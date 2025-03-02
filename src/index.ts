import express from "express";
import { exceptionMiddleware } from "./error.middleware";
import appController from "./app.controller";
import { config } from "./config";

const app = express();

app.use(express.json());

app.use(appController);

app.use(exceptionMiddleware);

app.listen(config.app.PORT, () => {
  console.log("Server is running on http://localhost:3000");
});
