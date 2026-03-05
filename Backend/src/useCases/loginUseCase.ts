import { User } from "../domain/entities/userEntity"
import { IUserRepository } from "../domain/interfaces/repositoryInterface/IuserRepository"
import { IUserLoginUseCase } from "../domain/interfaces/useCaseInterface/IuserLoginUseCase"
import { IhashPassword } from "../domain/interfaces/serviceInterface/IhashPassword"

export class LoginUserUseCase implements IUserLoginUseCase {

    private userDatabase: IUserRepository
    private hashpassword: IhashPassword

    constructor(userDatabase: IUserRepository,hashPassword:IhashPassword) {
        this.userDatabase = userDatabase
        this.hashpassword = hashPassword
    }

    async loginUser(email: string, password: string): Promise<User | null> {

        const user = await this.userDatabase.findByEmail(email)

        if (!user) {
            throw new Error("No user exists with this email")
        }

        

        const isPasswordValid = await this.hashpassword.comparePassword(
            password,
            user.password
        )

        if (!isPasswordValid) {
            throw new Error("Invalid password")
        }

        return user
    }
}