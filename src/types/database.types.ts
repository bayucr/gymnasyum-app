export type SegmentType = "Ibu-ibu" | "Lansia" | "Umum";
export type CustomerStatus = "Active" | "Inactive";
export type ReminderStatus = "Scheduled" | "Sent" | "Responded" | "No Response";
export type PriorityLevel = "Low" | "Medium" | "High";

export interface Customer {
  id: string;
  name: string;
  phone: string;
  segment: SegmentType;
  status: CustomerStatus;
  attendance_rate: number;
  cancellation_count: number;
  created_at?: string;
}

export interface Schedule {
  id: string;
  class_name: string;
  datetime: string;
  quota: number;
  created_at?: string;
}

export interface ReminderLog {
  id: string;
  customer_id: string;
  schedule_id: string;
  status: ReminderStatus;
  priority: PriorityLevel;
  draft_message: string | null;
  updated_at?: string;
  created_at?: string;
  customers?: Customer;
  schedules?: Schedule;
}
