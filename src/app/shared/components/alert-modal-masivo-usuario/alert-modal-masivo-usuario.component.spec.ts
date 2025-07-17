import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AlertModalMasivoUsuarioComponent } from './alert-modal-masivo-usuario.component';

describe('AlertModalComponent', () => {
  let component: AlertModalMasivoUsuarioComponent;
  let fixture: ComponentFixture<AlertModalMasivoUsuarioComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AlertModalMasivoUsuarioComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(AlertModalMasivoUsuarioComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
