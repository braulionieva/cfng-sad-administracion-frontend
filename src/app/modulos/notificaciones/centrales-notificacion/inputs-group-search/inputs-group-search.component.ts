import { CommonModule } from '@angular/common';
import {
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
} from '@angular/core';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { CentralNotificacionesService } from '@services/central-notificaciones/central-notificaciones.service';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import {
  Subject,
  debounceTime,
  distinctUntilChanged,
  filter,
  map,
  takeUntil,
  tap,
} from 'rxjs';
import { DropdownModule } from 'primeng/dropdown';

@Component({
  standalone: true,
  selector: 'app-inputs-group-search',
  templateUrl: './inputs-group-search.component.html',
  styleUrls: ['./inputs-group-search.component.scss'],
  imports: [
    CommonModule,
    InputNumberModule,
    InputTextModule,
    FormsModule,
    ReactiveFormsModule,
    DropdownModule,
  ],
})
export class InputsGroupSearchComponent implements OnInit, OnDestroy {
  @Input() defaultNombre: string;
  @Input() defaultCodigo: string;

  formGroup: FormGroup;
  isSearch = false;
  private destroy$ = new Subject<unknown>();

  @Output() search = new EventEmitter();

  formObject = {
    nombre: new FormControl(null, [Validators.maxLength(100)]),
    codigo: new FormControl(null, [Validators.maxLength(20)]),
  };

  distritosFiscales: { nombre: string; codigo: string }[] = [];

  constructor(
    private centralNotificacionesService: CentralNotificacionesService
  ) {
    this.formGroup = new FormGroup(this.formObject);
  }

  ngOnInit(): void {
    if (this.defaultNombre)
      this.formGroup.get('nombre').setValue(this.defaultNombre);
    if (this.defaultCodigo)
      this.formGroup.get('codigo').setValue(this.defaultCodigo);
    this.loadDistritosFiscales();
    this.onSearch();
  }

  private loadDistritosFiscales(): void {
    this.centralNotificacionesService.getListaDistritosFiscales().subscribe({
      next: (response) => {
        if (response?.code === 200 && response?.data) {
          // 1) Mapeas al formato [ { nombre, codigo }, ... ]
          this.distritosFiscales = response.data
            .map((item) => ({
              nombre: item.nombre,  // se mostrará en el combo
              codigo: item.id,      // valor
            }))
            // 2) Ordenar alfabéticamente por 'nombre', ignorando mayúsculas
            .sort((a, b) =>
              a.nombre.toLowerCase().localeCompare(b.nombre.toLowerCase())
            );
        } else {
          console.error('La respuesta del servicio no es válida:', response);
        }
      },
      error: (err) => {
        console.error('Error al cargar distritos fiscales:', err);
      },
    });
  }

  private onSearch(): void {
    this.formGroup.valueChanges
      .pipe(
        map((values) => {
          this.isSearch = false;
          return {
            nombre: values.nombre !== null ? values.nombre : '',
            codigo: values.codigo !== null ? values.codigo : '',
          };
        }),
        debounceTime(300),
        distinctUntilChanged(
          (prev, curr) => JSON.stringify(prev) === JSON.stringify(curr)
        ),
        filter(
          ({ nombre, codigo }) =>
            nombre == '' ||
            nombre?.length > 2 ||
            codigo == '' ||
            (codigo?.length > 2 && nombre !== undefined && codigo !== undefined)
        ),
        tap(({ nombre, codigo }) => {
          this.isSearch = true;
          this.search.emit({ nombre, codigo });
        }),
        takeUntil(this.destroy$)
      )
      .subscribe();
  }

  clearInputsGroup() {
    this.formGroup.reset();
  }

  get nombreField(): AbstractControl {
    return this.formGroup.get('nombre')!;
  }

  get codigoField(): AbstractControl {
    return this.formGroup.get('codigo')!;
  }

  ngOnDestroy(): void {
    this.destroy$.next({});
    this.destroy$.complete();
  }
}
