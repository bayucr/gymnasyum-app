import { Schedule } from "@/types/database.types";
import {
  scheduleRepository,
  ScheduleRepository,
} from "../repositories/schedule.repository";
import { ScheduleSchemaInput } from "../schemas/schedule.schema";

export class ScheduleService {
  constructor(private repo: ScheduleRepository = scheduleRepository) {}

  async getAllSchedules(): Promise<Schedule[]> {
    return await this.repo.findAll();
  }

  async getScheduleById(id: string): Promise<Schedule> {
    return await this.repo.findById(id);
  }

  async createSchedule(input: ScheduleSchemaInput): Promise<Schedule> {
    return await this.repo.create(input);
  }

  async updateSchedule(
    id: string,
    input: Partial<ScheduleSchemaInput>,
  ): Promise<Schedule> {
    return await this.repo.update(id, input);
  }

  async deleteSchedule(id: string): Promise<void> {
    return await this.repo.delete(id);
  }
}

export const scheduleService = new ScheduleService();

// Export fungsi pembantu untuk kompatibilitas ke belakang
export const getSchedules = () => scheduleService.getAllSchedules();
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const createSchedule = (data: any) =>
  scheduleService.createSchedule(data);
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const updateSchedule = (id: string, data: any) =>
  scheduleService.updateSchedule(id, data);
export const deleteSchedule = (id: string) =>
  scheduleService.deleteSchedule(id);
