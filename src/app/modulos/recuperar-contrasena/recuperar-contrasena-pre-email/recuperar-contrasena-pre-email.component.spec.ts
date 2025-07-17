import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RecuperarContrasenaPreEmailComponent } from './recuperar-contrasena-pre-email.component';

describe('RecuperarContrasenaPreEmailComponent', () => {
  let component: RecuperarContrasenaPreEmailComponent;
  let fixture: ComponentFixture<RecuperarContrasenaPreEmailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RecuperarContrasenaPreEmailComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RecuperarContrasenaPreEmailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
