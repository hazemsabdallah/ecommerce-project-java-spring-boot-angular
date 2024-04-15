import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Country } from 'src/app/common/country';
import { Order } from 'src/app/common/order';
import { OrderItem } from 'src/app/common/order-item';
import { Purchase } from 'src/app/common/purchase';
import { State } from 'src/app/common/state';
import { CartService } from 'src/app/services/cart.service';
import { CheckoutService } from 'src/app/services/checkout.service';
import { FormService } from 'src/app/services/form.service';
import { CustomValidators } from 'src/app/validators/custom-validators';

@Component({
  selector: 'app-checkout',
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.css']
})
export class CheckoutComponent implements OnInit {

  totalPrice: number = 0;
  totalQuantity: number = 0;

  checkoutFormGroup!: FormGroup;

  creditCardYears: number[] = [];
  creditCardMonths: number[] = [];

  countries: Country[] = [];
  shippingAddressStates: State[] = [];
  billingAddressStates: State[] = [];

  constructor(private formBuilder: FormBuilder,
              private formService: FormService,
              private cartService: CartService,
              private checkoutService: CheckoutService,
              private router: Router) { }

  ngOnInit(): void {

    this.reviewCartTotals();

    this.checkoutFormGroup = this.formBuilder.group({
      customer: this.formBuilder.group({
        firstName: new FormControl('', [Validators.required, Validators.minLength(2), CustomValidators.notOnlyWhitespace]),
        lastName: new FormControl('', [Validators.required, Validators.minLength(2), CustomValidators.notOnlyWhitespace]),
        email: new FormControl('',[
          Validators.required, Validators.pattern('^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$')
        ])
      }),
      shippingAddress: this.formBuilder.group({
        street: new FormControl('', [Validators.required, Validators.minLength(2), CustomValidators.notOnlyWhitespace]),
        city: new FormControl('', [Validators.required, Validators.minLength(2), CustomValidators.notOnlyWhitespace]),
        state: new FormControl('', [Validators.required]),
        country: new FormControl('', [Validators.required]),
        zipCode: new FormControl('', [Validators.required, Validators.minLength(2), CustomValidators.notOnlyWhitespace])
      }),
      billingAddress: this.formBuilder.group({
        street: new FormControl('', [Validators.required, Validators.minLength(2), CustomValidators.notOnlyWhitespace]),
        city: new FormControl('', [Validators.required, Validators.minLength(2), CustomValidators.notOnlyWhitespace]),
        state: new FormControl('', [Validators.required]),
        country: new FormControl('', [Validators.required]),
        zipCode: new FormControl('', [Validators.required, Validators.minLength(2), CustomValidators.notOnlyWhitespace])
      }),
      creditCard: this.formBuilder.group({
        cardType: new FormControl('', [Validators.required]),
        nameOnCard: new FormControl('', [Validators.required, Validators.minLength(2), CustomValidators.notOnlyWhitespace]),
        cardNumber: new FormControl('', [Validators.required, Validators.pattern('^[0-9]{16}$')]),
        securityCode: new FormControl('', [Validators.required, Validators.pattern('^[0-9]{3}$')]),
        expirationMonth: [''],
        expirationYear: ['']
      })
    });

    // populate credit card date drop down
    const startMonth: number = new Date().getMonth() + 1;

    this.formService.getCreditCardMonths(startMonth).subscribe(
      data => {
        this.creditCardMonths = data;
      }
    );

    this.formService.getCreditCardYears().subscribe(
      data => {
        this.creditCardYears = data;
      }
    );

    // populate countries
    this.formService.getCountries().subscribe(
      data => {
        this.countries = data;
      }
    );
  }

  reviewCartTotals() {
    // subscribe to cart totals
    this.cartService.totalQuantity.subscribe(
      data => this.totalQuantity = data
    );
    this.cartService.totalPrice.subscribe(
      data => this.totalPrice = data
    );
  }

  get firstName() { return this.checkoutFormGroup.get('customer.firstName');}
  get lastName() { return this.checkoutFormGroup.get('customer.lastName');}
  get email() { return this.checkoutFormGroup.get('customer.email');}

  get shippingAddressStreet() { return this.checkoutFormGroup.get('shippingAddress.street');}
  get shippingAddressCity() { return this.checkoutFormGroup.get('shippingAddress.city');}
  get shippingAddressState() { return this.checkoutFormGroup.get('shippingAddress.state');}
  get shippingAddressCountry() { return this.checkoutFormGroup.get('shippingAddress.country');}
  get shippingAddressZipCode() { return this.checkoutFormGroup.get('shippingAddress.zipCode');}

  get billingAddressStreet() { return this.checkoutFormGroup.get('billingAddress.street');}
  get billingAddressCity() { return this.checkoutFormGroup.get('billingAddress.city');}
  get billingAddressState() { return this.checkoutFormGroup.get('billingAddress.state');}
  get billingAddressCountry() { return this.checkoutFormGroup.get('billingAddress.country');}
  get billingAddressZipCode() { return this.checkoutFormGroup.get('billingAddress.zipCode');}

  get creditCardType() { return this.checkoutFormGroup.get('creditCard.cardType');}
  get creditCardName() { return this.checkoutFormGroup.get('creditCard.nameOnCard');}
  get creditCardNumber() { return this.checkoutFormGroup.get('creditCard.cardNumber');}
  get creditCardCode() { return this.checkoutFormGroup.get('creditCard.securityCode');}

  onSubmit(): void {

    if (this.checkoutFormGroup.invalid) {
      this.checkoutFormGroup.markAllAsTouched();
      return;
    }

    let order = new Order();
    order.totalPrice = this.totalPrice;
    order.totalQuantity = this.totalQuantity;

    const cartItems = this.cartService.cartItems;
    let orderItems: OrderItem[] = cartItems.map(item => new OrderItem(item));

    let purchase = new Purchase();

    purchase.customer = this.checkoutFormGroup.controls['customer'].value;

    purchase.shippingAddress = this.checkoutFormGroup.controls['shippingAddress'].value;
    const shippingState: State = JSON.parse(JSON.stringify(purchase.shippingAddress.state));
    const shippingCountry: Country = JSON.parse(JSON.stringify(purchase.shippingAddress.country));
    purchase.shippingAddress.state = shippingState.name;
    purchase.shippingAddress.country = shippingCountry.name;

    purchase.billingAddress = this.checkoutFormGroup.controls['billingAddress'].value;
    const billingState: State = JSON.parse(JSON.stringify(purchase.billingAddress.state));
    const billingCountry: Country = JSON.parse(JSON.stringify(purchase.billingAddress.country));
    purchase.billingAddress.state = billingState.name;
    purchase.billingAddress.country = billingCountry.name;

    purchase.order = order;
    purchase.orderItems = orderItems;

    // next is for success path
    this.checkoutService.palceOrder(purchase).subscribe({
        next: response => {
          alert(`Your order has been received.\nYour order tracking number: ${response.orderTrackingNumber}`);
          // reset cart
          this.restCart();
        },
        error: error => {
          alert(`There was an error: ${error.message}`);
        }
      }
    );
  }

  restCart() {
    this.cartService.cartItems = [];
    this.cartService.totalPrice.next(0);
    this.cartService.totalQuantity.next(0);

    this.checkoutFormGroup.reset();

    this.router.navigateByUrl('/products');
  }

  copyShippingAddressToBillingAddress(event: Event) {
    const isChecked = (<HTMLInputElement>event.target).checked;
    if (isChecked) {
      this.checkoutFormGroup.controls['billingAddress']
        .setValue(this.checkoutFormGroup.controls['shippingAddress'].value);

      this.billingAddressStates = this.shippingAddressStates;
    }
    else {
      this.checkoutFormGroup.controls['billingAddress'].reset();

      this.billingAddressStates = [];
    }
  }

  handleMonthsAndYears(): void {
    const creditCardGroup = this.checkoutFormGroup.get('creditCard');
    const selectedYear: number = Number(creditCardGroup?.value.expirationYear);
    const currentYear: number = new Date().getFullYear();

    let startMonth: number
    if (currentYear == selectedYear) {
      startMonth = new Date().getMonth() + 1;
    }
    else {
      startMonth = 1;
    }

    this.formService.getCreditCardMonths(startMonth).subscribe(
      data => {
        this.creditCardMonths = data;
      }
    );
  }

  getStates(formGroupName: string): void {
    const formGroup = this.checkoutFormGroup.get(formGroupName);
    const countryCode = formGroup?.value.country.code;

    this.formService.getStates(countryCode).subscribe(
      data => {
        if (formGroupName === 'shippingAddress') {
          this.shippingAddressStates = data;
        }
        else {
          this.billingAddressStates = data;
        }
        formGroup?.get('state')?.setValue(data[0]);
      }
    );
  }
}
