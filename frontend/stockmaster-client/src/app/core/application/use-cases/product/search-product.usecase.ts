import { Product } from '../../../domain/models/product.model';
import { ProductRepository } from '../../../domain/repositories/product.repository';

/**
 * Esta clase establece las reglas de interfaz anteriormente declaradas en el repositorio del dominio.
 * El método `execute` llama al método `search` definido en el repositorio.
 */
export class SearchProductsUseCase {
  constructor(private repository: ProductRepository) {}

  execute(params: { search?: string; page?: number; limit?: number }): Promise<Product[]> {
    return this.repository.search(params);
  }
}
