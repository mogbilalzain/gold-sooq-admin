import { CommonModule } from '@angular/common';
import { Component, ElementRef, QueryList, ViewChildren, ChangeDetectorRef, OnInit, OnDestroy } from '@angular/core';
import { SidebarService } from '../../services/sidebar.service';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { SafeHtmlPipe } from '../../pipe/safe-html.pipe';
import { SidebarWidgetComponent } from './app-sidebar-widget.component';
import { combineLatest, Subscription } from 'rxjs';
import { TranslationService } from '../../services/translation.service';

type NavItem = {
  name: string;
  icon: string;
  path?: string;
  new?: boolean;
  subItems?: { name: string; path: string; pro?: boolean; new?: boolean }[];
};

@Component({
  selector: 'app-sidebar',
  imports: [
    CommonModule,
    RouterModule,
    SafeHtmlPipe,
    SidebarWidgetComponent
  ],
  templateUrl: './app-sidebar.component.html',
})
export class AppSidebarComponent implements OnInit, OnDestroy {

  // Main nav items - will be populated from translation service
  navItems: NavItem[] = [];
  
  // Others nav items - will be populated from translation service
  othersItems: NavItem[] = [];

  openSubmenu: string | null | number = null;
  subMenuHeights: { [key: string]: number } = {};
  @ViewChildren('subMenu') subMenuRefs!: QueryList<ElementRef>;

  readonly isExpanded$;
  readonly isMobileOpen$;
  readonly isHovered$;

  private subscription: Subscription = new Subscription();

  constructor(
    public sidebarService: SidebarService,
    public translationService: TranslationService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {
    this.isExpanded$ = this.sidebarService.isExpanded$;
    this.isMobileOpen$ = this.sidebarService.isMobileOpen$;
    this.isHovered$ = this.sidebarService.isHovered$;
  }

  ngOnInit() {
    // Initialize menu items
    this.updateMenuItems();
    
    // Subscribe to language changes
    this.subscription.add(
      this.translationService.currentLanguage.subscribe(() => {
        this.updateMenuItems();
        this.cdr.detectChanges();
      })
    );

    // Subscribe to router events
    this.subscription.add(
      this.router.events.subscribe(event => {
        if (event instanceof NavigationEnd) {
          this.setActiveMenuFromRoute(this.router.url);
        }
      })
    );

    // Subscribe to combined observables to close submenus when all are false
    this.subscription.add(
      combineLatest([this.isExpanded$, this.isMobileOpen$, this.isHovered$]).subscribe(
        ([isExpanded, isMobileOpen, isHovered]) => {
          if (!isExpanded && !isMobileOpen && !isHovered) {
            this.cdr.detectChanges();
          }
        }
      )
    );

    // Initial load
    this.setActiveMenuFromRoute(this.router.url);
  }

  private updateMenuItems() {
    const t = this.translationService.getTranslations();
    
    this.navItems = [
      {
        icon: `<svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M5.5 3.25C4.25736 3.25 3.25 4.25736 3.25 5.5V8.99998C3.25 10.2426 4.25736 11.25 5.5 11.25H9C10.2426 11.25 11.25 10.2426 11.25 8.99998V5.5C11.25 4.25736 10.2426 3.25 9 3.25H5.5ZM4.75 5.5C4.75 5.08579 5.08579 4.75 5.5 4.75H9C9.41421 4.75 9.75 5.08579 9.75 5.5V8.99998C9.75 9.41419 9.41421 9.74998 9 9.74998H5.5C5.08579 9.74998 4.75 9.41419 4.75 8.99998V5.5ZM5.5 12.75C4.25736 12.75 3.25 13.7574 3.25 15V18.5C3.25 19.7426 4.25736 20.75 5.5 20.75H9C10.2426 20.75 11.25 19.7427 11.25 18.5V15C11.25 13.7574 10.2426 12.75 9 12.75H5.5ZM4.75 15C4.75 14.5858 5.08579 14.25 5.5 14.25H9C9.41421 14.25 9.75 14.5858 9.75 15V18.5C9.75 18.9142 9.41421 19.25 9 19.25H5.5C5.08579 19.25 4.75 18.9142 4.75 18.5V15ZM12.75 5.5C12.75 4.25736 13.7574 3.25 15 3.25H18.5C19.7426 3.25 20.75 4.25736 20.75 5.5V8.99998C20.75 10.2426 19.7426 11.25 18.5 11.25H15C13.7574 11.25 12.75 10.2426 12.75 8.99998V5.5ZM15 4.75C14.5858 4.75 14.25 5.08579 14.25 5.5V8.99998C14.25 9.41419 14.5858 9.74998 15 9.74998H18.5C18.9142 9.74998 19.25 9.41419 19.25 8.99998V5.5C19.25 5.08579 18.9142 4.75 18.5 4.75H15ZM15 12.75C13.7574 12.75 12.75 13.7574 12.75 15V18.5C12.75 19.7426 13.7574 20.75 15 20.75H18.5C19.7426 20.75 20.75 19.7427 20.75 18.5V15C20.75 13.7574 19.7426 12.75 18.5 12.75H15ZM14.25 15C14.25 14.5858 14.5858 14.25 15 14.25H18.5C18.9142 14.25 19.25 14.5858 19.25 15V18.5C19.25 18.9142 18.9142 19.25 18.5 19.25H15C14.5858 19.25 14.25 18.9142 14.25 18.5V15Z" fill="currentColor"></path></svg>`,
        name: t.sidebar.dashboard,
        path: "/",
      },
      {
        icon: `<svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M12 2C11.4477 2 11 2.44772 11 3V4H9C7.34315 4 6 5.34315 6 7V19C6 20.6569 7.34315 22 9 22H15C16.6569 22 18 20.6569 18 19V7C18 5.34315 16.6569 4 15 4H13V3C13 2.44772 12.5523 2 12 2ZM9 6H15C15.5523 6 16 6.44772 16 7V19C16 19.5523 15.5523 20 15 20H9C8.44772 20 8 19.5523 8 19V7C8 6.44772 8.44772 6 9 6ZM10 9C10 8.44772 10.4477 8 11 8H13C13.5523 8 14 8.44772 14 9C14 9.55228 13.5523 10 13 10H11C10.4477 10 10 9.55228 10 9Z" fill="currentColor"></path></svg>`,
        name: t.sidebar.categories,
        path: "/categories",
      },
      {
        icon: `<svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M5.5 3.25C4.25736 3.25 3.25 4.25736 3.25 5.5V18.5C3.25 19.7426 4.25736 20.75 5.5 20.75H18.5C19.7426 20.75 20.75 19.7427 20.75 18.5V5.5C20.75 4.25736 19.7426 3.25 18.5 3.25H5.5ZM4.75 5.5C4.75 5.08579 5.08579 4.75 5.5 4.75H18.5C18.9142 4.75 19.25 5.08579 19.25 5.5V18.5C19.25 18.9142 18.9142 19.25 18.5 19.25H5.5C5.08579 19.25 4.75 18.9142 4.75 18.5V5.5ZM7.5 7.25C7.08579 7.25 6.75 7.58579 6.75 8C6.75 8.41421 7.08579 8.75 7.5 8.75H16.5C16.9142 8.75 17.25 8.41421 17.25 8C17.25 7.58579 16.9142 7.25 16.5 7.25H7.5ZM6.75 12C6.75 11.5858 7.08579 11.25 7.5 11.25H16.5C16.9142 11.25 17.25 11.5858 17.25 12C17.25 12.4142 16.9142 12.75 16.5 12.75H7.5C7.08579 12.75 6.75 12.4142 6.75 12ZM7.5 15.25C7.08579 15.25 6.75 15.5858 6.75 16C6.75 16.4142 7.08579 16.75 7.5 16.75H12.5C12.9142 16.75 13.25 16.4142 13.25 16C13.25 15.5858 12.9142 15.25 12.5 15.25H7.5Z" fill="currentColor"></path></svg>`,
        name: t.sidebar.posts || 'الإعلانات',
        path: "/posts-ads",
      },
      {
        icon: `<svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M7.5 2.75C6.5335 2.75 5.75 3.5335 5.75 4.5V5H4.5C3.5335 5 2.75 5.7835 2.75 6.75V19.5C2.75 20.4665 3.5335 21.25 4.5 21.25H19.5C20.4665 21.25 21.25 20.4665 21.25 19.5V6.75C21.25 5.7835 20.4665 5 19.5 5H18.25V4.5C18.25 3.5335 17.4665 2.75 16.5 2.75H7.5ZM16.75 5V4.5C16.75 4.36193 16.6381 4.25 16.5 4.25H7.5C7.36193 4.25 7.25 4.36193 7.25 4.5V5H16.75ZM4.25 6.75C4.25 6.61193 4.36193 6.5 4.5 6.5H19.5C19.6381 6.5 19.75 6.61193 19.75 6.75V19.5C19.75 19.6381 19.6381 19.75 19.5 19.75H4.5C4.36193 19.75 4.25 19.6381 4.25 19.5V6.75ZM6.5 9.25C6.08579 9.25 5.75 9.58579 5.75 10C5.75 10.4142 6.08579 10.75 6.5 10.75H17.5C17.9142 10.75 18.25 10.4142 18.25 10C18.25 9.58579 17.9142 9.25 17.5 9.25H6.5ZM5.75 14C5.75 13.5858 6.08579 13.25 6.5 13.25H12.5C12.9142 13.25 13.25 13.5858 13.25 14C13.25 14.4142 12.9142 14.75 12.5 14.75H6.5C6.08579 14.75 5.75 14.4142 5.75 14Z" fill="currentColor"></path></svg>`,
        name: t.sidebar.adAttributes || 'خصائص الإعلانات',
        path: "/ad-attributes",
      },
      {
        icon: `<svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M12 2.75C9.65279 2.75 7.75 4.65279 7.75 7V9.25H7C5.75736 9.25 4.75 10.2574 4.75 11.5V18.5C4.75 19.7426 5.75736 20.75 7 20.75H17C18.2426 20.75 19.25 19.7426 19.25 18.5V11.5C19.25 10.2574 18.2426 9.25 17 9.25H16.25V7C16.25 4.65279 14.3472 2.75 12 2.75ZM14.75 9.25V7C14.75 5.48122 13.5188 4.25 12 4.25C10.4812 4.25 9.25 5.48122 9.25 7V9.25H14.75ZM7.75 10.75C7.33579 10.75 7 11.0858 7 11.5V18.5C7 18.9142 7.33579 19.25 7.75 19.25H16.25C16.6642 19.25 17 18.9142 17 18.5V11.5C17 11.0858 16.6642 10.75 16.25 10.75H7.75ZM12 13.25C12.5523 13.25 13 13.6977 13 14.25V15.75C13 16.3023 12.5523 16.75 12 16.75C11.4477 16.75 11 16.3023 11 15.75V14.25C11 13.6977 11.4477 13.25 12 13.25Z" fill="currentColor"></path></svg>`,
        name: t.sidebar.identityVerification || 'توثيق الهوية',
        path: "/identity-requests",
      },
      {
        icon: `<svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M3.75 4.5C3.75 3.5335 4.5335 2.75 5.5 2.75H18.5C19.4665 2.75 20.25 3.5335 20.25 4.5V19.5C20.25 20.4665 19.4665 21.25 18.5 21.25H5.5C4.5335 21.25 3.75 20.4665 3.75 19.5V4.5ZM5.5 4.25C5.36193 4.25 5.25 4.36193 5.25 4.5V19.5C5.25 19.6381 5.36193 19.75 5.5 19.75H18.5C18.6381 19.75 18.75 19.6381 18.75 19.5V4.5C18.75 4.36193 18.6381 4.25 18.5 4.25H5.5ZM8 6.25C7.58579 6.25 7.25 6.58579 7.25 7C7.25 7.41421 7.58579 7.75 8 7.75H16C16.4142 7.75 16.75 7.41421 16.75 7C16.75 6.58579 16.4142 6.25 16 6.25H8ZM7.25 11C7.25 10.5858 7.58579 10.25 8 10.25H16C16.4142 10.25 16.75 10.5858 16.75 11C16.75 11.4142 16.4142 11.75 16 11.75H8C7.58579 11.75 7.25 11.4142 7.25 11ZM8 14.25C7.58579 14.25 7.25 14.5858 7.25 15C7.25 15.4142 7.58579 15.75 8 15.75H12C12.4142 15.75 12.75 15.4142 12.75 15C12.75 14.5858 12.4142 14.25 12 14.25H8Z" fill="currentColor"></path></svg>`,
        name: t.sidebar.businessVerification || 'توثيق الأعمال',
        path: "/business-requests",
      },
      {
        icon: `<svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M4.5 4.25C3.25736 4.25 2.25 5.25736 2.25 6.5V17.5C2.25 18.7426 3.25736 19.75 4.5 19.75H19.5C20.7426 19.75 21.75 18.7426 21.75 17.5V6.5C21.75 5.25736 20.7426 4.25 19.5 4.25H4.5ZM3.75 7.07L11.5713 12.5452C11.8295 12.7259 12.1705 12.7259 12.4287 12.5452L20.25 7.07V17.5C20.25 17.9142 19.9142 18.25 19.5 18.25H4.5C4.08579 18.25 3.75 17.9142 3.75 17.5V7.07ZM19.6085 5.77L12 11.0959L4.39153 5.77C4.42711 5.75685 4.46325 5.75 4.5 5.75H19.5C19.5368 5.75 19.5729 5.75685 19.6085 5.77Z" fill="currentColor"></path></svg>`,
        name: t.sidebar.contactMessages || 'رسائل تواصل معنا',
        path: "/contact-messages",
      },
      {
        icon: `<svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M12 3.5C7.30558 3.5 3.5 7.30558 3.5 12C3.5 14.1526 4.3002 16.1184 5.61936 17.616C6.17279 15.3096 8.24852 13.5955 10.7246 13.5955H13.2746C15.7509 13.5955 17.8268 15.31 18.38 17.6167C19.6996 16.119 20.5 14.153 20.5 12C20.5 7.30558 16.6944 3.5 12 3.5ZM17.0246 18.8566V18.8455C17.0246 16.7744 15.3457 15.0955 13.2746 15.0955H10.7246C8.65354 15.0955 6.97461 16.7744 6.97461 18.8455V18.856C8.38223 19.8895 10.1198 20.5 12 20.5C13.8798 20.5 15.6171 19.8898 17.0246 18.8566ZM2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12ZM11.9991 7.25C10.8847 7.25 9.98126 8.15342 9.98126 9.26784C9.98126 10.3823 10.8847 11.2857 11.9991 11.2857C13.1135 11.2857 14.0169 10.3823 14.0169 9.26784C14.0169 8.15342 13.1135 7.25 11.9991 7.25ZM8.48126 9.26784C8.48126 7.32499 10.0563 5.75 11.9991 5.75C13.9419 5.75 15.5169 7.32499 15.5169 9.26784C15.5169 11.2107 13.9419 12.7857 11.9991 12.7857C10.0563 12.7857 8.48126 11.2107 8.48126 9.26784Z" fill="currentColor"></path></svg>`,
        name: t.sidebar.customers,
        path: "/users",
      },
      {
        icon: `<svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M12 2C11.5858 2 11.25 2.33579 11.25 2.75V12C11.25 12.4142 11.5858 12.75 12 12.75H21.25C21.6642 12.75 22 12.4142 22 12C22 6.47715 17.5228 2 12 2ZM12.75 11.25V3.53263C13.2645 3.57761 13.7659 3.66843 14.25 3.80098V3.80099C15.6929 4.19606 16.9827 4.96184 18.0104 5.98959C19.0382 7.01734 19.8039 8.30707 20.199 9.75C20.3316 10.2341 20.4224 10.7355 20.4674 11.25H12.75ZM2 12C2 7.25083 5.31065 3.27489 9.75 2.25415V3.80099C6.14748 4.78734 3.5 8.0845 3.5 12C3.5 16.6944 7.30558 20.5 12 20.5C15.9155 20.5 19.2127 17.8525 20.199 14.25H21.7459C20.7251 18.6894 16.7492 22 12 22C6.47715 22 2 17.5229 2 12Z" fill="currentColor"></path></svg>`,
        name: t.sidebar.goldPrices,
        path: "/metals-prices",
      },
    ];

    this.othersItems = [
      {
        icon: `<svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2ZM12 20C7.58172 20 4 16.4183 4 12C4 7.58172 7.58172 4 12 4C16.4183 4 20 7.58172 20 12C20 16.4183 16.4183 20 12 20ZM11 7C11 6.44772 11.4477 6 12 6C12.5523 6 13 6.44772 13 7V12C13 12.5523 12.5523 13 12 13C11.4477 13 11 12.5523 11 12V7ZM12 15C11.4477 15 11 15.4477 11 16C11 16.5523 11.4477 17 12 17C12.5523 17 13 16.5523 13 16C13 15.4477 12.5523 15 12 15Z" fill="currentColor"></path></svg>`,
        name: t.sidebar.notifications || 'الإشعارات',
        path: "/notifications",
      },
      {
        icon: `<svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M3.25 5.5C3.25 4.25736 4.25736 3.25 5.5 3.25H18.5C19.7426 3.25 20.75 4.25736 20.75 5.5V18.5C20.75 19.7426 19.7426 20.75 18.5 20.75H5.5C4.25736 20.75 3.25 19.7426 3.25 18.5V5.5ZM5.5 4.75C5.08579 4.75 4.75 5.08579 4.75 5.5V8.58325L19.25 8.58325V5.5C19.25 5.08579 18.9142 4.75 18.5 4.75H5.5ZM19.25 10.0833H15.416V13.9165H19.25V10.0833ZM13.916 10.0833L10.083 10.0833V13.9165L13.916 13.9165V10.0833ZM8.58301 10.0833H4.75V13.9165H8.58301V10.0833ZM4.75 18.5V15.4165H8.58301V19.25H5.5C5.08579 19.25 4.75 18.9142 4.75 18.5ZM10.083 19.25V15.4165L13.916 15.4165V19.25H10.083ZM15.416 19.25V15.4165H19.25V18.5C19.25 18.9142 18.9142 19.25 18.5 19.25H15.416Z" fill="currentColor"></path></svg>`,
        name: t.sidebar.charts,
        subItems: [
          { name: t.sidebar.lineChart, path: "/line-chart", pro: false },
          { name: t.sidebar.barChart, path: "/bar-chart", pro: false },
        ],
      },
      {
        icon: `<svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M12 3.5C7.30558 3.5 3.5 7.30558 3.5 12C3.5 14.1526 4.3002 16.1184 5.61936 17.616C6.17279 15.3096 8.24852 13.5955 10.7246 13.5955H13.2746C15.7509 13.5955 17.8268 15.31 18.38 17.6167C19.6996 16.119 20.5 14.153 20.5 12C20.5 7.30558 16.6944 3.5 12 3.5ZM17.0246 18.8566V18.8455C17.0246 16.7744 15.3457 15.0955 13.2746 15.0955H10.7246C8.65354 15.0955 6.97461 16.7744 6.97461 18.8455V18.856C8.38223 19.8895 10.1198 20.5 12 20.5C13.8798 20.5 15.6171 19.8898 17.0246 18.8566ZM2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12ZM11.9991 7.25C10.8847 7.25 9.98126 8.15342 9.98126 9.26784C9.98126 10.3823 10.8847 11.2857 11.9991 11.2857C13.1135 11.2857 14.0169 10.3823 14.0169 9.26784C14.0169 8.15342 13.1135 7.25 11.9991 7.25ZM8.48126 9.26784C8.48126 7.32499 10.0563 5.75 11.9991 5.75C13.9419 5.75 15.5169 7.32499 15.5169 9.26784C15.5169 11.2107 13.9419 12.7857 11.9991 12.7857C10.0563 12.7857 8.48126 11.2107 8.48126 9.26784Z" fill="currentColor"></path></svg>`,
        name: t.sidebar.profile,
        path: "/profile",
      },
      {
        icon: `<svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M12 2.75C9.65279 2.75 7.75 4.65279 7.75 7V9.25H7C5.75736 9.25 4.75 10.2574 4.75 11.5V18.5C4.75 19.7426 5.75736 20.75 7 20.75H17C18.2426 20.75 19.25 19.7426 19.25 18.5V11.5C19.25 10.2574 18.2426 9.25 17 9.25H16.25V7C16.25 4.65279 14.3472 2.75 12 2.75ZM14.75 9.25V7C14.75 5.48122 13.5188 4.25 12 4.25C10.4812 4.25 9.25 5.48122 9.25 7V9.25H14.75ZM12 13.25C12.4142 13.25 12.75 13.5858 12.75 14V16C12.75 16.4142 12.4142 16.75 12 16.75C11.5858 16.75 11.25 16.4142 11.25 16V14C11.25 13.5858 11.5858 13.25 12 13.25Z" fill="currentColor"></path></svg>`,
        name: t.sidebar.changePassword,
        path: "/change-password",
      },
      {
        icon: `<svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M12 3.5C7.30558 3.5 3.5 7.30558 3.5 12C3.5 16.6944 7.30558 20.5 12 20.5C16.6944 20.5 20.5 16.6944 20.5 12C20.5 7.30558 16.6944 3.5 12 3.5ZM2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12ZM9.25 12C9.25 10.4812 10.4812 9.25 12 9.25C13.5188 9.25 14.75 10.4812 14.75 12C14.75 13.5188 13.5188 14.75 12 14.75C10.4812 14.75 9.25 13.5188 9.25 12ZM12 7.75C9.65279 7.75 7.75 9.65279 7.75 12C7.75 14.3472 9.65279 16.25 12 16.25C14.3472 16.25 16.25 14.3472 16.25 12C16.25 9.65279 14.3472 7.75 12 7.75Z" fill="currentColor"></path></svg>`,
        name: t.sidebar.settings,
        path: "/settings",
      },
    ];
  }

  ngOnDestroy() {
    // Clean up subscriptions
    this.subscription.unsubscribe();
  }

  isActive(path: string): boolean {
    return this.router.url === path;
  }

  toggleSubmenu(section: string, index: number) {
    const key = `${section}-${index}`;

    if (this.openSubmenu === key) {
      this.openSubmenu = null;
      this.subMenuHeights[key] = 0;
    } else {
      this.openSubmenu = key;

      setTimeout(() => {
        const el = document.getElementById(key);
        if (el) {
          this.subMenuHeights[key] = el.scrollHeight;
          this.cdr.detectChanges(); // Ensure UI updates
        }
      });
    }
  }

  onSidebarMouseEnter() {
    this.isExpanded$.subscribe(expanded => {
      if (!expanded) {
        this.sidebarService.setHovered(true);
      }
    }).unsubscribe();
  }

  private setActiveMenuFromRoute(currentUrl: string) {
    const menuGroups = [
      { items: this.navItems, prefix: 'main' },
      { items: this.othersItems, prefix: 'others' },
    ];

    menuGroups.forEach(group => {
      group.items.forEach((nav, i) => {
        if (nav.subItems) {
          nav.subItems.forEach(subItem => {
            if (currentUrl === subItem.path) {
              const key = `${group.prefix}-${i}`;
              this.openSubmenu = key;

              setTimeout(() => {
                const el = document.getElementById(key);
                if (el) {
                  this.subMenuHeights[key] = el.scrollHeight;
                  this.cdr.detectChanges(); // Ensure UI updates
                }
              });
            }
          });
        }
      });
    });
  }

  onSubmenuClick() {
    console.log('click submenu');
    this.isMobileOpen$.subscribe(isMobile => {
      if (isMobile) {
        this.sidebarService.setMobileOpen(false);
      }
    }).unsubscribe();
  }  

  
}
