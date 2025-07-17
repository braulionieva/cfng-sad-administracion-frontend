import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AplicacionesCategoriasComponent } from './aplicaciones-categorias.component';

describe('AplicacionesCategoriasComponent', () => {
  let component: AplicacionesCategoriasComponent;
  let fixture: ComponentFixture<AplicacionesCategoriasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AplicacionesCategoriasComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(AplicacionesCategoriasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
