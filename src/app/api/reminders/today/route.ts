import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET() {
  try {
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
        customers (name, phone, cancellation_count, attendance_rate),
        schedules (class_name, datetime)
      `,
      )
      .gte("schedules.datetime", startOfDay)
      .lte("schedules.datetime", endOfDay)
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Filter data agar hanya mengambil yang jadwalnya valid hari ini
    const filteredData = (data || []).filter((item) => item.schedules !== null);

    return NextResponse.json({ data: filteredData }, { status: 200 });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Terjadi kesalahan server";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
