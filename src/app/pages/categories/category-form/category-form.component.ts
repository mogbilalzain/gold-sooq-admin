import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { PageHeaderComponent } from '../../../shared/components/layout/page-header/page-header.component';
import { LoadingSpinnerComponent } from '../../../shared/components/common/loading-spinner/loading-spinner.component';
import { ButtonComponent } from '../../../shared/components/ui/button/button.component';
import { InputFieldComponent } from '../../../shared/components/form/input/input-field.component';
import { ImageUploaderComponent } from '../../../shared/components/common/image-uploader/image-uploader.component';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { TranslationService } from '../../../shared/services/translation.service';
import { CategoriesService, Category, CreateCategoryRequest, UpdateCategoryRequest } from '../../../shared/services/data/categories.service';
import { ErrorHandlerService } from '../../../shared/services/api/error-handler.service';

@Component({
  selector: 'app-category-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    PageHeaderComponent,
    LoadingSpinnerComponent,
    ButtonComponent,
    InputFieldComponent,
    ImageUploaderComponent,
    MatFormFieldModule,
    MatSelectModule,
    MatButtonModule,
  ],
  templateUrl: './category-form.component.html',
})
export class CategoryFormComponent implements OnInit {
  categoryForm: FormGroup;
  isLoading = false;
  isSubmitting = false;
  isUploading = false;
  errorMessage = '';
  categoryId: number | null = null;
  isEditMode = false;

  /** R2 storage key of the newly uploaded image (set only after a successful upload). */
  imageStorageKey: string | null = null;
  /** Existing image CDN URL (edit mode). */
  existingImageUrl: string | null = null;

  /** Initial values, for partial updates (only changed fields are sent). */
  private initialNameEn = '';
  private initialNameAr = '';
  private initialParentId: number | null = null;

  // Parent category dropdown options
  parentCategories: Category[] = [];

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    public translationService: TranslationService,
    private categoriesService: CategoriesService,
    private errorHandler: ErrorHandlerService
  ) {
    this.categoryForm = this.fb.group({
      name_en: ['', Validators.required],
      name_ar: ['', Validators.required],
      parent_category_id: [null],
    });
  }

  ngOnInit() {
    this.loadParentCategories();
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.categoryId = +params['id'];
        this.isEditMode = true;
        this.loadCategory();
      }
    });
  }

  loadParentCategories() {
    const langCode = this.translationService.currentLanguageValue;
    this.categoriesService.listCategories({
      page: 1,
      limit: 100,
      langCode
    }).subscribe({
      next: (response) => {
        if (response.status === 'success' && response.data) {
          // API returns only top-level categories in the flat list
          this.parentCategories = response.data.categories;
          if (this.isEditMode && this.categoryId) {
            this.populateFromList(response.data.categories);
          }
        }
      },
      error: (error) => {
        console.error('Failed to load parent categories:', error);
      }
    });
  }

  loadCategory() {
    if (!this.categoryId) return;

    this.isLoading = true;
    const langCode = this.translationService.currentLanguageValue;

    this.categoriesService.listCategories({
      page: 1,
      limit: 100,
      langCode
    }).subscribe({
      next: (response) => {
        if (response.status === 'success' && response.data) {
          this.populateFromList(response.data.categories);
        }
        this.isLoading = false;
      },
      error: (error) => {
        const apiError = this.errorHandler.handleError(error);
        this.errorMessage = apiError.message;
        this.isLoading = false;
      }
    });
  }

  private populateFromList(categories: Category[]) {
    const category = categories.find((c: Category) => c.id === this.categoryId);
    if (category) {
      const parentId = category.parent_category_id ?? null;
      this.categoryForm.patchValue({
        name_en: category.name_en,
        name_ar: category.name_ar,
        parent_category_id: parentId,
      });
      this.initialNameEn = category.name_en;
      this.initialNameAr = category.name_ar;
      this.initialParentId = parentId;
      // image_url is a complete CDN URL — used directly
      this.existingImageUrl = category.image_url || null;
    }
  }

  onImageUploaded(storageKey: string) {
    this.imageStorageKey = storageKey;
  }

  onImageCleared() {
    // Removal semantics are not confirmed by the API (see
    // features/API_CONTRACT_NOTES.md). We simply stop offering a replacement;
    // the saved image stays untouched because image_storage_key is omitted.
    this.imageStorageKey = null;
  }

  onSubmit() {
    if (this.categoryForm.invalid) {
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';

    const raw = this.categoryForm.value;

    if (this.isEditMode && this.categoryId) {
      // Partial update: send only changed fields. image_storage_key is sent
      // only when a replacement was uploaded; omitted otherwise.
      const payload: UpdateCategoryRequest = { categoryId: this.categoryId };
      if (raw.name_en !== this.initialNameEn) payload.name_en = raw.name_en;
      if (raw.name_ar !== this.initialNameAr) payload.name_ar = raw.name_ar;
      if ((raw.parent_category_id ?? null) !== this.initialParentId) {
        payload.parent_category_id = raw.parent_category_id ?? null;
      }
      if (this.imageStorageKey) payload.image_storage_key = this.imageStorageKey;

      this.categoriesService.updateCategory(payload).subscribe({
        next: () => {
          this.router.navigate(['/categories']);
        },
        error: (error) => {
          const apiError = this.errorHandler.handleError(error);
          this.errorMessage = apiError.message;
          this.isSubmitting = false;
        }
      });
    } else {
      const payload: CreateCategoryRequest = {
        name_en: raw.name_en,
        name_ar: raw.name_ar,
        parent_category_id: raw.parent_category_id ?? null,
      };
      if (this.imageStorageKey) payload.image_storage_key = this.imageStorageKey;

      this.categoriesService.createCategory(payload).subscribe({
        next: () => {
          this.router.navigate(['/categories']);
        },
        error: (error) => {
          const apiError = this.errorHandler.handleError(error);
          this.errorMessage = apiError.message;
          this.isSubmitting = false;
        }
      });
    }
  }

  onCancel() {
    this.router.navigate(['/categories']);
  }

  get availableParents(): Category[] {
    // The API already returns only top-level categories in the flat list.
    // Exclude the current category in edit mode to prevent circular reference.
    return this.parentCategories.filter(c => c.id !== this.categoryId);
  }

  getCategoryName(category: Category): string {
    return this.translationService.currentLanguageValue === 'ar'
      ? category.name_ar
      : category.name_en;
  }
}
