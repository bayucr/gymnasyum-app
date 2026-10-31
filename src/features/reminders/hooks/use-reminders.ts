"use client";

import { useState, useEffect, useCallback } from "react";
import { ReminderLog } from "@/types/database.types";
import { ReminderFormValues } from "../components/reminder-form-dialog";

export function useReminders() {
  const [reminders, setReminders] = useState<ReminderLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchReminders = useCallback(async () => {
    try {
      const res = await fetch("/api/reminders");
      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.error || "Gagal mengambil data pengingat");
      }

      setReminders(json.data || []);
      setError(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Terjadi kesalahan";
      setError(message);
      console.error("Gagal mengambil data pengingat:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let isSubscribed = true;

    const initFetch = async () => {
      try {
        const res = await fetch("/api/reminders");
        const json = await res.json();

        if (!isSubscribed) return;

        if (!res.ok) {
          throw new Error(json.error || "Gagal mengambil data pengingat");
        }

        setReminders(json.data || []);
        setError(null);
      } catch (err) {
        if (!isSubscribed) return;
        const message =
          err instanceof Error ? err.message : "Terjadi kesalahan";
        setError(message);
        console.error("Gagal mengambil data pengingat:", err);
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
    await fetchReminders();
  }, [fetchReminders]);

  const createReminder = async (values: ReminderFormValues) => {
    const res = await fetch("/api/reminders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });

    const json = await res.json();
    if (!res.ok) {
      throw new Error(json.error || "Gagal membuat log pengingat");
    }

    await refetch();
    return json.data;
  };

  const updateReminder = async (id: string, values: ReminderFormValues) => {
    const res = await fetch(`/api/reminders/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });

    const json = await res.json();
    if (!res.ok) {
      throw new Error(json.error || "Gagal memperbarui log pengingat");
    }

    await refetch();
    return json.data;
  };

  const deleteReminder = async (id: string) => {
    const res = await fetch(`/api/reminders/${id}`, {
      method: "DELETE",
    });

    const json = await res.json();
    if (!res.ok) {
      throw new Error(json.error || "Gagal menghapus log pengingat");
    }

    await refetch();
  };

  return {
    reminders,
    loading,
    error,
    refetch,
    createReminder,
    updateReminder,
    deleteReminder,
  };
}
