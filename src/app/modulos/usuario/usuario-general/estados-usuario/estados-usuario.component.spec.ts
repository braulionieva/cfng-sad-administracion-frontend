import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EstadosUsuarioComponent } from './estados-usuario.component';

describe('EstadosUsuarioComponent', () => {
  let component: EstadosUsuarioComponent;
  let fixture: ComponentFixture<EstadosUsuarioComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EstadosUsuarioComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EstadosUsuarioComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
