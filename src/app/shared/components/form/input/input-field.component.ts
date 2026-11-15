import { CommonModule } from '@angular/common';
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-input-field',
  imports: [CommonModule, MatFormFieldModule, MatIconModule, MatInputModule],
  template: `
    <mat-form-field
      class="w-full"
      [ngClass]="[className, error ? 'app-field-error' : '', success ? 'app-field-success' : '']"
      subscriptSizing="dynamic"
    >
      @if (label) {
        <mat-label>{{ label }}</mat-label>
      }
      <input
        matInput
        [type]="effectiveType"
        [id]="id"
        [name]="name"
        [placeholder]="placeholder"
        [value]="value"
        [min]="min"
        [max]="max"
        [step]="step"
        [disabled]="disabled"
        [attr.dir]="inputDir"
        (input)="onInput($event)"
      />
      @if (type === 'password') {
        <button
          matSuffix
          type="button"
          class="app-pw-toggle"
          [attr.aria-label]="showPassword ? 'Hide password' : 'Show password'"
          (click)="togglePassword()"
        >
          <mat-icon class="text-[color:var(--color-on-surface-variant)]">
            {{ showPassword ? 'visibility' : 'visibility_off' }}
          </mat-icon>
        </button>
      }
      @if (hint) {
        <mat-hint
          [ngClass]="{
            'text-[color:var(--color-error)]': error,
            'text-success-600': success
          }"
        >{{ hint }}</mat-hint>
      }
    </mat-form-field>
  `,
  styles: `
    .app-pw-toggle {
      border: 0;
      background: transparent;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 40px;
      height: 40px;
      border-radius: 9999px;
      padding: 0;
    }
    .app-pw-toggle:hover {
      background-color: color-mix(in srgb, var(--color-on-surface) 8%, transparent);
    }
  `,
})
export class InputFieldComponent {

  @Input() type: string = 'text';
  @Input() id: string = '';
  @Input() name: string = '';
  @Input() label?: string;
  @Input() placeholder: string = '';
  @Input() value: string | number = '';
  @Input() min?: string;
  @Input() max?: string;
  @Input() step?: number;
  @Input() disabled: boolean = false;
  @Input() success: boolean = false;
  @Input() error: boolean = false;
  @Input() hint?: string;
  @Input() className: string = '';
  /** Optional text direction for the native input only (e.g. phone/OTP fields). */
  @Input() inputDir?: 'ltr' | 'rtl';

  @Output() valueChange = new EventEmitter<string | number>();

  showPassword = false;

  get effectiveType(): string {
    return this.type === 'password' && this.showPassword ? 'text' : this.type;
  }

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  onInput(event: Event) {
    const input = event.target as HTMLInputElement;
    this.valueChange.emit(this.type === 'number' ? +input.value : input.value);
  }
}
