import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PageHeaderComponent } from '../../shared/components/layout/page-header/page-header.component';
import { ButtonComponent } from '../../shared/components/ui/button/button.component';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { TranslationService } from '../../shared/services/translation.service';
import { SettingsService } from '../../shared/services/data/settings.service';
import { ErrorHandlerService } from '../../shared/services/api/error-handler.service';
import { NotifyService } from '../../shared/services/notify.service';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [
    CommonModule,
    PageHeaderComponent,
    ButtonComponent,
    MatFormFieldModule,
    MatSelectModule,
  ],
  templateUrl: './settings.component.html',
})
export class SettingsComponent implements OnInit {
  selectedCurrency = 'AED';
  isSaving = false;
  errorMessage = '';

  constructor(
    public translationService: TranslationService,
    public settingsService: SettingsService,
    private errorHandler: ErrorHandlerService,
    private notify: NotifyService
  ) {}

  ngOnInit() {
    this.selectedCurrency = this.settingsService.currency;
  }

  onCurrencyChange(value: string) {
    this.selectedCurrency = value;
    this.errorMessage = '';
  }

  onSave() {
    this.isSaving = true;
    this.errorMessage = '';

    this.settingsService.updateCurrency(this.selectedCurrency).subscribe({
      next: () => {
        this.isSaving = false;
        this.notify.success(this.translationService.t('settings.saveSuccess'));
      },
      error: (error) => {
        this.isSaving = false;
        this.errorMessage = this.errorHandler.handleError(error).message;
      }
    });
  }
}
