import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { PageHeaderComponent } from '../../../shared/components/layout/page-header/page-header.component';
import { LoadingSpinnerComponent } from '../../../shared/components/common/loading-spinner/loading-spinner.component';
import { ButtonComponent } from '../../../shared/components/ui/button/button.component';
import { InputFieldComponent } from '../../../shared/components/form/input/input-field.component';
import { LabelComponent } from '../../../shared/components/form/label/label.component';
import { TranslationService } from '../../../shared/services/translation.service';
import { CategoriesService, Category } from '../../../shared/services/data/categories.service';
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
    LabelComponent,
  ],
  templateUrl: './category-form.component.html',
})
export class CategoryFormComponent implements OnInit {
  categoryForm: FormGroup;
  isLoading = false;
  isSubmitting = false;
  errorMessage = '';
  categoryId: number | null = null;
  isEditMode = false;

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
      image_url: [''],
      parent_category_id: [null],
    });
  }

  ngOnInit() {
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.categoryId = +params['id'];
        this.isEditMode = true;
        this.loadCategory();
      }
    });
  }

  loadCategory() {
    if (!this.categoryId) return;
    
    this.isLoading = true;
    const langCode = this.translationService.currentLanguageValue;
    
    this.categoriesService.listCategories({
      page: 1,
      limit: 1000,
      langCode
    }).subscribe({
      next: (response) => {
        if (response.status === 'success' && response.data) {
          const category = response.data.categories.find((c: Category) => c.id === this.categoryId);
          if (category) {
            this.categoryForm.patchValue({
              name_en: category.name_en,
              name_ar: category.name_ar,
              image_url: category.image_url || '',
              parent_category_id: category.parent_category_id || null,
            });
          }
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

  onSubmit() {
    if (this.categoryForm.invalid) {
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';

    const formData = this.categoryForm.value;

    if (this.isEditMode && this.categoryId) {
      this.categoriesService.updateCategory({
        categoryId: this.categoryId,
        ...formData
      }).subscribe({
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
      this.categoriesService.createCategory(formData).subscribe({
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
}

