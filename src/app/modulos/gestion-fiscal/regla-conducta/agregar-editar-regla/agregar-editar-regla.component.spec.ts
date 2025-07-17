import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AgregarEditarReglaComponent } from './agregar-editar-regla.component';

describe('AgregarEditarReglaComponent', () => {
  let component: AgregarEditarReglaComponent;
  let fixture: ComponentFixture<AgregarEditarReglaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AgregarEditarReglaComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AgregarEditarReglaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
