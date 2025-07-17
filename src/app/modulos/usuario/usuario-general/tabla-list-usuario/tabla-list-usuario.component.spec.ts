import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TablaListUsuarioComponent } from './tabla-list-usuario.component';

describe('TablaListUsuarioComponent', () => {
  let component: TablaListUsuarioComponent;
  let fixture: ComponentFixture<TablaListUsuarioComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TablaListUsuarioComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TablaListUsuarioComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
