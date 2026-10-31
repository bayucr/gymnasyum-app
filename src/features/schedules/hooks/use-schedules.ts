"use client";

import { useState, useEffect, useCallback } from "react";
import { Schedule } from "@/types/database.types";
import { ScheduleFormValues } from "../components/schedule-form-dialog";

export function useSchedules() {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSchedules = useCallback(async () => {
    try {
      const res = await fetch("/api/schedules");
      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.error || "Gagal mengambil data jadwal");
      }

      setSchedules(json.data || []);
      setError(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Terjadi kesalahan";
      setError(message);
      console.error("Gagal mengambil data jadwal:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let isSubscribed = true;

    const initFetch = async () => {
      try {
        const res = await fetch("/api/schedules");
        const json = await res.json();

        if (!isSubscribed) return;

        if (!res.ok) {
          throw new Error(json.error || "Gagal mengambil data jadwal");
        }

        setSchedules(json.data || []);
        setError(null);
      } catch (err) {
        if (!isSubscribed) return;
        const message =
          err instanceof Error ? err.message : "Terjadi kesalahan";
        setError(message);
        console.error("Gagal mengambil data jadwal:", err);
      } finally {
        if (isSubscribed) {
          setLoading(false);
        }
      }
    };

    initFetch();

    return () => {
      isSubscribed = false;
    };
  }, []);

  const refetch = useCallback(async () => {
    setLoading(true);
    await fetchSchedules();
  }, [fetchSchedules]);

  const createSchedule = async (values: ScheduleFormValues) => {
    const res = await fetch("/api/schedules", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });

    const json = await res.json();
    if (!res.ok) {
      throw new Error(json.error || "Gagal menyimpan jadwal");
    }

    await refetch();
    return json.data;
  };

  const updateSchedule = async (id: string, values: ScheduleFormValues) => {
    const res = await fetch(`/api/schedules/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });

    const json = await res.json();
    if (!res.ok) {
      throw new Error(json.error || "Gagal memperbarui jadwal");
    }

    await refetch();
    return json.data;
  };

  const deleteSchedule = async (id: string) => {
    const res = await fetch(`/api/schedules/${id}`, {
      method: "DELETE",
    });

    const json = await res.json();
    if (!res.ok) {
      throw new Error(json.error || "Gagal menghapus jadwal");
    }

    await refetch();
  };

  return {
    schedules,
    loading,
    error,
    refetch,
    createSchedule,
    updateSchedule,
    deleteSchedule,
  };
}
