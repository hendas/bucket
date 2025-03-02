import { mkdir, readdir, readFile, writeFile, unlink } from "fs/promises";
import { join } from "path";

import { config } from "../config";
import { FileMetaData } from "../types";
import { createHash } from "crypto";
import { UnauthorizedException } from "../exceptions/unauthorized";
import { NotFoundException } from "../exceptions/not-found";
import { ForbiddenException } from "../exceptions/forbidden";

class FilesService {
  private static metadata: {
    [hash: string]: FileMetaData | null;
  } = {};

  constructor() {
    this.hydrateMetadata();
  }

  async getFilesList() {
    const fileNames: string[] = Object.entries(FilesService.metadata).map(
      ([hash, meta]) => {
        return meta === null
          ? `${config.files.PREFIX_ERROR}${hash}`
          : meta.pass
          ? `${config.files.PREFIX_PASS}${meta.name}`
          : meta.name;
      }
    );

    return fileNames;
  }

  async getFileContent(name: string, password?: string) {
    const hash = this.getFileHash(name);
    const meta = FilesService.metadata[hash];
    if (!meta) {
      throw new NotFoundException("File not found");
    }

    if (meta.pass && meta.pass !== password) {
      throw new UnauthorizedException("Invalid password");
    }

    const content = await readFile(
      join(config.files.FILES_PATH, `${hash}.txt`),
      "utf8"
    );
    return content;
  }

  async createFile(name: string, content: string, pass?: string) {
    const hash = this.getFileHash(name);
    const meta = FilesService.metadata[hash];

    if (meta) {
      throw new ForbiddenException("File already exists");
    }

    await this.saveFile(name, content, pass);

    return;
  }

  async uploadFile(
    name: string,
    content: string,
    authPass?: string,
    pass?: string
  ) {
    const hash = this.getFileHash(name);
    const meta = FilesService.metadata[hash];

    if (meta?.pass && meta.pass !== authPass) {
      throw new UnauthorizedException("Invalid password");
    }

    await this.saveFile(name, content, pass);

    return;
  }

  async updateFile(
    name: string,
    content: string,
    authPass?: string,
    pass?: string
  ) {
    const hash = this.getFileHash(name);
    const meta = FilesService.metadata[hash];
    if (!meta) {
      throw new NotFoundException("File not found");
    }

    if (meta.pass && meta.pass !== authPass) {
      throw new UnauthorizedException("Invalid password");
    }

    await this.saveFile(name, content, pass);
    return;
  }

  private async saveFile(name: string, content: string, pass?: string) {
    const hash = this.getFileHash(name);

    const meta = FilesService.metadata[hash];

    const newMeta: FileMetaData = {
      createdAt: new Date(),
      ...meta,
      updatedAt: new Date(),
      name,
      size: content.length,
      hash,
      pass,
    };

    await writeFile(
      join(config.files.META_PATH, `${hash}.meta.json`),
      JSON.stringify(newMeta)
    );
    await writeFile(join(config.files.FILES_PATH, `${hash}.txt`), content);
    FilesService.metadata[hash] = newMeta;

    return;
  }

  async deleteFile(name: string, authPass?: string) {
    const hash = this.getFileHash(name);
    const meta = FilesService.metadata[hash];
    if (!meta) {
      throw new NotFoundException("File not found");
    }

    if (meta.pass && meta.pass !== authPass) {
      throw new UnauthorizedException("Invalid password");
    }

    await unlink(join(config.files.META_PATH, `${hash}.meta.json`));
    await unlink(join(config.files.FILES_PATH, `${hash}.txt`));
    FilesService.metadata[hash] = null;

    return;
  }

  private getHashFromFileName(fileName: string) {
    return fileName.replace(".meta.json", "");
  }

  private async getMetaByHash(hash: string) {
    try {
      return JSON.parse(
        await readFile(
          join(config.files.META_PATH, `${hash}.meta.json`),
          "utf8"
        )
      );
    } catch (e) {
      return null;
    }
  }

  private getFileHash(name: string) {
    return createHash("md5").update(name).digest("hex");
  }

  private async migrateMetadata() {
    const files = (
      await readdir(config.files.SAMPLE_PATH, {
        withFileTypes: true,
      })
    ).filter((file) => file.isFile());
    console.log(`Found ${files.length} files`);
    for (const file of files) {
      try {
        const meta: FileMetaData = JSON.parse(
          await readFile(join(config.files.SAMPLE_PATH, file.name), "utf8")
        );

        if (meta.content) {
          this.saveFile(meta.name, meta.content, meta.pass);
        }
      } catch (e) {
        console.error(e);
      }
    }
  }

  private async hydrateMetadata() {
    mkdir(config.files.BASE_DIR, { recursive: true });
    mkdir(config.files.FILES_PATH, { recursive: true });
    mkdir(config.files.META_PATH, { recursive: true });
    if (config.files.RUN_MIGRATION) {
      await this.migrateMetadata();
    }
    try {
      const files = await readdir(config.files.META_PATH, {
        withFileTypes: true,
      });
      for (const file of files) {
        const hash = this.getHashFromFileName(file.name);
        try {
          if (!file.isFile()) {
            continue;
          }

          const meta = await this.getMetaByHash(hash);

          FilesService.metadata[hash] = meta;
        } catch (e) {
          FilesService.metadata[hash] = null;
        }
      }
      console.log(`Hydrated metadata for ${files.length} files`);
    } catch (e: any) {
      console.log(`Error hydrating metadata: ${e.message}`);
    }
  }
}

export default FilesService;
