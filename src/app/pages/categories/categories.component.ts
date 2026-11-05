import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { PageHeaderComponent } from '../../shared/components/layout/page-header/page-header.component';
import { LoadingSpinnerComponent } from '../../shared/components/common/loading-spinner/loading-spinner.component';
import { PaginationComponent } from '../../shared/components/common/pagination/pagination.component';
import { ButtonComponent } from '../../shared/components/ui/button/button.component';
import { ConfirmDialogComponent } from '../../shared/components/common/confirm-dialog/confirm-dialog.component';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatButtonModule } from '@angular/material/button';
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
    ConfirmDialogComponent,
    MatTableModule,
    MatTooltipModule,
    MatButtonModule,
  ],
  templateUrl: './categories.component.html',
})
export class CategoriesComponent implements OnInit {
  categories: Category[] = [];
  displayedColumns = ['name', 'image', 'actions'];
  isLoading = false;
  errorMessage = '';

  /** Flattened parent + sub rows for the mat-table data source. */
  get tableRows(): { category: Category; isParent: boolean }[] {
    const rows: { category: Category; isParent: boolean }[] = [];
    for (const category of this.categories) {
      rows.push({ category, isParent: true });
      for (const sub of category.subCategories ?? []) {
        rows.push({ category: sub, isParent: false });
      }
    }
    return rows;
  }

  currentPage = 1;
  limit = 20;
  total = 0;
  totalPages = 0;

  deleteTarget: Category | null = null;
  actionProcessing = false;

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

  openDelete(category: Category) {
    this.deleteTarget = category;
  }

  confirmDelete() {
    if (!this.deleteTarget) return;
    this.actionProcessing = true;
    this.categoriesService.deleteCategory({ categoryId: this.deleteTarget.id }).subscribe({
      next: () => {
        this.actionProcessing = false;
        this.deleteTarget = null;
        this.loadCategories();
      },
      error: (error) => {
        this.actionProcessing = false;
        this.deleteTarget = null;
        this.errorMessage = this.translationService.translateApiError(this.errorHandler.handleError(error).message);
      }
    });
  }

  getCategoryName(category: Category): string {
    return this.translationService.currentLanguageValue === 'ar' 
      ? category.name_ar 
      : category.name_en;
  }
}

