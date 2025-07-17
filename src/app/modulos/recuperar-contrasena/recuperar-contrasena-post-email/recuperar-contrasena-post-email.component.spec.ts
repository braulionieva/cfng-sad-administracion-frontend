import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RecuperarContrasenaPostEmailComponent } from './recuperar-contrasena-post-email.component';

describe('RecuperarContrasenaPostEmailComponent', () => {
  let component: RecuperarContrasenaPostEmailComponent;
  let fixture: ComponentFixture<RecuperarContrasenaPostEmailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RecuperarContrasenaPostEmailComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RecuperarContrasenaPostEmailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
