import { Request, Response, Router } from "express"
import { injectedUserAuthController } from "../inject/userInject"

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

  }

}