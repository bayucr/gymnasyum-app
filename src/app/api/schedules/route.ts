import { NextResponse } from "next/server";
import {
  getSchedules,
  createSchedule,
} from "@/features/schedules/services/schedule.service";

export async function GET() {
  try {
    const schedules = await getSchedules();
    return NextResponse.json({ data: schedules }, { status: 200 });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Terjadi kesalahan server";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const newSchedule = await createSchedule(body);
    return NextResponse.json({ data: newSchedule }, { status: 201 });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Terjadi kesalahan server";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
