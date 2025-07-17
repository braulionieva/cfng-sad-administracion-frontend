import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormDependenciaUsuarioComponent } from './form-dependencia-usuario.component';

describe('FormDependenciaUsuarioComponent', () => {
  let component: FormDependenciaUsuarioComponent;
  let fixture: ComponentFixture<FormDependenciaUsuarioComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FormDependenciaUsuarioComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FormDependenciaUsuarioComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
