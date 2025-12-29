import { Component, EventEmitter, Input, Output, inject, signal, computed, effect } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { toSignal } from '@angular/core/rxjs-interop';
import { LucideAngularModule, Loader2, X, Upload, Tag, Package, Box, Image, DollarSign, FileText, Calculator, Percent } from 'lucide-angular';
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
    template: `
    <app-modal [maxWidthClass]="'sm:max-w-5xl'" (close)="close.emit()">
        <div class="bg-gray-50/50 w-full flex flex-col max-h-[90vh]">
            
            <!-- Header -->
            <div class="px-8 py-6 border-b border-gray-100 flex items-center justify-between bg-white sticky top-0 z-10 shadow-sm">
                <div>
                    <h2 class="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-3">
                        <span class="p-2 bg-blue-50 rounded-lg text-blue-600">
                             <lucide-icon [img]="BoxIcon" class="w-6 h-6"></lucide-icon>
                        </span>
                        {{ _product ? 'Editar Producto' : 'Nuevo Producto' }}
                    </h2>
                    <p class="text-sm text-gray-500 mt-1 ml-14">Complete la información detallada para su catálogo digital.</p>
                </div>
                <button (click)="close.emit()" class="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400 hover:text-gray-600">
                    <lucide-icon [img]="XIcon" class="w-6 h-6"></lucide-icon>
                </button>
            </div>

            <!-- Scrollable Content -->
            <div class="flex-1 overflow-y-auto p-8 custom-scrollbar">
                <form [formGroup]="editForm" (ngSubmit)="onSubmit()" class="flex flex-col gap-10">

                    <!-- Section: Basic Info -->
                    <div class="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm grid grid-cols-12 gap-8">
                        <div class="col-span-12 lg:col-span-4 border-r border-gray-100 pr-8">
                            <h3 class="text-lg font-bold text-gray-900 flex items-center gap-2">
                                <lucide-icon [img]="FileTextIcon" class="w-5 h-5 text-gray-400"></lucide-icon>
                                Información General
                            </h3>
                            <p class="text-sm text-gray-500 mt-2 leading-relaxed">
                                Configure los datos principales del producto. El SKU se generará automáticamente.
                            </p>
                            
                            <!-- Status Toggle -->
                            <div class="mt-8 p-4 bg-gray-50 rounded-xl border border-gray-200">
                                <div class="flex items-center justify-between">
                                    <div class="flex flex-col">
                                        <span class="text-sm font-semibold text-gray-900">Estado</span>
                                        <span class="text-xs text-gray-500">Visible en catálogo</span>
                                    </div>
                                    <div class="relative inline-flex items-center cursor-pointer">
                                        <input type="checkbox" formControlName="isActive" id="activeToggle" class="sr-only peer">
                                        <label for="activeToggle" class="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600 block cursor-pointer"></label>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div class="col-span-12 lg:col-span-8 space-y-6">
                            <div>
                                <label class="block text-sm font-semibold text-gray-700 mb-2">Nombre del Producto</label>
                                <input formControlName="name" type="text" placeholder="Ej. Sierra Circular Profesional"
                                    class="w-full px-4 py-3 rounded-xl border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all placeholder-gray-400 text-sm font-medium">
                            </div>

                            <div class="grid grid-cols-2 gap-6">
                                <div>
                                    <label class="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                                        <lucide-icon [img]="TagIcon" class="w-4 h-4 text-gray-400"></lucide-icon>
                                        Categoría
                                    </label>
                                    <select formControlName="categoryId" 
                                        class="w-full px-4 py-3 rounded-xl border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all text-sm bg-white">
                                        <option value="" disabled selected>Seleccionar Categoría</option>
                                        @for (cat of categories(); track cat.id) {
                                            <option [value]="cat.id">{{ cat.name }}</option>
                                        }
                                    </select>
                                </div>
                                <div>
                                    <label class="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                                        <lucide-icon [img]="TagIcon" class="w-4 h-4 text-gray-400"></lucide-icon>
                                        Subcategoría
                                    </label>
                                    <select formControlName="subcategoryId" [attr.disabled]="!editForm.get('categoryId')?.value ? '' : null"
                                        class="w-full px-4 py-3 rounded-xl border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all text-sm bg-white disabled:bg-gray-100 disabled:text-gray-400">
                                        <option value="" disabled selected>Seleccionar Subcategoría</option>
                                        @for (sub of currentSubcategories(); track sub.id) {
                                            <option [value]="sub.id">{{ sub.name }}</option>
                                        }
                                    </select>
                                </div>
                            </div>

                            <div class="grid grid-cols-2 gap-6">
                                <div>
                                    <label class="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                                        <lucide-icon [img]="PackageIcon" class="w-4 h-4 text-gray-400"></lucide-icon>
                                        Marca
                                    </label>
                                    <input formControlName="brand" type="text" placeholder="Marca..."
                                        class="w-full px-4 py-3 rounded-xl border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all placeholder-gray-400 text-sm">
                                </div>
                                <div>
                                    <label class="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                                        <lucide-icon [img]="TagIcon" class="w-4 h-4 text-gray-400"></lucide-icon>
                                        SKU / Código
                                    </label>
                                    <input formControlName="sku" type="text" placeholder="Autogenerado al guardar"
                                        class="w-full px-4 py-3 rounded-xl border-gray-200 bg-gray-50 text-gray-500 cursor-not-allowed text-sm font-mono focus:ring-0 border-dashed">
                                    <p class="text-xs text-blue-500 mt-1" *ngIf="!_product">* Se generará automáticamente</p>
                                </div>
                            </div>

                            <div>
                                <label class="block text-sm font-semibold text-gray-700 mb-2">Descripción</label>
                                <textarea formControlName="description" rows="3" placeholder="Describa las características..."
                                    class="w-full px-4 py-3 rounded-xl border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all placeholder-gray-400 text-sm resize-none"></textarea>
                            </div>
                        </div>
                    </div>

                    <!-- Section: Pricing & Stock (Calculator) -->
                    <div class="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm grid grid-cols-12 gap-8 relative overflow-hidden">
                         <div class="absolute top-0 right-0 p-4 opacity-5">
                            <lucide-icon [img]="CalculatorIcon" class="w-32 h-32"></lucide-icon>
                        </div>
                        
                        <div class="col-span-12 lg:col-span-4 border-r border-gray-100 pr-8 z-10">
                            <h3 class="text-lg font-bold text-gray-900 flex items-center gap-2">
                                <lucide-icon [img]="DollarIcon" class="w-5 h-5 text-gray-400"></lucide-icon>
                                Calculadora B2B
                            </h3>
                            <p class="text-sm text-gray-500 mt-2 leading-relaxed">
                                Ingrese el precio base y descuentos para calcular automáticamente los precios finales.
                            </p>
                        </div>

                        <div class="col-span-12 lg:col-span-8 flex flex-col gap-6 z-10">
                            
                            <!-- Base Config Row -->
                             <div class="grid grid-cols-2 gap-6">
                                <div class="p-4 bg-gray-50 rounded-xl border border-gray-100">
                                    <span class="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 block">Datos Base</span>
                                    <div class="space-y-4">
                                        <div>
                                            <label class="block text-xs font-bold text-gray-700 mb-1">Precio Unitario Base</label>
                                            <div class="relative">
                                                <span class="absolute left-3 top-2.5 text-gray-400 font-medium">S/</span>
                                                <input formControlName="priceUnit" type="number" class="w-full pl-8 pr-4 py-2 rounded-lg border-gray-200 text-sm font-bold text-gray-900 focus:ring-blue-500 focus:border-blue-500">
                                            </div>
                                        </div>
                                        <div>
                                            <label class="block text-xs font-bold text-gray-700 mb-1">Unidades por Caja</label>
                                            <input formControlName="unitPerBox" type="number" class="w-full px-4 py-2 rounded-lg border-gray-200 text-sm font-medium focus:ring-blue-500 focus:border-blue-500">
                                        </div>
                                    </div>
                                </div>

                                <div class="p-4 bg-blue-50/30 rounded-xl border border-blue-100">
                                    <span class="text-xs font-bold text-blue-400 uppercase tracking-wider mb-3 block">Reglas de Descuento</span>
                                    <div class="space-y-4">
                                        <div>
                                            <label class="block text-xs font-bold text-blue-800 mb-1">Descuento Mayorista (%)</label>
                                            <div class="relative">
                                                <input formControlName="wholesaleDiscount" type="number" class="w-full px-4 py-2 rounded-lg border-blue-200 text-sm font-medium text-blue-700 focus:ring-blue-500 focus:border-blue-500">
                                                 <lucide-icon [img]="PercentIcon" class="w-4 h-4 text-blue-400 absolute right-3 top-2.5"></lucide-icon>
                                            </div>
                                        </div>
                                        <div>
                                            <label class="block text-xs font-bold text-blue-800 mb-1">Descuento Caja (%)</label>
                                            <div class="relative">
                                                <input formControlName="boxDiscount" type="number" class="w-full px-4 py-2 rounded-lg border-blue-200 text-sm font-medium text-blue-700 focus:ring-blue-500 focus:border-blue-500">
                                                 <lucide-icon [img]="PercentIcon" class="w-4 h-4 text-blue-400 absolute right-3 top-2.5"></lucide-icon>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                             </div>

                             <!-- Results Row -->
                             <div class="p-4 bg-gray-900 rounded-xl text-white shadow-lg shadow-gray-200">
                                <span class="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 block flex items-center gap-2">
                                    <lucide-icon [img]="CalculatorIcon" class="w-4 h-4"></lucide-icon>
                                    Precios Calculados
                                </span>
                                <div class="grid grid-cols-2 gap-8">
                                    <div>
                                        <p class="text-xs text-gray-400 mb-1">Precio Unitario Final</p>
                                        <p class="text-2xl font-bold tracking-tight">S/ {{ editForm.get('priceUnit')?.value | number:'1.2-2' }}</p>
                                        <div class="mt-2">
                                            <label class="block text-[10px] font-bold text-gray-500 uppercase mb-1">Stock Unidades</label>
                                            <input formControlName="stockUnits" type="number" class="w-full bg-gray-800 border-gray-700 rounded text-white text-xs py-1 px-2 focus:ring-0 focus:border-gray-600">
                                        </div>
                                    </div>
                                    <div class="border-l border-gray-700 pl-8">
                                        <div class="flex items-center justify-between mb-1">
                                            <p class="text-xs text-blue-400 font-bold">Precio Caja Final</p>
                                            <span class="text-[10px] bg-blue-600 text-white px-1.5 rounded" *ngIf="(editForm.get('boxDiscount')?.value ?? 0) > 0">-{{ editForm.get('boxDiscount')?.value }}%</span>
                                        </div>
                                        
                                        <div class="flex items-baseline gap-2">
                                             <p class="text-2xl font-bold tracking-tight text-blue-100">S/ {{ editForm.get('priceBox')?.value | number:'1.2-2' }}</p>
                                             <input formControlName="priceBox" type="number" class="hidden"> <!-- Hidden input to bind value -->
                                        </div>
                                        <p class="text-[10px] text-gray-500">S/ {{ ((editForm.get('priceBox')?.value ?? 0) / (editForm.get('unitPerBox')?.value || 1)) | number:'1.2-2' }} c/u</p>

                                        <div class="mt-2">
                                            <label class="block text-[10px] font-bold text-gray-500 uppercase mb-1">Stock Cajas</label>
                                            <input formControlName="stockBoxes" type="number" class="w-full bg-gray-800 border-gray-700 rounded text-white text-xs py-1 px-2 focus:ring-0 focus:border-gray-600">
                                        </div>
                                    </div>
                                </div>
                             </div>

                        </div>
                    </div>

                    <!-- Images -->
                    <div class="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                        <div class="flex items-center justify-between mb-6">
                            <h3 class="text-lg font-bold text-gray-900 flex items-center gap-2">
                                <lucide-icon [img]="ImageIcon" class="w-5 h-5 text-gray-400"></lucide-icon>
                                Galería de Imágenes
                            </h3>
                            <button type="button" class="text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 px-3 py-1.5 rounded-lg transition-colors">
                                + Añadir URL externa
                            </button>
                        </div>

                        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <!-- Upload Button -->
                             <label class="aspect-square border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 hover:bg-blue-50/50 transition-all group">
                                <div class="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                                    <lucide-icon [img]="UploadIcon" class="w-6 h-6"></lucide-icon>
                                </div>
                                <span class="text-sm font-semibold text-gray-700 group-hover:text-blue-700">Subir Imagen</span>
                                <span class="text-xs text-gray-400 mt-1">Max 5MB</span>
                                <input type="file" multiple accept="image/*" class="hidden" (change)="onFileSelected($event)">
                            </label>

                            @for (img of existingImages(); track $index) {
                                <div class="relative group aspect-square rounded-xl overflow-hidden border border-gray-200 bg-white">
                                    <img [src]="img" class="w-full h-full object-contain p-4">
                                    <div class="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center gap-2">
                                        <button type="button" (click)="removeExistingImage($index)" 
                                            class="p-2 bg-white text-red-600 rounded-lg hover:bg-red-50 transition-colors shadow-lg transform translate-y-2 group-hover:translate-y-0 duration-200">
                                            <lucide-icon [img]="XIcon" class="w-5 h-5"></lucide-icon>
                                        </button>
                                    </div>
                                    <div class="absolute top-2 right-2 bg-gray-900/80 text-white text-[10px] px-2 py-0.5 rounded-full backdrop-blur-sm">Existente</div>
                                </div>
                            }

                            @for (img of newImages(); track $index) {
                                <div class="relative group aspect-square rounded-xl overflow-hidden border border-green-200 bg-green-50/10">
                                    <img [src]="img" class="w-full h-full object-contain p-4">
                                    <div class="absolute inset-0 bg-green-900/20 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center">
                                        <button type="button" (click)="removeNewImage($index)" 
                                            class="p-2 bg-white text-red-600 rounded-lg hover:bg-red-50 transition-colors shadow-lg transform translate-y-2 group-hover:translate-y-0 duration-200">
                                            <lucide-icon [img]="XIcon" class="w-5 h-5"></lucide-icon>
                                        </button>
                                    </div>
                                    <div class="absolute top-2 right-2 bg-green-600 text-white text-[10px] px-2 py-0.5 rounded-full shadow-sm">Nueva</div>
                                </div>
                            }
                        </div>
                    </div>

                </form>
            </div>

            <!-- Footer -->
            <div class="px-8 py-5 border-t border-gray-100 bg-white flex items-center justify-end gap-3 sticky bottom-0 z-10">
                <button type="button" (click)="close.emit()" 
                    class="px-6 py-2.5 rounded-xl text-sm font-bold text-gray-600 hover:text-gray-800 hover:bg-gray-100/50 transition-all">
                    Cancelar
                </button>
                <button (click)="editForm.valid ? onSubmit() : null" 
                    [disabled]="editForm.invalid || isSaving"
                    [class.opacity-50]="editForm.invalid || isSaving"
                    class="px-8 py-2.5 rounded-xl text-sm font-bold text-white bg-gray-900 hover:bg-black transition-all flex items-center gap-2 shadow-lg shadow-gray-900/20 active:scale-95 transform duration-150">
                    
                    @if (isSaving) {
                        <lucide-icon [img]="LoaderIcon" class="w-4 h-4 animate-spin"></lucide-icon>
                        Guardando...
                    } @else {
                        Guardar Producto
                    }
                </button>
            </div>
        </div>
    </app-modal>
    `
})
export class ProductModal {
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
                // Assuming first discount in 'unit' is wholesale for now. 
                // Ideal approach: Find discount by minQuantity = 3 or specific identifier if available?
                // For MVP B2B: We take the first available discount as the primary 'Wholesale' one.
                wholesaleDiscount: (() => {
                    const unitPrice = value.prices?.find((p: any) => p.label === 'unit');
                    if (unitPrice?.discounts?.length) {
                        const discPrice = unitPrice.discounts[0].price; // Take first discount
                        const base = unitPrice.price;
                        if (!base) return 0;
                        // Reverse percent: (1 - (disc / base)) * 100
                        return Math.round((1 - (discPrice / base)) * 100);
                    }
                    return 0;
                })(),
                boxDiscount: (() => {
                    // Logic: Reverse calculate box discount
                    const unitPrice = value.prices?.find((p: any) => p.label === 'unit')?.price || 0;
                    const boxPrice = value.prices?.find((p: any) => p.label === 'box')?.price || 0;
                    const units = value.unitPerBox || 1;

                    if (unitPrice && boxPrice && units) {
                        const baseTotal = unitPrice * units;
                        // Avoid division by zero
                        if (baseTotal === 0) return 0;

                        // Formula: 1 - (BoxPrice / (UnitPrice * Units))
                        // Example: 1 - (900 / (100 * 10)) = 1 - 0.9 = 0.1 (10%)
                        const discount = Math.round((1 - (boxPrice / baseTotal)) * 100);
                        return discount > 0 ? discount : 0;
                    }
                    return 0;
                })()
            });
            // Update selected category for subcategories loading
            if (value.categoryId) {
                this.selectedCategoryId.set(value.categoryId);
            }
            // Images
            this.existingImages.set(value.images || []);
            this._product = value;
            // SKU readonly check done in template
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
    isCheckMode = false; // logic internal
    existingImages = signal<string[]>([]);
    newImages = signal<string[]>([]);

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

    editForm = this.fb.group({
        name: ['', Validators.required],
        sku: [{ value: '', disabled: true }], // Disabled by default for auto-generation
        brand: ['', Validators.required],
        categoryId: ['', Validators.required],
        subcategoryId: ['', Validators.required],
        description: [''],
        unitPerBox: [12, [Validators.required, Validators.min(1)]],
        priceUnit: [0, [Validators.required, Validators.min(0)]],
        priceBox: [0, [Validators.required, Validators.min(0)]],
        stockUnits: [0, [Validators.required, Validators.min(0)]],
        stockBoxes: [0, [Validators.required, Validators.min(0)]],
        wholesaleDiscount: [0],
        boxDiscount: [0],
        isActive: [true]
    });

    // Reactive Pricing Logic
    private formValues = toSignal(this.editForm.valueChanges, { initialValue: {} as Partial<typeof this.editForm.value> });

    private calculatedPrices = computed(() => {
        const val = this.formValues() || {};
        const basePrice = val.priceUnit || 0;
        const units = val.unitPerBox || 1;
        const boxDisc = (val.boxDiscount || 0) / 100;

        // Logic: Box Price = (Base * Units) * (1 - Discount)
        const totalBase = basePrice * units;
        const finalBoxPrice = totalBase * (1 - boxDisc);

        return {
            boxPrice: parseFloat(finalBoxPrice.toFixed(2))
        };
    });

    constructor() {
        // React to category changes
        this.editForm.get('categoryId')?.valueChanges.subscribe(val => {
            if (val) {
                this.selectedCategoryId.set(val);
                this.editForm.get('subcategoryId')?.reset('');
            }
        });

        // Effect to update box price control when inputs change
        effect(() => {
            const calculated = this.calculatedPrices();
            // Only update if value is different to avoid loops (though emitEvent:false helps)
            // Using patchValue with emitEvent: false to prevent circular dependency if we listened to priceBox
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
            for (let i = 0; i < files.length; i++) {
                const reader = new FileReader();
                reader.onload = (e: any) => {
                    this.newImages.update(imgs => [...imgs, e.target.result]);
                };
                reader.readAsDataURL(files[i]);
            }
        }
    }

    removeNewImage(index: number) {
        this.newImages.update(imgs => imgs.filter((_, i) => i !== index));
    }

    removeExistingImage(index: number) {
        this.existingImages.update(imgs => imgs.filter((_, i) => i !== index));
    }

    onSubmit() {
        if (this.editForm.valid) {
            const formValue = this.editForm.getRawValue();

            // Generate Strict Payload using Utils
            const payload = ProductUtils.formatProductPayload(
                formValue,
                [...this.existingImages(), ...this.newImages()]
            );

            this.save.emit(payload);
        }
    }
}
