import { customerService } from "@/features/customers/services/customer.service";
import { customerSchema } from "@/features/customers/schemas/customer.schema";
import { handleApiError, apiSuccess } from "@/lib/api-response";
import { ValidationError } from "@/lib/errors";
import {
  CustomerStatus,
  PriorityLevel,
  SegmentType,
} from "@/types/database.types";

const VALID_SEGMENTS: SegmentType[] = ["Ibu-ibu", "Lansia", "Umum"];
const VALID_STATUSES: CustomerStatus[] = ["Active", "Inactive"];
const VALID_PRIORITIES: PriorityLevel[] = ["Low", "Medium", "High"];

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    const hasPaginationOrFilter =
      searchParams.has("page") ||
      searchParams.has("limit") ||
      searchParams.has("search") ||
      searchParams.has("segment") ||
      searchParams.has("status") ||
      searchParams.has("priority");

    if (!hasPaginationOrFilter) {
      const customers = await customerService.getAllCustomers();
      return apiSuccess(customers);
    }

    const rawPage = Number(searchParams.get("page") || "1");
    const rawLimit = Number(searchParams.get("limit") || "10");
    const search = searchParams.get("search") || undefined;
    const rawSegment = searchParams.get("segment") as SegmentType | null;
    const rawStatus = searchParams.get("status") as CustomerStatus | null;
    const rawPriority = searchParams.get("priority") as PriorityLevel | null;

    const result = await customerService.getPaginatedCustomers({
      page: Number.isNaN(rawPage) ? 1 : rawPage,
      limit: Number.isNaN(rawLimit) ? 10 : rawLimit,
      search,
      segment:
        rawSegment && VALID_SEGMENTS.includes(rawSegment)
          ? rawSegment
          : undefined,
      status:
        rawStatus && VALID_STATUSES.includes(rawStatus) ? rawStatus : undefined,
      priority:
        rawPriority && VALID_PRIORITIES.includes(rawPriority)
          ? rawPriority
          : undefined,
    });

    return apiSuccess(result);
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
