import { NextResponse } from "next/server";
import {
  getCustomers,
  createCustomer,
} from "@/features/customers/services/customer.service";
import { customerSchema } from "@/features/customers/schemas/customer.schema";

export async function GET() {
  try {
    const customers = await getCustomers();
    return NextResponse.json({ data: customers }, { status: 200 });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Terjadi kesalahan server";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
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

    const newCustomer = await createCustomer(validation.data);
    return NextResponse.json({ data: newCustomer }, { status: 201 });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Terjadi kesalahan server";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
