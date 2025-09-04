# FIT5120_T13_FISHINGMAN Security Plan

## 1. System Security Awareness

- **Security Training:** All team members are briefed on secure coding practices, data privacy, and incident response procedures.
- **Authorization Controls:** Only authenticated users can access sensitive endpoints. Role-based access is enforced for admin operations using JWT tokens and middleware checks.
- **Threat Prevention:** Regular dependency updates, use of security linters, static code analysis, and automated vulnerability scanning are in place.
- **Secure Development Lifecycle:** Security requirements are integrated into design, development, and deployment phases. Code reviews include security checks.

## 2. Risk Assessment & Mitigation

| Risk | Description | Rating | Mitigation |
|------|-------------|--------|------------|
| Authentication & Session Management | Weak passwords, session hijacking, poor session controls | High | Enforce strong password policy (min 9 chars, alphanumeric), use bcrypt for hashing, implement JWT with short expiry, secure cookies, and session invalidation on logout. |
| Sensitive Data Exposure | Data sent or stored without encryption | High | Use HTTPS for all traffic, encrypt sensitive data at rest, restrict access to personal data, and mask sensitive fields in logs. |
| Injection | Unsanitized user input in queries or commands | High | Use parameterized queries, ORM, input validation/sanitization, and never concatenate user input in SQL or shell commands. |
| External Entities | Vulnerable XML parsers | Low | Avoid XML unless necessary, use secure parsers, disable external entity resolution. |
| Access Control | Unauthorized access to resources | High | Enforce role-based access control, validate user permissions on every request, and avoid exposing internal endpoints. |
| Security Misconfiguration | Default settings, unnecessary features, open ports | Medium | Harden server configs, close unused ports, disable directory listing, and regularly review environment settings. |
| Cross-Site Scripting (XSS) | Malicious scripts injected via frontend | High | Escape and sanitize all user input/output, use CSP headers, and validate data before rendering in Vue components. |
| Deserialization | Deserialization of untrusted data | Low | Avoid deserializing user input, use safe serialization formats, and validate all data before processing. |
| Vulnerable Components | Outdated or vulnerable dependencies | Medium | Use `npm audit`, dependabot, and update dependencies regularly. Remove unused packages. |
| Logging & Monitoring | Lack of visibility into attacks | Medium | Log all authentication attempts, errors, and suspicious activities. Set up alerts for abnormal behavior and review logs weekly. |
| Denial of Service (DoS) | Service disruption via traffic overload | Medium | Implement rate limiting, request size limits, and monitoring. Use cloud-based DDoS protection if needed. |

## 3. Security Measures & Policies

- **Password Policy:** All user passwords must be at least 9 characters, include numbers and letters, and be changed every 6 months. Passwords are hashed using bcrypt before storage.
- **Authentication Management:** JWT tokens are used for stateless authentication. Password reset/change requires email verification. Sessions expire after 30 minutes of inactivity.
- **Access Control:** Role-based access enforced via middleware. Admin-only routes are protected and audited.
- **Port Management:** Only necessary ports (backend, frontend) are open. Backend and database servers are not exposed to the public internet.
- **Data Protection:** All API traffic uses HTTPS. Sensitive data (e.g., user info) is encrypted in the database. No sensitive data is exposed in frontend code or logs.
- **Input Validation:** All API endpoints validate and sanitize incoming data using libraries (e.g., Joi, express-validator).
- **CORS Policy:** Only trusted domains are allowed to access the API via CORS headers.
- **Logging & Monitoring:** All authentication attempts, errors, and suspicious activities are logged. Logs are reviewed weekly. Alerts are set for suspicious activity.
- **Incident Response:** In case of a breach, root cause analysis is performed, documented in the PGP folder and LeanKit, and affected users are notified.

## 4. Ethical, Legal, Security, and Privacy Issues

- **User Privacy:** Only necessary user data is collected. Data is not shared with third parties. Privacy policy is published and accessible on the website.
- **Compliance:** The system complies with relevant privacy laws (e.g., GDPR, Australian Privacy Act). Data subject requests are supported.
- **Security Updates:** Dependencies are updated regularly. Vulnerabilities are patched within 48 hours of discovery.
- **Third-Party Services:** Only reputable third-party services are used. API keys and secrets are stored securely and never exposed in client-side code.

## 5. Widespread Security Attack Guidelines

- **Phishing:** Educate users to recognize phishing attempts. No sensitive info is requested via email. Email verification links expire after 24 hours.
- **Ransomware:** Regular encrypted backups and access controls minimize impact. Backups are stored offsite.
- **Brute Force:** Rate limiting and account lockout after repeated failed logins. CAPTCHA is used on login forms.
- **Cross-Site Request Forgery (CSRF):** CSRF tokens are implemented for all state-changing requests.
- **Clickjacking:** Use X-Frame-Options and CSP headers to prevent UI redress attacks.


This plan should be reviewed and updated regularly as the project evolves. All incidents and updates are documented in the PGP folder and LeanKit as required.
