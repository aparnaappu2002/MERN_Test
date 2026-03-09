import { User } from "../../entities/userEntity";

export interface IGetDashboardUseCase {
  getDashboardUsers(page: number, search: string): Promise<{ users: User[]; total: number }>;
}