import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { TranslationService } from '../../services/translation.service';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule],
  template: `
    <footer
      class="ayar-footer mt-10 flex flex-col items-center justify-between gap-3 px-4 py-6 text-center text-xs text-slate-400 sm:flex-row sm:px-8 sm:text-start dark:text-[color:var(--color-on-surface-variant)]"
    >
      <div class="flex flex-wrap items-center justify-center gap-x-2 gap-y-1">
        <span class="font-bold text-slate-700 dark:text-[color:var(--color-on-surface)]">
          {{ translationService.t('footer.brand') }}
        </span>
        <span>© {{ year }} {{ translationService.t('footer.rights') }}</span>
      </div>
      <div class="flex items-center gap-3 sm:gap-4">
        <a [href]="siteLink('privacy')" target="_blank" rel="noopener" class="ayar-footer-link">
          {{ translationService.t('footer.privacy') }}
        </a>
        <span aria-hidden="true">•</span>
        <a [href]="siteLink('terms')" target="_blank" rel="noopener" class="ayar-footer-link">
          {{ translationService.t('footer.terms') }}
        </a>
        <span aria-hidden="true">•</span>
        <a [href]="siteLink('help')" target="_blank" rel="noopener" class="ayar-footer-link">
          {{ translationService.t('footer.help') }}
        </a>
      </div>
    </footer>
  `,
})
export class AppFooterComponent {
  readonly year = new Date().getFullYear();

  constructor(public translationService: TranslationService) {}

  /** Public website pages, in the visitor's current language. */
  siteLink(page: 'privacy' | 'terms' | 'help'): string {
    return `https://ayarsouq.com/${this.translationService.currentLanguageValue}/${page}`;
  }
}
