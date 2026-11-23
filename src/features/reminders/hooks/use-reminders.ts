"use client";

import { useState, useEffect, useCallback } from "react";
import {
  PaginatedResult,
  PaginationMeta,
  PriorityLevel,
  ReminderLog,
  ReminderStatus,
} from "@/types/database.types";
import { ReminderFormValues } from "../components/reminder-form-dialog";

export function useReminders(initialLimit = 10) {
  const [reminders, setReminders] = useState<ReminderLog[]>([]);
  const [meta, setMeta] = useState<PaginationMeta>({
    page: 1,
    limit: initialLimit,
    totalItems: 0,
    totalPages: 1,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // State pencarian, filter, dan paginasi
  const [page, setPageState] = useState(1);
  const [limit, setLimitState] = useState(initialLimit);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [status, setStatusState] = useState<ReminderStatus | "ALL">("ALL");
  const [priority, setPriorityState] = useState<PriorityLevel | "ALL">("ALL");

  const buildQueryString = useCallback(() => {
    const params = new URLSearchParams({
      page: String(page),
      limit: String(limit),
    });

    if (debouncedSearch.trim()) {
      params.set("search", debouncedSearch.trim());
    }
    if (status !== "ALL") {
      params.set("status", status);
    }
    if (priority !== "ALL") {
      params.set("priority", priority);
    }

    return params.toString();
  }, [page, limit, debouncedSearch, status, priority]);

  // Debounce input pencarian 400ms
  useEffect(() => {
    if (search === debouncedSearch) return;

    const timer = setTimeout(() => {
      setLoading(true);
      setPageState(1);
      setDebouncedSearch(search);
    }, 400);

    return () => clearTimeout(timer);
  }, [search, debouncedSearch]);

  const fetchReminders = useCallback(async () => {
    try {
      const res = await fetch(`/api/reminders?${buildQueryString()}`);
      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.error || "Gagal mengambil data pengingat");
      }

      const paginated: PaginatedResult<ReminderLog> = json.data;
      setReminders(paginated.items || []);
      setMeta(paginated.meta);
      setError(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Terjadi kesalahan";
      setError(message);
      console.error("Gagal mengambil data pengingat:", err);
    } finally {
      setLoading(false);
    }
  }, [buildQueryString]);

  useEffect(() => {
    let isSubscribed = true;

    const loadReminders = async () => {
      try {
        const res = await fetch(`/api/reminders?${buildQueryString()}`);
        const json = await res.json();

        if (!isSubscribed) return;

        if (!res.ok) {
          throw new Error(json.error || "Gagal mengambil data pengingat");
        }

        const paginated: PaginatedResult<ReminderLog> = json.data;
        setReminders(paginated.items || []);
        setMeta(paginated.meta);
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

    loadReminders();

    return () => {
      isSubscribed = false;
    };
  }, [buildQueryString]);

  const setPage = useCallback((newPage: number) => {
    setLoading(true);
    setPageState(newPage);
  }, []);

  const setLimit = useCallback((newLimit: number) => {
    setLoading(true);
    setPageState(1);
    setLimitState(newLimit);
  }, []);

  const setStatus = useCallback((newStatus: ReminderStatus | "ALL") => {
    setLoading(true);
    setPageState(1);
    setStatusState(newStatus);
  }, []);

  const setPriority = useCallback((newPriority: PriorityLevel | "ALL") => {
    setLoading(true);
    setPageState(1);
    setPriorityState(newPriority);
  }, []);

  const resetFilters = useCallback(() => {
    setLoading(true);
    setSearch("");
    setDebouncedSearch("");
    setStatusState("ALL");
    setPriorityState("ALL");
    setPageState(1);
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
    meta,
    loading,
    error,
    page,
    setPage,
    limit,
    setLimit,
    search,
    setSearch,
    status,
    setStatus,
    priority,
    setPriority,
    resetFilters,
    refetch,
    createReminder,
    updateReminder,
    deleteReminder,
  };
}
