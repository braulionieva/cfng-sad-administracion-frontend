import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SincronizacionesComponent } from './sincronizaciones.component';

describe('SincronizacionesComponent', () => {
  let component: SincronizacionesComponent;
  let fixture: ComponentFixture<SincronizacionesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ SincronizacionesComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SincronizacionesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
