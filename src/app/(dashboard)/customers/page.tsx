"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, UserCheck } from "lucide-react";
import { CustomerTable } from "@/features/customers/components/customer-table";
import {
  CustomerFormDialog,
  CustomerFormValues,
} from "@/features/customers/components/customer-form-dialog";
import { Customer } from "@/types/database.types";

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(
    null,
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchCustomers = async () => {
    try {
      const res = await fetch("/api/customers");
      const json = await res.json();
      if (json.data) {
        setCustomers(json.data);
      }
    } catch (err) {
      console.error("Gagal mengambil data customers:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let isSubscribed = true;

    const init = async () => {
      try {
        const res = await fetch("/api/customers");
        const json = await res.json();
        if (isSubscribed && json.data) {
          setCustomers(json.data);
        }
      } catch (err) {
        console.error("Gagal mengambil data customers:", err);
      } finally {
        if (isSubscribed) {
          setLoading(false);
        }
      }
    };

    init();

    return () => {
      isSubscribed = false;
    };
  }, []);

  const handleOpenCreate = () => {
    setSelectedCustomer(null);
    setIsDialogOpen(true);
  };

  const handleOpenEdit = (customer: Customer) => {
    setSelectedCustomer(customer);
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus customer ini?")) return;

    try {
      setLoading(true);
      const res = await fetch(`/api/customers/${id}`, { method: "DELETE" });
      if (res.ok) {
        await fetchCustomers();
      }
    } catch (err) {
      console.error("Gagal menghapus customer:", err);
      setLoading(false);
    }
  };

  const handleSubmit = async (values: CustomerFormValues) => {
    try {
      setIsSubmitting(true);
      if (selectedCustomer) {
        await fetch(`/api/customers/${selectedCustomer.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(values),
        });
      } else {
        await fetch("/api/customers", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(values),
        });
      }
      setIsDialogOpen(false);
      setLoading(true);
      await fetchCustomers();
    } catch (err) {
      console.error("Gagal menyimpan customer:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <UserCheck className="h-6 w-6 text-emerald-600" />
            Data Customer Gym
          </h1>
          <p className="text-sm text-slate-500">
            Kelola data anggota gym, segmen, statistik kehadiran, dan nomor
            kontak WhatsApp.
          </p>
        </div>
        <Button
          onClick={handleOpenCreate}
          className="bg-emerald-600 hover:bg-emerald-700 gap-2"
        >
          <Plus className="h-4 w-4" />
          Tambah Customer
        </Button>
      </div>

      {loading ? (
        <div className="p-8 text-center text-slate-500 bg-white rounded-lg border border-slate-200">
          Memuat data customer...
        </div>
      ) : (
        <CustomerTable
          customers={customers}
          onEdit={handleOpenEdit}
          onDelete={handleDelete}
        />
      )}

      <CustomerFormDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onSubmit={handleSubmit}
        initialData={selectedCustomer}
        isSubmitting={isSubmitting}
      />
    </div>
  );
}
