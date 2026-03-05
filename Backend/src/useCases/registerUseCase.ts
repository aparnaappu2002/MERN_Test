import { User } from "../domain/entities/userEntity"
import { IUserRepository } from "../domain/interfaces/repositoryInterface/IuserRepository"
import { IUserRegisterUseCase } from "../domain/interfaces/useCaseInterface/IUserRegisterUseCase"
import { IhashPassword } from "../domain/interfaces/serviceInterface/IhashPassword"

export class RegisterUserUseCase implements IUserRegisterUseCase {

    private userRepository: IUserRepository
    private hashpassword: IhashPassword

    constructor(
        userRepository: IUserRepository,
        hashpassword: IhashPassword
    ) {
        this.userRepository = userRepository
        this.hashpassword = hashpassword
    }

    async registerUser(email: string, password: string): Promise<User> {

        const existingUser = await this.userRepository.findByEmail(email)

        if (existingUser) {
            throw new Error("User already exists")
        }

        const hashedPassword = await this.hashpassword.hashPassword(password)

        const user = await this.userRepository.create({
            email,
            password: hashedPassword
        })

        return user
    }
}