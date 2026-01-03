import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../../core/http/api.service';
import { ApiResponse } from '../../../../core/models/api-response.model';
import {
  Delivery,
  DeliveryStatus,
  CreateDeliveryDto,
  UpdateDeliveryStatusDto,
  FailDeliveryDto
} from '../../../../core/models/delivery.model';

@Injectable({
  providedIn: 'root'
})
export class DeliveriesService {
  private apiService = inject(ApiService);
  private readonly BASE_PATH = '/deliveries';

  /**
   * Obtener todas las entregas
   */
  getAll(): Observable<ApiResponse<Delivery[]>> {
    return this.apiService.get<Delivery[]>(this.BASE_PATH);
  }

  /**
   * Obtener entrega por ID
   */
  getById(id: string): Observable<ApiResponse<Delivery>> {
    return this.apiService.get<Delivery>(`${this.BASE_PATH}/${id}`);
  }

  /**
   * Obtener entregas de una ruta
   */
  getByRoute(routeId: string): Observable<ApiResponse<Delivery[]>> {
    return this.apiService.get<Delivery[]>(`${this.BASE_PATH}/route/${routeId}`);
  }

  /**
   * Obtener entregas de un conductor
   */
  getByDriver(driverId: string): Observable<ApiResponse<Delivery[]>> {
    return this.apiService.get<Delivery[]>(`${this.BASE_PATH}/driver/${driverId}`);
  }

  /**
   * Crear nueva entrega
   */
  create(data: CreateDeliveryDto): Observable<ApiResponse<Delivery>> {
    return this.apiService.post<Delivery>(this.BASE_PATH, data);
  }

  /**
   * Actualizar estado de entrega
   */
  updateStatus(id: string, status: DeliveryStatus): Observable<ApiResponse<Delivery>> {
    return this.apiService.post<Delivery>(`${this.BASE_PATH}/${id}/status`, { status });
  }

  /**
   * Completar entrega
   */
  complete(id: string): Observable<ApiResponse<Delivery>> {
    return this.apiService.post<Delivery>(`${this.BASE_PATH}/${id}/complete`, {});
  }

  /**
   * Marcar entrega como fallida
   */
  fail(id: string, reason: string): Observable<ApiResponse<Delivery>> {
    return this.apiService.post<Delivery>(`${this.BASE_PATH}/${id}/fail`, { reason });
  }

  /**
   * Cancelar entrega
   */
  cancel(id: string): Observable<ApiResponse<Delivery>> {
    return this.apiService.post<Delivery>(`${this.BASE_PATH}/${id}/cancel`, {});
  }

  /**
   * Eliminar entrega
   */
  delete(id: string): Observable<ApiResponse<void>> {
    return this.apiService.delete<void>(`${this.BASE_PATH}/${id}`);
  }
}