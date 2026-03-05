import { UserModel } from "../../../framework/database/models/userModel"
import { IUserRepository } from "../../../domain/interfaces/repositoryInterface/IuserRepository"
import { User } from "../../../domain/entities/userEntity"

export class UserRepository implements IUserRepository {

  async create(user: User): Promise<User> {
    const newUser = await UserModel.create(user)
    return {
      _id: newUser._id.toString(),
      email: newUser.email,
      password: newUser.password,
      imageUrl: newUser.imageUrl,
      audioUrl: newUser.audioUrl
    }

  }

  async findByEmail(email: string): Promise<User | null> {
    return UserModel.findOne({ email })
  }

}