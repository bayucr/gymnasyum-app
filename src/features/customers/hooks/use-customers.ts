"use client";

import { useState, useEffect, useCallback } from "react";
import { CustomerWithPriority } from "../services/customer.service";
import { CustomerFormValues } from "../components/customer-form-dialog";
import {
  PaginatedResult,
  PaginationMeta,
  PriorityLevel,
  SegmentType,
} from "@/types/database.types";

export function useCustomers(initialLimit = 10) {
  const [customers, setCustomers] = useState<CustomerWithPriority[]>([]);
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
  const [segment, setSegmentState] = useState<SegmentType | "ALL">("ALL");
  const [priority, setPriorityState] = useState<PriorityLevel | "ALL">("ALL");

  const buildQueryString = useCallback(() => {
    const params = new URLSearchParams({
      page: String(page),
      limit: String(limit),
    });

    if (debouncedSearch.trim()) {
      params.set("search", debouncedSearch.trim());
    }
    if (segment !== "ALL") {
      params.set("segment", segment);
    }
    if (priority !== "ALL") {
      params.set("priority", priority);
    }

    return params.toString();
  }, [page, limit, debouncedSearch, segment, priority]);

  // Debounce input pencarian 400ms (setState dijalankan asinkron di dalam callback timer)
  useEffect(() => {
    if (search === debouncedSearch) return;

    const timer = setTimeout(() => {
      setLoading(true);
      setPageState(1);
      setDebouncedSearch(search);
    }, 400);

    return () => clearTimeout(timer);
  }, [search, debouncedSearch]);

  // Single fetch entrypoint untuk refetch manual setelah mutasi CRUD
  const fetchCustomers = useCallback(async () => {
    try {
      const res = await fetch(`/api/customers?${buildQueryString()}`);
      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.error || "Gagal mengambil data customer");
      }

      const paginated: PaginatedResult<CustomerWithPriority> = json.data;
      setCustomers(paginated.items || []);
      setMeta(paginated.meta);
      setError(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Terjadi kesalahan";
      setError(message);
      console.error("Gagal mengambil data customer:", err);
    } finally {
      setLoading(false);
    }
  }, [buildQueryString]);

  // Sinkronisasi data asinkron saat mount atau parameter query berubah
  useEffect(() => {
    let isSubscribed = true;

    const loadCustomers = async () => {
      try {
        const res = await fetch(`/api/customers?${buildQueryString()}`);
        const json = await res.json();

        if (!isSubscribed) return;

        if (!res.ok) {
          throw new Error(json.error || "Gagal mengambil data customer");
        }

        const paginated: PaginatedResult<CustomerWithPriority> = json.data;
        setCustomers(paginated.items || []);
        setMeta(paginated.meta);
        setError(null);
      } catch (err) {
        if (!isSubscribed) return;
        const message =
          err instanceof Error ? err.message : "Terjadi kesalahan";
        setError(message);
        console.error("Gagal mengambil data customer:", err);
      } finally {
        if (isSubscribed) {
          setLoading(false);
        }
      }
    };

    loadCustomers();

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

  const setSegment = useCallback((newSegment: SegmentType | "ALL") => {
    setLoading(true);
    setPageState(1);
    setSegmentState(newSegment);
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
    setSegmentState("ALL");
    setPriorityState("ALL");
    setPageState(1);
  }, []);

  const refetch = useCallback(async () => {
    setLoading(true);
    await fetchCustomers();
  }, [fetchCustomers]);

  const createCustomer = async (values: CustomerFormValues) => {
    const res = await fetch("/api/customers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });

    const json = await res.json();
    if (!res.ok) {
      throw new Error(json.error || "Gagal menyimpan customer");
    }

    await refetch();
    return json.data;
  };

  const updateCustomer = async (id: string, values: CustomerFormValues) => {
    const res = await fetch(`/api/customers/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });

    const json = await res.json();
    if (!res.ok) {
      throw new Error(json.error || "Gagal memperbarui data customer");
    }

    await refetch();
    return json.data;
  };

  const deleteCustomer = async (id: string) => {
    const res = await fetch(`/api/customers/${id}`, {
      method: "DELETE",
    });

    const json = await res.json();
    if (!res.ok) {
      throw new Error(json.error || "Gagal menghapus customer");
    }

    await refetch();
  };

  return {
    customers,
    meta,
    loading,
    error,
    page,
    setPage,
    limit,
    setLimit,
    search,
    setSearch,
    segment,
    setSegment,
    priority,
    setPriority,
    resetFilters,
    refetch,
    createCustomer,
    updateCustomer,
    deleteCustomer,
  };
}
