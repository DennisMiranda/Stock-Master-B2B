export interface ResponseError<T> {
  code: string;
  message: string;
  details?: T;
}

export interface CustomResponse<T, U> {
  success: boolean;
  message: string;
  data?: T;
  error?: ResponseError<U>;
}
