import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { PageHeaderComponent } from '../../shared/components/layout/page-header/page-header.component';
import { TranslationService } from '../../shared/services/translation.service';
import { AdAttributesService, AdAttribute } from '../../shared/services/data/ad-attributes.service';
import { ErrorHandlerService } from '../../shared/services/api/error-handler.service';
import { AttributeDefinitionsComponent } from './attribute-definitions/attribute-definitions.component';
import { AttributeOptionsComponent } from './attribute-options/attribute-options.component';
import { CategoryAttributesComponent } from './category-attributes/category-attributes.component';

type TabId = 'definitions' | 'options' | 'mappings';

@Component({
  selector: 'app-ad-attributes',
  standalone: true,
  imports: [
    CommonModule,
    PageHeaderComponent,
    AttributeDefinitionsComponent,
    AttributeOptionsComponent,
    CategoryAttributesComponent,
  ],
  template: `
    <app-page-header
      [title]="translationService.t('attributes.title')"
      [subtitle]="translationService.t('attributes.subtitle')">
    </app-page-header>

    <!-- Tabs -->
    <div class="mb-6 flex flex-wrap gap-1 rounded-2xl border border-outline-variant/40 bg-surface-container-low p-1 dark:border-outline-variant/20 w-fit">
      @for (tab of tabs; track tab.id) {
        <button
          type="button"
          (click)="activeTab = tab.id"
          class="rounded-xl px-4 py-2 text-sm font-medium transition-colors"
          [class.bg-surface-container-lowest]="activeTab === tab.id"
          [class.text-brand-600]="activeTab === tab.id"
          [class.dark:text-brand-400]="activeTab === tab.id"
          [class.shadow-sm]="activeTab === tab.id"
          [class.text-surface-on-surface-variant]="activeTab !== tab.id"
        >
          {{ translationService.t(tab.labelKey) }}
        </button>
      }
    </div>

    @if (errorMessage) {
      <div class="mb-4 rounded-xl border border-error-200 bg-error-50 p-3 text-sm text-error-600 dark:border-error-800 dark:bg-error-900/20 dark:text-error-400">
        {{ errorMessage }}
      </div>
    }

    @if (activeTab === 'definitions') {
      <app-attribute-definitions
        [attributes]="attributes"
        [loading]="loading"
        (changed)="loadAttributes()"
      ></app-attribute-definitions>
    } @else if (activeTab === 'options') {
      <app-attribute-options
        [attributes]="attributes"
        [loading]="loading"
        (changed)="loadAttributes()"
      ></app-attribute-options>
    } @else {
      <app-category-attributes
        [attributes]="attributes"
        [loading]="loading"
      ></app-category-attributes>
    }
  `,
})
export class AdAttributesComponent implements OnInit {
  readonly translationService = inject(TranslationService);
  private readonly adAttributesService = inject(AdAttributesService);
  private readonly errorHandler = inject(ErrorHandlerService);

  activeTab: TabId = 'definitions';
  attributes: AdAttribute[] = [];
  loading = false;
  errorMessage = '';

  readonly tabs: { id: TabId; labelKey: string }[] = [
    { id: 'definitions', labelKey: 'attributes.tabDefinitions' },
    { id: 'options', labelKey: 'attributes.tabOptions' },
    { id: 'mappings', labelKey: 'attributes.tabMappings' },
  ];

  ngOnInit(): void {
    this.loadAttributes();
  }

  loadAttributes(): void {
    this.loading = true;
    this.errorMessage = '';
    this.adAttributesService.listAttributes(true).subscribe({
      next: (attributes) => {
        this.attributes = attributes;
        this.loading = false;
      },
      error: (error) => {
        this.errorMessage = this.errorHandler.getErrorMessage(error);
        this.loading = false;
      },
    });
  }
}
