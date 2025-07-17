import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BloquearUsuarioModalComponent } from './bloquear-usuario-modal.component';

describe('BloquearUsuarioModalComponent', () => {
  let component: BloquearUsuarioModalComponent;
  let fixture: ComponentFixture<BloquearUsuarioModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [BloquearUsuarioModalComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(BloquearUsuarioModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
