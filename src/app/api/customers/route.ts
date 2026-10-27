import { NextResponse } from "next/server";
import { customerService } from "@/features/customers/services/customer.service";
import { customerSchema } from "@/features/customers/schemas/customer.schema";
import { AppError } from "@/lib/errors";

export async function GET() {
  try {
    const customers = await customerService.getAllCustomers();
    return NextResponse.json({ data: customers }, { status: 200 });
  } catch (error) {
    if (error instanceof AppError) {
      return NextResponse.json(
        { error: error.message, details: error.details },
        { status: error.statusCode },
      );
    }
    return NextResponse.json(
      { error: "Terjadi kesalahan internal server" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validation = customerSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          error: "Validasi gagal",
          details: validation.error.flatten().fieldErrors,
        },
        { status: 400 },
      );
    }

    const newCustomer = await customerService.createCustomer(validation.data);
    return NextResponse.json({ data: newCustomer }, { status: 201 });
  } catch (error) {
    if (error instanceof AppError) {
      return NextResponse.json(
        { error: error.message, details: error.details },
        { status: error.statusCode },
      );
    }
    return NextResponse.json(
      { error: "Terjadi kesalahan internal server" },
      { status: 500 },
    );
  }
}
