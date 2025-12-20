import type { CustomResponse as CustomResponseModel } from "../models/custom-response.model";

export class CustomResponse {
  static success = <T>(
    data: T,
    message: string
  ): CustomResponseModel<T, null> => {
    return {
      success: true,
      message: message,
      data,
    };
  };

  static error = <T>(
    code: string,
    message: string,
    details?: T
  ): CustomResponseModel<null, T> => {
    return {
      success: false,
      message,
      error: {
        code,
        message,
        details,
      },
    };
  };
}
