"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Plus, Users } from "lucide-react";
import { CustomerTable } from "@/features/customers/components/customer-table";
import {
  CustomerFormDialog,
  CustomerFormValues,
} from "@/features/customers/components/customer-form-dialog";
import { useCustomers } from "@/features/customers/hooks/use-customers";
import { CustomerWithRiskFlag } from "@/features/customers/services/customer.service";
import { ErrorBanner } from "@/components/shared/error-banner";

export default function CustomersPage() {
  const {
    customers,
    loading,
    error,
    refetch,
    createCustomer,
    updateCustomer,
    deleteCustomer,
  } = useCustomers();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] =
    useState<CustomerWithRiskFlag | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleOpenCreate = () => {
    setSelectedCustomer(null);
    setIsDialogOpen(true);
  };

  const handleOpenEdit = (customer: CustomerWithRiskFlag) => {
    setSelectedCustomer(customer);
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus pelanggan ini?")) return;

    try {
      await deleteCustomer(id);
      toast.success("Data customer berhasil dihapus");
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Gagal menghapus customer";
      toast.error(message);
    }
  };

  const handleSubmit = async (values: CustomerFormValues) => {
    try {
      setIsSubmitting(true);
      if (selectedCustomer) {
        await updateCustomer(selectedCustomer.id, values);
        toast.success("Data customer berhasil diperbarui");
      } else {
        await createCustomer(values);
        toast.success("Customer baru berhasil ditambahkan");
      }
      setIsDialogOpen(false);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Gagal menyimpan data";
      toast.error(message);
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

      {error && (
        <ErrorBanner
          title="Gagal Memuat Data Customer"
          message={error}
          onRetry={refetch}
        />
      )}

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
