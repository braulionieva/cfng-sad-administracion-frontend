import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdministrarDependenciaComponent } from './administrar-dependencia.component';

describe('AdministrarDependenciaComponent', () => {
  let component: AdministrarDependenciaComponent;
  let fixture: ComponentFixture<AdministrarDependenciaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AdministrarDependenciaComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdministrarDependenciaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
