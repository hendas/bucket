import { join } from "path";

export const config = {
  app: {
    PORT: 3000,
  },
  files: {
    BASE_DIR: join(process.cwd(), "public"),
    FILES_PATH: join(process.cwd(), "public", "files"),
    META_PATH: join(process.cwd(), "public", "meta"),
    SAMPLE_PATH: join(process.cwd(), "sample"),
    PREFIX_PASS: "*",
    PREFIX_ERROR: "@",
    RUN_MIGRATION: false,
  },
};
