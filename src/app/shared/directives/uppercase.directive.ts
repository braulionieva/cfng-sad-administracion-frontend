import { Directive, ElementRef, HostListener } from '@angular/core';
import { NgControl } from '@angular/forms';

@Directive({
  selector: '[appUppercase]',
})
export class UppercaseDirective {
  constructor(private el: ElementRef, private control: NgControl) {}

  @HostListener('input', ['$event']) onInputChange(event: any) {
    const input = this.el.nativeElement;
    input.value = input.value.toUpperCase();
    this.control.control?.setValue(input.value, { emitEvent: false });
  }
}
