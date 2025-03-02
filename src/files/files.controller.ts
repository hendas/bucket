import express, { Request, Response, NextFunction } from "express";
import { body, validationResult, ValidationChain } from "express-validator";
import "express-async-errors";

import FilesService from "./files.service";

const router = express.Router();

const filesService = new FilesService();

const validateFileContent: ValidationChain[] = [
  body("content").notEmpty().withMessage("Content is required"),
  body("pass").optional().isString().withMessage("Password must be a string"),
];

const handleValidationErrors = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
  } else {
    next();
  }
};

router.get(
  "/",
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const filesList = await filesService.getFilesList();
      res.json(filesList);
    } catch (error) {
      next(error);
    }
  }
);

router.get(
  "/:name",
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { name } = req.params;
      const password = req.query.pass;
      const fileContent = await filesService.getFileContent(
        name,
        typeof password === "string" ? password : undefined
      );
      res.send(fileContent);
    } catch (error) {
      next(error);
    }
  }
);

router.post(
  "/:name",
  validateFileContent,
  handleValidationErrors,
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { name } = req.params;
      const { content, pass } = req.body;
      await filesService.createFile(name, content, pass);
      res.send("File saved");
    } catch (error) {
      next(error);
    }
  }
);

router.put(
  "/:name",
  validateFileContent,
  handleValidationErrors,
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { name } = req.params;
      const { content, pass } = req.body;
      const authPass = req.query.pass;
      await filesService.uploadFile(
        name,
        content,
        typeof authPass === "string" ? authPass : undefined,
        pass
      );
      res.send("File saved");
    } catch (error) {
      next(error);
    }
  }
);

router.patch(
  "/:name",
  validateFileContent,
  handleValidationErrors,
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { name } = req.params;
      const { content, pass } = req.body;
      await filesService.updateFile(name, content, pass);
      res.send("File updated");
    } catch (error) {
      next(error);
    }
  }
);

router.delete(
  "/:name",
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { name } = req.params;
      const pass = req.query.pass;

      await filesService.deleteFile(
        name,
        typeof pass === "string" ? pass : undefined
      );

      res.send("File deleted");
    } catch (error) {
      next(error);
    }
  }
);

export default router;
