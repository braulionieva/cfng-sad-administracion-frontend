import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalCrearEditarCategoriaComponent } from './modal-crear-editar-categoria.component';

describe('ModalCrearEditarCategoriaComponent', () => {
  let component: ModalCrearEditarCategoriaComponent;
  let fixture: ComponentFixture<ModalCrearEditarCategoriaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ModalCrearEditarCategoriaComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(ModalCrearEditarCategoriaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
