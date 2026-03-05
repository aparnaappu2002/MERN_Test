import { User } from "../../entities/userEntity"

export interface IUserLoginUseCase {
    loginUser(email: string, password: string): Promise<User | null>
}