"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Copy, Send, Check, Eye } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { formatPhoneForWA } from "../utils";

interface MessagePreviewDialogProps {
  isOpen: boolean;
  onClose: () => void;
  customerName?: string;
  phone?: string;
  message?: string;
}

export function MessagePreviewDialog({
  isOpen,
  onClose,
  customerName,
  phone,
  message,
}: MessagePreviewDialogProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (!message) return;
    navigator.clipboard.writeText(message);
    setCopied(true);
    toast.success("Pesan berhasil disalin ke clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSendWA = () => {
    if (!phone) {
      toast.error("Nomor WhatsApp tidak tersedia");
      return;
    }
    const cleanPhone = formatPhoneForWA(phone);
    const encoded = encodeURIComponent(message || "");
    window.open(`https://wa.me/${cleanPhone}?text=${encoded}`, "_blank");
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-slate-900 text-base font-semibold">
            <Eye className="h-5 w-5 text-emerald-600" />
            Detail Draf Pesan - {customerName || "Customer"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200 text-sm text-slate-800 whitespace-pre-wrap leading-relaxed max-h-[280px] overflow-y-auto">
            {message || "Tidak ada draf pesan."}
          </div>

          <div className="flex justify-between items-center pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleCopy}
              disabled={!message}
              className="gap-1.5 text-xs text-slate-700 hover:bg-slate-100"
            >
              {copied ? (
                <Check className="h-3.5 w-3.5 text-emerald-600" />
              ) : (
                <Copy className="h-3.5 w-3.5 text-slate-500" />
              )}
              {copied ? "Tersalin" : "Salin Pesan"}
            </Button>

            <Button
              type="button"
              size="sm"
              onClick={handleSendWA}
              disabled={!phone}
              className="bg-emerald-600 hover:bg-emerald-700 gap-1.5 text-xs text-white"
            >
              <Send className="h-3.5 w-3.5" />
              Kirim via WhatsApp
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
