/**
 * Format nomor telepon ke standar internasional WhatsApp (misal: 0812 -> 62812)
 */
export function formatPhoneForWA(phone: string): string {
  let cleaned = phone.replace(/[^0-9]/g, "");
  if (cleaned.startsWith("0")) {
    cleaned = "62" + cleaned.slice(1);
  }
  return cleaned;
}

/**
 * Generate draf pesan pengingat WhatsApp otomatis
 */
export function generateWAMessage(
  customerName: string,
  className: string,
  datetimeStr: string,
): string {
  try {
    const date = new Date(datetimeStr);
    const formattedDate = new Intl.DateTimeFormat("id-ID", {
      weekday: "long",
      day: "numeric",
      month: "long",
      timeStyle: "short",
    }).format(date);

    return `Halo Kak ${customerName}, sekadar mengingatkan untuk jadwal kelas ${className} pada ${formattedDate} WIB di Gymnasyum. Mohon konfirmasi kehadirannya ya, terima kasih!`;
  } catch {
    return `Halo Kak ${customerName}, sekadar mengingatkan untuk jadwal kelas ${className} di Gymnasyum. Mohon konfirmasi kehadirannya ya, terima kasih!`;
  }
}
