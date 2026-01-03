import { Component, EventEmitter, Input, Output, inject, signal, computed, effect } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { toSignal } from '@angular/core/rxjs-interop';
import { LucideAngularModule, Loader2, X, Upload, Tag, Package, Box, Image, DollarSign, FileText, Calculator, Percent, AlertTriangle, AlertCircle } from 'lucide-angular';
import { ProductModel } from '../../../../../core/services/product.service';
import { CategoryService } from '../../../../../core/services/category.service';
import { Modal } from '../../../../../shared/ui/modal/modal';
import { CommonModule } from '@angular/common';
import { ProductUtils } from '../../../../../shared/utils/product.utils';

@Component({
    selector: 'app-product-modal',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        LucideAngularModule,
        Modal
    ],
    templateUrl: './product-modal.html',
    styleUrl: './product-modal.css'
})
export class ProductModal {
    timestamp = new Date().toISOString();
    private fb = inject(FormBuilder);
    private categoryService = inject(CategoryService);

    // Signals
    categories = toSignal(this.categoryService.getCategoriesWithSubcategories(), { initialValue: [] });
    selectedCategoryId = signal<string>('');
    currentSubcategories = computed(() => {
        const cat = this.categories().find(c => c.id === this.selectedCategoryId());
        return cat?.subcategories || [];
    });

    // Inputs
    @Input() isSaving = false;
    @Input() set product(value: ProductModel | null) {
        if (value) {
            this.isCheckMode = false;
            this.editForm.patchValue({
                name: value.name,
                sku: value.sku,
                brand: value.brand,
                categoryId: value.categoryId,
                subcategoryId: value.subcategoryId,
                description: value.description,
                unitPerBox: value.unitPerBox,
                isActive: value.isActive,
                // Prices logic: map existing prices (Nested Structure)
                priceUnit: value.prices?.find((p: any) => p.label === 'unit')?.price || 0,
                priceBox: value.prices?.find((p: any) => p.label === 'box')?.price || 0,
                // Stock
                stockUnits: value.stockUnits,
                stockBoxes: value.stockBoxes,
                // Reverse Calculate Discounts (Simplified logic)
                wholesaleDiscount: (() => {
                    const unitPrice = value.prices?.find((p: any) => p.label === 'unit');
                    if (unitPrice?.discounts?.length) {
                        const discPrice = unitPrice.discounts[0].price;
                        const base = unitPrice.price;
                        if (!base) return 0;
                        return Math.round((1 - (discPrice / base)) * 100);
                    }
                    return 0;
                })(),
                wholesaleMinQty: (() => {
                    const unitPrice = value.prices?.find((p: any) => p.label === 'unit');
                    if (unitPrice?.discounts?.length) {
                        return unitPrice.discounts[0].minQuantity || 3;
                    }
                    return 3;
                })(),
                boxDiscount: (() => {
                    const unitPrice = value.prices?.find((p: any) => p.label === 'unit')?.price || 0;
                    const boxPrice = value.prices?.find((p: any) => p.label === 'box')?.price || 0;
                    const units = value.unitPerBox || 1;

                    if (unitPrice && boxPrice && units) {
                        const baseTotal = unitPrice * units;
                        if (baseTotal === 0) return 0;
                        const discount = Math.round((1 - (boxPrice / baseTotal)) * 100);
                        return discount > 0 ? discount : 0;
                    }
                    return 0;
                })()
            });
            if (value.categoryId) {
                this.selectedCategoryId.set(value.categoryId);
            }
            this.existingImages.set(value.images || []);
            this._product = value;
            this.editForm.get('sku')?.enable();
            this.editForm.get('sku')?.disable();
        } else {
            this.editForm.reset({
                isActive: true,
                unitPerBox: 12,
                wholesaleDiscount: 0,
                boxDiscount: 0
            });
            this.selectedCategoryId.set('');
            this.existingImages.set([]);
            this._product = null;
            this.editForm.get('sku')?.disable();
        }
    }

    @Output() close = new EventEmitter<void>();
    @Output() save = new EventEmitter<any>();

    protected _product: ProductModel | null = null;
    isCheckMode = false;
    readonly MAX_IMAGES = 5;

    // Image Signals
    existingImages = signal<string[]>([]);
    newImages = signal<string[]>([]);

    // Computed Image Logic
    totalImageCount = computed(() => this.existingImages().length + this.newImages().length);
    isGalleryFull = computed(() => this.totalImageCount() >= this.MAX_IMAGES);
    remainingSlots = computed(() => this.MAX_IMAGES - this.totalImageCount());

    readonly LoaderIcon = Loader2;
    readonly XIcon = X;
    readonly UploadIcon = Upload;
    readonly TagIcon = Tag;
    readonly PackageIcon = Package;
    readonly BoxIcon = Box;
    readonly ImageIcon = Image;
    readonly DollarIcon = DollarSign;
    readonly FileTextIcon = FileText;
    readonly CalculatorIcon = Calculator;
    readonly PercentIcon = Percent;
    readonly AlertTriangleIcon = AlertTriangle;
    readonly AlertCircleIcon = AlertCircle;

    editForm = this.fb.group({
        name: ['', [Validators.required, Validators.minLength(3)]],
        sku: [{ value: '', disabled: true }],
        brand: ['', [Validators.required, Validators.minLength(2)]],
        categoryId: ['', Validators.required],
        subcategoryId: ['', Validators.required],
        description: [''],
        unitPerBox: [12, [Validators.required, Validators.min(1), Validators.pattern(/^\d+$/)]],
        priceUnit: [0, [Validators.required, Validators.min(0)]],
        priceBox: [0, [Validators.required, Validators.min(0)]],
        stockUnits: [0, [Validators.required, Validators.min(0), Validators.pattern(/^\d+$/)]],
        stockBoxes: [0, [Validators.required, Validators.min(0), Validators.pattern(/^\d+$/)]],
        wholesaleDiscount: [0, [Validators.min(0), Validators.max(100), Validators.pattern(/^\d+$/)]],
        wholesaleMinQty: [3, [Validators.required, Validators.min(2), Validators.pattern(/^\d+$/)]],
        boxDiscount: [0, [Validators.min(0), Validators.max(100), Validators.pattern(/^\d+$/)]],
        isActive: [true]
    });

    // Reactive Pricing Logic
    private formValues = toSignal(this.editForm.valueChanges, { initialValue: {} as Partial<typeof this.editForm.value> });

    protected calculatedPrices = computed(() => {
        const val = this.formValues() || {};
        const basePrice = val.priceUnit || 0;
        const units = val.unitPerBox || 1;
        const boxDisc = (val.boxDiscount || 0) / 100;
        const wholesaleDisc = (val.wholesaleDiscount || 0) / 100;

        // Logic: Box Price
        const totalBase = basePrice * units;
        const finalBoxPrice = totalBase * (1 - boxDisc);

        // Logic: Wholesale Price
        const wholesaleSaving = basePrice * wholesaleDisc;
        const finalWholesalePrice = basePrice - wholesaleSaving;

        // Logic: Price Inconsistency Warning
        const theoreticalBoxPrice = basePrice * units;
        const hasPriceInconsistency = finalBoxPrice > theoreticalBoxPrice;

        return {
            boxPrice: parseFloat(finalBoxPrice.toFixed(2)),
            wholesalePrice: parseFloat(finalWholesalePrice.toFixed(2)),
            wholesaleSaving: parseFloat(wholesaleSaving.toFixed(2)),
            hasPriceInconsistency
        };
    });

    constructor() {
        this.editForm.get('categoryId')?.valueChanges.subscribe(val => {
            if (val) {
                this.selectedCategoryId.set(val);
                this.editForm.get('subcategoryId')?.reset('');
            }
        });

        effect(() => {
            const calculated = this.calculatedPrices();
            if (calculated.boxPrice !== this.editForm.get('priceBox')?.value) {
                this.editForm.patchValue({
                    priceBox: calculated.boxPrice
                }, { emitEvent: false });
            }
        });
    }

    onFileSelected(event: any) {
        const files = event.target.files;
        if (files) {
            const currentRemaining = this.remainingSlots();
            if (currentRemaining <= 0) return;
            const filesToProcess = Array.from(files).slice(0, currentRemaining);
            filesToProcess.forEach((file: any) => {
                const reader = new FileReader();
                reader.onload = (e: any) => {
                    this.newImages.update(imgs => [...imgs, e.target.result]);
                };
                reader.readAsDataURL(file);
            });
        }
        event.target.value = '';
    }

    removeNewImage(index: number) {
        this.newImages.update(imgs => imgs.filter((_, i) => i !== index));
    }

    removeExistingImage(index: number) {
        this.existingImages.update(imgs => imgs.filter((_, i) => i !== index));
    }

    onSubmit() {
        if (this.editForm.valid && this.totalImageCount() > 0) {
            const formValue = this.editForm.getRawValue();
            const payload = ProductUtils.formatProductPayload(
                formValue,
                [...this.existingImages(), ...this.newImages()]
            );
            this.save.emit(payload);
        } else {
            this.editForm.markAllAsTouched();
        }
    }
}
