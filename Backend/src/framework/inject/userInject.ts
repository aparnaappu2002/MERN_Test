import { JwtService } from "../service/jwtService"
import { RegisterUserUseCase } from "../../useCases/registerUseCase"
import { LoginUserUseCase } from "../../useCases/loginUseCase"
import { UserRepository } from "../../adapters/repository/user/userRepository"
import { UserAuthController } from "../../adapters/controllers/authenticationController"
import { hashPassword } from "../service/hashPassword"



const userRepository = new UserRepository()
const hashpassword=new hashPassword()

const registerUseCase = new RegisterUserUseCase(userRepository,hashpassword)
const loginUseCase = new LoginUserUseCase(userRepository,hashpassword)

const jwtService = new JwtService()
export const injectedUserAuthController = new UserAuthController(
  registerUseCase,
  loginUseCase,
  jwtService
)