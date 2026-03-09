import { Request, Response, Router } from "express"
import { injectedUserAuthController } from "../inject/userInject"
import { authMiddleware } from "../../adapters/middleware/authMiddleware"
import { injectedUserKycController } from "../inject/userInject"
import { injectedDashboardController } from "../inject/userInject"

export class UserRoute {

  public userRoute: Router

  constructor() {
    this.userRoute = Router()
    this.setRoute()
  }

  private setRoute() {

    this.userRoute.post("/register", (req: Request, res: Response) => {
      injectedUserAuthController.handleRegister(req, res)
    })

    this.userRoute.post("/login", (req: Request, res: Response) => {
      injectedUserAuthController.handleLogin(req, res)
    })

    this.userRoute.post("/kyc", authMiddleware, (req: Request, res: Response) => {
      injectedUserKycController.submitKyc(req, res)
    })
    this.userRoute.get("/kyc-status", authMiddleware, (req: Request, res: Response) => {
      injectedUserKycController.getKycStatus(req, res)
    })
    this.userRoute.get("/dashboard", authMiddleware, (req: Request, res: Response) => {
      injectedDashboardController.getDashboard(req, res)
    })

  }

}