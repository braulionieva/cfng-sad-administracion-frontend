import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SesionesIniciadasComponent } from './sesiones-iniciadas.component';

describe('SesionesIniciadasComponent', () => {
  let component: SesionesIniciadasComponent;
  let fixture: ComponentFixture<SesionesIniciadasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ SesionesIniciadasComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SesionesIniciadasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
