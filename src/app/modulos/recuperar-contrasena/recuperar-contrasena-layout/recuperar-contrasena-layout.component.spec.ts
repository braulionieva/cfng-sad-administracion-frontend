import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RecuperarContrasenaLayoutComponent } from './recuperar-contrasena-layout.component';

describe('RecuperarContrasenaLayoutComponent', () => {
  let component: RecuperarContrasenaLayoutComponent;
  let fixture: ComponentFixture<RecuperarContrasenaLayoutComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RecuperarContrasenaLayoutComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RecuperarContrasenaLayoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
