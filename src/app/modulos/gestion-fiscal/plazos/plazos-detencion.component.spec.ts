import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlazosDetencionComponent } from './plazos-detencion.component';

describe('PlazosDetencionComponent', () => {
  let component: PlazosDetencionComponent;
  let fixture: ComponentFixture<PlazosDetencionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PlazosDetencionComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PlazosDetencionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
