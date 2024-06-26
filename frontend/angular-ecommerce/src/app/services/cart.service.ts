import { Injectable } from '@angular/core';
import { CartItem } from '../common/cart-item';
import { BehaviorSubject, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CartService {

  cartItems: CartItem[] = [];
  totalPrice: Subject<number> = new BehaviorSubject<number>(0);
  totalQuantity: Subject<number> = new BehaviorSubject<number>(0);

  constructor() { }

  addToCart(CartItem: CartItem) {

    let existingCartItem: CartItem | undefined;
    if (this.cartItems.length > 0) {
      
      existingCartItem = this.cartItems.find(tempCartItem => tempCartItem.id === CartItem.id);
    }
    
    (existingCartItem != undefined) ? existingCartItem.quantity++
                                    : this.cartItems.push(CartItem);
    
    this.computeCartTotals();
  }

  computeCartTotals() {
    
    let totalPriceValue: number = 0;
    let totalQuantityValue: number = 0;

    for(let tempCartItem of this.cartItems) {
      totalPriceValue += (tempCartItem.unitPrice * tempCartItem.quantity);
      totalQuantityValue += tempCartItem.quantity;
    }
    
    // publish total values events to supply updated values upon subscription
    this.totalPrice.next(totalPriceValue);
    this.totalQuantity.next(totalQuantityValue);

    this.logCartData(totalPriceValue, totalQuantityValue);

  }

  logCartData(totalPriceValue: number, totalQuantityValue: number) {

    console.log('cart contents');

    for(let tempCartItem of this.cartItems) {
      const subTotal: number = tempCartItem.unitPrice * tempCartItem.quantity;
      console.log(`name: ${tempCartItem.name},
                   quantity: ${tempCartItem.quantity},
                   price: ${tempCartItem.unitPrice},
                   subtotal: ${subTotal}`);
    }
    
    console.log(`total price: ${totalPriceValue.toFixed(2)}, total quantity: ${totalQuantityValue.toFixed(2)}`);
    console.log('');
  }

  deccrementQuantity(cartItem: CartItem) {
    cartItem.quantity--;

    if(cartItem.quantity === 0) {
      this.remove(cartItem);
    }
    else {
      this.computeCartTotals();
    }
  }

  remove(cartItem: CartItem) {
    const itemIndex = this.cartItems.findIndex(tempItem => tempItem.id === cartItem.id);
    if(itemIndex > -1) {
      this.cartItems.splice(itemIndex, 1);
    }
    this.computeCartTotals();
  }
}
