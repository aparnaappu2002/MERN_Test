import { IUserRepository } from "../domain/interfaces/repositoryInterface/IuserRepository"
import { ISubmitKycUseCase } from "../domain/interfaces/useCaseInterface/IsubmitKycUseCase"
import { User } from "../domain/entities/userEntity"

export class SubmitKycUseCase implements ISubmitKycUseCase {

  private userDatabase: IUserRepository

  constructor(userDatabase: IUserRepository) {
    this.userDatabase = userDatabase
  }

  async submitKyc(
    userId: string,
    kycImage: string,
    kycAudio: string
  ): Promise<User | null> {

    if (!kycImage) {
      throw new Error("KYC Image is required")
    }

    if (!kycAudio) {
      throw new Error("KYC Audio is required")
    }

    const user = await this.userDatabase.updateKyc(
      userId,
      kycImage,
      kycAudio
    )

    if (!user) {
      throw new Error("User not found")
    }

    return user
  }
}