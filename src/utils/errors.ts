export class ForbiddenError extends Error {
  readonly name: string;

  constructor(message?: string) {
    super(message);

    this.name = 'Forbidden';
  }
}

export class NotFoundError extends Error {
  readonly name: string;

  constructor(message?: string) {
    super(message);

    this.name = 'Not Found';
  }
}
