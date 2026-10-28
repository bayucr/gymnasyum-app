"use client";

import { useState, useCallback } from "react";
import { BookingWithSchedule } from "../repositories/booking.repository";

export function useBookings() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getCustomerSchedules = useCallback(async (customerId: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/customers/${customerId}/schedules`);
      const json = await res.json();
      if (!res.ok)
        throw new Error(json.error || "Gagal memuat jadwal customer");
      return (json.data as BookingWithSchedule[]) || [];
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Terjadi kesalahan";
      setError(msg);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const createBooking = async (customerId: string, scheduleId: string) => {
    setLoading(true);
    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer_id: customerId,
          schedule_id: scheduleId,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Gagal mendaftarkan ke kelas");
      return json.data;
    } finally {
      setLoading(false);
    }
  };

  const deleteBooking = async (bookingId: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/bookings/${bookingId}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (!res.ok)
        throw new Error(json.error || "Gagal membatalkan pendaftaran kelas");
    } finally {
      setLoading(false);
    }
  };

  return { getCustomerSchedules, createBooking, deleteBooking, loading, error };
}
