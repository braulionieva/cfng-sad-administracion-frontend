import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DesbloquearUsuarioModalComponent } from './desbloquear-usuario-modal.component';

describe('DesbloquearUsuarioModalComponent', () => {
  let component: DesbloquearUsuarioModalComponent;
  let fixture: ComponentFixture<DesbloquearUsuarioModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DesbloquearUsuarioModalComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DesbloquearUsuarioModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
