export class NotFoundException extends Error {
  readonly status: number = 404;
  constructor(message: string) {
    super(message);
    this.name = "NotFoundException";
  }
}
