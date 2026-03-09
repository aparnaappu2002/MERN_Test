import { IUserRepository } from "../domain/interfaces/repositoryInterface/IuserRepository";
import { IGetKycStatusUseCase } from "../domain/interfaces/useCaseInterface/IgetKycStatusUseCase";

export class GetKycStatusUseCase implements IGetKycStatusUseCase {
  private userRepository: IUserRepository;

  constructor(userRepository: IUserRepository) {
    this.userRepository = userRepository;
  }

  async getKycStatus(userId: string): Promise<{ kycStatus: string }> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new Error("User not found");
    }
    return { kycStatus: user.kycStatus || "pending" };
  }
}