import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfiguracionPlazosComponent } from './configuracion-plazos.component';

describe('ConfiguracionPlazosComponent', () => {
  let component: ConfiguracionPlazosComponent;
  let fixture: ComponentFixture<ConfiguracionPlazosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ConfiguracionPlazosComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(ConfiguracionPlazosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    const aaa = component.dataDropdowns;

    expect(aaa['configuresDropdown'].length).toBeGreaterThan(0);
  });
});
