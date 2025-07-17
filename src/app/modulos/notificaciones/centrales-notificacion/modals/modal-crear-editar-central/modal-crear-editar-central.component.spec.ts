import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalCrearEditarCentralComponent } from './modal-crear-editar-central.component';

describe('ModalCrearEditarCentralComponent', () => {
  let component: ModalCrearEditarCentralComponent;
  let fixture: ComponentFixture<ModalCrearEditarCentralComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ModalCrearEditarCentralComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ModalCrearEditarCentralComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
