import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HabilitarDeshabilitarUsuarioComponent } from './habilitar-deshabilitar-usuario.component';

describe('HabilitarDeshabilitarUsuarioComponent', () => {
  let component: HabilitarDeshabilitarUsuarioComponent;
  let fixture: ComponentFixture<HabilitarDeshabilitarUsuarioComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ HabilitarDeshabilitarUsuarioComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HabilitarDeshabilitarUsuarioComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
