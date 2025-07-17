import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TablaSeleccionTramiteComponent } from './tabla-seleccion-tramite.component';

describe('TablaSeleccionTramiteComponent', () => {
  let component: TablaSeleccionTramiteComponent;
  let fixture: ComponentFixture<TablaSeleccionTramiteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ TablaSeleccionTramiteComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TablaSeleccionTramiteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
