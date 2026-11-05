import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslationService, Language } from '../../../services/translation.service';

@Component({
  selector: 'app-language-toggle',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="relative">
      <button
        (click)="toggleLanguage()"
        class="header-icon-btn"
        [attr.aria-label]="currentLang === 'ar' ? 'Switch to English' : 'التبديل إلى العربية'"
      >
        <span class="text-sm font-semibold tracking-wide">{{ currentLang === 'ar' ? 'EN' : 'ع' }}</span>
      </button>
    </div>
  `,
})
export class LanguageToggleComponent {
  currentLang: Language = 'ar';

  constructor(private translationService: TranslationService) {
    this.translationService.currentLanguage.subscribe(lang => {
      this.currentLang = lang;
    });
  }

  toggleLanguage(): void {
    const newLang: Language = this.currentLang === 'ar' ? 'en' : 'ar';
    this.translationService.setLanguage(newLang);
  }
}

