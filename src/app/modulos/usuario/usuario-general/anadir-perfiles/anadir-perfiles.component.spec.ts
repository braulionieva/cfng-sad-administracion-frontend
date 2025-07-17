import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AnadirPerfilesComponent } from './anadir-perfiles.component';

describe('AnadirPerfilesComponent', () => {
  let component: AnadirPerfilesComponent;
  let fixture: ComponentFixture<AnadirPerfilesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AnadirPerfilesComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AnadirPerfilesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
