import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { PageHeaderComponent } from '../../../shared/components/layout/page-header/page-header.component';
import { LoadingSpinnerComponent } from '../../../shared/components/common/loading-spinner/loading-spinner.component';
import { ButtonComponent } from '../../../shared/components/ui/button/button.component';
import { InputFieldComponent } from '../../../shared/components/form/input/input-field.component';
import { LabelComponent } from '../../../shared/components/form/label/label.component';
import { CheckboxComponent } from '../../../shared/components/form/input/checkbox.component';
import { TranslationService } from '../../../shared/services/translation.service';
import { PostsAdsService, PostAd } from '../../../shared/services/data/posts-ads.service';
import { ErrorHandlerService } from '../../../shared/services/api/error-handler.service';

@Component({
  selector: 'app-post-form',
  standalone: true,
  imports: [
    CommonModule,
    PageHeaderComponent,
    LoadingSpinnerComponent,
    ButtonComponent,
    InputFieldComponent,
    LabelComponent,
    CheckboxComponent,
  ],
  templateUrl: './post-form.component.html',
})
export class PostFormComponent implements OnInit {
  isLoading = false;
  isSubmitting = false;
  errorMessage = '';
  postId: number | null = null;
  isEditMode = false;

  postTitle = '';
  postDetail = '';
  price: number | null = null;
  isActive = true;
  isFeatured = false;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    public translationService: TranslationService,
    private postsAdsService: PostsAdsService,
    private errorHandler: ErrorHandlerService
  ) {}

  ngOnInit() {
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.postId = +params['id'];
        this.isEditMode = true;
        this.loadPost();
      }
    });
  }

  loadPost() {
    if (!this.postId) return;
    
    this.isLoading = true;
    const langCode = this.translationService.currentLanguageValue;
    
    this.postsAdsService.listPosts({
      page: 1,
      limit: 1000,
      langCode,
      status: 'all'
    }).subscribe({
      next: (response) => {
        if (response.status === 'success' && response.data) {
          const post = response.data.posts.find((p: PostAd) => p.id === this.postId);
          if (post) {
            this.postTitle = post.postTitle || '';
            this.postDetail = post.postDetail || '';
            this.price = post.price || null;
            this.isActive = post.isActive;
            this.isFeatured = post.isFeatured || false;
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
    if (!this.postTitle || !this.postDetail) {
      this.errorMessage = this.translationService.t('posts.fillRequired');
      return;
    }

    if (!this.postId) {
      this.errorMessage = this.translationService.t('posts.postIdRequired');
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';

    this.postsAdsService.updatePost({
      postAdsId: this.postId,
      postTitle: this.postTitle,
      postDetail: this.postDetail,
      price: this.price || undefined,
      isActive: this.isActive,
      isFeatured: this.isFeatured,
    }).subscribe({
      next: () => {
        this.router.navigate(['/posts-ads']);
      },
      error: (error) => {
        const apiError = this.errorHandler.handleError(error);
        this.errorMessage = apiError.message;
        this.isSubmitting = false;
      }
    });
  }

  onCancel() {
    this.router.navigate(['/posts-ads']);
  }

  onTitleChange(value: string | number) {
    this.postTitle = String(value);
  }

  onDetailChange(value: string | number) {
    this.postDetail = String(value);
  }

  onPriceChange(value: string | number) {
    this.price = value ? +value : null;
  }
}

