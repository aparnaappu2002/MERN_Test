import { JwtService } from "../service/jwtService"
import { RegisterUserUseCase } from "../../useCases/registerUseCase"
import { LoginUserUseCase } from "../../useCases/loginUseCase"
import { UserRepository } from "../../adapters/repository/user/userRepository"
import { UserAuthController } from "../../adapters/controllers/authenticationController"
import { hashPassword } from "../service/hashPassword"
import { SubmitKycUseCase } from "../../useCases/submitKycUseCase"
import { UserKycController } from "../../adapters/controllers/userKycController"
import { GetKycStatusUseCase } from "../../useCases/kycStatusUseCase"
import { GetDashboardUseCase } from "../../useCases/getDashboardUseCase"
import { UserDashboardController } from "../../adapters/controllers/userDashboardController"



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

const submitKycUseCase=new SubmitKycUseCase(userRepository)
const getStatusKycUseCase=new GetKycStatusUseCase(userRepository)
export const injectedUserKycController=new UserKycController(submitKycUseCase,getStatusKycUseCase)

const getDashboardUseCase=new GetDashboardUseCase(userRepository)
export const injectedDashboardController=new UserDashboardController(getDashboardUseCase)