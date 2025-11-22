import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { TranslationService } from './shared/services/translation.service';

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

  constructor(private translationService: TranslationService) {}

  ngOnInit(): void {
    // Initialize language service - this will set the initial language and RTL
    const savedLang = localStorage.getItem('language') || 'ar';
    this.translationService.setLanguage(savedLang as 'ar' | 'en');
  }
}
