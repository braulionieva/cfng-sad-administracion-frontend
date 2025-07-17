import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EliminarMenuComponent } from './eliminar-menu.component';

describe('EliminarMenuComponent', () => {
  let component: EliminarMenuComponent;
  let fixture: ComponentFixture<EliminarMenuComponent>;

  beforeEach((() => {
    TestBed.configureTestingModule({
      declarations: [EliminarMenuComponent]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EliminarMenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
