export interface IGetKycStatusUseCase {
  getKycStatus(userId: string): Promise<{ kycStatus: string }>;
}