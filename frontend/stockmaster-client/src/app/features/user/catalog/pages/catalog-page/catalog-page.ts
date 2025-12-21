import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CardProduct } from '../../../../../shared/ui/cards/card-product/card-product';
import { BasicPagination } from '../../../../../shared/ui/pagination/basic-pagination/basic-pagination';
import { ProductFilterSidebar } from '../../components/product-filter-sidebar/product-filter-sidebar';
import { ProductSearch } from '../../components/product-search/product-search';
import { CatalogService } from '../../services/catalog.service';

@Component({
  selector: 'app-catalog-page',
  imports: [ProductSearch, CardProduct, ProductFilterSidebar, BasicPagination],
  templateUrl: './catalog-page.html',
  styleUrls: ['./catalog-page.css'],
})
export class CatalogPage implements OnInit {
  catalogService = inject(CatalogService);
  private route = inject(ActivatedRoute);

  term = this.catalogService.term;
  currentPage = this.catalogService.page;
  products = this.catalogService.products;
  metadata = this.catalogService.metadata;

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      const page = params['page'] ? +params['page'] : 1;
      const searchTerm = params['search'] || '';
      this.catalogService.updateSearch({ search: searchTerm, page });
    });
  }

  onSearchChange(searchTerm: string) {
    this.catalogService.searchProducts(searchTerm);
  }

  onPageChange(page: number) {
    this.catalogService.setPage(page);
  }
}
