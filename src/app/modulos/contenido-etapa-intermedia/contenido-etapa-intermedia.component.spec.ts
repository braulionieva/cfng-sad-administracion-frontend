import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ContenidoEtapaIntermediaComponent } from './contenido-etapa-intermedia.component';

describe('ContenidoEtapaIntermediaComponent', () => {
  let component: ContenidoEtapaIntermediaComponent;
  let fixture: ComponentFixture<ContenidoEtapaIntermediaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ContenidoEtapaIntermediaComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ContenidoEtapaIntermediaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
