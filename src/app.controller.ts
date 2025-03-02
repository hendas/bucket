import express from "express";
import filesController from "./files/files.controller";
import "express-async-errors";

const router = express.Router();

router.use("/files", filesController);

export default router;
