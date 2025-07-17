import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { InputSwitchModule } from 'primeng/inputswitch';
import { CambiarContrasenaComponent } from './cambiar-contrasena/cambiar-contrasena.component';
import { ComunDialogService } from '@services/dialog/comun-dialog.service';
import { DialogModule } from 'primeng/dialog';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { MessageService } from 'primeng/api';
import {
  ISegActiveEmailSesion,
  ISegActiveEmailSesionRequest,
  ISegEmailStatusValidate,
  ISegEmailStatusValidateRequest,
  ISegFecha,
  ISegFechaRequest,
  ISegListStates2FA,
  ISegListStates2FARequest,
  ISegLoginEmails,
  ISegLoginEmailsRequest,
} from '@interfaces/seguridad-cuenta/seguridad-cuenta';
import UAParser from 'ua-parser-js';
import { SeguridadCuentaService } from '@services/seguridad-cuenta/seguridad-cuenta.service';
import { Auth2Service } from '@services/auth/auth2.service';
import { HistorialCambiosContrasenaComponent } from './historial-cambios-contrasena/historial-cambios-contrasena.component';
import { parse, addMonths, format } from 'date-fns';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ValidacionCorreoComponent } from './validacion-correo/validacion-correo.component';
import { AlertModalComponent } from '@components/alert-modal/alert-modal.component';
import { HistorialValidacionCorreoComponent } from './historial-validacion-correo/historial-validacion-correo.component';
import { EstadoAutenticacionDobleFactorComponent } from './estado-autenticacion-doble-factor/estado-autenticacion-doble-factor.component';
import { HistorialEstadosDobleFactorComponent } from './historial-estados-doble-factor/historial-estados-doble-factor.component';

@Component({
  selector: 'app-seguridad-cuenta',
  standalone: true,
  imports: [
    CommonModule,
    ButtonModule,
    InputSwitchModule,
    CambiarContrasenaComponent,
    HistorialCambiosContrasenaComponent,
    DialogModule,
    FormsModule,
    ReactiveFormsModule,
    ValidacionCorreoComponent,
    HistorialValidacionCorreoComponent,
    EstadoAutenticacionDobleFactorComponent,
    HistorialEstadosDobleFactorComponent,
  ],
  templateUrl: './seguridad-cuenta.component.html',
  styleUrls: ['./seguridad-cuenta.component.scss'],
  providers: [DialogService, DynamicDialogRef, MessageService],
})
export class SeguridadCuentaComponent implements OnInit {
  public infoUsuario;

  public fecha: string;
  public fechaNueva: string;

  public navegador: string;
  public tipoDispositivo: string;
  public nombreSO: string;
  public versionSO: string;

  public refModal: DynamicDialogRef;

  public correoPersonal: string;
  public correoInstitucional: string;

  public correoPersonalValidado: boolean;
  public correoInstitucionalValidado: boolean;

  public correoPersonalSwitch = new FormControl(false);
  public correoInstitucionalSwitch = new FormControl(false);
  public estado2FASwitch = new FormControl(false);

  public metodos2FA: Array<any>;
  public metodo2FAGoogleAuth = { idMetodo: null, estadoMetodo: null };
  public metodo2FACorreoPersonal = { idMetodo: null, estadoMetodo: null };
  public metodo2FACorreoInstitucional = { idMetodo: null, estadoMetodo: null };

  constructor(
    private seguridadCuentaService: SeguridadCuentaService,
    private dialogComunService: ComunDialogService,
    private userService: Auth2Service,
    private dialogService: DialogService
  ) {
    const parser = new UAParser();
    const resultado = parser.getResult();
    this.navegador = resultado.browser.name;
    this.tipoDispositivo = resultado.device.type || 'desktop';
    this.nombreSO = resultado.os.name;
    this.versionSO = resultado.os.version;
  }

  ngOnInit(): void {
    this.infoUsuario = this.userService.getUserInfo();

    if (this.infoUsuario) {
      this.obtenerFecha();
      this.inciarSesionCorreos();
      this.correoEstadoValidado('personal');
      this.correoEstadoValidado('institucional');
      this.obtenerListaEstadosMetodos2FA();
    }
  }

  private obtenerFecha(): void {
    const datosSolicitud: ISegFechaRequest = {
      codigoUserName: this.infoUsuario?.usuario.usuario,
    };
    this.seguridadCuentaService.getFecha(datosSolicitud).subscribe({
      next: (res: ISegFecha[]) => {
        this.fecha = res[0].fecha;

        const fechaCadena = this.fecha; //'2024-05-27 16:21:56.0';
        const formato = 'yyyy-MM-dd HH:mm:ss.S';
        const fechaObjeto = parse(fechaCadena, formato, new Date());

        const nuevaFechaObjeto = addMonths(fechaObjeto, 3);
        this.fechaNueva = format(nuevaFechaObjeto, formato);
      },
      error: (err) => {
        console.error('Error en la solicitud [getFecha]: ', err);
      },
    });
  }

  public obtenerListaEstadosMetodos2FA(): void {
    const datosSolicitud: ISegListStates2FARequest = {
      codigoUserName: this.infoUsuario?.usuario.usuario,
    };
    this.seguridadCuentaService.getEstadosMetodos2FA(datosSolicitud).subscribe({
      next: (res: ISegListStates2FA[]) => {
        if (res?.length <= 0) return;
        // moldeando metodos
        this.metodos2FA = res.map((metodo: any) => {
          return {
            idMetodo: metodo?.codMetodo ? metodo.codMetodo : null,
            nombreMetodo: metodo?.nombreMetodo
              ? metodo.nombreMetodo.toLowerCase()
              : '',
            estadoMetodo:
              metodo?.estadoMetodo && metodo?.estadoMetodo === '1'
                ? true
                : false,
            idUsuarioMetodo: metodo?.idUsuarioMetodo
              ? metodo?.idUsuarioMetodo
              : null,
          };
        });
        // asignacion de metodos
        this.metodo2FAGoogleAuth = this.metodos2FA.find((metodo: any) =>
          metodo.nombreMetodo.includes('google')
        );
        this.metodo2FACorreoPersonal = this.metodos2FA.find((metodo: any) =>
          metodo.nombreMetodo.includes('personal')
        );
        this.metodo2FACorreoInstitucional = this.metodos2FA.find(
          (metodo: any) => metodo.nombreMetodo.includes('institucional')
        );

        this.verificarEstadosMetodos2FA();
      },
    });
  }

  //refactorizado
  public correoEstadoValidado(tipoCorreo: 'personal' | 'institucional'): void {
    const datosSolicitud = this.crearDatosSolicitudCorreo(tipoCorreo);

    this.seguridadCuentaService.correoEstadoValidado(datosSolicitud).subscribe({
      next: (res: ISegEmailStatusValidate) => {
        this.actualizarEstadoCorreo(tipoCorreo, res);
      },
    });
  }

  private crearDatosSolicitudCorreo(
    tipoCorreo: 'personal' | 'institucional'
  ): ISegEmailStatusValidateRequest {
    return {
      codigoUserName: this.infoUsuario?.usuario.usuario,
      correoValidar: tipoCorreo === 'personal' ? '@gmail.com' : '@mpfn.gob.pe',
    };
  }

  private actualizarEstadoCorreo(
    tipoCorreo: 'personal' | 'institucional',
    res: ISegEmailStatusValidate
  ): void {
    if (tipoCorreo === 'personal') {
      this.actualizarCorreoPersonal(res);
    } else {
      this.actualizarCorreoInstitucional(res);
    }
  }

  private actualizarCorreoPersonal(res: ISegEmailStatusValidate): void {
    this.correoPersonal = res.correo;
    this.correoPersonalValidado = res.estadoValidacion === '1';
    this.toggleSwitch(this.correoPersonalSwitch, this.correoPersonalValidado);
  }

  private actualizarCorreoInstitucional(res: ISegEmailStatusValidate): void {
    this.correoInstitucional = res.correo;
    this.correoInstitucionalValidado = res.estadoValidacion === '1';
    this.toggleSwitch(
      this.correoInstitucionalSwitch,
      this.correoInstitucionalValidado
    );
  }

  private toggleSwitch(switchControl: any, isEnabled: boolean): void {
    isEnabled ? switchControl.enable() : switchControl.disable();
  }
  //

  /**public correoEstadoValidado(tipoCorreo: 'personal' | 'institucional'): void {
    const datosSolicitud: ISegEmailStatusValidateRequest = {
      codigoUserName: this.infoUsuario?.usuario.usuario,
      correoValidar:
        tipoCorreo === 'personal'
          ? '@gmail.com'
          : tipoCorreo === 'institucional'
          ? '@mpfn.gob.pe'
          : '',
    };
    this.seguridadCuentaService.correoEstadoValidado(datosSolicitud).subscribe({
      next: (res: ISegEmailStatusValidate) => {
        if (tipoCorreo === 'personal') {
          this.correoPersonal = res.correo;
          if (res.estadoValidacion === '1') {
            this.correoPersonalValidado = true;
            this.correoPersonalSwitch.enable();
          }
          if (res.estadoValidacion === '0') {
            this.correoPersonalValidado = false;
            this.correoPersonalSwitch.disable();
          }
        }
        if (tipoCorreo === 'institucional') {
          this.correoInstitucional = res.correo;
          if (res.estadoValidacion === '1') {
            this.correoInstitucionalValidado = true;
            this.correoInstitucionalSwitch.enable();
          }
          if (res.estadoValidacion === '0') {
            this.correoInstitucionalValidado = false;
            this.correoInstitucionalSwitch.disable();
          }
        }
      },
    });
  }**/

  private inciarSesionCorreos(): void {
    const datosSolicitud: ISegLoginEmailsRequest = {
      codigoUserName: this.infoUsuario?.usuario.usuario,
    };
    this.seguridadCuentaService.inciarSesionCorreos(datosSolicitud).subscribe({
      next: (res: ISegLoginEmails) => {
        this.correoPersonalSwitch.setValue(
          res.correoPersonal === 'SI' ? true : false
        );
        this.correoInstitucionalSwitch.setValue(
          res.correoInstitucional === 'SI' ? true : false
        );
      },
      error: (err) => {
        console.error('Error en la solicitud [inciarSesionCorreos]: ', err);
      },
    });
  }

  private modalLoginWithGoogle(tipoCorreo: 'personal' | 'institucional') {
    this.refModal = this.dialogService.open(AlertModalComponent, {
      width: '600px',
      showHeader: false,
      data: {
        icon: 'question',
        confirm: true,
        title: 'INICIAR SESIÓN CON GOOGLE',
        description:
          'A continuación, se procederá a activar el inicio de sesión con Google. ¿Está seguro de realizar esta acción?',
        confirmButtonText: 'Aceptar',
        cancelButtonText: 'Cancelar',
      },
    });
    this.refModal.onClose.subscribe((result) => {
      if (result === 'confirm') {
        this.activarSesionCorreo(tipoCorreo);
      }
    });
  }

  //refactorizado
  private activarSesionCorreo(tipoCorreo: 'personal' | 'institucional'): void {
    const datosSolicitud = this.crearDatosSolicitud(tipoCorreo);

    this.seguridadCuentaService.activarSesionCorreo(datosSolicitud).subscribe({
      next: (res: ISegActiveEmailSesion) => {
        this.actualizarEstadoCorreoo(tipoCorreo, res);
        this.mostrarModalExito();
      },
      error: (err) => this.manejarError(err),
    });
  }

  private crearDatosSolicitud(
    tipoCorreo: 'personal' | 'institucional'
  ): ISegActiveEmailSesionRequest {
    return {
      codigoUserName: this.infoUsuario?.usuario.usuario,
      correoValidar:
        tipoCorreo === 'personal'
          ? this.correoPersonal
          : this.correoInstitucional,
      tipoCorreo: tipoCorreo === 'personal' ? '2' : '1',
    };
  }

  private actualizarEstadoCorreoo(
    tipoCorreo: 'personal' | 'institucional',
    res: ISegActiveEmailSesion
  ): void {
    const estadoActivado = res.activado === 'SI';
    if (tipoCorreo === 'personal') {
      this.correoPersonalSwitch.setValue(estadoActivado);
    } else {
      this.correoInstitucionalSwitch.setValue(estadoActivado);
    }
  }

  private mostrarModalExito(): void {
    this.refModal = this.dialogService.open(AlertModalComponent, {
      width: '600px',
      showHeader: false,
      data: {
        icon: 'success',
        title: 'ACTIVACIÓN REALIZADA CORRECTAMENTE',
        description:
          'La activación del inicio de sesión con Google se realizó de forma exitosa.',
        confirmButtonText: 'Listo',
      },
    });
  }

  private manejarError(err: any): void {
    console.error('Error en la solicitud [activarSesionCorreo]: ', err);
  }
  //

  /**private activarSesionCorreo(tipoCorreo: 'personal' | 'institucional'): void {
    const datosSolicitud: ISegActiveEmailSesionRequest = {
      codigoUserName: this.infoUsuario?.usuario.usuario,
      correoValidar:
        tipoCorreo === 'personal'
          ? this.correoPersonal
          : tipoCorreo === 'institucional'
          ? this.correoInstitucional
          : null,
      tipoCorreo:
        tipoCorreo === 'personal'
          ? '2'
          : tipoCorreo === 'institucional'
          ? '1'
          : null,
    };
    this.seguridadCuentaService.activarSesionCorreo(datosSolicitud).subscribe({
      next: (res: ISegActiveEmailSesion) => {
        if (tipoCorreo === 'personal') {
          this.correoPersonalSwitch.setValue(
            res.activado === 'SI' ? true : res.activado === 'NO' ? false : false
          );
        }
        if (tipoCorreo === 'institucional') {
          this.correoInstitucionalSwitch.setValue(
            res.activado === 'SI' ? true : res.activado === 'NO' ? false : false
          );
        }
        this.refModal = this.dialogService.open(AlertModalComponent, {
          width: '600px',
          showHeader: false,
          data: {
            icon: 'success',
            title: 'ACTIVACIÓN REALIZADA CORRECTAMENTE',
            description:
              'La activación del inicio de sesión con Google, se realizó de forma exitosa.',
            confirmButtonText: 'Listo',
          },
        });
      },
      error: (err) => {
        console.error('Error en la solicitud [activarSesionCorreo]: ', err);
      },
    });
  }**/

  private verificarEstadosMetodos2FA(): void {
    if (
      this.metodo2FAGoogleAuth.estadoMetodo === true ||
      this.metodo2FACorreoPersonal.estadoMetodo === true ||
      this.metodo2FACorreoInstitucional.estadoMetodo === true
    ) {
      this.estado2FASwitch.setValue(true);
    } else this.estado2FASwitch.setValue(false);
  }

  public onCambiarEstadoCorreoPersonalSwitch(event: any) {
    this.correoPersonalSwitch.setValue(!event.checked); // previniendo cambio de estado
    this.modalLoginWithGoogle('personal');
  }

  public onCambiarEstadoCorreoInstitucionalSwitch(event: any) {
    this.correoInstitucionalSwitch.setValue(!event.checked); // previniendo cambio de estado
    this.modalLoginWithGoogle('institucional');
  }

  public onCambiarEstado2FASwitch(event: any) {
    this.estado2FASwitch.setValue(!event.checked); // previniendo cambio de estado
    this.onOpenModalEstado2FA();
  }

  public onOpenModalCambiarContrasena(): void {
    const params = {
      usuario: this.infoUsuario.usuario,
      tipoModal: 'cambiarContrasena',
    };

    this.dialogComunService.showDialog(params);
  }

  public onOpenModalHistorialContrasena(): void {
    const params = {
      usuario: this.infoUsuario.usuario,
      tipoModal: 'historialContrasena',
    };
    this.dialogComunService.showDialog(params);
  }

  public onOpenModalValidacionCorreo(
    tipoCorreo: 'personal' | 'institucional'
  ): void {
    let correo: string | null = null;

    if (tipoCorreo === 'personal') {
      correo = this.correoPersonal;
    } else if (tipoCorreo === 'institucional') {
      correo = this.correoInstitucional;
    }

    const params = {
      usuario: this.infoUsuario.usuario,
      tipoModal: 'validacion-correo',
      /**correoData: {
        tipoCorreo,
        correo:
          tipoCorreo === 'personal'
            ? this.correoPersonal
            : tipoCorreo === 'institucional'
            ? this.correoInstitucional
            : null,
      },**/

      correoData: {
        tipoCorreo,
        correo,
      },

      informacionDispositivo: {
        navegador: this.navegador,
        tipoDispositivo: this.tipoDispositivo,
        nombreSO: this.nombreSO,
        versionSO: this.versionSO,
      },
    };
    this.dialogComunService.showDialog(params);
  }

  public onOpenModalHistorialValidacionCorreo(
    tipoCorreo: 'personal' | 'institucional'
  ): void {
    let correo: string | null = null;

    if (tipoCorreo === 'personal') {
      correo = this.correoPersonal;
    } else if (tipoCorreo === 'institucional') {
      correo = this.correoInstitucional;
    }

    const params = {
      usuario: this.infoUsuario.usuario,
      tipoModal: 'historialValidacionCorreo',
      /**correoData: {
        tipoCorreo,
        correo:
          tipoCorreo === 'personal'
            ? this.correoPersonal
            : tipoCorreo === 'institucional'
              ? this.correoInstitucional
              : null,
      },**/
      correoData: {
        tipoCorreo,
        correo,
      },
    };
    this.dialogComunService.showDialog(params);
  }

  private onOpenModalEstado2FA(): void {
    const params = {
      usuario: this.infoUsuario.usuario,
      tipoModal: 'estadoAuthDobleFactor',
      correoData: {
        correo_personal: this.correoPersonal,
        correo_institucional: this.correoInstitucional,
      },
      metodo2FAGoogleAuth: this.metodo2FAGoogleAuth,
      metodo2FACorreoPersonal: this.metodo2FACorreoPersonal,
      metodo2FACorreoInstitucional: this.metodo2FACorreoInstitucional,
      informacionDispositivo: {
        navegador: this.navegador,
        tipoDispositivo: this.tipoDispositivo,
        nombreSO: this.nombreSO,
        versionSO: this.versionSO,
      },
    };
    this.dialogComunService.showDialog(params);
  }

  public onOpenModalHistorialEstados2FA(): void {
    const metodosDropdown = this.metodos2FA.map((metodo: any) => {
      return {
        name: metodo.nombreMetodo.toUpperCase(),
        value: metodo.idMetodo,
      };
    });
    const params = {
      usuario: this.infoUsuario.usuario,
      tipoModal: 'historialEstados2FA',
      metodosDropdown,
    };
    this.dialogComunService.showDialog(params);
  }
}
