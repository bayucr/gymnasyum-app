export class AppError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public details?: unknown,
  ) {
    super(message);
    this.name = "AppError";
  }
}

export class NotFoundError extends AppError {
  constructor(message = "Resource tidak ditemukan") {
    super(message, 404);
    this.name = "NotFoundError";
  }
}

export class ValidationError extends AppError {
  constructor(message = "Validasi data gagal", details?: unknown) {
    super(message, 400, details);
    this.name = "ValidationError";
  }
}

export class DatabaseError extends AppError {
  constructor(
    message = "Terjadi kesalahan operasi database",
    details?: unknown,
  ) {
    super(message, 500, details);
    this.name = "DatabaseError";
  }
}
