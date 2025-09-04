
# Penetration Test & Security Issues Report

This report documents penetration testing activities, findings, impact assessment, and recommendations for the FIT5120_T13_FISHINGMAN codebase.

## 1. Pen Test Findings


### Test 1: Unauthenticated API Access

**Attack:** Accessed `/api/v1/species` and `/api/v1/zone/:zoneCode/rules` endpoints without authentication.

**Finding:** All endpoints are accessible without login or authorization.

**Code Reference:**

- `backend/src/app.js` (commit: f590ba4d7ab71b24ece447d10a8b4ed9c5b3934d)

Line 50:
```js
app.use("/api/v1/species", speciesRouter);
```

Line 51:
```js
app.use("/api/v1", zoneRouter);
```

No authentication middleware before these lines.


### Test 2: CORS Misconfiguration

**Attack:** Sent requests from a third-party domain using JavaScript (browser console).

**Finding:** API accepts requests from any origin.

**Code Reference:**

- `backend/src/app.js` (commit: f590ba4d7ab71b24ece447d10a8b4ed9c5b3934d)

Lines 18-21:

```js
app.use(
    cors({
        origin: true,
        exposedHeaders: ["ETag"],
    })
);
```

### Test 3: Error Information Disclosure

**Attack:** Sent malformed requests to trigger errors.

**Finding:** Error responses include stack traces and internal error messages in non-production mode.

**Code Reference:**

- `backend/src/app.js` (commit: f590ba4d7ab71b24ece447d10a8b4ed9c5b3934d)

Lines 54-67:

```js
app.use((err, req, res, next) => {
    res.status(500).json({
        error: {
            code: "internal_error",
            message: process.env.NODE_ENV === "production" ? "Server error" : String(err?.message || err),
            stack: process.env.NODE_ENV === "production" ? undefined : err?.stack,
        },
    });
});
```

### Test 4: Rate Limiting

**Attack:** Sent a large number of requests in a short period.

**Finding:** No rate limiting; all requests processed.

**Code Reference:**

- `backend/src/app.js` (commit: f590ba4d7ab71b24ece447d10a8b4ed9c5b3934d)


No rate limiting middleware (e.g., `express-rate-limit`) is present anywhere in the file.


### Test 5: Input Validation

**Attack:** Sent SQL meta-characters in route/query parameters.

**Finding:** No SQL injection detected due to parameterized queries, but no explicit input validation.

**Code Reference:**

- `backend/src/routes/species.js` (commit: f590ba4d7ab71b24ece447d10a8b4ed9c5b3934d)

Line 29:

```js
router.get("/:code", async (req, res, next) => { ... }); // uses req.params.code directly without validation
```

- `backend/src/routes/zone.js` (commit: f590ba4d7ab71b24ece447d10a8b4ed9c5b3934d)

Line 17:

```js
router.get("/zone/:zoneCode/rules", async (req, res, next) => { ... }); // uses req.params.zoneCode and req.query.species directly without validation
```

## 2. Impact Assessment

| Vulnerability                        | Confidentiality | Integrity | Availability | Impact Description |
|--------------------------------------|-----------------|-----------|--------------|-------------------|
| Unauthenticated API Access           | High            | High      | Medium       | Unauthorized users can access and manipulate data. |
| CORS Misconfiguration                | Medium          | Medium    | Low          | Third-party sites can interact with the API, risking data exposure. |
| Error Information Disclosure         | Medium          | Low       | Low          | Internal details may aid attackers in crafting further attacks. |
| Lack of Rate Limiting                | Low             | Low       | High         | API is vulnerable to DoS attacks. |
| Lack of Input Validation             | Medium          | Medium    | Low          | Potential for future injection attacks if code changes. |

## 3. Recommendations

| Recommendation                                      | Priority   | Description |
|-----------------------------------------------------|------------|-------------|
| Implement authentication and authorization          | High       | Protect endpoints from unauthorized access. |
| Restrict CORS to trusted domains                    | High       | Prevent cross-origin attacks and data leakage. |
| Sanitize error responses and remove stack traces     | Medium     | Prevent information leakage. |
| Add rate limiting and request throttling             | High       | Protect against DoS attacks. |
| Add input validation and sanitization                | High       | Prevent injection and malformed data attacks. |
| Implement logging and monitoring for security events | Medium     | Detect and respond to suspicious activities. |
| Enforce HTTPS in production                         | High       | Protect data in transit. |
| Add CAPTCHA or bot protection for sensitive endpoints| Medium     | Prevent automated attacks and spam. |