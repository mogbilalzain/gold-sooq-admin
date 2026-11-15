import { Component, Input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { AdminInboxType } from '../../../services/data/admin-inbox.service';

@Component({
  selector: 'app-inbox-item-icon',
  imports: [MatIconModule],
  template: `
    <span class="app-inbox-icon" [attr.data-type]="type">
      <mat-icon>{{ symbol }}</mat-icon>
    </span>
  `,
  styles: [':host { display: contents; }'],
})
export class InboxItemIconComponent {
  @Input({ required: true }) type!: AdminInboxType;

  get symbol(): string {
    switch (this.type) {
      case 'new_ad_pending':
        return 'article';
      case 'identity_submitted':
        return 'badge';
      case 'business_submitted':
        return 'storefront';
      default:
        return 'mail';
    }
  }
}
