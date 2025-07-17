import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfigurarMasDeUnaFiscaliaComponent } from './configurar-mas-de-una-fiscalia.component';

describe('ConfigurarMasDeUnaFiscaliaComponent', () => {
  let component: ConfigurarMasDeUnaFiscaliaComponent;
  let fixture: ComponentFixture<ConfigurarMasDeUnaFiscaliaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ConfigurarMasDeUnaFiscaliaComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ConfigurarMasDeUnaFiscaliaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
