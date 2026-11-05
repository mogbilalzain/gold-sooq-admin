import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SimpleChange } from '@angular/core';
import { of, throwError } from 'rxjs';
import { AttributeOptionsComponent } from './attribute-options.component';
import { AdAttributesService } from '../../../shared/services/data/ad-attributes.service';

function makeAttribute(id: number, optionIds: number[]): unknown {
  return {
    id,
    code: `attr_${id}`,
    name_ar: `خاصية ${id}`,
    name_en: `Attribute ${id}`,
    data_type: 'select',
    is_active: 1,
    options: optionIds.map((optionId, index) => ({
      id: optionId,
      code: `opt_${optionId}`,
      label_ar: `خيار ${optionId}`,
      label_en: `Option ${optionId}`,
      sort_order: index + 1,
      is_active: 1,
    })),
  };
}

describe('AttributeOptionsComponent (reorder with rollback)', () => {
  let component: AttributeOptionsComponent;
  let fixture: ComponentFixture<AttributeOptionsComponent>;
  let reorderSpy: jasmine.Spy;

  const attributes = [makeAttribute(1, [10, 20, 30])];

  function setup(reorderResult: 'success' | 'error'): void {
    reorderSpy = jasmine.createSpy('reorderOptions').and.callFake(() =>
      reorderResult === 'success'
        ? of({ status: 'success', message: '', data: {} })
        : throwError(() => new Error('network down'))
    );

    TestBed.configureTestingModule({
      imports: [AttributeOptionsComponent],
      providers: [{ provide: AdAttributesService, useValue: { reorderOptions: reorderSpy } }],
    });

    fixture = TestBed.createComponent(AttributeOptionsComponent);
    component = fixture.componentInstance;
    component.attributes = attributes as never;
    component.selectedAttributeId = 1;
    component.ngOnChanges({ attributes: new SimpleChange(null, attributes, true) });
  }

  it('starts with the server order', () => {
    setup('success');
    expect(component.orderedOptions.map((o) => o.id)).toEqual([10, 20, 30]);
  });

  it('moveOption swaps options locally and marks the order dirty', () => {
    setup('success');
    component.moveOption(0, 1);
    expect(component.orderedOptions.map((o) => o.id)).toEqual([20, 10, 30]);
    expect(component.orderDirty).toBeTrue();
  });

  it('does not move beyond the list bounds', () => {
    setup('success');
    component.moveOption(0, -1);
    component.moveOption(2, 1);
    expect(component.orderedOptions.map((o) => o.id)).toEqual([10, 20, 30]);
    expect(component.orderDirty).toBeFalse();
  });

  it('sends optionIds in the new order on save', () => {
    setup('success');
    component.moveOption(0, 1);
    component.saveOrder();

    expect(reorderSpy).toHaveBeenCalledWith(1, [20, 10, 30]);
    expect(component.orderDirty).toBeFalse();
    expect(component.errorMessage).toBe('');
  });

  it('rolls back to the server order when saving fails (via parent refetch)', () => {
    setup('error');
    const changedEmissions: void[] = [];
    component.changed.subscribe(() => changedEmissions.push(void 0));

    component.moveOption(0, 1);
    expect(component.orderedOptions.map((o) => o.id)).toEqual([20, 10, 30]);

    component.saveOrder();

    // The failed save must: surface an error, clear the dirty flag, and ask
    // the parent to refetch (which restores the authoritative server order).
    expect(component.errorMessage).toBeTruthy();
    expect(component.orderDirty).toBeFalse();
    expect(changedEmissions.length).toBe(1);

    // Simulating the parent refetch: fresh attributes arrive, order is restored.
    component.attributes = attributes as never;
    component.ngOnChanges({ attributes: new SimpleChange(attributes, attributes, false) });
    expect(component.orderedOptions.map((o) => o.id)).toEqual([10, 20, 30]);
  });

  it('discardOrder restores the server order without calling the API', () => {
    setup('success');
    component.moveOption(0, 1);
    component.discardOrder();
    expect(component.orderedOptions.map((o) => o.id)).toEqual([10, 20, 30]);
    expect(component.orderDirty).toBeFalse();
    expect(reorderSpy).not.toHaveBeenCalled();
  });
});
