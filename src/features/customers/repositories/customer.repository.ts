import { supabase } from "@/lib/supabase";
import { Customer } from "@/types/database.types";
import { DatabaseError, NotFoundError } from "@/lib/errors";

export class CustomerRepository {
  async findAll(): Promise<Customer[]> {
    const { data, error } = await supabase
      .from("customers")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      throw new DatabaseError(
        "Gagal mengambil data customer dari database",
        error,
      );
    }

    return data || [];
  }

  async findById(id: string): Promise<Customer> {
    const { data, error } = await supabase
      .from("customers")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !data) {
      throw new NotFoundError(`Customer dengan ID ${id} tidak ditemukan`);
    }

    return data;
  }

  async create(
    customerData: Omit<Customer, "id" | "created_at">,
  ): Promise<Customer> {
    const { data, error } = await supabase
      .from("customers")
      .insert([customerData])
      .select()
      .single();

    if (error) {
      throw new DatabaseError("Gagal membuat data customer baru", error);
    }

    return data;
  }

  async update(
    id: string,
    customerData: Partial<Omit<Customer, "id" | "created_at">>,
  ): Promise<Customer> {
    const { data, error } = await supabase
      .from("customers")
      .update(customerData)
      .eq("id", id)
      .select()
      .single();

    if (error || !data) {
      throw new DatabaseError(`Gagal mengupdate data customer ID ${id}`, error);
    }

    return data;
  }

  async delete(id: string): Promise<void> {
    const { error } = await supabase.from("customers").delete().eq("id", id);

    if (error) {
      throw new DatabaseError(`Gagal menghapus customer ID ${id}`, error);
    }
  }
}

export const customerRepository = new CustomerRepository();
