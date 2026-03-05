import { User } from "../../entities/userEntity"

export interface IUserRegisterUseCase {
    registerUser(email: string, password: string): Promise<User>
}