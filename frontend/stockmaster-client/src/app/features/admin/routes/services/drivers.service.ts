
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../../core/http/api.service';
import { ApiResponse } from '../../../../core/models/api-response.model';
import { Driver, DriverStats, CreateDriverDto, DriverStatus } from '../../../../core/models/driver.model';

@Injectable({
  providedIn: 'root'
})
export class DriversService {
  private apiService = inject(ApiService);
  private readonly BASE_PATH = '/drivers';

  /**
   * Obtener todos los conductores
   */
  getAll(): Observable<ApiResponse<Driver[]>> {
    return this.apiService.get<Driver[]>(this.BASE_PATH);
  }

  /**
   * Obtener conductor por ID
   */
  getById(id: string): Observable<ApiResponse<Driver>> {
    return this.apiService.get<Driver>(`${this.BASE_PATH}/${id}`);
  }

  /**
   * Obtener conductores disponibles
   */
  getAvailable(): Observable<ApiResponse<Driver[]>> {
    return this.apiService.get<Driver[]>(`${this.BASE_PATH}/available`);
  }

  /**
   * Obtener estadísticas de un conductor
   */
  getStats(id: string): Observable<ApiResponse<DriverStats>> {
    return this.apiService.get<DriverStats>(`${this.BASE_PATH}/${id}/stats`);
  }

  /**
   * Crear nuevo conductor
   */
  create(data: CreateDriverDto): Observable<ApiResponse<Driver>> {
    return this.apiService.post<Driver>(this.BASE_PATH, data);
  }

  /**
   * Actualizar conductor
   */
  update(id: string, data: Partial<Driver>): Observable<ApiResponse<Driver>> {
    return this.apiService.put<Driver>(`${this.BASE_PATH}/${id}`, data);
  }

  /**
   * Asignar ruta a conductor
   */
  assignRoute(driverId: string, routeId: string): Observable<ApiResponse<Driver>> {
    return this.apiService.post<Driver>(
      `${this.BASE_PATH}/${driverId}/assign`,
      { routeId }
    );
  }

  /**
   * Desasignar ruta de conductor
   */
  unassignRoute(driverId: string): Observable<ApiResponse<Driver>> {
    return this.apiService.post<Driver>(
      `${this.BASE_PATH}/${driverId}/unassign`,
      {}
    );
  }

  /**
   * Eliminar conductor
   */
  delete(id: string): Observable<ApiResponse<void>> {
    return this.apiService.delete<void>(`${this.BASE_PATH}/${id}`);
  }
}