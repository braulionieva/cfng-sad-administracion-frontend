import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SeleccionTramiteComponent } from './seleccion-tramite.component';

describe('SeleccionTramiteComponent', () => {
  let component: SeleccionTramiteComponent;
  let fixture: ComponentFixture<SeleccionTramiteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ SeleccionTramiteComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SeleccionTramiteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
