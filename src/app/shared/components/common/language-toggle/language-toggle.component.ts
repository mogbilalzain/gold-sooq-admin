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
        class="flex items-center justify-center w-10 h-10 text-gray-700 rounded-lg hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
        [attr.aria-label]="currentLang === 'ar' ? 'Switch to English' : 'التبديل إلى العربية'"
      >
        <span class="text-sm font-medium">{{ currentLang === 'ar' ? 'EN' : 'ع' }}</span>
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

