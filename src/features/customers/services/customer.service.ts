import { supabase } from "@/lib/supabase";
import { Customer } from "@/types/database.types";

export async function getCustomers(): Promise<Customer[]> {
  const { data, error } = await supabase
    .from("customers")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`Gagal mengambil data customer: ${error.message}`);
  }

  return data || [];
}

export async function createCustomer(
  customerData: Omit<Customer, "id" | "created_at">,
): Promise<Customer> {
  const { data, error } = await supabase
    .from("customers")
    .insert([customerData])
    .select()
    .single();

  if (error) {
    throw new Error(`Gagal membuat customer: ${error.message}`);
  }

  return data;
}

export async function updateCustomer(
  id: string,
  customerData: Partial<Omit<Customer, "id" | "created_at">>,
): Promise<Customer> {
  const { data, error } = await supabase
    .from("customers")
    .update(customerData)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    throw new Error(`Gagal memperbarui customer: ${error.message}`);
  }

  return data;
}

export async function deleteCustomer(id: string): Promise<void> {
  const { error } = await supabase.from("customers").delete().eq("id", id);

  if (error) {
    throw new Error(`Gagal menghapus customer: ${error.message}`);
  }
}
