import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MyImageCropperComponent } from './image-cropper.component';

describe('ImageCropperComponent', () => {
  let component: MyImageCropperComponent;
  let fixture: ComponentFixture<MyImageCropperComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [MyImageCropperComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(MyImageCropperComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
