import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminAplicacionComponent } from './admin-aplicacion.component';

describe('AdminAplicacionComponent', () => {
  let component: AdminAplicacionComponent;
  let fixture: ComponentFixture<AdminAplicacionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AdminAplicacionComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminAplicacionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
