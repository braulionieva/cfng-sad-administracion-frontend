import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SeguridadCuentaComponent } from './seguridad-cuenta.component';

describe('SeguridadCuentaComponent', () => {
  let component: SeguridadCuentaComponent;
  let fixture: ComponentFixture<SeguridadCuentaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ SeguridadCuentaComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SeguridadCuentaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
