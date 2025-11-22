import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TranslationService } from '../../../services/translation.service';

@Component({
  selector: 'app-page-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h2 class="text-2xl font-semibold text-gray-800 dark:text-white">
          {{ title }}
        </h2>
        @if (subtitle) {
          <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
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

