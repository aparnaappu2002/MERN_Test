import {User} from '../../entities/userEntity'

export interface IUserRepository {
  create(user: User): Promise<User>
  findByEmail(email: string): Promise<User | null>
  findById(userId: string): Promise<User | null>

  updateKyc(
    userId: string,
    imageUrl: string,
    audioUrl: string
  ): Promise<User | null>
    findAllPaginated(page: number, search: string): Promise<{ users: User[]; total: number }>; 


}