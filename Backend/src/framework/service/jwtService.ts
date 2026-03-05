import jwt from "jsonwebtoken"
import { IJwtService } from "../../domain/interfaces/serviceInterface/IjwtService"
import { IJwtPayload } from "../../domain/interfaces/serviceInterface/IjwtPayload"

export class JwtService implements IJwtService {

  private secret: string

  constructor() {
    if (!process.env.JWTSECRET) {
      throw new Error("JWTSECRET not defined")
    }

    this.secret = process.env.JWTSECRET
  }

  generateToken(payload: IJwtPayload): string {

    return jwt.sign(payload, this.secret, {
      expiresIn: "1d"
    })

  }

  verifyToken(token: string): IJwtPayload {

    return jwt.verify(token, this.secret) as IJwtPayload

  }

}