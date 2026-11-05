import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SimpleChange } from '@angular/core';
import { SecureDocumentViewerComponent } from './secure-document-viewer.component';

describe('SecureDocumentViewerComponent (bounded refresh)', () => {
  let component: SecureDocumentViewerComponent;
  let fixture: ComponentFixture<SecureDocumentViewerComponent>;

  const expiredDoc = {
    url: 'https://r2.example/doc.jpg?sig=old',
    expiresAt: new Date(Date.now() - 5_000).toISOString(), // already expired
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SecureDocumentViewerComponent],
    }).compileComponents();
    fixture = TestBed.createComponent(SecureDocumentViewerComponent);
    component = fixture.componentInstance;
  });

  function setDoc(doc: { url: string; expiresAt?: string } | null): void {
    component.doc = doc;
    component.ngOnChanges({ doc: new SimpleChange(null, doc, false) });
  }

  it('auto-refreshes at most once when an expired link fails to load', () => {
    const emissions: void[] = [];
    component.refreshRequested.subscribe(() => emissions.push(void 0));

    setDoc(expiredDoc);
    component.onImageError(); // first failure → one automatic refresh request
    expect(emissions.length).toBe(1);
    expect(component.loadFailed).toBeFalse();

    component.onImageError(); // second failure → no more auto-refresh
    expect(emissions.length).toBe(1);
    expect(component.loadFailed).toBeTrue();
  });

  it('does not auto-refresh when the link has not expired', () => {
    const emissions: void[] = [];
    component.refreshRequested.subscribe(() => emissions.push(void 0));

    setDoc({ url: 'https://r2.example/doc.jpg', expiresAt: new Date(Date.now() + 60_000).toISOString() });
    component.onImageError();
    expect(emissions.length).toBe(0);
    expect(component.loadFailed).toBeTrue();
  });

  it('manual refresh always emits', () => {
    const emissions: void[] = [];
    component.refreshRequested.subscribe(() => emissions.push(void 0));

    setDoc(expiredDoc);
    component.requestRefresh(false);
    component.requestRefresh(false);
    expect(emissions.length).toBe(2);
  });

  it('resets the bounded auto-retry when a fresh document arrives', () => {
    const emissions: void[] = [];
    component.refreshRequested.subscribe(() => emissions.push(void 0));

    setDoc(expiredDoc);
    component.onImageError();
    expect(emissions.length).toBe(1);

    // Fresh URLs arrive from a getById refetch — auto-retry budget resets.
    setDoc({ url: 'https://r2.example/doc.jpg?sig=new', expiresAt: new Date(Date.now() - 5_000).toISOString() });
    expect(component.loadFailed).toBeFalse();
    component.onImageError();
    expect(emissions.length).toBe(2);
  });
});
