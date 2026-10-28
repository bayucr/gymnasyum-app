"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Plus, Users } from "lucide-react";
import { CustomerTable } from "@/features/customers/components/customer-table";
import {
  CustomerFormDialog,
  CustomerFormValues,
} from "@/features/customers/components/customer-form-dialog";
import { useCustomers } from "@/features/customers/hooks/use-customers";
import { CustomerWithPriority } from "@/features/customers/services/customer.service";
import { ErrorBanner } from "@/components/shared/error-banner";
import { AssignClassDialog } from "@/features/bookings/components/assign-class-dialog";
import { CreateReminderDialog } from "@/features/reminders/components/create-reminder-dialog";
import { useBookings } from "@/features/bookings/hooks/use-bookings";
import { BookingWithSchedule } from "@/features/bookings/repositories/booking.repository";
import { Schedule } from "@/types/database.types";
import { ReminderSchemaInput } from "@/features/reminders/schemas/reminder.schema";

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

  const { getCustomerSchedules, createBooking } = useBookings();

  // State Form Edit/Create Customer
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] =
    useState<CustomerWithPriority | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // State Assign Class Modal & Expandable Bookings
  const [isAssignOpen, setIsAssignOpen] = useState(false);
  const [customerForAssign, setCustomerForAssign] =
    useState<CustomerWithPriority | null>(null);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [customerBookings, setCustomerBookings] = useState<
    Record<string, BookingWithSchedule[]>
  >({});

  // State Reminder Modal
  const [isReminderOpen, setIsReminderOpen] = useState(false);
  const [customerForReminder, setCustomerForReminder] =
    useState<CustomerWithPriority | null>(null);

  // Fetch daftar jadwal kelas untuk dropdown modal pendaftaran
  useEffect(() => {
    async function fetchSchedules() {
      try {
        const res = await fetch("/api/schedules");
        const json = await res.json();
        if (res.ok) setSchedules(json.data || []);
      } catch {
        // Fallback jika fetch gagal
      }
    }
    fetchSchedules();
  }, []);

  const handleOpenCreate = () => {
    setSelectedCustomer(null);
    setIsDialogOpen(true);
  };

  const handleOpenEdit = (customer: CustomerWithPriority) => {
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

  // Handler Expand Row (Fetch List Kelas Customer)
  const handleFetchCustomerBookings = async (customerId: string) => {
    const list = await getCustomerSchedules(customerId);
    setCustomerBookings((prev) => ({ ...prev, [customerId]: list }));
    return list;
  };

  // Handler Buka Modal Assign Class
  const handleOpenAssign = (customer: CustomerWithPriority) => {
    setCustomerForAssign(customer);
    setIsAssignOpen(true);
  };

  // Handler Submit Assign Class
  const handleAssignSubmit = async (customerId: string, scheduleId: string) => {
    try {
      await createBooking(customerId, scheduleId);
      toast.success("Customer berhasil didaftarkan ke kelas");
      // Refresh list booking yang tampil pada expandable row
      handleFetchCustomerBookings(customerId);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Gagal mendaftar kelas";
      toast.error(msg);
    }
  };

  // Handler Buka Modal Create Reminder
  const handleOpenReminder = async (customer: CustomerWithPriority) => {
    setCustomerForReminder(customer);
    if (!customerBookings[customer.id]) {
      await handleFetchCustomerBookings(customer.id);
    }
    setIsReminderOpen(true);
  };

  // Handler Submit Create Reminder
  const handleReminderSubmit = async (data: ReminderSchemaInput) => {
    try {
      const res = await fetch("/api/reminders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.error || "Gagal membuat log pengingat");
      }

      toast.success("Pengingat berhasil dibuat");
      setIsReminderOpen(false);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Terjadi kesalahan";
      toast.error(msg);
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
            Kelola data pelanggan, pantau rasio kehadiran, dan buat pengingat
            jadwal kelas.
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
          onAssignClass={handleOpenAssign}
          onCreateReminder={handleOpenReminder}
          customerBookings={customerBookings}
          onFetchCustomerBookings={handleFetchCustomerBookings}
        />
      )}

      <CustomerFormDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onSubmit={handleSubmit}
        initialData={selectedCustomer}
        isSubmitting={isSubmitting}
      />

      <AssignClassDialog
        isOpen={isAssignOpen}
        onClose={() => setIsAssignOpen(false)}
        customer={customerForAssign}
        schedules={schedules}
        onSubmit={handleAssignSubmit}
      />

      <CreateReminderDialog
        isOpen={isReminderOpen}
        onClose={() => setIsReminderOpen(false)}
        customer={customerForReminder}
        customerBookings={
          customerForReminder
            ? customerBookings[customerForReminder.id] || []
            : []
        }
        onSubmit={handleReminderSubmit}
      />
    </div>
  );
}
