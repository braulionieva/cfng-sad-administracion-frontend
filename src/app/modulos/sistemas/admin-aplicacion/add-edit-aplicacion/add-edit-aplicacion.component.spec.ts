import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddEditAplicacionComponent } from './add-edit-aplicacion.component';

describe('AddEditAplicacionComponent', () => {
  let component: AddEditAplicacionComponent;
  let fixture: ComponentFixture<AddEditAplicacionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddEditAplicacionComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddEditAplicacionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
