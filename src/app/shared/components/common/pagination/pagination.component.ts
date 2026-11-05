import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { TranslationService } from '../../../services/translation.service';

@Component({
  selector: 'app-pagination',
  standalone: true,
  imports: [CommonModule, MatPaginatorModule],
  template: `
    <mat-paginator
      [length]="total"
      [pageSize]="limit"
      [pageIndex]="currentPage - 1"
      [hidePageSize]="true"
      [showFirstLastButtons]="true"
      (page)="onPage($event)"
      aria-label="Pagination"
    >
    </mat-paginator>
  `,
  styles: [
    `
      :host {
        display: block;
      }
      mat-paginator {
        background: transparent;
        border-top: 1px solid color-mix(in srgb, var(--color-outline-variant) 60%, transparent);
      }
    `,
  ],
})
export class PaginationComponent {
  @Input() currentPage: number = 1;
  @Input() totalPages: number = 1;
  @Input() total: number = 0;
  @Input() limit: number = 20;
  @Output() pageChange = new EventEmitter<number>();

  constructor(public translationService: TranslationService) {}

  onPage(event: PageEvent): void {
    const page = event.pageIndex + 1;
    if (page !== this.currentPage) {
      this.pageChange.emit(page);
    }
  }
}
