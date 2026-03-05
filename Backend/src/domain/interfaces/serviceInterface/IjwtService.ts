export interface IJwtService {
  generateToken(payload: object): string
  verifyToken(token: string): any
}