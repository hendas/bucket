export interface FileMetaData {
  name: string;
  hash: string;
  size: number;
  createdAt: Date;
  updatedAt: Date;
  pass?: string;
  content?: string; // for old files
}
