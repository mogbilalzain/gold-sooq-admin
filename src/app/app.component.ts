import { Component, OnInit, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { TranslationService } from './shared/services/translation.service';
import { ThemeService } from './shared/services/theme.service';
import { SettingsService } from './shared/services/data/settings.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterModule,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent implements OnInit {
  title = 'Gold Market Admin Dashboard';

  private readonly translationService = inject(TranslationService);
  private readonly themeService = inject(ThemeService);
  private readonly settingsService = inject(SettingsService);

  ngOnInit(): void {
    const savedLang = localStorage.getItem('language') || 'ar';
    this.translationService.setLanguage(savedLang as 'ar' | 'en');
    this.settingsService.loadSettings();
  }
}
