import { Request, Response } from "express"
import { IUserRegisterUseCase } from "../../domain/interfaces/useCaseInterface/IUserRegisterUseCase"
import { IUserLoginUseCase } from "../../domain/interfaces/useCaseInterface/IuserLoginUseCase"
import { IJwtService } from "../../domain/interfaces/serviceInterface/IjwtService"
import { IJwtPayload } from "../../domain/interfaces/serviceInterface/IjwtPayload"
import { HttpStatus } from "../../domain/enums/HttpStatus"
import { setCookie } from "../../framework/service/tokenCookieSetting"

export class UserAuthController {

  private registerUseCase: IUserRegisterUseCase
  private loginUseCase: IUserLoginUseCase
  private jwtService: IJwtService

  constructor(
    registerUseCase: IUserRegisterUseCase,
    loginUseCase: IUserLoginUseCase,
    jwtService: IJwtService
  ) {
    this.registerUseCase = registerUseCase
    this.loginUseCase = loginUseCase
    this.jwtService = jwtService
  }

  async handleRegister(req: Request, res: Response): Promise<void> {
    try {

      const { email, password } = req.body

      const user = await this.registerUseCase.registerUser(email, password)

      console.log(`User registered successfully - email: ${email}`)

      res.status(HttpStatus.CREATED).json({
        message: "User registered successfully",
        user
      })

    } catch (error: any) {

      console.error("Error while registering user:", error)

      res.status(HttpStatus.BAD_REQUEST).json({
        message: error.message || "Registration failed"
      })

    }
  }

  async handleLogin(req: Request, res: Response): Promise<void> {

    try {

      const { email, password } = req.body

      const user = await this.loginUseCase.loginUser(email, password)

      if (!user) {
        res.status(HttpStatus.BAD_REQUEST).json({
          message: "Invalid credentials"
        })
        return
      }

      const payload: IJwtPayload = {
        userId: user._id?.toString() || "",
        email: user.email
      }

      const token = this.jwtService.generateToken(payload)

      setCookie(res, token)

      console.log(`User login successful - email: ${email}`)

      res.status(HttpStatus.OK).json({
        message: "Login successful",
        user,
        token
      })

    } catch (error: any) {

      console.error("Error while user login:", error)

      res.status(HttpStatus.UNAUTHORIZED).json({
        message: error.message || "Login failed"
      })

    }

  }

}