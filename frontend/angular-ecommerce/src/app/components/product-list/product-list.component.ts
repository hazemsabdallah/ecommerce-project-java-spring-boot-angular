import { provideCloudflareLoader } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Product } from 'src/app/common/product';
import { ProductService } from 'src/app/services/product.service';

@Component({
  selector: 'app-product-list',
  templateUrl: './product-list-grid.component.html',
  // templateUrl: './product-list-table.component.html',
  // templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.css']
})
export class ProductListComponent implements OnInit {

  public products: Product[]= [];

  currentCategoryId: number = 1;

  searchMode: boolean = false;

  constructor(private productService: ProductService,
              private activatedRoute: ActivatedRoute) { }

  ngOnInit(): void {
    this.activatedRoute.paramMap.subscribe(() => {
      this.listproducts();
    });
  }

  listproducts(): void {
    this.searchMode  = this.activatedRoute.snapshot.paramMap.has('keyword');

    if(this.searchMode) {
      this.handleSearchProducts();
    }
    else {
      this.handleListProducts();
    }

  }

  handleListProducts(): void {
    const hasCategoryId: boolean = this.activatedRoute.snapshot.paramMap.has('id');

    if(hasCategoryId) {
      this.currentCategoryId = +this.activatedRoute.snapshot.paramMap.get('id')!;
    }
    
    this.productService.getProductList(this.currentCategoryId).subscribe(
      data => {
        this.products = data;
      }
    )
  }

  handleSearchProducts(): void {
    const keyword: string = this.activatedRoute.snapshot.paramMap.get('keyword')!;

    this.productService.searchProducts(keyword).subscribe(
      data => {
        this.products = data;
      }
    )
  }
}
