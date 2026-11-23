import { supabase } from "@/lib/supabase";
import { Customer, CustomerFilterParams } from "@/types/database.types";
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

  async findPaginated(
    params: CustomerFilterParams = {},
  ): Promise<{ data: Customer[]; total: number }> {
    const page = Math.max(1, params.page ?? 1);
    const limit = Math.min(100, Math.max(1, params.limit ?? 10));
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let query = supabase.from("customers").select("*", { count: "exact" });

    // Pencarian nama atau nomor telepon (mendukung input 08... maupun 628...)
    if (params.search?.trim()) {
      const sanitized = params.search.trim().replace(/[,%_()]/g, "");
      if (sanitized) {
        const normalizedPhone = sanitized.startsWith("08")
          ? `62${sanitized.slice(1)}`
          : sanitized;

        if (normalizedPhone !== sanitized) {
          query = query.or(
            `name.ilike.%${sanitized}%,phone.ilike.%${sanitized}%,phone.ilike.%${normalizedPhone}%`,
          );
        } else {
          query = query.or(
            `name.ilike.%${sanitized}%,phone.ilike.%${sanitized}%`,
          );
        }
      }
    }

    if (params.segment) {
      query = query.eq("segment", params.segment);
    }

    if (params.status) {
      query = query.eq("status", params.status);
    }

    // Pemetaan filter prioritas ke ambang attendance_rate di database
    if (params.priority === "High") {
      query = query.lt("attendance_rate", 0.5);
    } else if (params.priority === "Medium") {
      query = query.gte("attendance_rate", 0.5).lt("attendance_rate", 0.8);
    } else if (params.priority === "Low") {
      query = query.gte("attendance_rate", 0.8);
    }

    const { data, count, error } = await query
      .order("created_at", { ascending: false })
      .range(from, to);

    if (error) {
      throw new DatabaseError(
        "Gagal mengambil data paginasi customer dari database",
        error,
      );
    }

    return {
      data: data || [],
      total: count ?? 0,
    };
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
