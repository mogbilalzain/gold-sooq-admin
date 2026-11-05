import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, ViewChild, computed, inject } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { MatMenuModule, MatMenuTrigger } from '@angular/material/menu';
import { TranslationService } from '../../../services/translation.service';
import { AdminInboxItem, AdminInboxService } from '../../../services/data/admin-inbox.service';
import { InboxItemIconComponent } from './inbox-item-icon.component';

@Component({
  selector: 'app-notification-dropdown',
  templateUrl: './notification-dropdown.component.html',
  imports: [CommonModule, RouterModule, MatMenuModule, InboxItemIconComponent],
})
export class NotificationDropdownComponent implements OnInit, OnDestroy {
  readonly inbox = inject(AdminInboxService);
  readonly translationService = inject(TranslationService);
  private router = inject(Router);

  readonly badge = computed(() => {
    const n = this.inbox.unreadCount();
    return n > 99 ? '99+' : String(n);
  });

  @ViewChild(MatMenuTrigger) private menuTrigger?: MatMenuTrigger;

  ngOnInit(): void {
    this.inbox.start();
  }

  ngOnDestroy(): void {
    this.inbox.stop();
  }

  /** Close the panel from the in-menu button (a menu cannot contain its own trigger). */
  closeMenu() {
    this.menuTrigger?.closeMenu();
  }

  open(item: AdminInboxItem): void {
    this.closeMenu();
    if (!item.is_read) {
      this.inbox.markRead(item).subscribe();
    }
    this.router.navigate(this.inbox.routeFor(item));
  }

  markAllRead(): void {
    this.inbox.markAllRead().subscribe();
  }

  loadMore(): void {
    this.inbox.loadMore();
  }

  enableDesktopAlerts(): void {
    this.inbox.requestDesktopPermission();
  }
}
