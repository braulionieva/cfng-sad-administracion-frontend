import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VisorPdfFrameComponent } from './visor-pdf-frame.component';

describe('VisorPdfFrameComponent', () => {
  let component: VisorPdfFrameComponent;
  let fixture: ComponentFixture<VisorPdfFrameComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ VisorPdfFrameComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VisorPdfFrameComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
