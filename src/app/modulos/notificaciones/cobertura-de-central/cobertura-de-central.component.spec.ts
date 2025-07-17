import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CoberturaDeCentralComponent } from './cobertura-de-central.component';

describe('CoberturaDeCentralComponent', () => {
  let component: CoberturaDeCentralComponent;
  let fixture: ComponentFixture<CoberturaDeCentralComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CoberturaDeCentralComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(CoberturaDeCentralComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
