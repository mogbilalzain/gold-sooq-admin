import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TranslationService } from '../../../services/translation.service';

@Component({
  selector: 'app-page-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h2 class="text-m3-headline-sm sm:text-m3-headline-md font-semibold text-[color:var(--color-on-surface)]">
          {{ title }}
        </h2>
        @if (subtitle) {
          <p class="mt-1 text-m3-body-md text-[color:var(--color-on-surface-variant)]">
            {{ subtitle }}
          </p>
        }
      </div>
      <ng-content></ng-content>
    </div>
  `,
  styles: []
})
export class PageHeaderComponent {
  @Input() title: string = '';
  @Input() subtitle: string = '';
}

