import { User } from "../../entities/userEntity"

export interface ISubmitKycUseCase {

  submitKyc(
    userId: string,
    kycImage: string,
    kycAudio: string
  ): Promise<User | null>

}