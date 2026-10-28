import { Customer } from "@/types/database.types";
import {
  customerRepository,
  CustomerRepository,
} from "../repositories/customer.repository";
import {
  CustomerSchemaInput,
  normalizePhoneNumber,
} from "../schemas/customer.schema";

export type FollowUpPriority = "Low" | "Medium" | "High";

export interface CustomerWithPriority extends Customer {
  priorityLevel: FollowUpPriority;
}

export function calculatePriorityLevel(
  attendanceRate: number,
): FollowUpPriority {
  if (attendanceRate < 0.5) {
    return "High";
  }
  if (attendanceRate < 0.8) {
    return "Medium";
  }
  return "Low";
}

export class CustomerService {
  constructor(private repo: CustomerRepository = customerRepository) {}

  async getAllCustomers(): Promise<CustomerWithPriority[]> {
    const customers = await this.repo.findAll();

    return customers.map((c) => ({
      ...c,
      priorityLevel: calculatePriorityLevel(c.attendance_rate),
    }));
  }

  async getCustomerById(id: string): Promise<CustomerWithPriority> {
    const customer = await this.repo.findById(id);
    return {
      ...customer,
      priorityLevel: calculatePriorityLevel(customer.attendance_rate),
    };
  }

  async createCustomer(input: CustomerSchemaInput): Promise<Customer> {
    const normalizedPhone = normalizePhoneNumber(input.phone);

    return await this.repo.create({
      ...input,
      phone: normalizedPhone,
    });
  }

  async updateCustomer(
    id: string,
    input: Partial<CustomerSchemaInput>,
  ): Promise<Customer> {
    const updateData = { ...input };
    if (updateData.phone) {
      updateData.phone = normalizePhoneNumber(updateData.phone);
    }

    return await this.repo.update(id, updateData);
  }

  async deleteCustomer(id: string): Promise<void> {
    return await this.repo.delete(id);
  }
}

export const customerService = new CustomerService();
