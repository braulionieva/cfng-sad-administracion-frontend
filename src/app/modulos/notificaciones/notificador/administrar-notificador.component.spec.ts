import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdministrarNotificadorComponent } from './administrar-notificador.component';

describe('AdministrarNotificadorComponent', () => {
  let component: AdministrarNotificadorComponent;
  let fixture: ComponentFixture<AdministrarNotificadorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AdministrarNotificadorComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdministrarNotificadorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
