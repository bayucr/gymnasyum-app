import { NextResponse } from "next/server";
import {
  getCustomers,
  createCustomer,
} from "@/features/customers/services/customer.service";

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
    const newCustomer = await createCustomer(body);
    return NextResponse.json({ data: newCustomer }, { status: 201 });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Terjadi kesalahan server";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
