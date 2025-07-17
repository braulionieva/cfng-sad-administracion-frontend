import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditarServidorComponent } from './editar-servidor.component';

describe('EditarServidorComponent', () => {
  let component: EditarServidorComponent;
  let fixture: ComponentFixture<EditarServidorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ EditarServidorComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditarServidorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
