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
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    const startOfDay = new Date(
      new Date(tomorrow).setHours(0, 0, 0, 0),
    ).toISOString();
    const endOfDay = new Date(
      new Date(tomorrow).setHours(23, 59, 59, 999),
    ).toISOString();

    // 1. Query Booking Kelas Besok
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

    const typedBookings = bookings as unknown as BookingCronData[];

    // 2. Query Reminder Logs yang Sudah Ada di Database (Untuk Cegah Duplikasi)
    const { data: existingReminders, error: existingError } = await supabase
      .from("reminder_logs")
      .select("customer_id, schedule_id");

    if (existingError) throw existingError;

    // Buat Set kunci unik "customer_id_schedule_id" dari reminder yang sudah tersimpan
    const existingKeys = new Set(
      (existingReminders || []).map((r) => `${r.customer_id}_${r.schedule_id}`),
    );

    // 3. Filter Hanya Booking yang BELUM Punya Draf Reminder
    const newBookingsToRemind = typedBookings.filter(
      (b) => !existingKeys.has(`${b.customer_id}_${b.schedule_id}`),
    );

    if (newBookingsToRemind.length === 0) {
      return NextResponse.json({
        message: "Semua draf reminder untuk kelas besok sudah pernah dibuat.",
        inserted: 0,
      });
    }

    // 4. Formulasi Draf Pesan Baru
    const newReminders = newBookingsToRemind.map((booking) => {
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

    // 5. Insert Hanya Draf Baru
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
