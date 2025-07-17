import { CommonModule } from "@angular/common";
import { Component, Input, Output, EventEmitter } from "@angular/core";
import { ReactiveFormsModule, FormGroup, FormBuilder } from "@angular/forms";
import { AlertModalComponent } from "@components/alert-modal/alert-modal.component";
import { JerarquiaDTOB } from "@interfaces/administrar-dependencia/administrar-dependencia";
import { RequestFiltrarTurno } from "@interfaces/administrar-turno/administrar-turno";
import { DistritoFiscalDTOB, EspecialidadDTOB } from "@interfaces/plazo-doc-obs/BuscarPlazoDocObsRes";
import { MaestroService } from "@services/maestro/maestro.service";
import { ButtonModule } from "primeng/button";
import { CalendarModule } from "primeng/calendar";
import { DropdownModule } from "primeng/dropdown";
import { DynamicDialogRef, DialogService } from "primeng/dynamicdialog";
import { InputTextModule } from "primeng/inputtext";
import { RadioButtonModule } from "primeng/radiobutton";
import { Subscription } from "rxjs";

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
export class FiltrosComponent {
  protected showMoreFiltro: boolean = false;
  protected refModalExcel: DynamicDialogRef;
  protected refModal: DynamicDialogRef;
  protected distritoFiscalLst: DistritoFiscalDTOB[] = [];
  protected jerarquiaLst: JerarquiaDTOB[] = [];
  protected especialidadLst: EspecialidadDTOB[] = [];


  protected distritosFiscalesList = [];
  protected dependenciasFiscalesList = [];
  protected despachosList = [];

  protected filtros: RequestFiltrarTurno;
  protected filtroForm: FormGroup;
  protected showAdditionalFilters = false;

  public subscriptions: Subscription[] = [];

  @Input() totalElementos: number = 0;
  @Output() filter = new EventEmitter<RequestFiltrarTurno>();

  constructor(
    private readonly fb: FormBuilder,
    private readonly dialogService: DialogService,
    private readonly maestrosService: MaestroService
  ) {
    this.filtroForm = this.fb.group({
      inTipoDocumento: [null],
    });
  }
  getDistritoFiscal() {
    this.subscriptions.push(
      this.maestrosService.listarDistritosFiscalesActivos().subscribe({
        next: (resp) => {
          this.distritosFiscalesList = resp;
        },
      })
    );
  }
  getDependenciaFiscal() {
    this.subscriptions.push(
      this.maestrosService.listarDependenciasFiscalesActivos().subscribe({
        next: (resp) => {
          this.dependenciasFiscalesList = resp;
        },
      })
    );
  }
  getDespacho() {
    this.subscriptions.push(
      this.maestrosService.listarDespachosActivos().subscribe({
        next: (resp) => {
          this.despachosList = resp;
        },
      })
    );
  }

  submit() {
    this.filter.emit(this.filtroForm.get('inTipoDocumento')?.value);
  }

  toggleFilters() {
    this.showAdditionalFilters = !this.showAdditionalFilters;
  }

  onClearFilters() {
    this.filtroForm.reset();
    this.showAdditionalFilters = false;
  }

  toggleMasFiltros() {
    this.showMoreFiltro = !this.showMoreFiltro;
  }

  confirmarEliminacionDeTurno(icon: string) {
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
