import { Router } from "express";

const router = Router();

router.post(
    "/register",

);
router.post(
    "/login",

);
router.post(
    "/refresh",

);

router.post(
    "/logout",

    );

router.post(
    "/forgot",

);
router.put(
    "/forgot/:token",

);
router.post(
    "/password",
);

export const authRouter = router;
