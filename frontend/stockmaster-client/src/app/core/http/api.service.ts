import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api-response.model';

type HttpOptions = {
  headers?: HttpHeaders | { [header: string]: string | string[] };
  params?:
    | HttpParams
    | { [param: string]: string | number | boolean | ReadonlyArray<string | number | boolean> };
};

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  http = inject(HttpClient);

  apiUrl = environment.apiUrl;

  get<T>(path: string, options?: HttpOptions): Observable<ApiResponse<T>> {
    return this.http.get<ApiResponse<T>>(this.apiUrl + path, options);
  }

  post<T>(path: string, data: unknown, options?: HttpOptions): Observable<ApiResponse<T>> {
    return this.http.post<ApiResponse<T>>(this.apiUrl + path, data, options);
  }

  put<T>(path: string, data: unknown, options?: HttpOptions): Observable<ApiResponse<T>> {
    return this.http.put<ApiResponse<T>>(this.apiUrl + path, data, options);
  }

  delete<T>(path: string, options?: HttpOptions): Observable<ApiResponse<T>> {
    return this.http.delete<ApiResponse<T>>(this.apiUrl + path, options);
  }
}
