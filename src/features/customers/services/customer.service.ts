import { Customer } from "@/types/database.types";
import {
  customerRepository,
  CustomerRepository,
} from "../repositories/customer.repository";
import {
  CustomerSchemaInput,
  normalizePhoneNumber,
} from "../schemas/customer.schema";

export interface CustomerWithRiskFlag extends Customer {
  isHighRisk: boolean;
}

export class CustomerService {
  constructor(private repo: CustomerRepository = customerRepository) {}

  async getAllCustomers(): Promise<CustomerWithRiskFlag[]> {
    const customers = await this.repo.findAll();

    return customers.map((c) => ({
      ...c,
      isHighRisk: c.cancellation_count >= 3 || c.attendance_rate < 0.5,
    }));
  }

  async getCustomerById(id: string): Promise<CustomerWithRiskFlag> {
    const customer = await this.repo.findById(id);
    return {
      ...customer,
      isHighRisk:
        customer.cancellation_count >= 3 || customer.attendance_rate < 0.5,
    };
  }

  /**
   * Menyimpan customer baru dengan sanitasi nomor telepon terstandarisasi (62...)
   */
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
