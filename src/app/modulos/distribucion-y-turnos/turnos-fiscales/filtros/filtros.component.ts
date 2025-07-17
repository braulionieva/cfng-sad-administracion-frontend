import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { DropdownModule } from 'primeng/dropdown';
import { RadioButtonModule } from 'primeng/radiobutton';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { CalendarModule } from 'primeng/calendar';
import { AlertModalComponent } from '@components/alert-modal/alert-modal.component';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import {
  EspecialidadDTOB,
  JerarquiaDTOB,
} from '@interfaces/administrar-dependencia/administrar-dependencia';
import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { RequestFiltrarTurno } from '@interfaces/administrar-turno/administrar-turno';
import { MaestroService } from '@services/maestro/maestro.service';
import { Subscription } from 'rxjs';
import { formatDateSimple } from '@utils/utils';
import { DistritoFiscalDTOB } from '@interfaces/plazo-doc-obs/BuscarPlazoDocObsRes';

@Component({
  selector: 'app-filtros',
  standalone: true,
  imports: [
    CommonModule,
    DropdownModule,
    RadioButtonModule,
    CalendarModule,
    ReactiveFormsModule,
    InputTextModule,
    ButtonModule,
  ],
  templateUrl: './filtros.component.html',
  styleUrls: ['./filtros.component.scss'],
})
export class FiltrosComponent implements OnInit {
  showMoreFiltro: boolean = false;
  public refModalExcel: DynamicDialogRef;
  public refModal: DynamicDialogRef;
  distritoFiscalLst: DistritoFiscalDTOB[] = [];
  jerarquiaLst: JerarquiaDTOB[] = [];
  especialidadLst: EspecialidadDTOB[] = [];

  @Output() filter = new EventEmitter<RequestFiltrarTurno>();

  public distritosFiscalesList = [];
  public dependenciasFiscalesList = [];
  public despachosList = [];

  filtros: RequestFiltrarTurno;
  filtroForm: FormGroup;
  /* tiposDistribucion = [{label: 'Por Despacho', value: 1}, {label: 'Por Fiscal', value: 2}];
  distritosFiscales = [{label: 'Lima Norte', value: 4},
  especialidades = [{label: 'Cámara Gesell', value: 8}, */
  showAdditionalFilters = false;

  public subscriptions: Subscription[] = [];

  constructor(
    private readonly fb: FormBuilder,
    private readonly dialogService: DialogService,
    private readonly maestrosService: MaestroService
  ) {
    this.filtroForm = this.fb.group({
      distritoFiscal: [null],
      dependencia: [null],
      despacho: [null],
      fechaInicio: [null],
      fechaFin: [null],
      vigente: [null],
    });
  }

  ngOnInit() {
    this.submit();
    this.obtenerDistritoFiscal();
    // this.obtenerDependenciaFiscal();
    // this.obtenerDespacho();
  }

  obtenerDistritoFiscal() {
    this.subscriptions.push(
      this.maestrosService.listarDistritosFiscalesActivos().subscribe({
        next: (resp) => {
          this.distritosFiscalesList = resp;
          // Ordenar por 'nombre'
          this.distritosFiscalesList.sort((a, b) => a.nombre.localeCompare(b.nombre));
        },
        error: (err) => {
          console.error(err);
        },
      })
    );
  }
  // obtenerDependenciaFiscal() {
  //   this.subscriptions.push(
  //     this.maestrosService.listarDependenciasFiscalesActivos().subscribe({
  //       next: (resp) => {
  //         this.dependenciasFiscalesList = resp;
  //       },
  //     })
  //   );
  // }
  // obtenerDespacho() {
  //   this.subscriptions.push(
  //     this.maestrosService.listarDespachosActivos().subscribe({
  //       next: (resp) => {
  //         this.despachosList = resp;
  //       },
  //     })
  //   );
  // }

  renuevaDependencia(idDistritoFiscal: number) {
  if (!idDistritoFiscal) {
    this.dependenciasFiscalesList = [];
    this.filtroForm.get('dependencia').reset();
    return;
  }

  this.subscriptions.push(
    this.maestrosService
      .listarDependenciasFiscalesActivosPorDistritoFiscal(idDistritoFiscal)
      .subscribe({
        next: (resp) => {
          this.dependenciasFiscalesList = resp.data.map((dependencia) => ({
            nombre: dependencia.nombre,
            codigo: dependencia.codigo,
          }));

          this.dependenciasFiscalesList.sort((a, b) => a.nombre.localeCompare(b.nombre));

          this.despachosList = [];
          this.filtroForm.get('despacho').reset();
        },
        error: (err) => {
          console.error('Error al cargar dependencias fiscales:', err);
        },
      })
  );

  this.submit();
}


renuevaDespacho(event: any) {
  const idDependencia = event;
  this.subscriptions.push(
    this.maestrosService.listarDespachoPorEntidad(idDependencia).subscribe({
      next: (resp) => {
        this.despachosList = resp;

        this.despachosList.sort((a, b) => a.nombre.localeCompare(b.nombre));
      },
      error: (err) => {
        console.error(err);
      }
    })
  );
  this.submit();
}


  getPayload() {
    this.filtros = {
      pagina: 0,
      porPagina: 10,
      idDistritoFiscal: this.filtroForm.value.distritoFiscal,
      codigoDependencia: this.filtroForm.value.dependencia,
      codigoDespacho: this.filtroForm.value.despacho,
      fechaInicio: formatDateSimple(this.filtroForm.value.fechaInicio),
      fechaFin: formatDateSimple(this.filtroForm.value.fechaFin),
      vigente: null, //'0'
    };

    return this.filtros;
  }

  submit() {
    this.filter.emit(this.getPayload());
  }

  //FUNCION MOSTRAR MÁS FILTROS
  toggleFilters() {
    this.showAdditionalFilters = !this.showAdditionalFilters;
  }

  /********************* */
  //FUNCIÓN LIMPIAR FILTROS
  onClearFilters() {
    this.filtroForm.reset();
    
    this.dependenciasFiscalesList = [];
    this.despachosList = [];
  
    this.showAdditionalFilters = false;
  
    this.filter.emit(null);
  }

  toggleMasFiltros() {
    this.showAdditionalFilters = !this.showAdditionalFilters;
    this.showMoreFiltro = !this.showMoreFiltro;
  }

  getIcon() {
    return `pi pi-angle-double-${this.showAdditionalFilters ? 'up' : 'down'}`;
  }

  onConfirmarEliminacionDeTurno(icon: string) {
    this.refModal = this.dialogService.open(AlertModalComponent, {
      width: '600px',
      showHeader: false,
      data: {
        icon: icon,
        title: 'Eliminar',
        confirm: true,
        description: '¿Quiere usted eliminar el turno fiscal?',
      },
    });
  }
}
