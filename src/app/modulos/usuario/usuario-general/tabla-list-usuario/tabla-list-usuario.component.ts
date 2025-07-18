import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { UsuarioComplete, UsuarioRow } from '@interfaces/agregar-dependencia-us/agregar-dependencia-us';
import { MenuItem, MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { DynamicDialogRef, DynamicDialogConfig, DynamicDialogModule, DialogService } from 'primeng/dynamicdialog';
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
    DynamicDialogModule,
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
  usuarioFiltro: UsuarioComplete;
  administradorDistrital: boolean;
  actionItemsMenu: MenuItem[];

  resetearContrasenaDialog: any;

  public tareaAdminDistrital: any = '';
  imgDefault: string = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAKMAAAClCAYAAAAwNU2dAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAwZSURBVHhe7Z1bdhS9DkbhTAnegcnAMIBhwGSA9zAm/v6aFqdSqYv9SbIll/daXuksQsdlb0u+VKpf/7nxajIJwP8eXyeT7kwZJ2GYaXqDnz9/vvr169fju798+fLl8aqO9f/7/Pnz49VkzeVl/Pr16/0rBERpiYj67t27V+/fv7+/vjKXk1HkYyOdN1KvK0bQ4WWUlNsj8mlBtES5iphDyigCRo1+DFcQcygZkYIzRsBahhUTMmbnFgExoC5ZcO2jkFbGHz9+/LlFh80OumKBlGiTzKSTcUp4XNA2WaVMI+OUsK6grbKRQsYrzwm1JdOcMvRqGqviDx8+PL6baLhllvsKPDIhZYSEsk3Tm48fPz5e/Z83b97cyxa/f/++lzXfv39/vOoHZISUUQknIyS8pZbHd+1YCrYloCUi5p643kSNkmFkbB0NRb6lhL0QKVvKGTFKhpCx1dxQxPOOfFoQOVuJGSlKdpcREnpGwywC7tFCTEyLIhwtdpXRU0TIJyKOgAjptRCKkLa7yOiZliFh1ihYCoT0kBJCIkL2StvNZfQS8QoSrvGSstc8sqmMHiJeUcI1HlL2ELKZjNbzQ8wFv3379vhuAj59+mS60GktZBMZLUWUlfEoCxNrZJFjJWVLId1ltBRxpuRyLFN3KyFdZbQScUZDDkRHpG4LWgjp9kQJq6M9mRtOEetBmz09PZm0nfWcfwuXyIhKo/JapoR2WKVtzwhpLuMUMS5WadtLSFMZLUSEgHN+6IfVattDSFMZX79+/XjFAQHn3mEbtHuSEBFCWmK2gLGIiFPEdminQVbTsSUmMmpXzlPEPlgIib63Qp2mtSNkitgfbcq2mj+qZdTME6eIcdAIaTV/VKXpGRHHQZOyreaPdGTUVGCKGJe3b98+XtWjTde0jJr0rBmFkVifaIxwEwdStWZjXDPro2RERGRXz9lEROcsSw24zmXJgkZIzR93VcuoSc9ZbgGTE4pa+c4QKbO0AXuWzabrahnZqIhOiDxPhHgWx2SliJSRIya7wmZX11Uyah49gluZIqKJABZEjpYQkU3XTHSskpFdtEScJ7aOhGdEjZQaISuTbvk+I3vsIyM/EmhcNgV5IZ3OdrwXmv6rdaY4MrJRMVJ61ozy1kTLJuz+Y010LIqMbFSMtGCJGHWOiFZfdk5b405RZGSiIkZ1FBnRqZFScg0jtGNpdDyNjGxUjLA6lLScVUQQaWrhHR1PI2PWqBipE62IMI/0jI6HkTFzVBxNRNBzP1Rg+7bkoORQRvakJcLo9QAb/ijY0MVI3yr4N/k5ayJEe7Z/SwLbbppmz6B7pxI2jewBqTQfTo52tP6EV7Rvz2kQOyh2VPvHbmREA9bCjhorrE5U5GwVjad9eCb+L94D7wUhNe8l4BojHGHWchYddyMjs3DpGRWtUhiE8X6+NTrFIlJmbO+j6LgZGTPOFbWRAhFLIqE3Eim1UTJjdDxya1NGNkX3QpueEaWYW560yGKHJUK6ruXIrc00zaTonmfQPf9uwwJ2sShka/u9VP0iMjIpuue+omaeGEFEgDpoInPP6Mj0/Z5jL2TMlKKRptj0HEVEQSPkKKn6hYzMHKanjAzo+EgiCpp69RKS6fviyFhLzxTNdIAmArWAjdiZUnWRjMxZdK+oyDZ+i60bLWwdewpZy5Zr6siYKUVr0mBL2Hqy0xYtVtnxmYy188VeIgKm4SOn5zVMXXvJCGpd2ErVqsiYKUVbHL+1hqlzr1RtKuPepPKITCkad95kI1OdGRfWzv2TMdv+Yg1Z5oprmDpniYxg7Zx6AZOBjCIKGacXLHSa7rW/yIz8jClaYOqeZVW9m6aZOWMWMkdGpu49V9U17Mo4mfSGlrHnMWANI8y5slyD1om7jMwxYC+ypKBJGctUnS5NTxnPydRGy+2dOWcckKwDlpKx12b3pIys/ZNOxjkQzunZRppFTLo0PWUcl+HnjCNs5l/lSHDKOAnD8DKCzEIydb/UAqYnzASZuT0uCplu7dMyI2NwrjTNSCkjc6tSxk5l6p3lnoEtLhEZQcZUnXl6wXCJyAgybo8wde4dGTVHkZSMEf5YnJmkZ7o7iXkqWYSFS3MZI8A0PCJNhrkjO8fNuooW0srIpqMM0ZGtY+bFC7jLmPUPlpjGR8TRPJjTG/bD5bOKuHyu0F3GrH/0w6YlNg16o6lXBBm1awk6TUeRkRWSjUBeoC5sxM6enoW0c0ZB8+E8UYTUiAiGk7F2TyvSre2azoAEPRc1+N2jiFibptfOpU7TAjpEs62BRtEIwYLfyWxsC7jmUaIiUKXpUaIjQKrER460SNtWvyuSiIwL612cfzIyj+6NJKNVlEC0QvGQEu8p769Fmw2sYVxY7+IMExmBVQeJNIheFvNJvAfey0ryiOnZwoVnn5DFNFbPT2faw/pjfgWZ351lERFYMx/cAyL2/HjfPWo/KQtts27HZ5FxlCdeeXUWGhAFUe6oyM9ZE1VEKweeyZjpWYBnROw0DVFFBIwDW9nlxQdZYmTXEjFVAzQS9r6iDphSIosIrD7M8sUChkkvUTtbOhFfsxJdRKbv9xxTraaF6JEn2sqzhuh1t+z7IT5veg+k6Ah3pVsAKSOK6fp50yD7qhoCopFGERFEvCamz4/cMpMxQiONKOGaSNfI1OHIrc00DTKlaoxQNEz0uas1WNwgdfdYoKGtcbhQy16KBrsLmCzREQ3ideISHRGCkUIL095nTu1GRjmfraVVdGRH5si03MZiFi5nH+y+KyNgUnWLVd9VI2EJLfYlkQGZLHiUosGhjDjwZzbBvaJjz2iIEV07dUF2sbhLh8EzSjJRER6d3WByKCOIEh1biigDEGf1zNx5C0gpz85hBjiDh5BeURGcyshGR8uG8E7LEvUs5TtD5PSOnpZpmw0IJVERnMqIhmIWMlaN4CliaSO1gB30JfTui7OFi3B6Ni1RoxZUWiuRh4i4FjQOxmAUEQHqgjqVdlwNaEMmoi1h+7PGn6IbJdhO0+w7WosoEnp0tiVe9dQKyf7fGneKZESjMA2DBmCEtBTRq3O98ag3KyQbVFDvmroXyQg00bFGLEsRMQfLJuEakdJqPlkrJH6elbHWmWIZ0Shsg5RejJWIqGu0OaEWXAuuyWJg1QjJighXaut6uppew+w7grMVnZWI2SNhCVYrb88+qdTqTnFkFNhGwEXtXVhtKt8CAl5BRIAoaXGtR31y9G9n0AMFkbGWWyNAe6rcRuKfp6enfwXfb/1cTUF9roqmL6RY9ommLygZb6NysyIl5ZYanl341s/UlCuLKFgIadUncIOFkhHcQvFmZUqKCImvW/9eWlCHyV+0Qlr0ibY/aBmBxYhki2YEjoomY2mLRYZSydjr4qeI+/QKEBZ9opIRaNI1UyxG4Oi0FtJquqSWEbS6+CliORn7pHrTew92M7yU20Xf99Ym5Vg9D/III33uVG967+EtyhSxHu/jUPM+QWS0ApNYvKV1wftOODL1iamMwHquMueJeqz7xGt/12zOuMRyruJQvUtiNaf3nLubzRmXoLKotAXyfOwJj1Ubeop4B5HRC6v0gPeZcGTqA1cZgVVjoHhMmkcFbbXVhkxpFQzcZQSWQrZqmMxkbe8mMgLLBkKZd+y8xPpotvXAbyYjsBYS7zdT99+U7NG2rWkqI7BuNJSrSukhIUoPEUFzGYHXnT5XkdJLQpSe058uMgI06FZjWJRRpfSUEKV3m3WTEXg3LsoICx2vTCIlyuDtKqPgLSQKfkcmMVHXVu0SBZezaQb20XsMtw64l5bPYzwD19/ieY1LbtEwzPXfuSsZhBZpe6vgdyIStUxV+F2tot+64HdGSMtrwkTGJZ4PziwFEQNFYG9UXd6k0DLq7YF2jfoMopAyCi1um78KGFhIy5FxuYXMCjQeyjJCTeoQCaOLeAeRMQOYX6G6s5QXtFkm0sgoTCnPSzYJhXQyClPKlyWrhEJaGYUp5RinTCC9jMJtgt5lz65XwbXimkci9NYOC/b2IuzpWYOVMUrUfUItQ8ooQMbWR2zWjC7gkqFlXCOnIbc51v1rVKR+VxBwyaVkXBNFzqvKt+bSMm6xPEu2lnT5flcXb4spI8FS2C2maBxTxkkYQt8oMbkSr179B/Qk77/Qts7ZAAAAAElFTkSuQmCC';
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
  getSeverityAdminDistrital(admin: string): string {
    if (admin === '0') {
      return 'danger';
    }
    return 'success';
  }
  getSeverityBloqueado(usuario: string): string {
    switch (usuario) {
      case 'SI':
        return 'danger';
      case 'NO':
        return 'success';
      default:
        return 'warning';
    }
  }
  getSeverityEstado(estado: string): string {
    switch (estado) {
      case 'activo':
        return 'success';
      case 'inactivo':
        return 'danger';
      default:
        return 'warning';
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
