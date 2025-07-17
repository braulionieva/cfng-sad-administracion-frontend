import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DependenciaUsuarioModalComponent } from './dependencia-usuario-modal.component';

describe('DependenciaUsuarioModalComponent', () => {
  let component: DependenciaUsuarioModalComponent;
  let fixture: ComponentFixture<DependenciaUsuarioModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DependenciaUsuarioModalComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DependenciaUsuarioModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
