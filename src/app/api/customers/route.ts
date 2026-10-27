import { customerService } from "@/features/customers/services/customer.service";
import { customerSchema } from "@/features/customers/schemas/customer.schema";
import { handleApiError, apiSuccess } from "@/lib/api-response";
import { ValidationError } from "@/lib/errors";

export async function GET() {
  try {
    const customers = await customerService.getAllCustomers();
    return apiSuccess(customers);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validation = customerSchema.safeParse(body);

    if (!validation.success) {
      throw new ValidationError(
        "Validasi data gagal",
        validation.error.flatten().fieldErrors,
      );
    }

    const newCustomer = await customerService.createCustomer(validation.data);
    return apiSuccess(newCustomer, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
