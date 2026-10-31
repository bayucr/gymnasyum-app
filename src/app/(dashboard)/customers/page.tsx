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
import { CustomerWithPriority } from "@/features/customers/services/customer.service";
import { ErrorBanner } from "@/components/shared/error-banner";
import { AssignClassDialog } from "@/features/bookings/components/assign-class-dialog";
import { CreateReminderDialog } from "@/features/reminders/components/create-reminder-dialog";
import { useBookings } from "@/features/bookings/hooks/use-bookings";
import { BookingWithSchedule } from "@/features/bookings/repositories/booking.repository";
import { ReminderSchemaInput } from "@/features/reminders/schemas/reminder.schema";
import { useSchedules } from "@/features/schedules/hooks/use-schedules";
import { useReminders } from "@/features/reminders/hooks/use-reminders";

export default function CustomersPage() {
  // 1. Data Hooks
  const {
    customers,
    loading,
    error,
    refetch,
    createCustomer,
    updateCustomer,
    deleteCustomer,
  } = useCustomers();

  const { schedules } = useSchedules();
  const { createReminder } = useReminders();
  const { getCustomerSchedules, createBooking } = useBookings();

  // 2. Consolidated UI State for Modals
  const [activeModal, setActiveModal] = useState<{
    type: "customer" | "assign" | "reminder" | null;
    customer: CustomerWithPriority | null;
  }>({ type: null, customer: null });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [customerBookings, setCustomerBookings] = useState<
    Record<string, BookingWithSchedule[]>
  >({});

  // 3. Modal Open/Close Handlers
  const closeModal = () => setActiveModal({ type: null, customer: null });

  const handleOpenCreate = () =>
    setActiveModal({ type: "customer", customer: null });

  const handleOpenEdit = (customer: CustomerWithPriority) =>
    setActiveModal({ type: "customer", customer });

  const handleOpenAssign = (customer: CustomerWithPriority) =>
    setActiveModal({ type: "assign", customer });

  const handleOpenReminder = async (customer: CustomerWithPriority) => {
    setActiveModal({ type: "reminder", customer });
    if (!customerBookings[customer.id]) {
      await handleFetchCustomerBookings(customer.id);
    }
  };

  // 4. CRUD Customer Handlers
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

  const handleSubmitCustomer = async (values: CustomerFormValues) => {
    try {
      setIsSubmitting(true);
      if (activeModal.customer) {
        await updateCustomer(activeModal.customer.id, values);
        toast.success("Data customer berhasil diperbarui");
      } else {
        await createCustomer(values);
        toast.success("Customer baru berhasil ditambahkan");
      }
      closeModal();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Gagal menyimpan data";
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // 5. Booking & Expandable Table Handlers
  const handleFetchCustomerBookings = async (customerId: string) => {
    const list = await getCustomerSchedules(customerId);
    if (list) {
      setCustomerBookings((prev) => ({ ...prev, [customerId]: list }));
    }
    return list;
  };

  const handleAssignSubmit = async (customerId: string, scheduleId: string) => {
    try {
      await createBooking(customerId, scheduleId);
      toast.success("Customer berhasil didaftarkan ke kelas");
      handleFetchCustomerBookings(customerId);
      closeModal();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Gagal mendaftar kelas";
      toast.error(msg);
    }
  };

  // 6. Reminder Submit Handler
  const handleReminderSubmit = async (data: ReminderSchemaInput) => {
    try {
      await createReminder(data);
      toast.success("Pengingat berhasil dibuat");
      closeModal();
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
        isOpen={activeModal.type === "customer"}
        onClose={closeModal}
        onSubmit={handleSubmitCustomer}
        initialData={activeModal.customer}
        isSubmitting={isSubmitting}
      />

      <AssignClassDialog
        isOpen={activeModal.type === "assign"}
        onClose={closeModal}
        customer={activeModal.customer}
        schedules={schedules}
        onSubmit={handleAssignSubmit}
      />

      <CreateReminderDialog
        isOpen={activeModal.type === "reminder"}
        onClose={closeModal}
        customer={activeModal.customer}
        customerBookings={
          activeModal.customer
            ? customerBookings[activeModal.customer.id] || []
            : []
        }
        onSubmit={handleReminderSubmit}
      />
    </div>
  );
}
