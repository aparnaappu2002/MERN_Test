import { userSchema } from "../schema/userSchema"
import { User } from "../../../domain/entities/userEntity"
import { model, Document, Types } from "mongoose"

export interface IUserModel
  extends Omit<User, "_id">,
    Document {
  _id: Types.ObjectId
}

export const UserModel = model<IUserModel>(
  "user",
  userSchema
)