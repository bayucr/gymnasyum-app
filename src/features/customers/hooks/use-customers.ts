"use client";

import { useState, useEffect, useCallback } from "react";
import { CustomerWithRiskFlag } from "../services/customer.service";
import { CustomerFormValues } from "../components/customer-form-dialog";

export function useCustomers() {
  const [customers, setCustomers] = useState<CustomerWithRiskFlag[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Single fetch entrypoint tanpa pemanggilan setState sinkron sebelum await
  const fetchCustomers = useCallback(async () => {
    try {
      const res = await fetch("/api/customers");
      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.error || "Gagal mengambil data customer");
      }

      setCustomers(json.data || []);
      setError(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Terjadi kesalahan";
      setError(message);
      console.error("Gagal mengambil data customer:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Inisialisasi data asinkron saat komponen di-mount
  useEffect(() => {
    let isSubscribed = true;

    const initFetch = async () => {
      try {
        const res = await fetch("/api/customers");
        const json = await res.json();

        if (!isSubscribed) return;

        if (!res.ok) {
          throw new Error(json.error || "Gagal mengambil data customer");
        }

        setCustomers(json.data || []);
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

    initFetch();

    return () => {
      isSubscribed = false;
    };
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
    loading,
    error,
    refetch,
    createCustomer,
    updateCustomer,
    deleteCustomer,
  };
}
