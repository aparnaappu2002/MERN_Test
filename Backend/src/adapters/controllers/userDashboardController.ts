import { Request, Response } from "express";
import { IGetDashboardUseCase } from "../../domain/interfaces/useCaseInterface/IgetDashboardUseCase";
import { HttpStatus } from "../../domain/enums/HttpStatus";

export class UserDashboardController {
  private getDashboardUseCase: IGetDashboardUseCase;

  constructor(getDashboardUseCase: IGetDashboardUseCase) {
    this.getDashboardUseCase = getDashboardUseCase;
  }

  async getDashboard(req: Request, res: Response): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const search = (req.query.search as string) || "";

      const result = await this.getDashboardUseCase.getDashboardUsers(page, search);

      res.status(HttpStatus.OK).json({
        users: result.users,
        total: result.total,
      });
    } catch (error: any) {
      console.error("Dashboard fetch error:", error);
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        message: error.message || "Failed to fetch dashboard data",
      });
    }
  }
}