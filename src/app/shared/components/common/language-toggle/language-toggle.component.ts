import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TranslationService, Language } from '../../../services/translation.service';

@Component({
  selector: 'app-language-toggle',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatTooltipModule],
  template: `
    <button
      matIconButton
      (click)="toggleLanguage()"
      [matTooltip]="translationService.t('header.toggleLanguage')"
      [attr.aria-label]="currentLang === 'ar' ? 'Switch to English' : 'التبديل إلى العربية'"
    >
      <span class="text-sm font-semibold tracking-wide">{{ currentLang === 'ar' ? 'EN' : 'ع' }}</span>
    </button>
  `,
})
export class LanguageToggleComponent {
  currentLang: Language = 'ar';

  constructor(public translationService: TranslationService) {
    this.translationService.currentLanguage.subscribe(lang => {
      this.currentLang = lang;
    });
  }

  toggleLanguage(): void {
    const newLang: Language = this.currentLang === 'ar' ? 'en' : 'ar';
    this.translationService.setLanguage(newLang);
  }
}

