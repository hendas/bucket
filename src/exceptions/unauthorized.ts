export class UnauthorizedException extends Error {
  readonly status: number = 401;
  constructor(message: string) {
    super(message);
    this.name = "UnauthorizedException";
  }
}
