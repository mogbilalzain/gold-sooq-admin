import { Component } from '@angular/core';
import { ThemeService } from '../../../services/theme.service';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TranslationService } from '../../../services/translation.service';

@Component({
  selector: 'app-theme-toggle-button',
  templateUrl: './theme-toggle-button.component.html',
  imports: [CommonModule, MatButtonModule, MatIconModule, MatTooltipModule],
})
export class ThemeToggleButtonComponent {
  theme$;

  constructor(
    private themeService: ThemeService,
    public translationService: TranslationService,
  ) {
    this.theme$ = this.themeService.theme$;
  }

  toggleTheme() {
    this.themeService.toggleTheme();
  }
}
