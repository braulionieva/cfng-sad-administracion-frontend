import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SeleccionarOpcionesMenuComponent } from './seleccionar-opciones-menu.component';

describe('SeleccionarOpcionesMenuComponent', () => {
  let component: SeleccionarOpcionesMenuComponent;
  let fixture: ComponentFixture<SeleccionarOpcionesMenuComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ SeleccionarOpcionesMenuComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SeleccionarOpcionesMenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
