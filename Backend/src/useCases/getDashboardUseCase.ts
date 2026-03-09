import { User } from "../domain/entities/userEntity";
import { IUserRepository } from "../domain/interfaces/repositoryInterface/IuserRepository";
import { IGetDashboardUseCase } from "../domain/interfaces/useCaseInterface/IgetDashboardUseCase";

export class GetDashboardUseCase implements IGetDashboardUseCase {
  private userRepository: IUserRepository;

  constructor(userRepository: IUserRepository) {
    this.userRepository = userRepository;
  }

  async getDashboardUsers(page: number, search: string): Promise<{ users: User[]; total: number }> {
    const result = await this.userRepository.findAllPaginated(page, search);
    return result;
  }
}