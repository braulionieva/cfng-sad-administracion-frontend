import { NgIf } from "@angular/common";
import { Component } from "@angular/core";
import { ReactiveFormsModule, FormGroup, FormBuilder, FormControl, Validators } from "@angular/forms";
import { AlertModalComponent } from "@components/alert-modal/alert-modal.component";
import { patron } from "@constants/constantes";
import { UsuarioRow } from "@interfaces/agregar-dependencia-us/agregar-dependencia-us";
import { ProcesaUsuarioReq, UsuarioDetalle } from "@interfaces/baja-usuario/baja-usuario";
import { BajaUsuarioService } from "@services/admin-usuario/baja-usuario/baja-usuario.service";
import { DataBrowserService } from "@services/admin-usuario/data-browser/data-browser.service";
import { Auth2Service } from "@services/auth/auth2.service";
import { MessageService, ConfirmationService } from "primeng/api";
import { ButtonModule } from "primeng/button";
import { DynamicDialogRef, DynamicDialogConfig, DialogService } from "primeng/dynamicdialog";
import { InputTextarea } from "primeng/inputtextarea";

@Component({
  selector: 'app-bloquear-usuario-modal',
  templateUrl: './bloquear-usuario-modal.component.html',
  standalone: true,
  imports: [
    ButtonModule,
    InputTextarea,
    NgIf,
    ReactiveFormsModule
  ],
  styleUrls: ['./bloquear-usuario-modal.component.scss']
})
export class BloquearUsuarioModalComponent {
  //usuario seleccionado enviado en la tabla
  userRow: UsuarioRow;

  //detalle del usuario solicitado via http
  userDetail: UsuarioDetalle;

  isVisibleModalBloquearUs: boolean = false;

  formGroup: FormGroup;

  //objeto donde se almacena datos de bloquear usuario y se enviaran al formulario y viceversa
  formBean: ProcesaUsuarioReq;

  //Datos para modal de notificaciones
  isVisibleModalNotificationModBloquear: boolean = false;
  modalNotificationTitle: string;
  modalNotificationMsg: string;

  //dinamic dialog for confirm:
  refModal: DynamicDialogRef;

  //usuario session
  public usuarioSesion;

  constructor(
    public readonly ref: DynamicDialogRef,
    public readonly config: DynamicDialogConfig,
    private readonly dataBrowserService: DataBrowserService,
    private readonly bajaUsuarioService: BajaUsuarioService,
    private readonly formBuilder: FormBuilder,
    private readonly messageService: MessageService,
    private readonly userService: Auth2Service,
    public readonly dialogService: DialogService,
    public readonly confirmationService: ConfirmationService,

  ) {

  }

  ngOnInit() {
    //inicializacion
    this.userRow = Object.create(null);
    this.userDetail = Object.create(null);
    this.clearForm();

    //usuario en sesion
    this.usuarioSesion = this.userService.getUserInfo();

    this.setData();
  }

  public icon(name: string): string {
    return `assets/icons/${name}.svg`;
  }

  public confirmAction(): void {
    this.ref.close('confirm');
  }

  public cancelAction(): void {
    this.ref.close('cancel');
  }

  public closeAction(): void {
    this.ref.close('closed');
  }

  private setData() {
    this.userRow = { ...this.config.data };
    this.getUsuarioDetalle(this.userRow.idUsuario);
  }

  clearForm() {
    this.formBean = Object.create(null)
    this.formBean.flCAceptaCondiciones = false;
    this.setFormData(this.formBean)
  }

  setFormData(formBean: ProcesaUsuarioReq) {
    this.formGroup = this.formBuilder.group({
      idVUsuario: new FormControl(formBean.idVUsuario),
      coVUsername: new FormControl(formBean.coVUsername),
      noVNavegador: new FormControl(formBean.noVNavegador),
      deVNavegVers: new FormControl(formBean.deVNavegVers),
      noVSistOpe: new FormControl(formBean.noVSistOpe),
      deVSistOpeVers: new FormControl(formBean.deVSistOpeVers),
      deVDisptvo: new FormControl(formBean.deVDisptvo),
      idNTipoDisptvo: new FormControl(formBean.idNTipoDisptvo),
      ipVAcceso: new FormControl(formBean.ipVAcceso),
      idNTipoIp: new FormControl(formBean.idNTipoIp),
      coVUsUsuario: new FormControl(formBean.coVUsUsuario),
      noVObservaciones: new FormControl(formBean.noVObservaciones, [
        Validators.required,
        Validators.pattern(patron.PATRON_TEXTO_SIN_DOBLE_ESPACIO),
        //Validators.minLength(1),
        Validators.maxLength(300),
      ]),
      flCAceptaCondiciones: new FormControl(formBean.flCAceptaCondiciones,),
    });
  }

  getUsuarioDetalle(idVUsuario: string) {
    this.bajaUsuarioService.getUsuarioDetalle(idVUsuario).subscribe({
      next: (response) => {
        this.userDetail = response;
      },
      error: (err) => {
        console.error('error al consultar datos', err);
      },
    });
  }

  cancelarUsForm() {
    this.cancelAction()
  }

  async procesarUsuarioForm() {
    if (this.formGroup.invalid) {
      this.marcarCamposComoTocados(this.formGroup);
    } else {
      this.confirmarBloquearRegistro('question')
      this.refModal.onClose.subscribe({
        next: (resp) => {
          if (resp === 'confirm') {
            this._procesarBloquearUsuarioForm();
          }
        },
        error: (err) => {
          console.error('Error en el proceso.', err);
          throw new Error('Error en el proceso');
        },
      });
    }
  }

  async _procesarBloquearUsuarioForm() {
    const ippublica = this.usuarioSesion?.usuario.ip;
    const procesaDesbloquearUsuarioReq: ProcesaUsuarioReq = {
      ...this.formGroup.value,
      idVUsuario: this.userDetail.idVUsuario,
      coVUsername: this.usuarioSesion?.usuario.usuario,
      //idNEstado: 3,//todos: se setea a 1 porque: aun no han enviado el dato, no está poblado
      noVNavegador: this.dataBrowserService.getBrowserName(),
      deVNavegVers: this.dataBrowserService.getBrowserVersion(),
      noVSistOpe: this.dataBrowserService.getDeviceName(),
      deVSistOpeVers: this.dataBrowserService.getOSVersion(),
      deVDisptvo: this.dataBrowserService.getDeviceName(),
      idNTipoDisptvo: null, //aun no han enviado el dato, no está poblado
      ipVAcceso: ippublica,
      idNTipoIp: null, //aun no han enviado el dato, no está poblado
      coVUsUsuario: this.usuarioSesion?.usuario.usuario,
    };

    const procesaBloquearUsuarioRes = await this.bajaUsuarioService.procesarUsuario_Block('procesarBloquearUsuario', procesaDesbloquearUsuarioReq);

    if (procesaBloquearUsuarioRes.PO_V_ERR_COD == '0') {
      this.refModal = this.dialogService.open(AlertModalComponent, {
        width: '600px',
        showHeader: false,
        data: {
          icon: 'success',
          title: 'Proceso realizado correctamente',
          description: `El proceso de bloquear al usuario "${this.userDetail.nuVDocumento}" fue realizado exitosamente`,
          confirmButtonText: 'Listo'
        },
      });

      this.refModal.onClose.subscribe({
        next: resp => {
          if (resp === 'confirm') {
            this.confirmAction();//comunicamos al componente superior
          }
        }
      });
      //---------------------------------------------------------------
      //AQUI COMUNICAR A TRAVES DEL LISTENER
      //---------------------------------------------------------------
    } else {
      this.messageService.add({
        severity: 'error',
        summary: 'Rejected',
        detail: procesaBloquearUsuarioRes.PO_V_ERR_MSG,
      });
    }
  }

  marcarCamposComoTocados(formGroup: FormGroup) {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();

      if (control instanceof FormGroup) {
        this.marcarCamposComoTocados(control);
      }
    });
  }

  private confirmarBloquearRegistro(icon: string): void {
    const nuVDocumento = this.userDetail.nuVDocumento

    this.refModal = this.dialogService.open(AlertModalComponent, {
      width: '50%',
      showHeader: false,
      data: {
        icon: icon,
        title: 'Bloquear al usuario',
        confirm: true,
        description:
          'A continuacióon, se procederá ' +
          `<b>a bloquear al usuario ${nuVDocumento}</b>. ` +
          '¿Esta seguro de realizar esta acción?',
        confirmButtonText: 'Aceptar'
      },
    });
  }
}
