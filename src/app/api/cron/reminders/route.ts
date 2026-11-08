import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

// 1. Interface TypeScript untuk menggantikan `any`
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
  // 2. Verifikasi Token Keamanan Cron Vercel
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // 3. Hitung Rentang Waktu H-1 (Besok Hari)
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    const startOfDay = new Date(
      new Date(tomorrow).setHours(0, 0, 0, 0),
    ).toISOString();
    const endOfDay = new Date(
      new Date(tomorrow).setHours(23, 59, 59, 999),
    ).toISOString();

    // 4. Query Booking Kelas Besok Beserta Relasi Customer & Schedule
    const { data: bookings, error: fetchError } = await supabase
      .from("bookings")
      .select(
        "id, customer_id, schedule_id, customers(name, phone), schedules(class_name, datetime)",
      )
      .gte("schedules.datetime", startOfDay)
      .lte("schedules.datetime", endOfDay);

    if (fetchError) throw fetchError;
    if (!bookings || bookings.length === 0) {
      return NextResponse.json({ message: "Tidak ada jadwal kelas besok." });
    }

    // 5. Safe Type Casting
    const typedBookings = bookings as unknown as BookingCronData[];

    // 6. Formulasi Draf Pesan
    const newReminders = typedBookings.map((booking) => {
      const customerName = booking.customers?.name ?? "Customer";
      const className = booking.schedules?.class_name ?? "Kelas";
      const datetime = booking.schedules?.datetime
        ? new Date(booking.schedules.datetime)
        : new Date();

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

    // 7. Simpan Draf ke Tabel reminder_logs
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
