import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SeccionNivelTramiteComponent } from './seccion-nivel-tramite.component';

describe('SeccionNivelTramiteComponent', () => {
  let component: SeccionNivelTramiteComponent;
  let fixture: ComponentFixture<SeccionNivelTramiteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ SeccionNivelTramiteComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SeccionNivelTramiteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
