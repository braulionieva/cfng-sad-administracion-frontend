import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalCrearEditarPlazoComponent } from './modal-crear-editar-plazo.component';

describe('ModalCrearEditarPlazoComponent', () => {
  let component: ModalCrearEditarPlazoComponent;
  let fixture: ComponentFixture<ModalCrearEditarPlazoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ModalCrearEditarPlazoComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ModalCrearEditarPlazoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
