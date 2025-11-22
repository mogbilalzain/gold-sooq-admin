import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { PageHeaderComponent } from '../../shared/components/layout/page-header/page-header.component';
import { LoadingSpinnerComponent } from '../../shared/components/common/loading-spinner/loading-spinner.component';
import { PaginationComponent } from '../../shared/components/common/pagination/pagination.component';
import { ButtonComponent } from '../../shared/components/ui/button/button.component';
import { InputFieldComponent } from '../../shared/components/form/input/input-field.component';
import { TranslationService } from '../../shared/services/translation.service';
import { PostsAdsService, PostAd } from '../../shared/services/data/posts-ads.service';
import { ErrorHandlerService } from '../../shared/services/api/error-handler.service';

@Component({
  selector: 'app-posts-ads',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    PageHeaderComponent,
    LoadingSpinnerComponent,
    PaginationComponent,
    ButtonComponent,
    InputFieldComponent,
  ],
  templateUrl: './posts-ads.component.html',
})
export class PostsAdsComponent implements OnInit {
  posts: PostAd[] = [];
  isLoading = false;
  errorMessage = '';
  
  currentPage = 1;
  limit = 20;
  total = 0;
  totalPages = 0;

  // Filters
  statusFilter: 'active' | 'inactive' | 'all' = 'all';
  searchTerm = '';

  constructor(
    public translationService: TranslationService,
    private postsAdsService: PostsAdsService,
    private errorHandler: ErrorHandlerService
  ) {}

  ngOnInit() {
    this.loadPosts();
  }

  loadPosts() {
    this.isLoading = true;
    this.errorMessage = '';
    
    const langCode = this.translationService.currentLanguageValue;
    
    this.postsAdsService.listPosts({
      page: this.currentPage,
      limit: this.limit,
      langCode,
      status: this.statusFilter,
    }).subscribe({
      next: (response) => {
        if (response.status === 'success' && response.data) {
          this.posts = response.data.posts;
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
    this.loadPosts();
  }

  onStatusFilterChange(status: 'active' | 'inactive' | 'all') {
    this.statusFilter = status;
    this.currentPage = 1;
    this.loadPosts();
  }

  onSearch() {
    this.currentPage = 1;
    this.loadPosts();
  }

  onSearchTermChange(value: string | number) {
    this.searchTerm = String(value);
  }

  onDelete(postId: number) {
    if (confirm(this.translationService.t('posts.confirmDelete'))) {
      this.postsAdsService.deletePost({ postAdsId: postId }).subscribe({
        next: () => {
          this.loadPosts();
        },
        error: (error) => {
          const apiError = this.errorHandler.handleError(error);
          alert(apiError.message);
        }
      });
    }
  }

  toggleActive(post: PostAd) {
    this.postsAdsService.updatePost({
      postAdsId: post.id,
      isActive: !post.isActive
    }).subscribe({
      next: () => {
        this.loadPosts();
      },
      error: (error) => {
        const apiError = this.errorHandler.handleError(error);
        alert(apiError.message);
      }
    });
  }

  toggleFeatured(post: PostAd) {
    this.postsAdsService.updatePost({
      postAdsId: post.id,
      isFeatured: !post.isFeatured
    }).subscribe({
      next: () => {
        this.loadPosts();
      },
      error: (error) => {
        const apiError = this.errorHandler.handleError(error);
        alert(apiError.message);
      }
    });
  }
}

