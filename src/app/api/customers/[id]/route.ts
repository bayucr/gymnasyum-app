import { NextResponse } from "next/server";
import {
  updateCustomer,
  deleteCustomer,
} from "@/features/customers/services/customer.service";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const updated = await updateCustomer(id, body);
    return NextResponse.json({ data: updated }, { status: 200 });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Terjadi kesalahan server";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    await deleteCustomer(id);
    return NextResponse.json(
      { message: "Customer berhasil dihapus" },
      { status: 200 },
    );
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Terjadi kesalahan server";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
