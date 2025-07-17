import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalLogoAppComponent } from './modal-logo-app.component';

describe('ModalLogoAppComponent', () => {
  let component: ModalLogoAppComponent;
  let fixture: ComponentFixture<ModalLogoAppComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ModalLogoAppComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(ModalLogoAppComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
