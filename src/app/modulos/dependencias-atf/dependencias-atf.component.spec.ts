import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DependenciasAtfComponent } from './dependencias-atf.component';

describe('DependenciasAtfComponent', () => {
  let component: DependenciasAtfComponent;
  let fixture: ComponentFixture<DependenciasAtfComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DependenciasAtfComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(DependenciasAtfComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
