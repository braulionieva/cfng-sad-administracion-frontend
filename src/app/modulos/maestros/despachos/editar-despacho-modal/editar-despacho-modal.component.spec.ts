import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditarDespachoModalComponent } from './editar-despacho-modal.component';

describe('EditarDespachoModalComponent', () => {
  let component: EditarDespachoModalComponent;
  let fixture: ComponentFixture<EditarDespachoModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EditarDespachoModalComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditarDespachoModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
