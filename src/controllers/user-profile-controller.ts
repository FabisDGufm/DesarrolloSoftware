import type { Request, Response, NextFunction } from 'express';

export class UserProfileController {
  constructor(private profileService: any) {}

  getProfile = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = Number(req.params.id);

      const data = await this.profileService.getProfile(userId);

      res.status(200).json({ data });
    } catch (error) {
      next(error);
    }
  };
}