import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-table-skeleton',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="w-full overflow-hidden">
      <div class="space-y-3 p-4">
        @for (row of rowsArray; track $index) {
          <div class="flex items-center gap-4">
            @for (col of columnsArray; track $index) {
              <div
                class="h-4 flex-1 animate-pulse rounded-md bg-[color:var(--color-surface-container-high)]"
                [ngClass]="{ 'max-w-[48px] flex-none': $index === 0 }"
              ></div>
            }
          </div>
        }
      </div>
    </div>
  `,
})
export class TableSkeletonComponent {
  @Input() rows = 6;
  @Input() columns = 5;

  get rowsArray(): number[] {
    return Array.from({ length: this.rows });
  }

  get columnsArray(): number[] {
    return Array.from({ length: this.columns });
  }
}
