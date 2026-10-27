import { NextResponse } from "next/server";
import { AppError } from "@/lib/errors";

export function handleApiError(error: unknown) {
  if (error instanceof AppError) {
    return NextResponse.json(
      { error: error.message, details: error.details },
      { status: error.statusCode },
    );
  }

  console.error("[API Error]:", error);
  return NextResponse.json(
    { error: "Terjadi kesalahan internal server" },
    { status: 500 },
  );
}

export function apiSuccess<T>(data: T, status = 200) {
  return NextResponse.json({ data }, { status });
}
