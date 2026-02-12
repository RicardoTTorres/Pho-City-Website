import { Router } from "express";


const router = Router();


router.get("/health", (req, res) => {
  res.json({ ok: true, message: "auth route ready" });
});

export default router;
