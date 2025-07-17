import {
  Component,
  ElementRef,
  EventEmitter,
  forwardRef,
  HostListener,
  Input,
  OnInit,
  Output,
  ViewChild
} from '@angular/core';
import {ControlValueAccessor, FormsModule, NG_VALUE_ACCESSOR} from '@angular/forms';
import {TagsObj} from '@interfaces/ayuda/ayuda';
import {NgForOf, NgIf} from "@angular/common";

@Component({
  selector: 'app-ayuda-tag',
  templateUrl: './ayuda-tag.component.html',
  styleUrls: ['./ayuda-tag.component.scss'],
  standalone: true,
  imports: [
    FormsModule,
    NgForOf,
    NgIf
  ],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => AyudaTagComponent),
      multi: true
    }
  ]
})
export class AyudaTagComponent implements OnInit, ControlValueAccessor {
  @Input() options: TagsObj[] = [];
  @Input() placeholder: string = 'Seleccionar o ingresar tags...';
  @Input() disabled: boolean = false;
  @Output() tagsChange = new EventEmitter<TagsObj[]>();

  @ViewChild('inputElement') inputElement!: ElementRef;

  selectedTags: TagsObj[] = [];
  inputValue: string = '';
  filteredOptions: TagsObj[] = [];
  showDropdown: boolean = false;
  highlightedIndex: number = -1;
  nextTempId: number = 1;

  onChange: any = () => {
  };
  onTouched: any = () => {
  };

  constructor() {
  }

  ngOnInit(): void {
    this.updateFilteredOptions();
    if (this.options.length > 0) {
      const maxId = Math.max(...this.options.map(tag => tag.idTag));
      this.nextTempId = maxId + 1;
    }
  }

  writeValue(value: TagsObj[]): void {
    if (value) {
      this.selectedTags = value;
    } else {
      this.selectedTags = [];
    }
    this.updateFilteredOptions();
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  addTag(tag: TagsObj): void {
    const exists = this.selectedTags.some(t => t.idTag === tag.idTag);
    if (!exists) {
      this.selectedTags = [...this.selectedTags, tag];
      this.emitChange();
      this.updateFilteredOptions();
    }
    this.inputValue = '';
    this.showDropdown = false;
    this.highlightedIndex = -1;
  }

  createNewTag(): void {
    if (!this.inputValue.trim()) return;

    const existingTag = this.options.find(option =>
      option.noTag.toLowerCase() === this.inputValue.trim().toLowerCase()
    );

    if (existingTag) {
      this.addTag(existingTag);
    } else {
      const newTag: TagsObj = {
        idTag: this.nextTempId++,
        noTag: this.inputValue.trim()
      };

      this.options = [...this.options, newTag];
      this.addTag(newTag);
    }
  }

  removeTag(index: number): void {
    this.selectedTags = this.selectedTags.filter((_, i) => i !== index);
    this.emitChange();
    this.updateFilteredOptions();
  }

  updateFilteredOptions(): void {
    const availableOptions = this.options.filter(option =>
      !this.selectedTags.some(selected => selected.idTag === option.idTag)
    );

    if (!this.inputValue?.trim()) {
      this.filteredOptions = [...availableOptions];
    } else {
      this.filteredOptions = availableOptions.filter(option =>
        option.noTag.toLowerCase().includes(this.inputValue.toLowerCase())
      );
    }
    this.highlightedIndex = -1;
  }

  onInput(): void {
    this.updateFilteredOptions();
    this.showDropdown = true;
  }

  onFocus(): void {
    if (!this.disabled) {
      this.showDropdown = true;
      this.updateFilteredOptions();
    }
  }

  @HostListener('document:click', ['$event'])
  onClickOutside(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (this.inputElement && !this.inputElement.nativeElement.contains(target)) {
      this.showDropdown = false;
    }
  }

  onKeyDown(event: KeyboardEvent): void {
    if (this.disabled) return;
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        this.highlightedIndex = Math.min(this.highlightedIndex + 1, this.filteredOptions.length - 1);
        if (this.highlightedIndex === -1 && this.filteredOptions.length > 0) {
          this.highlightedIndex = 0;
        }
        break;
      case 'ArrowUp':
        event.preventDefault();
        this.highlightedIndex = Math.max(this.highlightedIndex - 1, -1);
        break;
      case 'Enter':
        event.preventDefault();
        if (this.highlightedIndex >= 0 && this.filteredOptions[this.highlightedIndex]) {
          this.addTag(this.filteredOptions[this.highlightedIndex]);
        } else {
          this.createNewTag();
        }
        break;
      case 'Escape':
        this.showDropdown = false;
        break;
      case 'Backspace':
        if (!this.inputValue && this.selectedTags.length > 0) {
          this.removeTag(this.selectedTags.length - 1);
        }
        break;
    }
  }

  emitChange(): void {
    this.onChange(this.selectedTags);
    this.tagsChange.emit(this.selectedTags);
  }
}
