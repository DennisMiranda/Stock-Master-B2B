import { Component, inject, signal, computed, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators, FormArray } from '@angular/forms';
import { CategoryService } from '../../../../../core/services/category.service';
import { ToastService } from '../../../../../core/services/toast.service';
import { Modal } from '../../../../../shared/ui/modal/modal';
import { PrimaryButton } from '../../../../../shared/ui/buttons/primary-button/primary-button';
import { LucideAngularModule, Plus, X, Save, Trash2, Check } from 'lucide-angular';

import { ConfirmationModalComponent } from '../../../../../shared/ui/confirmation-modal/confirmation-modal.component';

@Component({
    selector: 'app-category-modal',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, Modal, PrimaryButton, LucideAngularModule, ConfirmationModalComponent],
    template: `
    @if (isOpen()) {
        <app-modal (close)="close()" [title]="isEditing() ? 'Editar Categoría' : 'Nueva Categoría'">
          <form [formGroup]="form" (ngSubmit)="submit()" class="space-y-6">
            
            <!-- Category Basic Info -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="md:col-span-2">
                    <label class="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                    <input type="text" formControlName="name" class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all" placeholder="Ej. Laptops">
                </div>
                <!-- Slug Hidden/Readonly for UX -->
                <div class="hidden">
                    <label class="block text-sm font-medium text-gray-700 mb-1">Slug</label>
                    <input type="text" formControlName="slug" class="w-full px-3 py-2 border rounded-lg bg-gray-50 text-gray-500" readonly>
                </div>
            </div>
    
            <!-- Subcategories Management -->
            <div class="border-t pt-4">
                <div class="flex items-center justify-between mb-2">
                    <h3 class="text-sm font-semibold text-gray-900">Subcategorías</h3>
                    @if (!isAddingSubcategory()) {
                        <button type="button" (click)="startAddingSubcategory()" class="text-xs flex items-center gap-1 text-blue-600 hover:text-blue-700 font-medium">
                            <lucide-icon [img]="PlusIcon" class="w-3 h-3"/> Agregar Subcategoría
                        </button>
                    }
                </div>
                
                @if (isAddingSubcategory()) {
                    <div class="mb-3 flex items-center gap-2 animate-in fade-in slide-in-from-top-1">
                        <input 
                            [formControl]="newSubcategoryControl" 
                            (keydown.enter)="$event.preventDefault(); saveNewSubcategory()" 
                            (keydown.escape)="cancelAddingSubcategory()"
                            type="text" 
                            class="flex-1 px-3 py-1.5 text-sm border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" 
                            placeholder="Nombre de subcategoría..." 
                            autofocus>
                        
                        <button type="button" (click)="saveNewSubcategory()" [disabled]="newSubcategoryControl.invalid" class="p-1.5 text-green-600 hover:bg-green-50 rounded disabled:opacity-50">
                            <lucide-icon [img]="CheckIcon" class="w-4 h-4"/>
                        </button>
                        <button type="button" (click)="cancelAddingSubcategory()" class="p-1.5 text-gray-400 hover:bg-gray-100 rounded">
                            <lucide-icon [img]="XIcon" class="w-4 h-4"/>
                        </button>
                    </div>
                }
    
                @if(currentSubcategories().length === 0) {
                    <p class="text-sm text-gray-400 italic">Sin subcategorías asignadas.</p>
                } @else {
                    <div class="space-y-2">
                        @for(sub of currentSubcategories(); track sub.id) {
                            <div class="flex items-center justify-between p-2 bg-gray-50 rounded border border-gray-100 group">
                                <span class="text-sm text-gray-700">{{ sub.name }}</span>
                                <button type="button" (click)="removeSubcategory(sub)" class="text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <lucide-icon [img]="TrashIcon" class="w-4 h-4"/>
                                </button>
                            </div>
                        }
                    </div>
                }
            </div>
    
            <!-- Actions -->
            <div class="flex justify-end gap-3 pt-2">
              <button type="button" (click)="close()" class="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
                Cancelar
              </button>
              
              @if (isEditing()) {
                  <button type="button" (click)="confirmDelete()" class="px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 border border-transparent hover:border-red-200 rounded-lg transition-colors">
                    <lucide-icon [img]="TrashIcon" class="w-4 h-4 mr-2 inline-block"/>
                    Eliminar
                  </button>
              }
              <app-primary-button [type]="'submit'" [loading]="loading()">
                <lucide-icon [img]="SaveIcon" class="w-4 h-4 mr-2"/>
                {{ isEditing() ? 'Actualizar' : 'Crear' }}
              </app-primary-button>
            </div>
          </form>
        </app-modal>
        
        <app-confirmation-modal
            #confirmationModal
            (confirm)="onConfirmAction()"
            [title]="confirmConfig().title"
            [message]="confirmConfig().message"
            [confirmText]="confirmConfig().confirmText"
            [type]="confirmConfig().type"
            cancelText="Cancelar"
        />
    }
  `
})
export class CategoryModal {
    private fb = inject(FormBuilder);
    private categoryService = inject(CategoryService);
    private toast = inject(ToastService);

    @ViewChild('confirmationModal') confirmationModal!: ConfirmationModalComponent;

    isOpen = signal(false);
    loading = signal(false);
    categoryId = signal<string | null>(null);
    currentSubcategories = signal<any[]>([]);

    form = this.fb.group({
        name: ['', Validators.required],
        slug: ['']
    });

    readonly PlusIcon = Plus;
    readonly SaveIcon = Save;
    readonly TrashIcon = Trash2;
    readonly CheckIcon = Check;
    readonly XIcon = X;

    isEditing = computed(() => !!this.categoryId());

    constructor() {
        // Auto-generate slug
        this.form.get('name')?.valueChanges.subscribe(val => {
            if (val) {
                const slug = val.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
                this.form.patchValue({ slug }, { emitEvent: false });
            }
        });
    }

    open(category?: any) {
        this.form.reset();
        this.currentSubcategories.set([]);

        if (category) {
            this.categoryId.set(category.id);
            this.form.patchValue({
                name: category.name,
                slug: category.slug
            });
            // Extract subcategories if present (the API returns them nested)
            if (category.subcategories) {
                this.currentSubcategories.set(category.subcategories);
            }
        } else {
            this.categoryId.set(null);
        }
        this.isOpen.set(true);
    }

    close() {
        this.isOpen.set(false);
    }

    submit() {
        if (this.form.invalid) return;
        this.loading.set(true);
        const data = this.form.getRawValue() as { name: string; slug: string };

        let req$;
        if (this.isEditing()) {
            req$ = this.categoryService.updateCategory(this.categoryId()!, data);
        } else {
            // New: Send subcategories payload
            req$ = this.categoryService.createCategory({
                ...data,
                subcategories: this.currentSubcategories()
            });
        }

        req$.subscribe({
            next: () => {
                this.loading.set(false);
                this.close();
                this.toast.success(this.isEditing() ? 'Categoría actualizada correctamente.' : 'Categoría creada correctamente.');
                this.categoryService.notifyDataChanged();
            },
            error: (err) => {
                console.error(err);
                this.loading.set(false);
                this.toast.error('Error al guardar categoría.');
            }
        });
    }



    // Confirmation State
    confirmConfig = signal({
        title: '',
        message: '',
        confirmText: 'Confirmar',
        type: 'danger' as 'danger' | 'primary'
    });
    private pendingAction: (() => void) | null = null;

    openConfirmation(config: { title: string, message: string, confirmText?: string, type?: 'danger' | 'primary' }, action: () => void) {
        this.confirmConfig.set({
            title: config.title,
            message: config.message,
            confirmText: config.confirmText || 'Confirmar',
            type: config.type || 'danger'
        });
        this.pendingAction = action;

        // Ensure change detection runs before opening if inputs changed
        setTimeout(() => {
            this.confirmationModal.open();
        });
    }

    onConfirmAction() {
        if (this.pendingAction) {
            this.pendingAction();
            this.pendingAction = null;
        }
    }

    removeSubcategory(sub: any) {
        this.openConfirmation({
            title: 'Eliminar Subcategoría',
            message: `¿Estás seguro de eliminar la subcategoría "${sub.name}"?`,
            confirmText: 'Eliminar',
            type: 'danger'
        }, () => {
            // UX: If creating new (temp id), just remove from local array
            if (!this.isEditing() || sub.id.startsWith('temp-')) {
                this.currentSubcategories.update(prev => prev.filter(s => s.id !== sub.id));
                return;
            }

            this.loading.set(true);
            this.categoryService.deleteSubcategory(this.categoryId()!, sub.id).subscribe({
                next: () => {
                    this.loading.set(false);
                    this.currentSubcategories.update(prev => prev.filter(s => s.id !== sub.id));
                    this.toast.success('Subcategoría eliminada.');
                },
                error: (err) => {
                    console.error(err);
                    this.loading.set(false);
                    this.toast.error('Error al eliminar subcategoría.');
                }
            });
        });
    }

    confirmDelete() {
        this.openConfirmation({
            title: 'Eliminar Categoría',
            message: '¿Estás seguro de eliminar esta categoría y TODAS sus subcategorías? Esta acción no se puede deshacer.',
            confirmText: 'Eliminar Categoría',
            type: 'danger'
        }, () => {
            this.loading.set(true);
            this.categoryService.deleteCategory(this.categoryId()!).subscribe({
                next: () => {
                    this.loading.set(false);
                    this.close();
                    this.toast.success('Categoría eliminada correctamente.');
                    this.categoryService.notifyDataChanged();
                },
                error: (err) => {
                    console.error(err);
                    this.loading.set(false);
                    if (err.message === 'CATEGORY_HAS_PRODUCTS') {
                        this.toast.error('No se puede eliminar: Esta categoría tiene productos asociados.');
                    } else {
                        this.toast.error('Error inesperado al eliminar la categoría.');
                    }
                }
            });
        });
    }
    // Inline Subcategory Creation
    isAddingSubcategory = signal(false);
    newSubcategoryControl = this.fb.control('', [Validators.required]);

    startAddingSubcategory() {
        this.isAddingSubcategory.set(true);
        this.newSubcategoryControl.reset();
        // Focus logic can be handled with a directive or basic timeout if strictly needed,
        // but for now keeping it simple. User clicks input.
    }

    cancelAddingSubcategory() {
        this.isAddingSubcategory.set(false);
        this.newSubcategoryControl.reset();
    }

    saveNewSubcategory() {
        if (this.newSubcategoryControl.invalid || !this.newSubcategoryControl.value?.trim()) return;

        const name = this.newSubcategoryControl.value.trim();
        const slug = name.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');

        // UX: If creating new category, just add to local array
        if (!this.isEditing()) {
            this.currentSubcategories.update(prev => [...prev, { name, slug, id: `temp-${Date.now()}` }]);
            this.cancelAddingSubcategory();
            return;
        }

        this.loading.set(true);
        this.categoryService.addSubcategory(this.categoryId()!, { name, slug }).subscribe({
            next: (newSub: any) => {
                this.loading.set(false);
                this.currentSubcategories.update(prev => [...prev, newSub.data]);
                this.toast.success('Subcategoría agregada.');
                this.cancelAddingSubcategory();
            },
            error: (err) => {
                console.error(err);
                this.loading.set(false);
                this.toast.error('Error al agregar subcategoría.');
            }
        });
    }
}
