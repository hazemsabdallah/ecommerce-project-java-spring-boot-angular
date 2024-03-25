import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { Product } from '../common/product';
import { ProductCategory } from '../common/product-category';

@Injectable({
  providedIn: 'root'
})
export class ProductService {

  private baseUrl: string = "http://localhost:8080/api/products";
  
  private categoryUrl: string = "http://localhost:8080/api/product-category";

  constructor(private httpClient: HttpClient) { }

  getProductListPaginate(page: number,
                         pageSize:number,
                         categoryId: number): Observable<GetResponseProducts> {
    const searchURL: string = `${this.baseUrl}/search/findByCategoryId`+
                              `?id=${categoryId}&page=${page}&size=${pageSize}`;
    return this.httpClient.get<GetResponseProducts>(searchURL);
  }

  getProductList(categoryId: number): Observable<Product[]> {
    const searchURL: string = `${this.baseUrl}/search/findByCategoryId?id=${categoryId}`;
    return this.getProducts(searchURL);
  }

  searchProductsPaginate(page: number, pageSize:number, keyword: string): Observable<GetResponseProducts> {
    const searchURL: string = `${this.baseUrl}/search/findByNameContaining`+
                              `?name=${keyword}&page=${page}&size=${pageSize}`;
    return this.httpClient.get<GetResponseProducts>(searchURL);
  }

  searchProducts(keyword: string): Observable<Product[]> {
    const searchURL: string = `${this.baseUrl}/search/findByNameContaining?name=${keyword}`;
    return this.getProducts(searchURL);
  }

  private getProducts(searchURL: string): Observable<Product[]> {
    return this.httpClient.get<GetResponseProducts>(searchURL).pipe(
      map(response => response._embedded.products)
    );
  }

  // for product details view
  getProduct(productId: number): Observable<Product> {
    return this.httpClient.get<Product>(`${this.baseUrl}/${productId}`);
  }

  // for side nav menu
  getProductCategories(): Observable<ProductCategory[]> {
    return this.httpClient.get<GetResponseProductCategory>(this.categoryUrl).pipe(
      map(response => response._embedded.productCategory)
    );
  }
}

interface GetResponseProducts {
  _embedded: {
    products: Product[];
  },
  page: {
    size: number,
    totalElements: number,
    totalPages: number,
    number: number
  }
}

interface GetResponseProductCategory {
  _embedded: {
    productCategory: ProductCategory[];
  }
}
