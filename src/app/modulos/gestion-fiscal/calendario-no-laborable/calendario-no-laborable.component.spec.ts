/* tslint:disable:no-unused-variable */
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CalendarioNoLaborableComponent } from './calendario-no-laborable.component';

describe('CalendarioNoLaborableComponent', () => {
  let component: CalendarioNoLaborableComponent;
  let fixture: ComponentFixture<CalendarioNoLaborableComponent>;

  beforeEach((() => {
    TestBed.configureTestingModule({
      declarations: [CalendarioNoLaborableComponent]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CalendarioNoLaborableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
