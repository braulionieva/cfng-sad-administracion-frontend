import { CommonModule } from '@angular/common';
import { Component, EventEmitter, inject, Output } from '@angular/core';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import {
  DialogService,
  DynamicDialog,
  DynamicDialogRef,
} from 'primeng/dynamicdialog';
import { MenuModule } from 'primeng/menu';
import { TableModule } from 'primeng/table';
import { DialogModule } from 'primeng/dialog';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DropdownModule } from 'primeng/dropdown';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { ToastModule } from 'primeng/toast';
import { TablaListUsuarioComponent } from '../tabla-list-usuario/tabla-list-usuario.component';
import { ListenerAdminUsuarioService } from '../listener-admin-usuario/listener-admin-usuario.service';
import { AgregarDependenciaUsService } from '@services/agregar-dependencia-us/agregar-dependencia-us.service';
import { RegistrarEditarUsuarioComponent } from '@modulos/usuario/usuario-general/registrar-editar-usuario/registrar-editar-usuario.component';
import { AnadirPerfilesComponent } from '../anadir-perfiles/anadir-perfiles.component';
import { AlertModalComponent } from '@components/alert-modal/alert-modal.component';
import { MaestroGenerico } from '@interfaces/maestro-generico/maestro-generico';
import { FiltrosUsuario } from '@interfaces/shared/shared';
import { CargaMasivaComponent } from './componentes/carga-masiva-usuarios/carga-masiva.component';
import { CmpLibModule } from 'ngx-mpfn-dev-cmp-lib';
import { obtenerIcono } from '@utils/icon';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { FiltrosComponent } from './filtros/filtros.component';
import { UsuarioService } from '@services/usuario/usuario.service';
const EXCEL_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';

@Component({
  selector: 'app-admin-usuario',
  standalone: true,
  templateUrl: './admin-usuario.component.html',
  styleUrls: ['./admin-usuario.component.scss'],
  imports: [
    CommonModule,
    TableModule,
    ButtonModule,
    MenuModule,
    DynamicDialog,
    DialogModule,
    CommonModule,
    TableModule,
    ToastModule,
    ConfirmDialogModule,
    ButtonModule,
    MenuModule,
    DialogModule,
    FormsModule,
    ReactiveFormsModule,
    InputTextModule,
    DropdownModule,
    InputNumberModule,
    CommonModule,
    TablaListUsuarioComponent,
    AnadirPerfilesComponent,
    FiltrosComponent,
    CmpLibModule,
  ],
  providers: [DialogService, MessageService, ConfirmationService],
})
export class AdminUsuarioComponent {
  public tituloPage: string = 'Configurar usuarios';
  public actoProcesal: MaestroGenerico[] = [];
  public carpetaCuaderno: MaestroGenerico[] = [];
  public tipoEspecialidad: MaestroGenerico[] = [];
  public especialidad: MaestroGenerico[] = [];
  public jerarquia: MaestroGenerico[] = [];
  public tipoProceso: MaestroGenerico[] = [];
  public subTipoProceso: MaestroGenerico[] = [];

  public obtenerIcono = obtenerIcono;
  filtros: FiltrosUsuario;
  users: any[] = [];
  excelExport: any[] = [];
  agregarDespachoDialog: { isVisible: boolean; documents: any };

  @Output() clicked = new EventEmitter();

  addProfileOption: boolean;

  public refModal: DynamicDialogRef;

  //usuario seleccionado
  usuarioSelected: any;
  //usuarioSelected: UsuarioRow; //un registro de la tabla

  private readonly listenerAdminUsuarioService: ListenerAdminUsuarioService =
    inject(ListenerAdminUsuarioService);

  private readonly agregarDependenciaUsService: AgregarDependenciaUsService =
    inject(AgregarDependenciaUsService);

  private readonly dialogService: DialogService = inject(DialogService);
  private readonly usuarioService: UsuarioService = inject(UsuarioService);

  constructor() {
    this.agregarDespachoDialog = {
      isVisible: false,
      documents: {},
    };
  }

  ngOnInit() {
    //el escucha para las opciones de las acciones
    this.listenerAdminUsuarioService
      .getUsuarioMenuOpcionId()
      .subscribe((usuarioMenuOpcionId) => {
        //en la primera ocasion el listener envia datos null
        if (usuarioMenuOpcionId) {
          this.usuarioSelected = usuarioMenuOpcionId.usuarioRow;
        }
      });
  }

  public icon(name: string): string {
    return `assets/icons/${name}.svg`;
  }

  getUsuarioLst() {
    this.usuarioService.bandejaUsuarios(this.filtros).subscribe({
      next: (response) => {
        this.users = response?.listaUsuarios;
      },
      error: (err) => {
        console.error('error al leer datos del servidor. ', err);
      },
    });
  }

  onFilter(filtros: FiltrosUsuario): void {
    this.filtros = {...filtros,
    };
    /*if (filtros == null) {
      this.filtros = {
        pagina: 0,
        porPagina: 10
      }
    }*/

    this.getUsuarioLst();
  }

  onCloseAgregarDespachoDialog() {
    this.agregarDespachoDialog.isVisible = false;
  }

  onClicked() {
    this.clicked.emit();
  }

  changeAddProfileOption($event) {
    this.addProfileOption = $event;
  }

  onOpenAgregarDespachoDialog() {
    this.agregarDespachoDialog.isVisible = true;
  }

  public agregarUsuario(): void {
    this.refModal = this.dialogService.open(RegistrarEditarUsuarioComponent, {
      showHeader: false,
      style: { 'min-width': '1100px' }, //en vez del //width: '60%',
      data: {
        edit: false,
        usuarioSelected: null,
      },
    });
    this.refModal.onClose.subscribe({
      next: (resp) => {
        this.getUsuarioLst();
      },
    });

  }

  public openCargaMasiva(): void {
    this.refModal = this.dialogService.open(CargaMasivaComponent, {
      width: '900px',
      height: 'auto',
      showHeader: false,
      data: {},
    });

    this.refModal.onClose.subscribe((resultado) => {
      if (resultado === 'success' || resultado === 'partial') {
        // Actualizar la lista de usuarios
        this.getUsuarioLst();
      }
    });
  }

  exportarExcel(): void {
    let secuencia = 0;
    this.users.forEach((usuario, idx) => {
      secuencia = secuencia + 1;

      this.excelExport.push({
        N: secuencia, //usuario.secuencia,
        Usuario: usuario.usuario,
        Documento: usuario.numeroDocumento,
        Nombre_completo: usuario.nombreCompleto,
        Relacion_Laboral: usuario.relacionLaboral,
        Distrito_Fiscal: usuario.distritoFiscal,
        Dependencia: usuario.entidad,
        Despacho: usuario.despacho,
        Administrador_Distrital: usuario.adminDistrital == '1' ? 'SI' : 'NO',
        Bloq: usuario.bloqueado?.toUpperCase(),
        Estado: usuario.esUsuario?.toUpperCase()
      })
    })

    const encabezados = [
      {
        N: 'Secuencia',
        Usuario: 'Usuario',
        Documento: 'Número de Documento',
        Nombre_completo: 'Nombre Completo',
        Relacion_Laboral: 'Relación Laboral',
        Distrito_Fiscal: 'Distrito Fiscal',
        Dependencia: 'Dependencia',
        Despacho: 'Despacho',
        Administrador_Distrital: 'Administrador Distrital',
        Bloq: 'Bloqueado',
        Estado: 'Estado'
      }
    ];

    const datosParaExcel = [...encabezados, ...this.excelExport];

    const hojaTrabajo: XLSX.WorkSheet = XLSX.utils.json_to_sheet(datosParaExcel,
      { skipHeader: true });
    const libroTrabajo: XLSX.WorkBook = {
      Sheets: { Datos: hojaTrabajo },
      SheetNames: ['Datos'],
    };
    const excelBuffer: any = XLSX.write(libroTrabajo, {
      bookType: 'xlsx',
      type: 'array',
    });

    this.guardarExcel(excelBuffer, 'Usuarios');

  }

  private guardarExcel(buffer: any, nombreArchivo: string): void {
    const data: Blob = new Blob([buffer], { type: EXCEL_TYPE });
    saveAs(data, `${nombreArchivo}.xlsx`);
  }
  public informarAgregarMenu(
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

  refrescarTabla() {
    this.getUsuarioLst();
  }
}
