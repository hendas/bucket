export class ForbiddenException extends Error {
  readonly status: number = 403;
  constructor(message: string) {
    super(message);
    this.name = "ForbiddenException";
  }
}
