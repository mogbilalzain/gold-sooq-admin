import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { PageHeaderComponent } from '../../shared/components/layout/page-header/page-header.component';
import { LoadingSpinnerComponent } from '../../shared/components/common/loading-spinner/loading-spinner.component';
import { PaginationComponent } from '../../shared/components/common/pagination/pagination.component';
import { ButtonComponent } from '../../shared/components/ui/button/button.component';
import { TranslationService } from '../../shared/services/translation.service';
import { CategoriesService, Category } from '../../shared/services/data/categories.service';
import { ErrorHandlerService } from '../../shared/services/api/error-handler.service';
import { ImageUrlService } from '../../shared/services/utils/image-url.service';

@Component({
  selector: 'app-categories',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    PageHeaderComponent,
    LoadingSpinnerComponent,
    PaginationComponent,
    ButtonComponent,
  ],
  templateUrl: './categories.component.html',
})
export class CategoriesComponent implements OnInit {
  categories: Category[] = [];
  isLoading = false;
  errorMessage = '';
  
  currentPage = 1;
  limit = 20;
  total = 0;
  totalPages = 0;

  constructor(
    public translationService: TranslationService,
    private categoriesService: CategoriesService,
    private errorHandler: ErrorHandlerService,
    public imageUrlService: ImageUrlService
  ) {}

  ngOnInit() {
    this.loadCategories();
  }

  loadCategories() {
    this.isLoading = true;
    this.errorMessage = '';
    
    const langCode = this.translationService.currentLanguageValue;
    
    this.categoriesService.listCategories({
      page: this.currentPage,
      limit: this.limit,
      langCode
    }).subscribe({
      next: (response) => {
        if (response.status === 'success' && response.data) {
          this.categories = response.data.categories;
          this.total = response.data.pagination.total;
          this.totalPages = response.data.pagination.totalPages;
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

  onPageChange(page: number) {
    this.currentPage = page;
    this.loadCategories();
  }

  onDelete(categoryId: number) {
    if (confirm(this.translationService.t('categories.confirmDelete'))) {
      this.categoriesService.deleteCategory({ categoryId }).subscribe({
        next: () => {
          this.loadCategories();
        },
        error: (error) => {
          const apiError = this.errorHandler.handleError(error);
          alert(apiError.message);
        }
      });
    }
  }

  getCategoryName(category: Category): string {
    return this.translationService.currentLanguageValue === 'ar' 
      ? category.name_ar 
      : category.name_en;
  }
}

