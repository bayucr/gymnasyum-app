import { customerService } from "@/features/customers/services/customer.service";
import { updateCustomerSchema } from "@/features/customers/schemas/customer.schema";
import { handleApiError, apiSuccess } from "@/lib/api-response";
import { ValidationError } from "@/lib/errors";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const validation = updateCustomerSchema.safeParse(body);

    if (!validation.success) {
      throw new ValidationError(
        "Validasi data gagal",
        validation.error.flatten().fieldErrors,
      );
    }

    const updated = await customerService.updateCustomer(id, validation.data);
    return apiSuccess(updated);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    await customerService.deleteCustomer(id);
    return apiSuccess({ message: "Customer berhasil dihapus" });
  } catch (error) {
    return handleApiError(error);
  }
}
