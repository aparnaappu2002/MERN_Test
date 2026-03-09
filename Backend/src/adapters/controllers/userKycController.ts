import { Request, Response } from "express"
import { ISubmitKycUseCase } from "../../domain/interfaces/useCaseInterface/IsubmitKycUseCase"
import { HttpStatus } from "../../domain/enums/HttpStatus"
import { IGetKycStatusUseCase } from "../../domain/interfaces/useCaseInterface/IgetKycStatusUseCase"
export class UserKycController {

  private submitKycUseCase: ISubmitKycUseCase
  private getKycStatusUseCase:IGetKycStatusUseCase

  constructor(submitKycUseCase: ISubmitKycUseCase,getKycStatusUseCase:IGetKycStatusUseCase) {
    this.submitKycUseCase = submitKycUseCase
    this.getKycStatusUseCase=getKycStatusUseCase
  }

  async submitKyc(req: Request, res: Response): Promise<void> {

    try {

      const userId = (req as any).user.userId

      const { imageUrl, audioUrl } = req.body

      if (!imageUrl || !audioUrl) {
        res.status(HttpStatus.BAD_REQUEST).json({
          message: "KYC image and audio are required"
        })
        return
      }

      await this.submitKycUseCase.submitKyc(
        userId,
        imageUrl,
        audioUrl
      )

      res.status(HttpStatus.OK).json({
        message: "KYC submitted successfully"
      })

    } catch (error: any) {

      console.error("KYC submit error:", error)

      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        message: error.message
      })

    }

  }

  async getKycStatus(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user.userId;
      const result = await this.getKycStatusUseCase.getKycStatus(userId);

      res.status(HttpStatus.OK).json(result);
    } catch (error: any) {
      console.error("Error fetching KYC status:", error);
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        message: error.message,
      });
    }
  }


}