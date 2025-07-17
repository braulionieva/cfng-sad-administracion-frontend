import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdministrarPlazosComponent } from './administrar-plazos.component';

describe('AdministrarPlazosComponent', () => {
  let component: AdministrarPlazosComponent;
  let fixture: ComponentFixture<AdministrarPlazosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ AdministrarPlazosComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdministrarPlazosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
