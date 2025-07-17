import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SeleccionPlazoConfiguradoComponent } from './seleccion-plazo-configurado.component';

describe('SeleccionPlazoConfiguradoComponent', () => {
  let component: SeleccionPlazoConfiguradoComponent;
  let fixture: ComponentFixture<SeleccionPlazoConfiguradoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ SeleccionPlazoConfiguradoComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SeleccionPlazoConfiguradoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
