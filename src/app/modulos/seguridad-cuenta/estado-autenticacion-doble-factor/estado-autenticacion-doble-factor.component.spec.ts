import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EstadoAutenticacionDobleFactorComponent } from './estado-autenticacion-doble-factor.component';

describe('EstadoAutenticacionDobleFactorComponent', () => {
  let component: EstadoAutenticacionDobleFactorComponent;
  let fixture: ComponentFixture<EstadoAutenticacionDobleFactorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ EstadoAutenticacionDobleFactorComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EstadoAutenticacionDobleFactorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
