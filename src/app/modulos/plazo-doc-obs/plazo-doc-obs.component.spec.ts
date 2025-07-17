import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlazoDocObsComponent } from './plazo-doc-obs.component';

describe('PlazoDocObsComponent', () => {
  let component: PlazoDocObsComponent;
  let fixture: ComponentFixture<PlazoDocObsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PlazoDocObsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PlazoDocObsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
