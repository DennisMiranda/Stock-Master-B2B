import { Request, Response } from "express";
import { SettingsService } from "../services/settings/settings.service";
import { CustomResponse } from "../utils/custom-response";

export class SettingsController {
  private settingsService: SettingsService;

  constructor(settingsService: SettingsService) {
    this.settingsService = settingsService;
  }

  async getDistricts(req: Request, res: Response) {
    try {
      const districts = await this.settingsService.getDistricts();
      res.json(
        CustomResponse.success(districts, "Districts retrieved successfully")
      );
    } catch (error: any) {
      res
        .status(500)
        .json(
          CustomResponse.error(
            "SETTINGS_DISTRICTS",
            "Failed to retrieve districts"
          )
        );
    }
  }
}

export const settingsController = new SettingsController(new SettingsService());
