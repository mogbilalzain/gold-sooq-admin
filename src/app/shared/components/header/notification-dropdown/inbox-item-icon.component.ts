import { Component, Input } from '@angular/core';
import { AdminInboxType } from '../../../services/data/admin-inbox.service';

@Component({
  selector: 'app-inbox-item-icon',
  template: `
    <span class="app-inbox-icon" [attr.data-type]="type">
      @switch (type) {
        @case ('new_ad_pending') {
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path stroke-linecap="round" stroke-linejoin="round" d="M3 7h18M3 12h18M3 17h10"/></svg>
        }
        @case ('identity_submitted') {
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="5" width="18" height="14" rx="2"/><circle cx="9" cy="12" r="2.5"/><path stroke-linecap="round" d="M14 10h4M14 14h4"/></svg>
        }
        @case ('business_submitted') {
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path stroke-linejoin="round" d="M4 21V8l8-5 8 5v13M9 21v-6h6v6"/></svg>
        }
        @default {
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path stroke-linejoin="round" d="M4 6h16v12H4z"/><path stroke-linecap="round" stroke-linejoin="round" d="M4 7l8 6 8-6"/></svg>
        }
      }
    </span>
  `,
  styles: [':host { display: contents; }'],
})
export class InboxItemIconComponent {
  @Input({ required: true }) type!: AdminInboxType;
}
