import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MenuPorPerfilComponent } from './menu-por-perfil.component';

describe('MenuPorPerfilComponent', () => {
  let component: MenuPorPerfilComponent;
  let fixture: ComponentFixture<MenuPorPerfilComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ MenuPorPerfilComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MenuPorPerfilComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
