import { AsyncPipe } from '@angular/common';
import { Component, inject, OnDestroy, OnInit, output, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { OrderCustomerInfo, OrderDeliveryAddress } from '../../../../../core/models/order.model';
import { Map } from '../../../../../shared/ui/maps/map/map';
import { CheckoutService } from '../../services/checkout.service';

interface CheckoutFormValues {
  businessName: string;
  taxId: string;
  businessPhone: string;
  email: string;
  receiverName: string;
  receiverPhone: string;
  city: string;
  district: string;
  street: string;
  number: string;
  reference: string;
  latitude: number;
  longitude: number;
}

@Component({
  selector: 'app-checkout-customer-form',
  imports: [ReactiveFormsModule, Map, AsyncPipe],
  templateUrl: './checkout-customer-form.html',
  styleUrl: './checkout-customer-form.css',
})
export class CheckoutCustomerForm implements OnInit, OnDestroy {
  valueChanges = output<{ customer: OrderCustomerInfo; deliveryAddress: OrderDeliveryAddress }>();
  isValidChange = output<boolean>();

  private checkoutService = inject(CheckoutService);
  private fb = inject(FormBuilder);
  private subscriptions = new Subscription();

  form = this.fb.nonNullable.group({
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
    city: ['Lima', [Validators.required, Validators.minLength(3)]],
    district: ['', [Validators.required, Validators.minLength(3)]],
    street: ['', [Validators.required, Validators.minLength(3)]],
    number: ['', [Validators.required, Validators.minLength(1)]],
    reference: [''],
    latitude: [0, Validators.required],
    longitude: [0, Validators.required],
  });

  districts = signal<string[]>([]);
  constructor() {
    this.form.valueChanges.subscribe((value) => {
      this.valueChanges.emit(this.mapFormValues(value as CheckoutFormValues));
      this.isValidChange.emit(this.form.valid);
    });
  }

  ngOnInit(): void {
    this.checkoutService.getDistricts().subscribe((response) => {
      if (!response.data) {
        console.error('No data in districts response');
        return;
      }
      const districts = response.data.map((d) => d.name);
      this.districts.set(districts);
    });
    this.onlyNumbers('taxId');
    this.onlyNumbers('businessPhone');
    this.onlyNumbers('receiverPhone');
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const payload = this.form.getRawValue();
  }

  get f() {
    return this.form.controls;
  }

  updateLocation(location: { lat: number; lng: number }): void {
    if (!location.lat || !location.lng) return;
    this.form.get('latitude')!.setValue(location.lat);
    this.form.get('longitude')!.setValue(location.lng);
  }

  onlyNumbers(field: string): void {
    const subscription = this.form.get(field)?.valueChanges.subscribe((value) => {
      if (value) {
        const onlyNumbers = value.replace(/\D/g, '');
        this.form.get(field)?.setValue(onlyNumbers, { emitEvent: false });
      }
    });
    this.subscriptions.add(subscription);
  }

  mapFormValues(values: CheckoutFormValues): {
    customer: OrderCustomerInfo;
    deliveryAddress: OrderDeliveryAddress;
  } {
    return {
      customer: {
        companyName: values.businessName || '',
        taxId: values.taxId || '',
        contactName: values.receiverName || '',
        email: values.email || '',
        phone: values.businessPhone || '',
      },
      deliveryAddress: {
        city: values.city || '',
        district: values.district || '',
        street: values.street || '',
        number: values.number || '',
        reference: values.reference || '',
        location: {
          lat: values.latitude || 0,
          lng: values.longitude || 0,
        },
      },
    };
  }
}
