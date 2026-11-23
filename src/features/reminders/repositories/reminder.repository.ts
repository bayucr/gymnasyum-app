import { supabase } from "@/lib/supabase";
import { ReminderFilterParams, ReminderLog } from "@/types/database.types";
import { DatabaseError, NotFoundError } from "@/lib/errors";

export class ReminderRepository {
  async findAll(): Promise<unknown[]> {
    const { data, error } = await supabase
      .from("reminder_logs")
      .select(
        `
        *,
        customers (
          id,
          name,
          phone,
          segment,
          status,
          attendance_rate
        ),
        schedules (
          id,
          class_name,
          datetime,
          quota
        )
      `,
      )
      .order("created_at", { ascending: false });

    if (error) {
      throw new DatabaseError(
        "Gagal mengambil log pengingat dari database",
        error,
      );
    }

    return data || [];
  }

  async findPaginated(
    params: ReminderFilterParams = {},
  ): Promise<{ data: ReminderLog[]; total: number }> {
    const page = Math.max(1, params.page ?? 1);
    const limit = Math.min(100, Math.max(1, params.limit ?? 10));
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let query = supabase.from("reminder_logs").select(
      `
        *,
        customers (
          id,
          name,
          phone,
          segment,
          status,
          attendance_rate
        ),
        schedules (
          id,
          class_name,
          datetime,
          quota
        )
      `,
      { count: "exact" },
    );

    if (params.search?.trim()) {
      const sanitized = params.search.trim().replace(/[,%_()]/g, "");
      if (sanitized) {
        const normalizedPhone = sanitized.startsWith("08")
          ? `62${sanitized.slice(1)}`
          : sanitized;

        const phoneFilter =
          normalizedPhone !== sanitized
            ? `name.ilike.%${sanitized}%,phone.ilike.%${sanitized}%,phone.ilike.%${normalizedPhone}%`
            : `name.ilike.%${sanitized}%,phone.ilike.%${sanitized}%`;

        const [{ data: matchedCustomers }, { data: matchedSchedules }] =
          await Promise.all([
            supabase.from("customers").select("id").or(phoneFilter).limit(200),
            supabase
              .from("schedules")
              .select("id")
              .ilike("class_name", `%${sanitized}%`)
              .limit(200),
          ]);

        const orConditions: string[] = [`draft_message.ilike.%${sanitized}%`];

        if (matchedCustomers && matchedCustomers.length > 0) {
          const customerIds = matchedCustomers.map((c) => c.id).join(",");
          orConditions.push(`customer_id.in.(${customerIds})`);
        }

        if (matchedSchedules && matchedSchedules.length > 0) {
          const scheduleIds = matchedSchedules.map((s) => s.id).join(",");
          orConditions.push(`schedule_id.in.(${scheduleIds})`);
        }

        query = query.or(orConditions.join(","));
      }
    }

    if (params.status) {
      query = query.eq("status", params.status);
    }

    if (params.priority) {
      query = query.eq("priority", params.priority);
    }

    const { data, count, error } = await query
      .order("created_at", { ascending: false })
      .range(from, to);

    if (error) {
      throw new DatabaseError(
        "Gagal mengambil data paginasi pengingat dari database",
        error,
      );
    }

    return {
      data: (data as ReminderLog[]) || [],
      total: count ?? 0,
    };
  }

  async findToday(): Promise<unknown[]> {
    const now = new Date();
    const startOfDay = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
    ).toISOString();
    const endOfDay = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      23,
      59,
      59,
      999,
    ).toISOString();

    const { data, error } = await supabase
      .from("reminder_logs")
      .select(
        `
        *,
        customers (id, name, phone, attendance_rate),
        schedules (id, class_name, datetime)
      `,
      )
      .gte("schedules.datetime", startOfDay)
      .lte("schedules.datetime", endOfDay)
      .order("created_at", { ascending: false });

    if (error) {
      throw new DatabaseError("Gagal mengambil pengingat hari ini", error);
    }

    return (data || []).filter((item) => item.schedules !== null);
  }

  async findById(id: string): Promise<ReminderLog> {
    const { data, error } = await supabase
      .from("reminder_logs")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !data) {
      throw new NotFoundError(`Log pengingat dengan ID ${id} tidak ditemukan`);
    }

    return data;
  }

  async create(
    reminderData: Omit<ReminderLog, "id" | "created_at">,
  ): Promise<ReminderLog> {
    const { data, error } = await supabase
      .from("reminder_logs")
      .insert([reminderData])
      .select()
      .single();

    if (error) {
      throw new DatabaseError("Gagal membuat log pengingat baru", error);
    }

    return data;
  }

  async update(
    id: string,
    reminderData: Partial<Omit<ReminderLog, "id" | "created_at">>,
  ): Promise<ReminderLog> {
    const { data, error } = await supabase
      .from("reminder_logs")
      .update(reminderData)
      .eq("id", id)
      .select()
      .single();

    if (error || !data) {
      throw new DatabaseError(
        `Gagal memperbarui log pengingat ID ${id}`,
        error,
      );
    }

    return data;
  }

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from("reminder_logs")
      .delete()
      .eq("id", id);

    if (error) {
      throw new DatabaseError(`Gagal menghapus log pengingat ID ${id}`, error);
    }
  }
}

export const reminderRepository = new ReminderRepository();
