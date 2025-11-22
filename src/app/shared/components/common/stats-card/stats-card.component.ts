import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SafeHtmlPipe } from '../../../pipe/safe-html.pipe';

@Component({
  selector: 'app-stats-card',
  standalone: true,
  imports: [CommonModule, SafeHtmlPipe],
  template: `
    <div class="rounded-lg border border-gray-200 bg-white p-6 shadow-theme-xs dark:border-gray-800 dark:bg-gray-dark">
      <div class="flex items-center justify-between">
        <div>
          <p class="text-sm font-medium text-gray-500 dark:text-gray-400">{{ title }}</p>
          <p class="mt-2 text-2xl font-semibold text-gray-800 dark:text-white">
            {{ value | number }}
            @if (suffix) {
              <span class="text-sm font-normal text-gray-500 dark:text-gray-400">{{ suffix }}</span>
            }
          </p>
          @if (change !== undefined) {
            <div class="mt-2 flex items-center gap-1">
              <span [ngClass]="{
                'text-success-500': change >= 0,
                'text-error-500': change < 0
              }">
                @if (change >= 0) {
                  <svg class="inline" width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M8 3.33334L12 7.33334H9.33333V12.6667H6.66667V7.33334H4L8 3.33334Z" fill="currentColor"/>
                  </svg>
                } @else {
                  <svg class="inline" width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M8 12.6667L4 8.66667H6.66667V3.33334H9.33333V8.66667H12L8 12.6667Z" fill="currentColor"/>
                  </svg>
                }
                {{ Math.abs(change) }}%
              </span>
              <span class="text-xs text-gray-500 dark:text-gray-400">{{ changeLabel }}</span>
            </div>
          }
        </div>
        @if (icon) {
          <div class="rounded-full p-3" [ngClass]="iconBgClass">
            <span [innerHTML]="icon | safeHtml"></span>
          </div>
        }
      </div>
    </div>
  `,
  styles: []
})
export class StatsCardComponent {
  @Input() title: string = '';
  @Input() value: number = 0;
  @Input() suffix: string = '';
  @Input() change: number | undefined;
  @Input() changeLabel: string = 'من الشهر الماضي';
  @Input() icon: string = '';
  @Input() iconBgClass: string = 'bg-brand-100 dark:bg-brand-900/20';

  Math = Math;
}

