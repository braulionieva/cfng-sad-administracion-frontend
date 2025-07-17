import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HistorialValidacionCorreoComponent } from './historial-validacion-correo.component';

describe('HistorialValidacionCorreoComponent', () => {
  let component: HistorialValidacionCorreoComponent;
  let fixture: ComponentFixture<HistorialValidacionCorreoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ HistorialValidacionCorreoComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HistorialValidacionCorreoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
