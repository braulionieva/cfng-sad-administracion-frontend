import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AlertModalMasivoComponent } from './alert-modal-masivo.component';

describe('AlertModalComponent', () => {
  let component: AlertModalMasivoComponent;
  let fixture: ComponentFixture<AlertModalMasivoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ AlertModalMasivoComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AlertModalMasivoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
