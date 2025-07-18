import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { UsuarioComplete, UsuarioRow } from '@interfaces/agregar-dependencia-us/agregar-dependencia-us';
import { MenuItem, MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { DynamicDialogRef, DynamicDialogConfig, DynamicDialog, DialogService } from 'primeng/dynamicdialog';
import { MenuModule } from 'primeng/menu';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ListenerAdminUsuarioService } from '../listener-admin-usuario/listener-admin-usuario.service';
import { ConstanteMenuUsuario } from '../ConstanteAdminUsuario';
import { AdministradorDistritalComponent } from '../administrador-distrital/administrador-distrital.component';
import { ResetearContrasenaComponent } from '@modulos/administrar-cuenta/resetear-contrasena/resetear-contrasena.component';
import { AdminDistritalService } from '@services/admin-usuario/admin-distrital/admin-distrital.service';
import { Auth2Service } from '@services/auth/auth2.service';
import { AlertModalComponent } from '@components/alert-modal/alert-modal.component';
import { RegistrarEditarUsuarioComponent } from '../registrar-editar-usuario/registrar-editar-usuario.component';
import { MasInfoUsuarioComponent } from '../admin-usuario/componentes/mas-info-usuario/mas-info-usuario.component';
import { FotoUsuarioComponent } from '../admin-usuario/componentes/foto-usuario/foto-usuario.component';
import { BloquearUsuarioModalComponent } from "@modulos/usuario/usuario-general/bloquear-usuario-modal/bloquear-usuario-modal.component";
import { DependenciaUsuarioModalComponent } from "@modulos/usuario/usuario-general/dependencia-usuario-modal/dependencia-usuario-modal.component";
import { DesbloquearUsuarioModalComponent } from "@modulos/usuario/usuario-general/desbloquear-usuario-modal/desbloquear-usuario-modal.component";
import { HabilitarDeshabilitarUsuarioComponent } from '../habilitar-deshabilitar-usuario/habilitar-deshabilitar-usuario.component';
import {ESTADOS_USUARIO} from "@constants/constantes";

type PrimeNGSeverity = "success" | "info" | "secondary" | "warn" | "danger" | "contrast";

@Component({
  selector: 'app-tabla-list-usuario',
  standalone: true,
  templateUrl: './tabla-list-usuario.component.html',
  styleUrls: ['./tabla-list-usuario.component.scss'],
  imports: [
    TableModule,
    CommonModule,
    TableModule,
    ButtonModule,
    MenuModule,
    DynamicDialog,
    TagModule,
  ],
  providers: [MessageService, DialogService, DynamicDialogConfig],
})
export class TablaListUsuarioComponent {
  public infoUsuario;
  public refModal: DynamicDialogRef;
  @Input() users: UsuarioRow[] = [];
  @Output() refrescarTabla = new EventEmitter<unknown>();

  //usuario seleccionado
  usuarioSelected: UsuarioRow; //un registro de la tabla

  administradorDistrital: boolean;
  actionItemsMenu: MenuItem[];

  resetearContrasenaDialog: any;


  constructor(
    private readonly listenerAdminUsuarioService: ListenerAdminUsuarioService,
    private readonly adminDistritalService: AdminDistritalService,
    private readonly dialogService: DialogService,
    private readonly userService: Auth2Service
  ) { }

  ngOnInit() {
   this.infoUsuario = this.userService.getUserInfo();
    this.actionItemsMenu = [
      {
        label: 'Editar datos',
        command: () => this.onEditarUsuario(),
      },
      {
        label: 'Dependencias de usuario',
        command: () => {
          this.onOptionActionDependenciaUsuario();
        },
      },
      {
        label: `Asignar Adm. Distrital`,
        command: () => {
          this.onOptionActionAdminDistrital();
        },
      },
      {
        label: `Dejar de ser Adm. Distrital`,
        visible: false,
        command: () => {
          this.onOptionActionBajaAdminDistrital();
        },
      },
      {
        label: 'Añadir perfiles',
        command: () => this.actionAddProfileUs(),
      },
      {
        label: 'Cambiar foto',
        command: () => this.actionAddphoto(),
      },
      {
        label: 'Resetear contraseña',
        command: () => {
          this.cargarVentanaResetearContrasena();
        },
      },
      {
        label: 'Bloquear usuario',
        command: () => {
          this.onOptionActionBloquearUs();
        },
      },
      {
        label: 'Desbloquear usuario',
        command: () => {
          this.onOptionActionDesbloquearUs();
        },
      },
      {
        label: 'Habilitar usuario',
        command: () => {
          this.onOptionActionHabilitarUs();
        },
      },
      {
        label: 'Deshabilitar usuario',
        command: () => {
          this.onOptionActionBajaUs();
        },
      },
      {
        label: 'Más información',
        command: () => this.onMasInfoUsuario(),
      },

    ];

    //------------------------------------------------------
    //Solicitado por Ivonne el día 01/02/2025 para no afectar a EFE
    //ocultar DEPENDENCIAS DE USUARIO
    this.actionItemsMenu[1].visible = false;
    //------------------------------------------------------

  }
  loadPerfiles(usuarioRow: any) {
    this.adminDistritalService
      .esAdminDistrital(usuarioRow.idUsuario)
      .subscribe({
        next: (response) => {
          if (response > 0) {
            this.actionItemsMenu[2].label = 'Editar Adm. Distrital';
            this.administradorDistrital = true;
            this.actionItemsMenu[3].visible = true;
          } else {
            this.actionItemsMenu[2].label = 'Asignar Adm. Distrital';
            this.administradorDistrital = false;
            this.actionItemsMenu[3].visible = false;
          }
        },
        error: (err) => {
          console.error('error al leer datos del servidor. ', err);
        },
      });
    if ([ESTADOS_USUARIO.ACTIVO, ESTADOS_USUARIO.DESBLOQUEADO].includes(usuarioRow.idNEstado)) {
      this.actionItemsMenu[9].visible = false;
      this.actionItemsMenu[10].visible = true;
    } else {
      this.actionItemsMenu[9].visible = true;
      this.actionItemsMenu[10].visible = false;
    }
    if (usuarioRow.bloqueado.toUpperCase() == 'NO') {
      this.actionItemsMenu[8].visible = false;
      this.actionItemsMenu[7].visible = true;
    } else {
      this.actionItemsMenu[8].visible = true;
      this.actionItemsMenu[7].visible = false;
    }
  }
  // Método para editar un usuario
onEditarUsuario() {
  this.refModal = this.dialogService.open(RegistrarEditarUsuarioComponent, {
    showHeader: false,
    style: { 'min-width': '1100px' },
    data: {
      usuarioSelected: this.usuarioSelected,
      edit: true,
    }
  });

  // Suscribirse al evento onClose
  this.refModal.onClose.subscribe((data: any) => {
    if (data && data.accion === 'actualizar bandeja') {
      this.refrescarTabla.emit(); // Emitir el evento para refrescar la tabla
    }
  });
}

/***
// Método para registrar un nuevo usuario (si existe)
onRegistrarUsuario() {
  this.refModal = this.dialogService.open(RegistrarEditarUsuarioComponent, {
    showHeader: false,
    style: { 'min-width': '1100px' },
    data: {
      edit: false,
    }
  });

  // Suscribirse al evento onClose
  this.refModal.onClose.subscribe((data: any) => {
    if (data && data.accion === 'actualizar bandeja') {
      this.refrescarTabla.emit(); // Emitir el evento para refrescar la tabla
    }
  });
}***/


  onMasInfoUsuario() {
    this.refModal = this.dialogService.open(MasInfoUsuarioComponent, {
      showHeader: false,
      height: 'auto',
      style: { 'min-width': '900px' },//en vez del //width: '60%',
      data: {
        usuarioSelected: this.usuarioSelected,
      }
    });
  }

  bajaAsignarAdminDistrital() {
    this.refModal = this.dialogService.open(AlertModalComponent, {
      width: '600px',
      contentStyle: {
        padding: '0',
        'border-radius': '20px',
        border: 'none!important',
      },
      showHeader: false,
      data: {
        icon: 'question',
        title: 'DEJAR DE SER ADMINISTRADOR DISTRITAL',
        confirm: true,
        confirmButtonText: 'Aceptar',
        description:
          'A continuación, se procederá a <b>desasignar</b> como administrador distrital al usuario "' +
          this.usuarioSelected?.numeroDocumento +
          '". ¿Está seguro de realizar esta okiacción?',
      },
    });
    this.refModal.onClose.subscribe({
      next: (resp) => {
        if (resp === 'confirm') {
          let request = {
            idUsuarioAdministrador: this.usuarioSelected?.idUsuario,
            idTipoEntidad: 1,
            idUsuario: this.usuarioSelected?.usuario
          }

          this.servicioBaja(request);
        }
      }
    });
  }
  servicioBaja(request: any) {
    this.adminDistritalService.bajaAdminDistrital(request).subscribe({
      next: (response) => {
        this.informarBaja();
        this.refrescarTabla.emit();
      },
      error: (err) => {
        console.error('error al consultar datos', err);
      },
    });
  }

  informarBaja() {
    this.refModal = this.dialogService.open(
      AlertModalComponent,
      {
        width: '600px',
        showHeader: false,
        data: {
          icon: 'success',
          title: 'PROCESO REALIZADO CORRECTAMENTE',
          confirmButtonText: 'Listo',
          description: 'La desasignación como administrador distrital para el usuario "'
            + this.usuarioSelected?.numeroDocumento + '", se realizó correctamente.',
        }
      }
    )

  }
  getSeverityAdminDistrital(admin: string): PrimeNGSeverity  {
    if (admin === '0') {
      return 'danger';
    }
    return 'success';
  }
  getSeverityBloqueado(usuario: string): PrimeNGSeverity  {
    switch (usuario) {
      case 'SI':
        return 'danger';
      case 'NO':
        return 'success';
      default:
        return 'warn';
    }
  }
  getSeverityEstado(estado: string): PrimeNGSeverity  {
    switch (estado) {
      case 'activo':
        return 'success';
      case 'inactivo':
        return 'danger';
      default:
        return 'warn';
    }
  }
  //al elegir un item desde el html
  setRowSelected(usuarioRow: UsuarioRow) {
    this.usuarioSelected = usuarioRow;
    this.loadPerfiles(usuarioRow);
  }

  actionAddProfileUs() {
    this.listenerAdminUsuarioService.setUsuarioMenuOpcionId({
      usuarioRow: this.usuarioSelected,
      menuOpcionId: ConstanteMenuUsuario.PERFILES_USAURIO,
    });
    this.listenerAdminUsuarioService.setInfoUsuario(this.infoUsuario);
  }

  actionAddphoto() {
    this.refModal = this.dialogService.open(FotoUsuarioComponent, {
      showHeader: false,
      header: 'Foto',
      style: { 'min-width': '900px' }, //en vez del //width: '60%',
      data: {
        usuarioSelected: this.usuarioSelected,
      },
    });

    this.refModal.onClose.subscribe((data: any) => {
      this.refrescarTabla.emit();
    });
  }

  onOptionActionDependenciaUsuario() {
    this.refModal = this.dialogService.open(DependenciaUsuarioModalComponent, {
      width: '1100px',
      showHeader: false,
      contentStyle: { overflow: 'auto' },
      data: {
        usuarioSelected: {
          ...this.usuarioSelected,
          idVUsuario: this.usuarioSelected.idUsuario
        }
      },
    });

    this.refModal.onClose.subscribe({
      next: (resp) => {

      },
    });

  }
  onOptionActionAdminDistrital() {
    this.refModal = this.dialogService.open(AdministradorDistritalComponent, {
      width: '80%',
      showHeader: false,
      contentStyle: { padding: '0', 'border-radius': '10px' },
      data: {
        editar: this.administradorDistrital,
        usuarioSelected: this.usuarioSelected,
      },
    });
    this.refModal.onClose.subscribe({
      next: (resp) => {
          this.refrescarTabla.emit();

      },
    });
  }
  onOptionActionBajaAdminDistrital() {
    this.bajaAsignarAdminDistrital();
  }

  //comunicamos al listener que se seleccionó la opcion baja de usuario
  onOptionActionBajaUs() {
    this.refModal = this.dialogService.open(HabilitarDeshabilitarUsuarioComponent, {
      // this.refModal = this.dialogService.open(DeshabilitarUsuarioComponent, {
      style: { 'min-width': '1100px' },
      showHeader: false,
      contentStyle: { overflow: 'auto' },
      data: {
        actionType: 'deshabilitar',
        ...this.usuarioSelected,
        idVUsuario: this.usuarioSelected.idUsuario,
      },
    });

    this.refModal.onClose.subscribe({
      next: (resp) => {
        if (resp === 'confirm') {
          this.refrescarTabla.emit();
        }
      },
    });
  }

  //comunicamos al listener que se seleccionó la opcion habilitar usuario
  onOptionActionHabilitarUs() {
    this.refModal = this.dialogService.open(HabilitarDeshabilitarUsuarioComponent, {
      // this.refModal = this.dialogService.open(HabilitarUsuarioModalComponent, {
      style: { 'min-width': '1100px' },
      showHeader: false,
      contentStyle: { overflow: 'auto' },
      data: {
        actionType: 'habilitar', // o 'deshabilitar'
        ...this.usuarioSelected,
        idVUsuario: this.usuarioSelected.idUsuario,
      },
    });

    this.refModal.onClose.subscribe({
      next: (resp) => {
        if (resp === 'confirm') {
          this.refrescarTabla.emit();
        }
      },
    });
  }

  //comunicamos al listener que se seleccionó la opcion bloquear usuario
  onOptionActionBloquearUs() {

    this.refModal = this.dialogService.open(BloquearUsuarioModalComponent, {
      style: { 'min-width': '1100px' },
      showHeader: false,
      contentStyle: { overflow: 'auto' },
      data: { ...this.usuarioSelected, idVUsuario: this.usuarioSelected.idUsuario },
    });

    this.refModal.onClose.subscribe({
      next: resp => {
        if (resp === 'confirm') {
          this.refrescarTabla.emit()
        }
      }
    });
  }

  //comunicamos al listener que se seleccionó la opcion desbloquer usuario
  onOptionActionDesbloquearUs() {
    this.refModal = this.dialogService.open(DesbloquearUsuarioModalComponent, {
      style: { 'min-width': '1100px' },
      showHeader: false,
      contentStyle: { overflow: 'auto' },
      data: { ...this.usuarioSelected, idVUsuario: this.usuarioSelected.idUsuario },
    });

    this.refModal.onClose.subscribe({
      next: resp => {
        if (resp === 'confirm') {
          this.refrescarTabla.emit()
        }
      }
    });

  }

  cargarVentanaResetearContrasena(): void {
    this.resetearContrasenaDialog = {
      ...this.usuarioSelected,
    };
    this.refModal = this.dialogService.open(ResetearContrasenaComponent, {
      width: '1180px',
      showHeader: false,
      data: this.resetearContrasenaDialog,
    });
  }
}
