import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HistorialCambiosContrasenaComponent } from './historial-cambios-contrasena.component';

describe('HistorialCambiosContrasenaComponent', () => {
  let component: HistorialCambiosContrasenaComponent;
  let fixture: ComponentFixture<HistorialCambiosContrasenaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ HistorialCambiosContrasenaComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HistorialCambiosContrasenaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
