import { Component, ElementRef, HostListener, ViewChild } from '@angular/core';
import { SidebarService } from '../../services/sidebar.service';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { MatAutocompleteModule, MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ThemeToggleButtonComponent } from '../../components/common/theme-toggle/theme-toggle-button.component';
import { NotificationDropdownComponent } from '../../components/header/notification-dropdown/notification-dropdown.component';
import { UserDropdownComponent } from '../../components/header/user-dropdown/user-dropdown.component';
import { LanguageToggleComponent } from '../../components/common/language-toggle/language-toggle.component';
import { TranslationService } from '../../services/translation.service';
import { ADMIN_NAV_PAGES, AdminNavPage } from '../admin-nav';

@Component({
  selector: 'app-header',
  imports: [
    CommonModule,
    RouterModule,
    MatAutocompleteModule,
    MatButtonModule,
    MatTooltipModule,
    ThemeToggleButtonComponent,
    NotificationDropdownComponent,
    UserDropdownComponent,
    LanguageToggleComponent,
  ],
  templateUrl: './app-header.component.html',
})
export class AppHeaderComponent {
  isScrolled = false;
  readonly isMobileOpen$;

  /** Page-jump search state (filters ADMIN_NAV_PAGES). */
  searchQuery = '';

  @ViewChild('searchInput') searchInput!: ElementRef<HTMLInputElement>;

  constructor(
    public sidebarService: SidebarService,
    public translationService: TranslationService,
    private router: Router
  ) {
    this.isMobileOpen$ = this.sidebarService.isMobileOpen$;
  }

  handleToggle() {
    if (window.innerWidth >= 1280) {
      this.sidebarService.toggleExpanded();
    } else {
      this.sidebarService.toggleMobileOpen();
    }
  }

  /** Pages whose translated label contains the query (max 8). */
  get filteredPages(): AdminNavPage[] {
    const query = this.searchQuery.trim().toLowerCase();
    if (!query) return [];
    return ADMIN_NAV_PAGES.filter((page) =>
      this.translationService.t(page.labelKey).toLowerCase().includes(query)
    ).slice(0, 8);
  }

  onSearchInput(event: Event) {
    this.searchQuery = (event.target as HTMLInputElement).value;
  }

  onPageSelected(event: MatAutocompleteSelectedEvent) {
    this.goToPage(event.option.value as AdminNavPage);
  }

  goToPage(page: AdminNavPage) {
    this.router.navigateByUrl(page.path);
    this.searchQuery = '';
    this.searchInput?.nativeElement.blur();
  }

  @HostListener('window:scroll')
  onWindowScroll() {
    this.isScrolled = window.scrollY > 8;
  }

  ngAfterViewInit() {
    document.addEventListener('keydown', this.handleKeyDown);
  }

  ngOnDestroy() {
    document.removeEventListener('keydown', this.handleKeyDown);
  }

  handleKeyDown = (event: KeyboardEvent) => {
    if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
      event.preventDefault();
      this.searchInput?.nativeElement.focus();
    }
  };
}
