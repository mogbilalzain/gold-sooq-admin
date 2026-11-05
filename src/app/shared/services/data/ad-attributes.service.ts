import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { ApiConfigService } from '../api/api-config.service';

export interface ApiResponse<T> {
  message: string;
  status: string;
  data: T;
}

export type AttributeDataType = 'select' | 'number' | 'text' | 'boolean';

export interface AdAttributeOption {
  id: number;
  attribute_id?: number;
  code?: string;
  label_ar: string;
  label_en: string;
  sort_order?: number;
  /** May arrive as boolean or 0/1 */
  is_active?: boolean | number;
  parent_option_id?: number | null;
}

export interface AdAttribute {
  id: number;
  code: string;
  name_ar: string;
  name_en: string;
  data_type: AttributeDataType;
  unit_ar?: string | null;
  unit_en?: string | null;
  min_value?: number | null;
  max_value?: number | null;
  decimal_places?: number | null;
  depends_on_attribute_id?: number | null;
  /** May arrive as boolean or 0/1 */
  is_active?: boolean | number;
  options?: AdAttributeOption[];
}

export interface CategoryAttributeMapping {
  categoryId: number;
  attributeId: number;
  /** May arrive as boolean or 0/1 */
  is_required: boolean | number;
  is_filterable: boolean | number;
  show_in_card?: boolean | number;
  sort_order?: number;
  is_active?: boolean | number;
  attribute?: AdAttribute;
}

export interface CreateAttributeRequest {
  code: string;
  name_ar: string;
  name_en: string;
  data_type: AttributeDataType;
  unit_ar?: string;
  unit_en?: string;
  min_value?: number;
  max_value?: number;
  decimal_places?: number;
  depends_on_attribute_id?: number;
}

export interface UpdateAttributeRequest {
  attributeId: number;
  name_ar?: string;
  name_en?: string;
  unit_ar?: string;
  unit_en?: string;
  min_value?: number;
  max_value?: number;
  decimal_places?: number;
  is_active?: boolean;
}

export interface CreateOptionRequest {
  attributeId: number;
  code: string;
  label_ar: string;
  label_en: string;
  sort_order?: number;
  parent_option_id?: number;
}

export interface UpdateOptionRequest {
  optionId: number;
  label_ar?: string;
  label_en?: string;
  parent_option_id?: number;
  sort_order?: number;
  is_active?: boolean;
}

export interface AssignCategoryAttributeRequest {
  categoryId: number;
  attributeId: number;
  is_required: boolean;
  is_filterable: boolean;
  show_in_card: boolean;
  sort_order: number;
}

export interface UpdateCategoryAttributeRequest {
  categoryId: number;
  attributeId: number;
  is_required?: boolean;
  is_filterable?: boolean;
  show_in_card?: boolean;
  sort_order?: number;
  is_active?: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class AdAttributesService {
  constructor(
    private http: HttpClient,
    private apiConfig: ApiConfigService
  ) {}

  private get attributesUrl(): string {
    return `${this.apiConfig.getAdminAdAttributesUrl()}/attributes`;
  }

  private get optionsUrl(): string {
    return `${this.apiConfig.getAdminAdAttributesUrl()}/options`;
  }

  private get categoryAttributesUrl(): string {
    return `${this.apiConfig.getAdminAdAttributesUrl()}/category-attributes`;
  }

  listAttributes(includeInactive = true): Observable<AdAttribute[]> {
    return this.http
      .post<ApiResponse<unknown>>(`${this.attributesUrl}/list`, { includeInactive })
      .pipe(map((res) => this.normalizeAttributes(res?.data)));
  }

  createAttribute(request: CreateAttributeRequest): Observable<ApiResponse<unknown>> {
    return this.http.post<ApiResponse<unknown>>(`${this.attributesUrl}/create`, request);
  }

  updateAttribute(request: UpdateAttributeRequest): Observable<ApiResponse<unknown>> {
    return this.http.post<ApiResponse<unknown>>(`${this.attributesUrl}/update`, request);
  }

  deactivateAttribute(attributeId: number): Observable<ApiResponse<unknown>> {
    return this.http.post<ApiResponse<unknown>>(`${this.attributesUrl}/deactivate`, { attributeId });
  }

  createOption(request: CreateOptionRequest): Observable<ApiResponse<unknown>> {
    return this.http.post<ApiResponse<unknown>>(`${this.optionsUrl}/create`, request);
  }

  updateOption(request: UpdateOptionRequest): Observable<ApiResponse<unknown>> {
    return this.http.post<ApiResponse<unknown>>(`${this.optionsUrl}/update`, request);
  }

  deactivateOption(optionId: number): Observable<ApiResponse<unknown>> {
    return this.http.post<ApiResponse<unknown>>(`${this.optionsUrl}/deactivate`, { optionId });
  }

  reorderOptions(attributeId: number, optionIds: number[]): Observable<ApiResponse<unknown>> {
    return this.http.post<ApiResponse<unknown>>(`${this.optionsUrl}/reorder`, {
      attributeId,
      optionIds,
    });
  }

  listCategoryAttributes(categoryId: number): Observable<CategoryAttributeMapping[]> {
    return this.http
      .post<ApiResponse<unknown>>(`${this.categoryAttributesUrl}/list`, { categoryId })
      .pipe(map((res) => this.normalizeMappings(res?.data)));
  }

  assignCategoryAttribute(request: AssignCategoryAttributeRequest): Observable<ApiResponse<unknown>> {
    return this.http.post<ApiResponse<unknown>>(`${this.categoryAttributesUrl}/assign`, request);
  }

  updateCategoryAttribute(request: UpdateCategoryAttributeRequest): Observable<ApiResponse<unknown>> {
    return this.http.post<ApiResponse<unknown>>(`${this.categoryAttributesUrl}/update`, request);
  }

  unassignCategoryAttribute(categoryId: number, attributeId: number): Observable<ApiResponse<unknown>> {
    return this.http.post<ApiResponse<unknown>>(`${this.categoryAttributesUrl}/unassign`, {
      categoryId,
      attributeId,
    });
  }

  /**
   * The collection documents no example responses, so list payloads are
   * normalized defensively: `data.attributes`, `data.items`, or a bare array.
   */
  private normalizeAttributes(data: unknown): AdAttribute[] {
    const d = data as { attributes?: AdAttribute[]; items?: AdAttribute[] } | AdAttribute[] | null | undefined;
    if (Array.isArray(d)) return d;
    if (d && Array.isArray(d.attributes)) return d.attributes;
    if (d && Array.isArray(d.items)) return d.items;
    return [];
  }

  private normalizeMappings(data: unknown): CategoryAttributeMapping[] {
    const d = data as
      | { mappings?: CategoryAttributeMapping[]; attributes?: CategoryAttributeMapping[]; items?: CategoryAttributeMapping[] }
      | CategoryAttributeMapping[]
      | null
      | undefined;
    if (Array.isArray(d)) return d;
    if (d && Array.isArray(d.mappings)) return d.mappings;
    if (d && Array.isArray(d.attributes)) return d.attributes;
    if (d && Array.isArray(d.items)) return d.items;
    return [];
  }
}
