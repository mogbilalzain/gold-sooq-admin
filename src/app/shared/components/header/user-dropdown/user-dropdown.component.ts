import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { AuthService } from '../../../services/auth/auth.service';
import { TranslationService } from '../../../services/translation.service';

@Component({
  selector: 'app-user-dropdown',
  templateUrl: './user-dropdown.component.html',
  imports: [CommonModule, RouterModule, MatMenuModule, MatDividerModule],
})
export class UserDropdownComponent {
  constructor(
    public authService: AuthService,
    public translationService: TranslationService,
    private router: Router
  ) {}

  get currentUser() {
    return this.authService.getCurrentUser();
  }

  get fullName(): string {
    return this.currentUser?.fullName || '';
  }

  get phoneNumber(): string {
    return this.currentUser?.phoneNumber || '';
  }

  get shortName(): string {
    if (!this.fullName) return '';
    const names = this.fullName.split(' ');
    return names[0] || this.fullName;
  }

  onSignOut() {
    this.authService.logout();
  }
}
