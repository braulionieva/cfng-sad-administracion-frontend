import { Component, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { MessageService } from 'primeng/api';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { Subscription } from 'rxjs';
import { ComunDialogService } from '@services/dialog/comun-dialog.service';
import { AccionCorreoComponent } from './accion-correo/accion-correo.component';
import { InputSwitchModule } from 'primeng/inputswitch';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AccionGoogleComponent } from './accion-google/accion-google.component';
import { ToastModule } from 'primeng/toast';
import { SeguridadCuentaComponent } from '../seguridad-cuenta.component';

@Component({
  selector: 'app-estado-autenticacion-doble-factor',
  standalone: true,
  imports: [
    CommonModule,
    ButtonModule,
    DialogModule,
    FormsModule,
    ReactiveFormsModule,
    AccionGoogleComponent,
    AccionCorreoComponent,
    InputSwitchModule,
    ToastModule,
  ],
  templateUrl: './estado-autenticacion-doble-factor.component.html',
  styleUrls: ['../seguridad-cuenta.component.scss'],
  providers: [MessageService, DynamicDialogRef],
})
export class EstadoAutenticacionDobleFactorComponent
  implements OnInit, OnChanges
{
  private suscripcionMostrarDialogo: Subscription;
  private suscripcionOcultarDialogo: Subscription;
  public visible: boolean;
  public usuarioActual;
  public informacionDispositivo;

  public accionTitulo: string;

  public correoPersonal: string;
  public correoInstitucional: string;

  public mostrarSeccionGoogleAuth: boolean;
  public mostrarSeccionCorreoPersonal: boolean;
  public mostrarSeccionCorreoInstitucional: boolean;

  public metodoGoogleAuth = {
    idMetodo: null,
    estadoMetodo: false,
    idUsuarioMetodo: null,
  };
  public metodoCorreoPersonal = {
    idMetodo: null,
    estadoMetodo: false,
    idUsuarioMetodo: null,
  };
  public metodoCorreoInstitucional = {
    idMetodo: null,
    estadoMetodo: false,
    idUsuarioMetodo: null,
  };

  public googleAuthSwitch = new FormControl(false);
  public correoPersonalSwitch = new FormControl(false);
  public correoInstitucionalSwitch = new FormControl(false);

  constructor(
    private messageService: MessageService,
    private dialogService: DialogService,
    public dialogComunService: ComunDialogService,
    private seguridadCuentaComponent: SeguridadCuentaComponent
  ) {
    this.suscribirMostrarDialogo();
    this.suscribirOcultarDialogo();
  }

  ngOnInit(): void {
    this.verificarSeccionActiva();
  }

  cierraAddAppModal() {
    this.closeModal();
  }

  protected closeModal() {
    this.visible = false;
  }

  public icon(name: string): string {
    return `assets/icons/${name}.svg`;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (
      changes['mostrarSeccionGoogleAuth'] ||
      changes['mostrarSeccionCorreoPersonal'] ||
      changes['mostrarSeccionCorreoInstitucional']
    ) {
      this.verificarSeccionActiva();
    }
  }

  private suscribirMostrarDialogo() {
    this.suscripcionMostrarDialogo =
      this.dialogComunService.showDialog$.subscribe((params) => {
        if (!params || params.tipoModal !== 'estadoAuthDobleFactor') return;
        this.visible = true;
        this.usuarioActual = params.usuario;
        this.correoPersonal = params.correoData.correo_personal;
        this.correoInstitucional = params.correoData.correo_institucional;

        this.metodoGoogleAuth = params.metodo2FAGoogleAuth;
        this.metodoCorreoPersonal = params.metodo2FACorreoPersonal;
        this.metodoCorreoInstitucional = params.metodo2FACorreoInstitucional;
        this.informacionDispositivo = params.informacionDispositivo;

        this.verificarEstadosMetodos();
        this.accionTituloGenerado();
      });
  }

  private suscribirOcultarDialogo() {
    this.suscripcionOcultarDialogo =
      this.dialogComunService.hideDialog$.subscribe(() => {
        this.visible = false;
      });
  }

  public verificarSeccionActiva(): boolean {
    if (
      this.mostrarSeccionGoogleAuth === true ||
      this.mostrarSeccionCorreoPersonal === true ||
      this.mostrarSeccionCorreoInstitucional === true
    ) {
      return true;
    }
    return false;
  }

  private verificarEstadosMetodos() {
    this.metodoGoogleAuth.estadoMetodo === true
      ? this.googleAuthSwitch.setValue(true)
      : this.googleAuthSwitch.setValue(false);
    this.metodoCorreoPersonal.estadoMetodo === true
      ? this.correoPersonalSwitch.setValue(true)
      : this.correoPersonalSwitch.setValue(false);
    this.metodoCorreoInstitucional.estadoMetodo === true
      ? this.correoInstitucionalSwitch.setValue(true)
      : this.correoInstitucionalSwitch.setValue(false);
  }

  /**public accionTituloGenerado(estado?: boolean): void {
    if (!this.verificarSeccionActiva()) {
      this.accionTitulo = 'Activar/Desactivar';
    } else if (this.verificarSeccionActiva()) {
      const estadoResultado =
        estado === true ? 'Desactivar' : estado === false ? 'Activar' : '';
      this.accionTitulo = estadoResultado;
    } else this.accionTitulo = '';
  }**/

  //refactorizado
  public accionTituloGenerado(estado?: boolean): void {
    if (!this.verificarSeccionActiva()) {
      this.accionTitulo = 'Activar/Desactivar';
    } else {
      let estadoResultado = '';

      if (estado === true) {
        estadoResultado = 'Desactivar';
      } else if (estado === false) {
        estadoResultado = 'Activar';
      }

      this.accionTitulo = estadoResultado;
    }
  }

  public onCambiarEstadoGoogleAuth(event?: any) {
    if (event) {
      this.googleAuthSwitch.setValue(!event.checked); // previniendo cambio de estado
    }
    this.cambiarEstadoMostrarSeccionGoogleAuth(true);
    this.accionTituloGenerado(this.metodoGoogleAuth.estadoMetodo); // cambiando titulo del modal
  }

  public onCambiarEstadoCorreoPersonal(event?: any) {
    if (event) {
      this.correoPersonalSwitch.setValue(!event.checked); // previniendo cambio de estado
    }
    this.cambiarEstadoMostrarSeccionCorreoPersonal(true);
    this.accionTituloGenerado(this.metodoCorreoPersonal.estadoMetodo); // cambiando titulo del modal
  }

  public onCambiarEstadoCorreoInstitucional(event?: any) {
    if (event) {
      this.correoInstitucionalSwitch.setValue(!event.checked); // previniendo cambio de estado
    }
    this.cambiarEstadoMostrarSeccionCorreoInstitucional(true);
    this.accionTituloGenerado(this.metodoCorreoInstitucional.estadoMetodo); // cambiando titulo del modal
  }

  public cambiarEstadoMostrarSeccionGoogleAuth(state: boolean): void {
    this.mostrarSeccionGoogleAuth = state;
  }

  public mostrarMensajeToast(event: any) {
    this.messageService.add({
      severity: event.estado,
      summary: event.estado,
      detail: event.mensaje,
    });
  }

  public onCodigoAccion(event: {
    accion: 'activar' | 'desactivar';
    metodo: 'google' | 'personal' | 'institucional';
  }) {
    // Ocultando las secciones
    this.cambiarEstadoMostrarSeccionGoogleAuth(false);
    this.cambiarEstadoMostrarSeccionCorreoPersonal(false);
    this.cambiarEstadoMostrarSeccionCorreoInstitucional(false);

    const nuevoEstado = event.accion === 'activar';

    switch (event.metodo) {
      case 'google':
        this.googleAuthSwitch.setValue(nuevoEstado);
        this.metodoGoogleAuth.estadoMetodo = nuevoEstado;
        break;
      case 'personal':
        this.correoPersonalSwitch.setValue(nuevoEstado);
        this.metodoCorreoPersonal.estadoMetodo = nuevoEstado;
        break;
      case 'institucional':
        this.correoInstitucionalSwitch.setValue(nuevoEstado);
        this.metodoCorreoInstitucional.estadoMetodo = nuevoEstado;
        break;
    }
    // obteniendo nuevamente listado de metodos
    this.seguridadCuentaComponent.obtenerListaEstadosMetodos2FA();
  }

  public cambiarEstadoMostrarSeccionCorreoPersonal(state: boolean): void {
    this.mostrarSeccionCorreoPersonal = state;
  }

  public cambiarEstadoMostrarSeccionCorreoInstitucional(state: boolean): void {
    this.mostrarSeccionCorreoInstitucional = state;
  }

  public ocultarDialogo() {
    this.dialogComunService.hideDialog({});
    this.cambiarEstadoMostrarSeccionGoogleAuth(false);
    this.cambiarEstadoMostrarSeccionCorreoPersonal(false);
    this.cambiarEstadoMostrarSeccionCorreoInstitucional(false);
  }
}
