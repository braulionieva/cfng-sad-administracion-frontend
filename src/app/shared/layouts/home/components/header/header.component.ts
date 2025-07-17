import { Component, ElementRef, HostListener, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple';
import { MegaMenuItem, MessageService } from 'primeng/api';
import { MegaMenuModule } from 'primeng/megamenu';
import { Router } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { ModalConfirmCloseComponent } from '@modulos/login-two/components/modal-confirm-close/modal-confirm-close.component';
import { Auth2Service } from '@services/auth/auth2.service';
import { HeaderTopComponent } from './header-top/header-top.component';
import { ComunDialogService } from '@services/dialog/comun-dialog.service';
import { CambiarContrasenaComponent } from '@modulos/seguridad-cuenta/cambiar-contrasena/cambiar-contrasena.component';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { ListarMisAplicacionesComponent } from '@modulos/sistemas/listar-mis-aplicaciones/listar-mis-aplicaciones.component';
import { UsuarioService } from '@services/usuario/usuario.service';
import { environment } from '@environments/environment';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    CommonModule,
    ButtonModule,
    RippleModule,
    MegaMenuModule,
    CambiarContrasenaComponent,
    HttpClientModule,
    ModalConfirmCloseComponent,
    HeaderTopComponent,
    ListarMisAplicacionesComponent,
  ],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  providers: [DialogService, DynamicDialogRef, MessageService],
})
export class HeaderComponent {
  items: MegaMenuItem[];
  showActions = false;

  logoutDialog: { isVisible: boolean };

  showModal = false;

  public usuarioSesion: any;

  // Añadir estas propiedades a la clase
  public userImage: string | null = null;

  constructor(
    private readonly router: Router,
    public readonly messageService: MessageService,
    private readonly userService: Auth2Service,
    private dialogComunService: ComunDialogService,
    private readonly usuarioService: UsuarioService
  ) {
    this.logoutDialog = {
      isVisible: false,
    };
  }

  ngOnInit(): void {
    this.usuarioSesion = this.userService.getUserInfo();
    this.loadPhotoUser();
  }

  @ViewChild('selectUser') selectUser: ElementRef;
  @HostListener('document:click', ['$event'])
  closeSelect(event: MouseEvent) {
    if (
      this.selectUser &&
      !this.selectUser.nativeElement.contains(event.target)
    ) {
      this.showActions = false;
    }
  }

  logOut() {
    // sessionStorage.removeItem('access_token');
    sessionStorage.clear();
    this.showModal = false;
    // this.router.navigateByUrl('auth');
    window.location.href = environment.DOMAIN_HOME;
    // 'http://cfng-home-development.apps.dev.ocp4.cfe.mpfn.gob.pe/auth/login';
  }

  getOperatingSystem(): string {
    const userAgent = window.navigator.userAgent;
    let os = 'Unknown OS';
    let version = '';

    // Detectar Windows 11
    // if (
    //   /Windows NT 10.0; Win64; x64/.test(userAgent) &&
    //   /Chrome\/(\d+)/.test(userAgent)
    // ) {
    //   const chromeVersion = parseInt(RegExp.$1, 10);
    //   if (chromeVersion >= 96) {
    //     // Chrome 96+ se lanzó con Win11
    //     return 'Windows 11';
    //   }
    // }

    if (/Windows NT/.test(userAgent)) {
      os = 'Windows';
      const versionMatch = /Windows NT (\d+\.\d+)/.exec(userAgent);
      if (versionMatch) {
        const versionMap: { [key: string]: string } = {
          '10.0': '10',
          '6.3': '8.1',
          '6.2': '8',
          '6.1': '7',
          '6.0': 'Vista',
          '5.1': 'XP',
          '5.0': '2000',
        };
        version = versionMap[versionMatch[1]] || versionMatch[1];
      }
    } else if (/Macintosh|Mac OS X/.test(userAgent)) {
      os = 'MacOS';
      const versionMatch = /Mac OS X (\d+[_\.]\d+[_\.]?\d*)/.exec(userAgent);
      if (versionMatch) {
        version = versionMatch[1].replace(/_/g, '.');
      }
    } else if (/Android/.test(userAgent)) {
      os = 'Android';
      const versionMatch = /Android (\d+(\.\d+)?)/.exec(userAgent);
      if (versionMatch) {
        version = versionMatch[1];
      }
    } else if (/iPhone|iPad|iPod/.test(userAgent)) {
      os = 'iOS';
      const versionMatch = /OS (\d+_\d+(_\d+)?)/.exec(userAgent);
      if (versionMatch) {
        version = versionMatch[1].replace(/_/g, '.');
      }
    } else if (/Linux/.test(userAgent)) {
      os = 'Linux';
      // No es común obtener una versión específica de Linux del userAgent
    } else if (/X11/.test(userAgent)) {
      os = 'UNIX';
      // Generalmente no se incluye una versión para UNIX
    }

    return `${os} ${version}`.trim();
  }

  redirecionarSeguridad() {
    const infoUsuario = this.userService.getUserInfo();

    const params = {
      usuario: infoUsuario.usuario,
      tipoModal: 'cambiarContrasena',
    };

    this.dialogComunService.showDialog(params);
  }

  redirecionarCuenta() {
    this.router.navigate(['/app/seguridad-cuenta']);
  }

  redirecionarSistemas() {
    this.router.navigate(['/app/listar-mis-aplicaciones']);
  }

  loadPhotoUser() {
    const coVUsername = this.usuarioSesion.usuario.usuario;

    this.usuarioService.obtenerFotoXCousername(coVUsername).subscribe({
      next: (response: any) => {
        // Validar el código de respuesta
        if (response.responseMessageDTO.code === '0') {
          // Si el código es 0, significa que hay una imagen
          this.userImage = `data:image/png;base64,${response.logo}`;
        } else if (response.responseMessageDTO.code === '-4') {
          // Si el código es -4, no hay imagen
          this.userImage = null;
        }
      },
      error: (err) => {
        console.error(
          'loadPhotoUser Error al cargar la imagen del usuario: ',
          err
        );
        this.userImage = null;
      },
    });
  }
}
