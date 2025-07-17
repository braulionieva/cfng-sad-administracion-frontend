import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalDetallePlazoTramitesComponent } from './modal-detalle-plazo-tramites.component';

describe('ModalDetallePlazoTramitesComponent', () => {
  let component: ModalDetallePlazoTramitesComponent;
  let fixture: ComponentFixture<ModalDetallePlazoTramitesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModalDetallePlazoTramitesComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(ModalDetallePlazoTramitesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
