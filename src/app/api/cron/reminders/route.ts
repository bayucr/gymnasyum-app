import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

interface BookingCronData {
  id: string;
  customer_id: string;
  schedule_id: string;
  customers: {
    name: string;
    phone: string;
  } | null;
  schedules: {
    class_name: string;
    datetime: string;
  } | null;
}

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // 1. Hitung Rentang Waktu H-1 (Besok Hari)
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    const startOfDayStr = new Date(
      new Date(tomorrow).setHours(0, 0, 0, 0),
    ).toISOString();
    const endOfDayStr = new Date(
      new Date(tomorrow).setHours(23, 59, 59, 999),
    ).toISOString();

    const startOfDay = new Date(startOfDayStr);
    const endOfDay = new Date(endOfDayStr);

    // 2. Query Booking dengan !inner JOIN (Agar Filter Tanggal Berfungsi di Level SQL)
    const { data: bookings, error: fetchError } = await supabase
      .from("bookings")
      .select(
        "id, customer_id, schedule_id, customers(name, phone), schedules!inner(class_name, datetime)",
      )
      .gte("schedules.datetime", startOfDayStr)
      .lte("schedules.datetime", endOfDayStr);

    if (fetchError) throw fetchError;
    if (!bookings || bookings.length === 0) {
      return NextResponse.json({
        message: "Tidak ada jadwal kelas untuk besok.",
      });
    }

    const typedBookings = bookings as unknown as BookingCronData[];

    // 3. Filter Proteksi Ganda (JavaScript Level Filter Tanggal Besok)
    const tomorrowBookings = typedBookings.filter((b) => {
      if (!b.schedules?.datetime) return false;
      const scheduleDate = new Date(b.schedules.datetime);
      return scheduleDate >= startOfDay && scheduleDate <= endOfDay;
    });

    if (tomorrowBookings.length === 0) {
      return NextResponse.json({
        message: "Tidak ada jadwal kelas yang cocok untuk besok.",
      });
    }

    // 4. Filter Idempotency (Cegah Duplikasi jika Draf Sudah Ada)
    const { data: existingReminders, error: existingError } = await supabase
      .from("reminder_logs")
      .select("customer_id, schedule_id");

    if (existingError) throw existingError;

    const existingKeys = new Set(
      (existingReminders || []).map((r) => `${r.customer_id}_${r.schedule_id}`),
    );

    const newBookingsToRemind = tomorrowBookings.filter(
      (b) => !existingKeys.has(`${b.customer_id}_${b.schedule_id}`),
    );

    if (newBookingsToRemind.length === 0) {
      return NextResponse.json({
        message: "Semua draf reminder untuk kelas besok sudah pernah dibuat.",
        inserted: 0,
      });
    }

    // 5. Formulasi Draf Pesan
    const newReminders = newBookingsToRemind.map((booking) => {
      const customerName = booking.customers?.name ?? "Customer";
      const className = booking.schedules?.class_name ?? "Kelas";
      const datetime = new Date(booking.schedules!.datetime);

      const timeString = datetime.toLocaleTimeString("id-ID", {
        hour: "2-digit",
        minute: "2-digit",
      });

      const draftMessage = `Halo Kak ${customerName}, mengingatkan jadwal kelas ${className} Anda untuk besok pukul ${timeString} WIB. Sampai jumpa di Gymnasyum!`;

      return {
        customer_id: booking.customer_id,
        schedule_id: booking.schedule_id,
        draft_message: draftMessage,
        priority: "Medium",
        status: "Scheduled",
      };
    });

    // 6. Insert ke Database
    const { error: insertError } = await supabase
      .from("reminder_logs")
      .insert(newReminders);

    if (insertError) throw insertError;

    return NextResponse.json({
      success: true,
      inserted: newReminders.length,
    });
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 },
    );
  }
}
