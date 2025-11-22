import { Component } from '@angular/core';
import { DropdownComponent } from '../../ui/dropdown/dropdown.component';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { DropdownItemTwoComponent } from '../../ui/dropdown/dropdown-item/dropdown-item.component-two';
import { AuthService } from '../../../services/auth/auth.service';
import { TranslationService } from '../../../services/translation.service';

@Component({
  selector: 'app-user-dropdown',
  templateUrl: './user-dropdown.component.html',
  imports:[CommonModule,RouterModule,DropdownComponent,DropdownItemTwoComponent]
})
export class UserDropdownComponent {
  isOpen = false;

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

  toggleDropdown() {
    this.isOpen = !this.isOpen;
  }

  closeDropdown() {
    this.isOpen = false;
  }

  onSignOut() {
    this.closeDropdown();
    this.authService.logout();
  }
}