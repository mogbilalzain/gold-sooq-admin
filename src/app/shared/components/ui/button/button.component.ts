import { CommonModule } from '@angular/common';
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { SafeHtmlPipe } from '../../../pipe/safe-html.pipe';

type ButtonSize = 'sm' | 'md' | 'lg';
type ButtonVariant = 'primary' | 'outline' | 'ghost' | 'danger';
type MatAppearance = 'filled' | 'outlined' | 'text' | 'tonal' | 'elevated';

@Component({
  selector: 'app-button',
  imports: [
    CommonModule,
    MatButton,
    SafeHtmlPipe,
  ],
  templateUrl: './button.component.html',
  styles: ``,
  host: {},
})
export class ButtonComponent {

  @Input() size: ButtonSize = 'md';
  @Input() variant: ButtonVariant = 'primary';
  @Input() disabled = false;
  @Input() className = '';
  @Input() type: 'button' | 'submit' | 'reset' = 'button';
  @Input() startIcon?: string;
  @Input() endIcon?: string;

  @Output() btnClick = new EventEmitter<Event>();

  get sizeClasses(): string {
    switch (this.size) {
      case 'sm':
        return 'app-btn-sm';
      case 'lg':
        return 'app-btn-lg';
      default:
        return '';
    }
  }

  get appearance(): MatAppearance {
    switch (this.variant) {
      case 'outline':
        return 'outlined';
      case 'ghost':
        return 'text';
      default:
        return 'filled';
    }
  }

  get disabledClasses(): string {
    return this.disabled ? 'pointer-events-none' : '';
  }

  onClick(event: Event) {
    if (!this.disabled) {
      this.btnClick.emit(event);
    }
  }
}
