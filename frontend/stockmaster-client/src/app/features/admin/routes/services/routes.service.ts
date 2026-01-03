import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../../core/http/api.service';
import { ApiResponse } from '../../../../core/models/api-response.model';
import {
  Route,
  RouteStats,
  RouteStatus,
  CreateOptimizedRouteDto,
  OptimizedRouteResult
} from '../../../../core/models/route.model';

@Injectable({
  providedIn: 'root'
})
export class RoutesService {
  private apiService = inject(ApiService);
  private readonly BASE_PATH = '/routes';


  getAll(): Observable<ApiResponse<Route[]>> {
    return this.apiService.get<Route[]>(this.BASE_PATH);
  }


  getById(id: string): Observable<ApiResponse<Route>> {
    return this.apiService.get<Route>(`${this.BASE_PATH}/${id}`);
  }

  getByDriver(driverId: string): Observable<ApiResponse<Route[]>> {
    return this.apiService.get<Route[]>(`${this.BASE_PATH}/driver/${driverId}`);
  }


  getStats(id: string): Observable<ApiResponse<RouteStats>> {
    return this.apiService.get<RouteStats>(`${this.BASE_PATH}/${id}/stats`);
  }

 
  createOptimized(data: CreateOptimizedRouteDto): Observable<ApiResponse<OptimizedRouteResult>> {
    return this.apiService.post<OptimizedRouteResult>(`${this.BASE_PATH}/optimize`, data);
  }


  updateStatus(id: string, status: RouteStatus): Observable<ApiResponse<Route>> {
    return this.apiService.post<Route>(`${this.BASE_PATH}/${id}/status`, { status });
  }


  delete(id: string): Observable<ApiResponse<void>> {
    return this.apiService.delete<void>(`${this.BASE_PATH}/${id}`);
  }
}