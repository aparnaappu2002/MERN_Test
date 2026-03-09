export interface User {
  _id?: string
  email: string
  password: string
  imageUrl?: string
  audioUrl?: string
  createdAt?: Date
  updatedAt?: Date,
  kycStatus?:string
}