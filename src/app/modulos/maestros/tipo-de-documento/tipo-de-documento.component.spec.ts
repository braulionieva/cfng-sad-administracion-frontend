import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TipoDeDocumentoComponent } from './tipo-de-documento.component';

describe('TipoDeDocumentoComponent', () => {
  let component: TipoDeDocumentoComponent;
  let fixture: ComponentFixture<TipoDeDocumentoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ TipoDeDocumentoComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TipoDeDocumentoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
