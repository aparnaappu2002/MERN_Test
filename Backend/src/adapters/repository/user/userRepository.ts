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

  async findById(userId: string): Promise<User | null> {

    const user = await UserModel.findById(userId)

    if (!user) return null

    return {
      _id: user._id.toString(),
      email: user.email,
      password: user.password,
      imageUrl: user.imageUrl,
      audioUrl: user.audioUrl,
      kycStatus: user.kycStatus
    }

  }

  async updateKyc(
    userId: string,
    imageUrl: string,
    audioUrl: string
  ): Promise<User | null> {

    const user = await UserModel.findByIdAndUpdate(
      userId,
      {
        imageUrl,
        audioUrl,
        kycStatus: "submitted"
      },
      { new: true }
    )

    if (!user) return null

    return {
      _id: user._id.toString(),
      email: user.email,
      password: user.password,
      imageUrl: user.imageUrl,
      audioUrl: user.audioUrl,
      kycStatus: user.kycStatus
    }

  }

  async findAllPaginated(page: number, search: string): Promise<{ users: User[]; total: number }> {
  const limit = 5;
  const skip = (page - 1) * limit;

  const query = search
    ? { email: { $regex: search, $options: "i" } }
    : {};

  const [users, total] = await Promise.all([
    UserModel.find(query)
      .select("_id email kycStatus imageUrl audioUrl createdAt updatedAt") 
      .skip(skip)
      .limit(limit)
      .lean(),
    UserModel.countDocuments(query),
  ]);

  const mappedUsers = users.map((user) => ({
    ...user,
    _id: user._id.toString(),
  }));

  return { users: mappedUsers as User[], total };
}



}