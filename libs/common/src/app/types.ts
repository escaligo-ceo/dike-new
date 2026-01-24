export class GenericError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'Generic';
  }
}

export class User {
  constructor(
    private readonly id: string,
    private readonly email: string,
    private readonly username: string
  ) {}
}
