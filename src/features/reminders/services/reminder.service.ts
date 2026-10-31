import { ReminderLog } from "@/types/database.types";
import {
  reminderRepository,
  ReminderRepository,
} from "../repositories/reminder.repository";
import { ReminderSchemaInput } from "../schemas/reminder.schema";

export class ReminderService {
  constructor(private repo: ReminderRepository = reminderRepository) {}

  async getAllReminders() {
    return await this.repo.findAll();
  }

  async getTodayReminders() {
    return await this.repo.findToday();
  }

  async getReminderById(id: string): Promise<ReminderLog> {
    return await this.repo.findById(id);
  }

  async createReminder(input: ReminderSchemaInput): Promise<ReminderLog> {
    return await this.repo.create(input);
  }

  async updateReminder(
    id: string,
    input: Partial<ReminderSchemaInput>,
  ): Promise<ReminderLog> {
    return await this.repo.update(id, input);
  }

  async deleteReminder(id: string): Promise<void> {
    return await this.repo.delete(id);
  }
}

export const reminderService = new ReminderService();
