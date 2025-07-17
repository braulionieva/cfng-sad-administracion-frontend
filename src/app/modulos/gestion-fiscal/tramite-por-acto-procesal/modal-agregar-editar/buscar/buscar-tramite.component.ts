import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { NotaInfoComponent } from '@components/nota-info/nota-info.component';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TableModule } from 'primeng/table';
import { TablaModalAgregarEditarTramiteComponent } from '../tabla/tabla-modal-agregar-editar-tramite.component';
import { MaestroGenerico } from '@interfaces/maestro-generico/maestro-generico';
import {
  TramiteBandejaResponse,
  TramiteConfiguracionRequest,
} from '@interfaces/admin-tramite-por-acto-procesal/tramite-por-acto-procesal';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { MaestroService } from '@services/maestro/maestro.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { AutoCompleteCompleteEvent } from '@interfaces/shared/shared';
import { AdminTramiteActoProcesalService } from '@services/admin-tramite-acto-procesal/admin-tramite-acto-procesal.service';
import { AlertModalComponent } from '@components/alert-modal/alert-modal.component';

@Component({
  selector: 'app-buscar-tramite',
  standalone: true,
  imports: [
    CommonModule,
    NotaInfoComponent,
    InputTextModule,
    ButtonModule,
    FormsModule,
    ReactiveFormsModule,
    AutoCompleteModule,
    TableModule,
    TablaModalAgregarEditarTramiteComponent,
  ],
  templateUrl: './buscar-tramite.component.html',
  styleUrls: ['./buscar-tramite.component.scss'],
})
export class BuscarTramiteComponent {
  @Input() tipoLlamado: string = '';
  @Output() siguiente = new EventEmitter();
  @Output() setIdTramite = new EventEmitter();
  @Output() setNombreTramite = new EventEmitter();

  tramites: MaestroGenerico[] = [];
  bandejaTramites: TramiteBandejaResponse[] = [];
  tramiteNotFound: boolean = false;

  public formularioBuscar: FormGroup;
  loading: boolean = false;
  // filteredTramites: MaestroGenerico[] | undefined;
  nombre: string = '';
  showActions: boolean = false;
  idTramiteSeleccionado: string = '';
  colorBackgroundMensaje: string = '#e2f0fb';
  public refModal: DynamicDialogRef;
  error: any;

  caracteresActualesNombreTramite: number = 0;

  constructor(
    private fb: FormBuilder,
    public ref: DynamicDialogRef,
    private maestroService: MaestroService,
    private tramiteService: AdminTramiteActoProcesalService,
    private spinner: NgxSpinnerService,
    public dialogService: DialogService
  ) {
    this.formularioBuscar = this.fb.group({
      nombreTramite: new FormControl(null, [
        Validators.required,
        Validators.maxLength(100),
        Validators.minLength(3),
      ]),
    });

    // Suscribirse a los cambios del campo nombreTramite
    this.suscribirCaracteresActualesNombreTramite();
  }

  public suscribirCaracteresActualesNombreTramite(){
    // Suscribirse a los cambios del campo nombreTramite
    this.formularioBuscar.get('nombreTramite')?.valueChanges.subscribe(value => {
      if (typeof value === 'string') {
        this.caracteresActualesNombreTramite = value.length;
      } else if (value && typeof value === 'object' && value.nombre) {
        this.caracteresActualesNombreTramite = value.nombre.length;
      } else {
        this.caracteresActualesNombreTramite = 0;
      }
    });
  }
  public icon(name: string): string {
    return `assets/icons/${name}.svg`;
  }

  public getDescripcionTop(): any {
    return '<b>Nota:</b> Antes de registrar un nuevo trámite, asegurarse si ya existe, ingresando como mínimo las tres primeras letras del nombre del trámite para la búsqueda.';
  }

  public getDescripcionButton(): any {
    return '<b>Nota:</b> Antes de continuar con el registro, por favor, asegúrese de que el nombre del trámite esté escrito correctamente, utilizando todas las letras de forma completa. Además de verificar que las tildes se hayan aplicado correctamente, evitando el uso indebido de tildes donde no corresponde.';
  }

  public getDescripcionNoExiste(): any {
    return '<b>Nota:</b> Al no haber encontrado y seleccionado un trámite existente, este trámite será registrado como <b>NUEVO.</b>';
  }

  search(event: AutoCompleteCompleteEvent) {
    this.idTramiteSeleccionado = '';

    if (event.query.length >= 3) {
      this.buscarTramite(event.query);
    } else {
      this.tramiteNotFound = false;
    }
  }

  private buscarTramite(tramite: string): void {
    this.spinner.show();
    this.tramiteService.buscarTramitePorNombre(tramite).subscribe({
      next: (response) => {
        this.spinner.hide();
        this.tramites = response;
        this.tramiteNotFound = this.tramites.length == 0 ? true : false;
      },
      error: (err) => {
        this.error = err;
        console.error('Error al obtener el detalle de tramites:', err);

        this.spinner.hide();
      },
    });
  }

  getSelectedItemName(item: { id: string; nombre: string }): string {
    return item.nombre;
  }

  onSelect(event: any) {
    this.idTramiteSeleccionado = '';

    this.idTramiteSeleccionado = event.id;
    this.setIdTramite.emit(this.idTramiteSeleccionado);
    this.setNombreTramite.emit(event.nombre);
  }

  nextPage() {
    if (this.tramiteNotFound) {
      this.agregarTramite();
    } else {
      this.goToNextPage();
    }
  }

  private agregarTramite(): void {
    this.spinner.show();
    const tramite = this.obtenerBodyTramite();
    this.tramiteService.agregarTramite(tramite).subscribe({
      next: (response) => {
        this.spinner.hide();
        this.idTramiteSeleccionado = response.idTramite;
        this.goToNextPage();
      },
      error: (err) => {
        this.error = err;
        this.informarEstadoAccion('error', 'Error', err.error.message);
        this.spinner.hide();
      },
    });
  }

  private obtenerBodyTramite(): TramiteConfiguracionRequest {
    const nuevoTramite = {
      nombreTramite: this.formularioBuscar.value.nombreTramite,
      usuarioCreador: '44836273',
    };

    return nuevoTramite;
  }

  private goToNextPage(): void {
    this.setIdTramite.emit(this.idTramiteSeleccionado);
    this.setNombreTramite.emit(this.nombre);
    this.siguiente.emit();
  }

  public close(): void {
    this.ref.close();
  }

  public informarEstadoAccion(
    icon: string,
    title: string,
    description: string
  ): void {
    this.refModal = this.dialogService.open(AlertModalComponent, {
      width: '600px',
      showHeader: false,
      data: {
        icon: icon,
        title: title,
        description: description,
      },
    });
  }
}
