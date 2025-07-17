import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VerDetalleGrupoAleatorioComponent } from './ver-detalle-fecha.component';

describe('VerDetalleGrupoAleatorioComponent', () => {
  let component: VerDetalleGrupoAleatorioComponent;
  let fixture: ComponentFixture<VerDetalleGrupoAleatorioComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ VerDetalleGrupoAleatorioComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VerDetalleGrupoAleatorioComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
