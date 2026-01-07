import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../../core/http/api.service';
import { ApiResponse } from '../../../../core/models/api-response.model';
import {
  Route,
  RouteStats,
  RouteStatus,
  CreateOptimizedRouteDto,
  OptimizedRouteResult,
  RouteEnriched,
} from '../../../../core/models/route.model';

@Injectable({
  providedIn: 'root',
})
export class RoutesService {
  private apiService = inject(ApiService);
  private readonly BASE_PATH = '/routes';

  getAll(): Observable<ApiResponse<Route[]>> {
    return this.apiService.get<Route[]>(this.BASE_PATH);
  }

  getById(id: string): Observable<ApiResponse<RouteEnriched>> {
    return this.apiService.get<RouteEnriched>(`${this.BASE_PATH}/${id}`);
  }
  getByDriver(driverId: string): Observable<ApiResponse<Route[]>> {
    return this.apiService.get<Route[]>(`${this.BASE_PATH}/driver/${driverId}`);
  }

  createOptimized(data: CreateOptimizedRouteDto): Observable<ApiResponse<OptimizedRouteResult>> {
    return this.apiService.post<OptimizedRouteResult>(`${this.BASE_PATH}/optimize`, data);
  }

  updateStatus(id: string, status: RouteStatus): Observable<ApiResponse<Route>> {
    return this.apiService.patch<Route>(`${this.BASE_PATH}/${id}/status`, { status });
  }

  addOrder(routeId: string, orderId: string): Observable<ApiResponse<Route>> {
    return this.apiService.patch<Route>(`${this.BASE_PATH}/${routeId}/add-order`, { orderId });
  }

  addOrderToRoute(
    routeId: string,
    orderId: string,
    startLocation: { lat: number; lng: number }
  ): Observable<ApiResponse<Route>> {
    return this.apiService.post<Route>(`${this.BASE_PATH}/${routeId}/orders`, {
      orderId,
      startLocation,
    });
  }

  removeOrderFromRoute(
    routeId: string,
    orderId: string,
    startLocation: { lat: number; lng: number }
  ): Observable<ApiResponse<Route>> {
    return this.apiService.delete<Route>(`${this.BASE_PATH}/${routeId}/orders/${orderId}`, {
      body: { startLocation },
    } as any);
  }

  delete(id: string): Observable<ApiResponse<void>> {
    return this.apiService.delete<void>(`${this.BASE_PATH}/${id}`);
  }

  markOrderAsDelivered(routeId: string, orderId: string): Observable<ApiResponse<Route>> {
    return this.apiService.patch<Route>(
      `${this.BASE_PATH}/${routeId}/orders/${orderId}/deliver`,
      {}
    );
  }

}
