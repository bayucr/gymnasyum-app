/**
 * Konversi ISO UTC String dari DB ke string lokal 'YYYY-MM-DDTHH:mm' untuk input datetime-local
 */
export function formatToLocalDatetimeInput(dateStr?: string | null): string {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return "";

  const pad = (n: number) => n.toString().padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

/**
 * Konversi string datetime-local browser ke ISO UTC String untuk Supabase
 */
export function formatLocalToUTCISO(localDatetimeStr: string): string {
  return new Date(localDatetimeStr).toISOString();
}
