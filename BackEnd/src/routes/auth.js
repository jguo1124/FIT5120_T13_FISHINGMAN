import { Router } from "express";
import { handleAdminLogin, requireAuth } from "../middleware/auth.js";

const router = Router();

router.post("/login", handleAdminLogin);
router.get("/me", requireAuth, (req, res) => {
  return res.json({
    user: {
      username: req.user?.sub,
      role: req.user?.role,
    },
  });
});

export default router;
