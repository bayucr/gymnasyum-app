"use client";

import { useState, useEffect, useCallback } from "react";
import { CustomerFormValues } from "../components/customer-form-dialog";

export function useCustomers() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Single fetch entrypoint tanpa setState sinkron di awal
  const fetchCustomers = useCallback(async () => {
    try {
      setError(null);
      const res = await fetch("/api/customers");
      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.error || "Gagal mengambil data customer");
      }

      setCustomers(json.data || []);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Terjadi kesalahan";
      setError(message);
      console.error("Gagal mengambil data customer:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Inisialisasi data saat komponen di-mount
  useEffect(() => {
    let isSubscribed = true;

    const initFetch = async () => {
      try {
        setError(null);
        const res = await fetch("/api/customers");
        const json = await res.json();

        if (!isSubscribed) return;

        if (!res.ok) {
          throw new Error(json.error || "Gagal mengambil data customer");
        }

        setCustomers(json.data || []);
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

    initFetch();

    return () => {
      isSubscribed = false;
    };
  }, []);

  // Manual refetch untuk pemanggilan dari event/mutasi aksi pengguna
  const refetch = useCallback(async () => {
    setLoading(true);
    await fetchCustomers();
  }, [fetchCustomers]);

  // Handler Tambah Customer
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

  // Handler Update Customer
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

  // Handler Hapus Customer
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
    loading,
    error,
    refetch,
    createCustomer,
    updateCustomer,
    deleteCustomer,
  };
}
