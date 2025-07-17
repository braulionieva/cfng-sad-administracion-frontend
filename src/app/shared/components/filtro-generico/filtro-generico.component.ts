import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MaestroGenerico } from '@interfaces/maestro-generico/maestro-generico';
import { Filtros } from '@interfaces/shared/shared';
import { MaestroService } from '@services/maestro/maestro.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { ButtonModule } from 'primeng/button';
import { CalendarModule } from 'primeng/calendar';
import { DropdownModule } from 'primeng/dropdown';
import { InputTextModule } from 'primeng/inputtext';
import {debounceTime} from "rxjs";

@Component({
  selector: 'app-filtro-generico',
  standalone: true,
  imports: [
    CommonModule,
    DropdownModule,
    ReactiveFormsModule,
    InputTextModule,
    ButtonModule,
    CalendarModule,
  ],
  templateUrl: './filtro-generico.component.html',
  styleUrls: ['./filtro-generico.component.scss'],
})
export class FiltroGenericoComponent implements OnInit {

    @Input() tituloPage: string = 'Tiulo';
  @Input() placeholder: string = 'Ingrese el código';
  @Input() phFiltroGn: string = '';
  @Input() phFiltroGc: string = '';
  @Input() phFiltroCn: string = '';
  @Input() phFiltroApp: string = '';

  @Input() actoProcesal: MaestroGenerico[] = [];
  @Input() carpetaCuaderno: MaestroGenerico[] = [];
  @Input() tipoEspecialidad: MaestroGenerico[] = [];
  @Input() jerarquia: MaestroGenerico[] = [];
  @Input() tipoProceso: MaestroGenerico[] = [];
  @Input() tramite: MaestroGenerico[] = [];
  @Input() bEspecialidad: boolean = false;
  @Input() bDistritoFiscal: boolean = false;
  @Input() bDistribucionAleatoria: boolean = false;
  @Input() bEtapas: boolean = false;
  @Input() bCreacionInicio: boolean = false;
  @Input() bCreacionFin: boolean = false;
  @Input() bModificacionInicio: boolean = false;
  @Input() bModificacionFin: boolean = false;

  @Output() filter = new EventEmitter<Filtros>();
  @Output() searchTermChange = new EventEmitter<string>();

  dCreacionDesde: Date | undefined;
  requireSubTipoProceso: boolean = true;
  toggleOn: boolean = false;
  toggleIcon: string = 'pi-angle-double-down';

  especialidad: MaestroGenerico[] = [];
  subTipoProceso: MaestroGenerico[] = [];
  distritoFiscal: MaestroGenerico[] = [];
  distribucionAleatoria: MaestroGenerico[] = [];
  etapas: MaestroGenerico[] = [];

  filtros: Filtros;
  filtroForm: FormGroup;

  constructor(
    private readonly fb: FormBuilder,
    private readonly maestroService: MaestroService,
    private readonly spinner: NgxSpinnerService
  ) {
    this.filtroForm = this.fb.group({
      codigo: [null],
      idTramite: [null],
      idActoProcesal: [null],
      idCarpetaCuaderno: [null],
      idTipoEspecialidad: [null],
      idEspecialidad: [null],
      idJerarquia: [null],
      idTipoProceso: [null],
      idSubTipoProceso: [null],
      idEtapa: [null],
      filtroGn: [null],
      filtroGc: [null],
      filtroCn: [null],
      filtroApp: [null],
      idDistritoFiscal: [],
      idDistribucionAleatoria: [],
      dCreacionInicio: [null],
      dCreacionFin: [null],
      dModificacionInicio: [null],
      dModificacionFin: [null],
    });
  }

  ngOnInit() {
    this.buscarActoProcesal();
    this.toggleIcon = 'pi-angle-double-down';
    if (this.bEspecialidad) {
      this.loadFiltroEspecialidad();
    }

    if (this.bDistritoFiscal) {
      this.loadDistritoFiscal();
    }

    if (this.bDistribucionAleatoria) {
      this.loadDistribucionAleatoria();
    }

    if (this.bEtapas) {
      this.loadFiltroEtapas();
    }

    this.filtroForm.valueChanges
      .pipe(
        debounceTime(500) // Ajustar el tiempo de debounce según sea necesario para el tiempo
      )
      .subscribe(() => {
        this.buscarActoProcesal();
      });

  }

  changeToggle(): void {
    this.toggleOn = !this.toggleOn;
    this.toggleIcon = this.toggleOn
      ? 'pi-angle-double-up'
      : 'pi-angle-double-down';
  }

  onChange(event: any): void {
    this.loadFiltroSubTipoProceso(event.value);
  }

  private loadFiltroSubTipoProceso(idProceso: number): void {
    this.spinner.show();
    this.maestroService.listarSubTipoProceso(idProceso).subscribe({
      next: (response) => {
        this.spinner.hide();
        this.subTipoProceso = response.data;

        // Ordenar
        this.subTipoProceso.sort((a, b) =>
          a.nombre.localeCompare(b.nombre, 'es', { sensitivity: 'base' })
        );
      },
      error: (err) => {
        this.spinner.hide();
        console.error(err);
      },
    });
  }

  public getPayload(): Filtros {
    this.filtros = {
      nombreGrupoAleatorio: this.filtroForm.value['codigo'],
      idDistritoFiscal: this.filtroForm.value['idDistritoFiscal'],
      idEspecialidad: this.filtroForm.value['idEspecialidad'],
      idTipoDistribucionAleatoria:
        this.filtroForm.value['idDistribucionAleatoria'],
      filtroGn: this.filtroForm.value['filtroGn'],
      filtroGc: this.filtroForm.value['filtroGc'],
      filtroCn: this.filtroForm.value['filtroCn'],
      filtroApp: this.filtroForm.value['filtroApp'],
      dCreacionInicio: this.filtroForm.value['dCreacionInicio'],
      dCreacionFin: this.filtroForm.value['dCreacionFin'],
      dModificacionInicio: this.filtroForm.value['dModificacionInicio'],
      dModificacionFin: this.filtroForm.value['dModificacionFin'],
    };
    return this.filtros;
  }

  //FUNCIÓN PARA ENVIAR EL FORMULARIO
  public buscarActoProcesal(): void {
    this.filter.emit(this.getPayload());
  }

  onCodigoInput(event: any): void {
    const value = event.target.value;
    this.searchTermChange.emit(value);
  }

  //FUNCIÓN LIMPIAR FILTROS
  public onClearFilters(): void {
    this.filtroForm.reset();
    //this.buscarActoProcesal();//todo: comentado porque realiza doble búsqueda
  }

  private loadFiltroEspecialidad(): void {
    this.spinner.show();
    this.maestroService.listarEspecialidad().subscribe({
      next: (response) => {
        this.spinner.hide();
        this.especialidad = response.data;
        this.especialidad.sort((a, b) =>
          a.nombre.localeCompare(b.nombre, 'es', { sensitivity: 'base' })
        );
      },
      error: (err) => {
        this.spinner.hide();
        console.error(err);
      },
    });
  }

  private loadDistritoFiscal(): void {
    this.spinner.show();
    this.maestroService.listarDistritosFiscalesActivos().subscribe({
      next: (response) => {
        this.spinner.hide();
        this.distritoFiscal = response;
        this.distritoFiscal.sort((a, b) =>
          a.nombre.localeCompare(b.nombre, 'es', { sensitivity: 'base' })
        );
      },
      error: (err) => {
        this.spinner.hide();
        console.error(err);
      },
    });
  }

  private loadDistribucionAleatoria(): void {
    this.spinner.show();
    this.maestroService.listarDistribucionAleatoria().subscribe({
      next: (response) => {
        this.spinner.hide();
        this.distribucionAleatoria = response;
        this.distribucionAleatoria.sort((a, b) =>
          a.nombre.localeCompare(b.nombre, 'es', { sensitivity: 'base' })
        );
      },
      error: (err) => {
        this.spinner.hide();
        console.error(err);
      },
    });
  }

  private loadFiltroEtapas(): void {
    this.spinner.show();
    this.maestroService.listarEtapas().subscribe({
      next: (response) => {
        this.spinner.hide();
        this.etapas = response.data;

        // Ordenar
        this.etapas.sort((a, b) =>
          a.nombre.localeCompare(b.nombre, 'es', { sensitivity: 'base' })
        );
      },
      error: (err) => {
        this.spinner.hide();
        console.error(err);
      },
    });
  }

  //MÉTODOS ONCHANGE
  onChangeDistritoFiscal(): void {
    this.buscarActoProcesal();
  }

  onChangeEspecialidad(): void {
    this.buscarActoProcesal();
  }

  onChangeDistribucionAleatoria(): void {
    this.buscarActoProcesal();
  }
}
