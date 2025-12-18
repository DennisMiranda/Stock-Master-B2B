import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { Map } from '../../../../../shared/ui/maps/map/map';

@Component({
  selector: 'app-checkout-customer-form',
  imports: [ReactiveFormsModule, Map],
  templateUrl: './checkout-customer-form.html',
  styleUrl: './checkout-customer-form.css',
})
export class CheckoutCustomerForm implements OnInit, OnDestroy {
  private fb = inject(FormBuilder);
  private subscriptions = new Subscription();

  orderForm = this.fb.nonNullable.group({
    // ===== Empresa =====
    businessName: ['', [Validators.required, Validators.minLength(3)]],
    taxId: [
      '',
      [
        Validators.required,
        Validators.pattern(/^(?:\d{8}|\d{11})$/), // DNI o RUC
      ],
    ],
    businessPhone: ['', [Validators.required, Validators.pattern(/^\d{9}$/)]],
    email: ['', [Validators.required, Validators.email]],

    // ===== Receptor =====
    receiverName: ['', [Validators.required, Validators.minLength(3)]],
    receiverPhone: ['', [Validators.required, Validators.pattern(/^\d{9}$/)]],

    // ===== Dirección =====
    city: ['', [Validators.required, Validators.minLength(3)]],
    district: ['', [Validators.required, Validators.minLength(3)]],
    street: ['', [Validators.required, Validators.minLength(3)]],
    number: ['', [Validators.required, Validators.minLength(3)]],
    reference: [''],
    latitude: [0, Validators.required],
    longitude: [0, Validators.required],
  });

  ngOnInit(): void {
    this.onlyNumbers('taxId');
    this.onlyNumbers('businessPhone');
    this.onlyNumbers('receiverPhone');
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  submit(): void {
    if (this.orderForm.invalid) {
      this.orderForm.markAllAsTouched();
      return;
    }

    const payload = this.orderForm.getRawValue();
    console.log('ORDER DATA:', payload);

    // aquí luego:
    // this.checkoutService.createOrder(payload)
  }

  get f() {
    return this.orderForm.controls;
  }

  updateLocation(location: { lat: number; lng: number }): void {
    if (!location.lat || !location.lng) return;
    this.orderForm.get('latitude')!.setValue(location.lat);
    this.orderForm.get('longitude')!.setValue(location.lng);
  }

  onlyNumbers(field: string): void {
    const subscription = this.orderForm.get(field)?.valueChanges.subscribe((value) => {
      if (value) {
        const onlyNumbers = value.replace(/\D/g, '');
        this.orderForm.get(field)?.setValue(onlyNumbers, { emitEvent: false });
      }
    });
    this.subscriptions.add(subscription);
  }
}
