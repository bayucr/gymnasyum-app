"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Users } from "lucide-react";
import { CustomerTable } from "@/features/customers/components/customer-table";
import {
  CustomerFormDialog,
  CustomerFormValues,
} from "@/features/customers/components/customer-form-dialog";
import { useCustomers } from "@/features/customers/hooks/use-customers";

export default function CustomersPage() {
  const { customers, loading, createCustomer, updateCustomer, deleteCustomer } =
    useCustomers();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [selectedCustomer, setSelectedCustomer] = useState<any | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleOpenCreate = () => {
    setSelectedCustomer(null);
    setIsDialogOpen(true);
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleOpenEdit = (customer: any) => {
    setSelectedCustomer(customer);
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus pelanggan ini?")) return;

    try {
      await deleteCustomer(id);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Gagal menghapus customer";
      alert(message);
    }
  };

  const handleSubmit = async (values: CustomerFormValues) => {
    try {
      setIsSubmitting(true);
      if (selectedCustomer) {
        await updateCustomer(selectedCustomer.id, values);
      } else {
        await createCustomer(values);
      }
      setIsDialogOpen(false);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Gagal menyimpan data";
      alert(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <Users className="h-6 w-6 text-emerald-600" />
            Data Customer
          </h1>
          <p className="text-sm text-slate-500">
            Kelola data pelanggan, pantau rasio kehadiran, dan tingkat risiko
            pembatalan.
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
