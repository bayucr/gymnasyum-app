"use client";

import { useState, Fragment } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Pencil,
  Trash2,
  AlertTriangle,
  Clock,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  PlusCircle,
  CalendarDays,
} from "lucide-react";
import { CustomerWithPriority } from "../services/customer.service";
import { BookingWithSchedule } from "@/features/bookings/repositories/booking.repository";

interface CustomerTableProps {
  customers: CustomerWithPriority[];
  onEdit: (customer: CustomerWithPriority) => void;
  onDelete: (id: string) => void;
  onAssignClass?: (customer: CustomerWithPriority) => void; // Dibuat optional
  customerBookings?: Record<string, BookingWithSchedule[]>;
  onFetchCustomerBookings?: (customerId: string) => void;
}

export function CustomerTable({
  customers,
  onEdit,
  onDelete,
  onAssignClass,
  customerBookings = {},
  onFetchCustomerBookings,
}: CustomerTableProps) {
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({});

  const toggleRow = (customerId: string) => {
    const isExpanding = !expandedRows[customerId];
    setExpandedRows((prev) => ({ ...prev, [customerId]: isExpanding }));

    if (
      isExpanding &&
      onFetchCustomerBookings &&
      !customerBookings[customerId]
    ) {
      onFetchCustomerBookings(customerId);
    }
  };

  if (customers.length === 0) {
    return (
      <div className="p-8 text-center text-slate-500 bg-white rounded-lg border border-slate-200">
        Belum ada data customer. Klik Tambah Customer untuk menambahkan data
        baru.
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-slate-200 overflow-hidden shadow-sm">
      <Table>
        <TableHeader>
          <TableRow className="bg-slate-50">
            <TableHead className="w-[40px]"></TableHead>
            <TableHead className="font-semibold">Nama</TableHead>
            <TableHead className="font-semibold">No. WhatsApp</TableHead>
            <TableHead className="font-semibold">Segmen</TableHead>
            <TableHead className="font-semibold">Status</TableHead>
            <TableHead className="font-semibold">Kehadiran</TableHead>
            <TableHead className="font-semibold">Prioritas Follow-up</TableHead>
            <TableHead className="text-right font-semibold">Aksi</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {customers.map((customer) => {
            const isExpanded = !!expandedRows[customer.id];
            const bookings = customerBookings[customer.id] || [];

            return (
              <Fragment key={customer.id}>
                <TableRow className="hover:bg-slate-50/50">
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => toggleRow(customer.id)}
                      className="h-6 w-6 text-slate-500"
                    >
                      {isExpanded ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                    </Button>
                  </TableCell>
                  <TableCell className="font-medium text-slate-900">
                    {customer.name}
                  </TableCell>
                  <TableCell className="text-slate-600">
                    {customer.phone}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className="bg-slate-50 text-slate-700"
                    >
                      {customer.segment}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      className={
                        customer.status === "Active"
                          ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-100"
                          : "bg-slate-100 text-slate-600 hover:bg-slate-100"
                      }
                    >
                      {customer.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-slate-700 font-medium">
                    {Math.round(customer.attendance_rate * 100)}%
                  </TableCell>
                  <TableCell>
                    {customer.priorityLevel === "High" && (
                      <Badge
                        variant="destructive"
                        className="bg-rose-100 text-rose-800 hover:bg-rose-100 border-rose-200 gap-1"
                      >
                        <AlertTriangle className="h-3 w-3 text-rose-600" />
                        High
                      </Badge>
                    )}
                    {customer.priorityLevel === "Medium" && (
                      <Badge
                        variant="outline"
                        className="bg-amber-50 text-amber-800 hover:bg-amber-50 border-amber-200 gap-1"
                      >
                        <Clock className="h-3 w-3 text-amber-600" />
                        Medium
                      </Badge>
                    )}
                    {customer.priorityLevel === "Low" && (
                      <Badge
                        variant="outline"
                        className="bg-emerald-50 text-emerald-800 hover:bg-emerald-50 border-emerald-200 gap-1"
                      >
                        <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                        Low
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onAssignClass?.(customer)}
                        className="h-8 gap-1 text-xs text-emerald-700 border-emerald-200 hover:bg-emerald-50"
                      >
                        <PlusCircle className="h-3.5 w-3.5" />
                        Daftar Kelas
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onEdit(customer)}
                        className="h-8 w-8 text-slate-600 hover:text-slate-900"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onDelete(customer.id)}
                        className="h-8 w-8 text-rose-600 hover:text-rose-700 hover:bg-rose-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>

                {/* Sub-row rincian kelas */}
                {isExpanded && (
                  <TableRow className="bg-slate-50/70">
                    <TableCell colSpan={8} className="p-4 pl-12">
                      <div className="space-y-2">
                        <span className="text-xs font-semibold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
                          <CalendarDays className="h-3.5 w-3.5 text-slate-500" />
                          Kelas yang Diikuti:
                        </span>
                        {bookings.length === 0 ? (
                          <p className="text-xs text-slate-400 italic">
                            Belum terdaftar di kelas manapun.
                          </p>
                        ) : (
                          <div className="flex flex-wrap gap-2">
                            {bookings.map((b) => (
                              <Badge
                                key={b.id}
                                variant="outline"
                                className="bg-white border-slate-200 text-slate-800 py-1 px-2.5 text-xs flex items-center gap-2"
                              >
                                <span className="font-semibold text-emerald-700">
                                  {b.schedules?.class_name || "Kelas"}
                                </span>
                                {b.schedules?.datetime && (
                                  <span className="text-slate-500">
                                    (
                                    {new Date(
                                      b.schedules.datetime,
                                    ).toLocaleString("id-ID", {
                                      weekday: "short",
                                      hour: "2-digit",
                                      minute: "2-digit",
                                    })}
                                    )
                                  </span>
                                )}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </Fragment>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
