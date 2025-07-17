import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { AccionesDistribucionAleatoriaComponent } from './acciones/acciones-distribucion-aleatoria.component';
import {
  GrupoAleatorioBandejaRequest,
  GrupoAleatorioBandejaResponse,
} from '@interfaces/grupo-aleatorio/grupo-aleatorio';
import { GrupoAleatorioService } from '@services/grupo-aleatorio/grupo-aleatorio.service';
import { Filtros } from '@interfaces/shared/shared';
import { MenuItem } from 'primeng/api';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { DetalleDistribucionAleatoriaComponent } from '../ver-detalle/detalle-distribucion-aleatoria.component';
import { CargaInicialDistribucionAleatoriaComponent } from '../carga-inicial/carga-inicial-distribucion-aleatoria.component';
import { DocumentoAdjuntoDistribucionAleatoriaComponent } from '../ver-documento/documento-adjunto-distribucion-aleatoria.component';
import { NgxSpinnerService } from 'ngx-spinner';
import { AgregarEditarDistribucionAleatoriaComponent } from '../agregar-editar/agregar-editar-distribucion-aleatoria.component';
import { AlertModalComponent } from '@components/alert-modal/alert-modal.component';
import { TablaDistribucionAleatoriaComponent } from './tabla-distribucion-aleatoria/tabla-distribucion-aleatoria.component';
import * as XLSX from 'xlsx';
import { FiltroGenericoComponent } from '@components/filtro-generico/filtro-generico.component';
import { debounceTime, distinctUntilChanged, Subject } from 'rxjs';

@Component({
  selector: 'app-bandeja-distribucion-aleatoria',
  standalone: true,
  templateUrl: './bandeja-distribucion-aleatoria.component.html',
  styleUrls: ['./bandeja-distribucion-aleatoria.component.scss'],
  imports: [
    FiltroGenericoComponent,
    AccionesDistribucionAleatoriaComponent,
    TablaDistribucionAleatoriaComponent,
  ],
  providers: [DialogService],
})
export class BandejaConfiguracionAleatoriaComponent implements OnInit {

  tituloPage = 'Configurar distribución de denuncias';
  query: GrupoAleatorioBandejaRequest;
  gruposAleatorios: GrupoAleatorioBandejaResponse;
  error: any;
  cols: any[] = [];
  searchSubject = new Subject<string>();

  showActionsButton: boolean = true;
  menuActionsItems: MenuItem[] = [];
  menu2ActionsItems: MenuItem[] = [];
  valueToAction: any;
  nameExcel: string = 'grupos aleatorios.xlsx';
  datosDocumento: any;
  existeDocumento: boolean;
  inNotaPeriodo: boolean = false;

  public refModal: DynamicDialogRef;

  constructor(
    private readonly grupoAleatorioService: GrupoAleatorioService,
    private readonly dialogService: DialogService,
    private readonly spinner: NgxSpinnerService
  ) {}

  onFilter(filtros: Filtros) {
    this.query = { ...this.query, pages: 10, perPage: 1, filtros };
    this.buscarGruposAleatoriosDisponibles();
  }

  buscarGruposAleatoriosDisponibles() {
    this.grupoAleatorioService.obtenerGruposAleatorios(this.query).subscribe({
      next: (response) => {
        this.gruposAleatorios = response;
        this.inNotaPeriodo = this.gruposAleatorios?.registros.some(
          (grupo) => grupo.inNotaPeriodo == '1'
        );
      },
      error: (err) => {
        this.error = err;
        console.error('Error al obtener grupos aleatorios:', err);
      },
    });
  }

  ngOnInit() {
    this.setCols();
    this.setMenuActionItems();
    this.initializeSearch();
  }

  initializeSearch() {
    this.searchSubject
      .pipe(
        debounceTime(300),
        distinctUntilChanged()
      )
      .subscribe((searchTerm: string) => {
        this.executeSearch(searchTerm);
      });
  }

  executeSearch(searchTerm: string) {
    const filtros: Filtros = { nombreGrupoAleatorio: searchTerm || '' };
    this.onFilter(filtros);
  }

  public refrescar(): void {
    const filtros = {};
    this.onFilter(filtros);
  }

  setCols(): void {
    this.cols = [
      { field: 'secuencia', header: 'Nº' },
      { field: 'nombreGrupoAleatorio', header: 'Nombre del Grupo Aleatorio' },
      { field: 'tipoDistribucion', header: 'Tipo de Distribución' },
      { field: 'distritoFiscal', header: 'Distrito Fiscal' },
      { field: 'especialidad', header: 'Especialidad' },
      { field: 'cantidadFiscalia', header: 'Fiscalías' },
      { field: 'diferenciaMaxima', header: 'Diferencia Máxima' },
      { field: 'ultimaModificacion', header: 'Última Modificación' },
    ];
  }

  setMenuActionItems(): void {
    this.menuActionsItems = [
      {
        label: 'Editar Grupo Aleatorio',
        icon: 'pi pi-pencil',
        command: () => {
          this.loadEditarGrupoAleatorio(this.valueToAction);
        },
      },
      {
        label: 'Configurar Carga Inicial',
        icon: 'pi pi-cog',
        command: () => {
          this.loadCargaInicial();
        },
      },
      {
        label: 'Ver Detalle',
        icon: 'pi pi-eye',
        command: () => {
          this.loadVerDetalles(this.valueToAction);
        },
      },
      {
        label: 'Ver documento adjunto',
        icon: 'pi pi-file-pdf',
        command: () => {
          this.loadVerDocumentoAdjunto();
        },
      },
      {
        label: 'Eliminar Grupo Aleatorio',
        icon: 'pi pi-trash',
        command: () => {
          this.eliminarGrupoAleatorio(this.valueToAction);
        },
      },
    ];
    this.menu2ActionsItems = this.menuActionsItems.filter(
      (data) => data.label !== 'Ver documento adjunto'
    );
  }

  onSearchTermChange(searchTerm: string) {
    this.searchSubject.next(searchTerm);
  }


  getDataToAction(data: any) {
    this.valueToAction = data;
  }

  public consultarDocumentos() {
    this.spinner.show();
    this.datosDocumento = null;
    this.grupoAleatorioService
      .consultaDocumentos(this.valueToAction.id)
      .subscribe({
        next: (resp) => {
          if (resp) {
            this.datosDocumento = {
              distritoFiscal: resp?.distritoFiscal,
              distrito: resp?.distrito,
              tipoEspecialidad: resp?.tipoEspecialidad,
              especialidad: resp?.especialidad,
              totalArchivo: '1',
              nombreDocumento: resp?.nombreDocumento,
              idDocumento: resp?.idGrupoAleatorio,
            };
            this.refModal = this.dialogService.open(
              DocumentoAdjuntoDistribucionAleatoriaComponent,
              {
                width: '1100px',
                showHeader: false,
                data: {
                  title: 'Documento de Sustento',
                  idGrupoAleatorio: this.valueToAction.id,
                  datosDocumento: this.datosDocumento,
                },
              }
            );
          }
        },
        error: (error) => {
          //mostrar mensaje
          this.spinner.hide();
          this.existeDocumento = false;
        },
      });
    this.spinner.hide();
  }
  private loadEditarGrupoAleatorio(item: any): void {
    this.refModal = this.dialogService.open(
      AgregarEditarDistribucionAleatoriaComponent,
      {
        width: '1180px',
        showHeader: false,
        data: {
          tipo: 'editar',
          grupoAleatorio: item,
          nombreGrupoAleatorio: item.nombreGrupoAleatorio,
          tipoDistribucion: item.tipoDistribucion,
          distritoFiscal: item.distritoFiscal,
          tipoEspecialidad: item.tipoEspecialidad,
          especialidad: item.especialidad,
          idGrupoAleatorio: item.id,
        },
      }
    );
    this.refModal.onClose.subscribe((data: any) => {
      console.log("data retorno:",data)
      if (data?.id == 1) {
        this.refrescar();
      }
    });
  }

  private loadCargaInicial(): void {
    this.refModal = this.dialogService.open(
      CargaInicialDistribucionAleatoriaComponent,
      {
        width: '1100px',
        showHeader: false,
        data: {
          title: 'Configurar Carga Inicial',
          idGrupoAleatorio: this.valueToAction.id,
          nombreGrupoAleatorio: this.valueToAction.nombreGrupoAleatorio,
        },
      }
    );
  }

  private loadVerDetalles(item: any): void {
    this.refModal = this.dialogService.open(
      DetalleDistribucionAleatoriaComponent,
      {
        width: '1200px',
        showHeader: false,
        data: item,
      }
    );
  }

  private loadVerDocumentoAdjunto(): void {
    this.consultarDocumentos();
  }
  /* showAttachments(idCaso: string): void {
    this.refModalPD = this.dialogService.open(AdjuntosModalComponent, {
      width: '1400px',
      height: '97vh',
      showHeader: false,
      contentStyle: { padding: '0', 'border-radius': '15px',overflow: 'hidden' },
      data: { idCaso: idCaso },
    });
  }*/
  private eliminarGrupoAleatorio(item: any): void {
    this.confirmarEliminacionDeGrupoAleatorio('question');
    this.refModal.onClose.subscribe({
      next: (resp) => {
        if (resp === 'confirm') {
          this.llamarServicioEliminarGrupoAleatorio();
        }
      },
    });
  }

  private confirmarEliminacionDeGrupoAleatorio(icon: string): void {
    this.refModal = this.dialogService.open(AlertModalComponent, {
      width: '750px',
      showHeader: false,
      data: {
        icon: icon,
        title: 'ELIMINAR DATOS DEL GRUPO ALEATORIO',
        confirm: true,
        description:
          'A continuación, se procederá a <b>eliminar los datos del “' +
          this.valueToAction.nombreGrupoAleatorio +
          '”</b>.<br>¿Esta seguro de realizar esta acción?',
        confirmButtonText: 'Aceptar',
      },
    });
  }

  private llamarServicioEliminarGrupoAleatorio(): void {
    this.spinner.show();

    this.grupoAleatorioService.eliminarGrupo(this.valueToAction.id).subscribe({
      next: (response) => {
        this.refrescar();
        this.spinner.hide();
        this.informarEliminacionDeGrupoAleatorio(
          'success',
          'ELIMINACIÓN EXITOSA',
          'La eliminación de los datos del “' +
            this.valueToAction.nombreGrupoAleatorio +
            '” fue realizado de forma exitosa.'
        );
      },
      error: (err) => {
        this.spinner.hide();
        this.error = err;
        console.error('Error al eliminar el grupo Aleatorio.', err);
      },
    });
    this.spinner.hide();
  }

  public informarEliminacionDeGrupoAleatorio(
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
        confirmButtonText: 'Listo',
      },
    });
  }

  exportarExcel() {
    if (
      !this.gruposAleatorios?.registros ||
      this.gruposAleatorios.registros.length === 0
    ) {
      console.error('No hay datos para exportar.');
      return;
    }

    // Crear una hoja de trabajo a partir de los datos
    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(
      this.gruposAleatorios.registros.map((registro) => ({
        Nº: registro.secuencia,
        'Nombre del Grupo Aleatorio': registro.nombreGrupoAleatorio,
        'Tipo de Distribución': registro.tipoDistribucion,
        'Distrito Fiscal': registro.distritoFiscal,
        Especialidad: registro.especialidad,
        Fiscalías: registro.cantidadFiscalia,
        'Diferencia Máxima': registro.diferenciaMaxima,
        'Última Modificación': registro.ultimaModificacion,
      }))
    );

    // Crear el libro y agregar la hoja
    const book: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(book, worksheet, 'GruposAleatorios');

    // Descargar archivo Excel
    XLSX.writeFile(book, this.nameExcel);

    // let element = document.getElementById('idTableDistribuciones');
    // const worksheet: XLSX.WorkSheet = XLSX.utils.table_to_sheet(element);

    // const book: XLSX.WorkBook = XLSX.utils.book_new();
    // XLSX.utils.book_append_sheet(book, worksheet, 'Sheet1');

    // XLSX.writeFile(book, this.nameExcel);
    /**this.grupoAleatorioService.exportarGruposAleatorios(this.query).subscribe({
      next: (response) => {
        const blob = new Blob([response], {
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        });
        const url = window.URL.createObjectURL(blob);
        const anchor = document.createElement('a');
        anchor.href = url;
        anchor.download = 'ExcelBandejaGruposAleatorios.xlsx';
        anchor.click();
        window.URL.revokeObjectURL(url);
      },
      error: (err) => {
        this.error = err;
        console.error('Error al obtener grupos aleatorios:', err);
      },
     });**/
  }
}
