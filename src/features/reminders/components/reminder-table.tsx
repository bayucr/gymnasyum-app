"use client";

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
import { Pencil, Trash2, Send } from "lucide-react";
import { formatPhoneForWA } from "../utils";

interface ReminderLogItem {
  id: string;
  customer_id: string;
  schedule_id: string;
  draft_message: string | null;
  status: string;
  priority: string;
  customers?: {
    id: string;
    name: string;
    phone: string;
  } | null;
  schedules?: {
    id: string;
    class_name: string;
    datetime: string;
  } | null;
}

interface ReminderTableProps {
  reminders: ReminderLogItem[];
  onEdit: (reminder: ReminderLogItem) => void;
  onDelete: (id: string) => void;
}

export function ReminderTable({
  reminders,
  onEdit,
  onDelete,
}: ReminderTableProps) {
  if (reminders.length === 0) {
    return (
      <div className="p-8 text-center text-slate-500 bg-white rounded-lg border border-slate-200">
        Belum ada log pengingat. Klik ikon pengingat di tabel customer untuk
        mencatat draf pesan baru.
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Sent":
        return (
          <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 border-none">
            Sent
          </Badge>
        );
      case "Responded":
        return (
          <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-none">
            Responded
          </Badge>
        );
      case "No Response":
        return (
          <Badge className="bg-rose-100 text-rose-700 hover:bg-rose-100 border-none">
            No Response
          </Badge>
        );
      default:
        return (
          <Badge className="bg-slate-100 text-slate-700 hover:bg-slate-100 border-none">
            Scheduled
          </Badge>
        );
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "High":
        return (
          <Badge
            variant="outline"
            className="border-rose-200 bg-rose-50 text-rose-700"
          >
            High
          </Badge>
        );
      case "Medium":
        return (
          <Badge
            variant="outline"
            className="border-amber-200 bg-amber-50 text-amber-700"
          >
            Medium
          </Badge>
        );
      default:
        return (
          <Badge
            variant="outline"
            className="border-slate-200 bg-slate-50 text-slate-600"
          >
            Low
          </Badge>
        );
    }
  };

  const handleOpenWhatsApp = (phone?: string, message?: string) => {
    if (!phone) {
      alert("Nomor WhatsApp tidak tersedia");
      return;
    }
    const cleanPhone = formatPhoneForWA(phone);
    const encodedMessage = encodeURIComponent(message || "");
    window.open(`https://wa.me/${cleanPhone}?text=${encodedMessage}`, "_blank");
  };

  return (
    <div className="bg-white rounded-lg border border-slate-200 overflow-hidden shadow-sm">
      <Table>
        <TableHeader>
          <TableRow className="bg-slate-50">
            <TableHead className="font-semibold">Customer</TableHead>
            <TableHead className="font-semibold">Kelas</TableHead>
            <TableHead className="font-semibold">Draf Pesan</TableHead>
            <TableHead className="font-semibold">Prioritas</TableHead>
            <TableHead className="font-semibold">Status</TableHead>
            <TableHead className="text-right font-semibold">Aksi</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {reminders.map((log) => (
            <TableRow key={log.id} className="hover:bg-slate-50/50">
              <TableCell className="font-medium text-slate-900">
                <div>{log.customers?.name || "Customer N/A"}</div>
                <div className="text-xs text-slate-500 font-normal">
                  {log.customers?.phone || "-"}
                </div>
              </TableCell>
              <TableCell className="text-slate-600">
                <div>{log.schedules?.class_name || "Kelas N/A"}</div>
                {log.schedules?.datetime && (
                  <div className="text-xs text-slate-400">
                    {new Date(log.schedules.datetime).toLocaleString("id-ID", {
                      weekday: "short",
                      day: "numeric",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                )}
              </TableCell>
              <TableCell className="max-w-[280px] truncate text-slate-600 text-xs">
                {log.draft_message || "-"}
              </TableCell>
              <TableCell>{getPriorityBadge(log.priority)}</TableCell>
              <TableCell>{getStatusBadge(log.status)}</TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() =>
                      handleOpenWhatsApp(
                        log.customers?.phone,
                        log.draft_message || "",
                      )
                    }
                    title="Kirim via WhatsApp"
                    className="h-8 w-8 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onEdit(log)}
                    className="h-8 w-8 text-slate-600 hover:text-slate-900"
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onDelete(log.id)}
                    className="h-8 w-8 text-rose-600 hover:text-rose-700 hover:bg-rose-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
