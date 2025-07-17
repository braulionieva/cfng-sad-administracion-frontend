import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BandejaReglaComponent } from './bandeja-regla.component';

describe('BandejaReglaComponent', () => {
  let component: BandejaReglaComponent;
  let fixture: ComponentFixture<BandejaReglaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BandejaReglaComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BandejaReglaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
