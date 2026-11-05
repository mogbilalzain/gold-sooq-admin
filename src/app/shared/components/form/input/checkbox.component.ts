import { CommonModule } from '@angular/common';
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { MatCheckboxModule, MatCheckboxChange } from '@angular/material/checkbox';

@Component({
  selector: 'app-checkbox',
  imports: [CommonModule, MatCheckboxModule],
  template: `
  <mat-checkbox
    [id]="id"
    [ngClass]="className"
    [checked]="checked"
    [disabled]="disabled"
    (change)="onChange($event)"
  >
    {{ label }}
  </mat-checkbox>
  `,
  styles: ``
})
export class CheckboxComponent {

  @Input() label?: string;
  @Input() checked = false;
  @Input() className = '';
  @Input() id: string = '';
  @Input() disabled = false;
  @Output() checkedChange = new EventEmitter<boolean>();

  onChange(event: MatCheckboxChange) {
    this.checkedChange.emit(event.checked);
  }
}
