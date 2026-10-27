import { Customer } from "@/types/database.types";
import {
  customerRepository,
  CustomerRepository,
} from "../repositories/customer.repository";
import { CustomerSchemaInput } from "../schemas/customer.schema";

export interface CustomerWithRiskFlag extends Customer {
  isHighRisk: boolean;
}

export class CustomerService {
  constructor(private repo: CustomerRepository = customerRepository) {}

  /**
   * Mengambil semua customer dan memperkaya entity dengan flag domain (High Risk)
   */
  async getAllCustomers(): Promise<CustomerWithRiskFlag[]> {
    const customers = await this.repo.findAll();

    return customers.map((c) => ({
      ...c,
      // Aturan Bisnis: Pelanggan dianggap berisiko tinggi jika pembatalan >= 3 atau kehadiran < 50%
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
   * Transformasi input sebelum disimpan ke persistence layer
   */
  async createCustomer(input: CustomerSchemaInput): Promise<Customer> {
    // Transformasi nomor HP ke format bersih
    const cleanPhone = input.phone.replace(/[^0-9]/g, "");

    return await this.repo.create({
      ...input,
      phone: cleanPhone,
    });
  }

  async updateCustomer(
    id: string,
    input: Partial<CustomerSchemaInput>,
  ): Promise<Customer> {
    const updateData = { ...input };
    if (updateData.phone) {
      updateData.phone = updateData.phone.replace(/[^0-9]/g, "");
    }

    return await this.repo.update(id, updateData);
  }

  async deleteCustomer(id: string): Promise<void> {
    return await this.repo.delete(id);
  }
}

export const customerService = new CustomerService();
