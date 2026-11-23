import {
  PaginatedResult,
  ReminderFilterParams,
  ReminderLog,
} from "@/types/database.types";
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

  async getPaginatedReminders(
    params: ReminderFilterParams,
  ): Promise<PaginatedResult<ReminderLog>> {
    const page = Math.max(1, params.page ?? 1);
    const limit = Math.min(100, Math.max(1, params.limit ?? 10));

    const { data, total } = await this.repo.findPaginated({
      ...params,
      page,
      limit,
    });

    return {
      items: data,
      meta: {
        page,
        limit,
        totalItems: total,
        totalPages: Math.max(1, Math.ceil(total / limit)),
      },
    };
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
