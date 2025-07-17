import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HistorialEstadosDobleFactorComponent } from './historial-estados-doble-factor.component';

describe('HistorialEstadosDobleFactorComponent', () => {
  let component: HistorialEstadosDobleFactorComponent;
  let fixture: ComponentFixture<HistorialEstadosDobleFactorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ HistorialEstadosDobleFactorComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HistorialEstadosDobleFactorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
