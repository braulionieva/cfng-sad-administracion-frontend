import {
  animate,
  state,
  style,
  transition,
  trigger,
} from '@angular/animations';
import { CommonModule } from '@angular/common';
import {
  Component,
  EventEmitter,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { DynamicDialogRef } from 'primeng/dynamicdialog';
import { InputTextModule } from 'primeng/inputtext';
import { InputsGroupSearchComponent } from '../inputs-group-search/inputs-group-search.component';

@Component({
  standalone: true,
  selector: 'app-filtros',
  templateUrl: './filtros.component.html',
  styleUrls: ['./filtros.component.scss'],
  imports: [
    CommonModule,
    InputTextModule,
    ButtonModule,
    InputsGroupSearchComponent,
  ],
  animations: [
    trigger('stateFilter', [
      state(
        'collapsed',
        style({
          height: '0',
          padding: '0',
          background: 'transparent',
        })
      ),
      state(
        'expanded',
        style({
          height: '*',
          background: '#3333331a',
        })
      ),
      transition(
        'expanded <=> collapsed',
        animate('400ms cubic-bezier(0.86, 0, 0.07, 1)')
      ),
      transition(
        'collapsed <=> expanded',
        animate('400ms cubic-bezier(0.86, 0, 0.07, 1)')
      ),
    ]),
  ],
})
export class FiltrosComponent implements OnInit {
  public refModal: DynamicDialogRef;
  @Output() onCleanFilters = new EventEmitter();
  @Output() createCentral = new EventEmitter();
  @Output() onFilterValues = new EventEmitter();

  @ViewChild(InputsGroupSearchComponent)
  inputsGroupSearchComponent: InputsGroupSearchComponent;

  activeIndex: number = 0;
  objSearch: { nombreCentral: string; codigoCentral: string } = {
    nombreCentral: '',
    codigoCentral: '',
  };
  nombreSearch = this.objSearch.nombreCentral;
  codigoSearch = this.objSearch.codigoCentral;

  constructor() {
    // This is intentional
  }

  ngOnInit(): void {
    // This is intentional
  }

  showModalCreationCentral() {
    this.createCentral.emit();
  }

  toggleFilterButton(index: number) {
    if (this.activeIndex === index) {
      this.activeIndex = -1;
    } else {
      this.activeIndex = index;
    }
  }

  searchFilters($event) {
    if ($event !== this.objSearch) {
      this.nombreSearch = $event.nombre;
      this.codigoSearch = $event.codigo;
      this.onFilterValues.emit({
        nombreCentral: this.nombreSearch,
        codigoCentral: this.codigoSearch,
      });
    }
  }

  onClickCleanFilters() {
    this.onCleanFilters.emit();
    this.inputsGroupSearchComponent.clearInputsGroup();
  }
}
