import { NgIf } from "@angular/common";
import { Component, OnInit } from "@angular/core";
import { ReactiveFormsModule, FormGroup, FormBuilder, FormControl, Validators } from "@angular/forms";
import { AlertModalComponent } from "@components/alert-modal/alert-modal.component";
import { patron } from "@constants/constantes";
import { UsuarioRow } from "@interfaces/agregar-dependencia-us/agregar-dependencia-us";
import { UsuarioDetalle } from "@interfaces/baja-usuario/baja-usuario";
import { BajaUsuarioService } from "@services/admin-usuario/baja-usuario/baja-usuario.service";
import { DataBrowserService } from "@services/admin-usuario/data-browser/data-browser.service";
import { Auth2Service } from "@services/auth/auth2.service";
import { MessageService } from "primeng/api";
import { ButtonModule } from "primeng/button";
import { CheckboxModule } from "primeng/checkbox";
import { DynamicDialogRef, DynamicDialogConfig, DialogService } from "primeng/dynamicdialog";
import { InputTextarea } from "primeng/inputtextarea";

@Component({
  standalone: true,
  selector: 'app-habilitar-deshabilitar-usuario',
  templateUrl: './habilitar-deshabilitar-usuario.component.html',
  styleUrls: ['./habilitar-deshabilitar-usuario.component.scss'],
  imports: [
    ButtonModule,
    CheckboxModule,
    InputTextarea,
    NgIf,
    ReactiveFormsModule,
  ],
})
export class HabilitarDeshabilitarUsuarioComponent implements OnInit {
  protected userRow: UsuarioRow;
  protected userDetail: UsuarioDetalle;
  protected formGroup: FormGroup;
  protected usuarioSesion: any;
  protected refModal: DynamicDialogRef;

  // Configurable properties
  protected isHabilitar = true;
  protected actionType: 'habilitar' | 'deshabilitar'; // 'habilitar' or 'deshabilitar'
  protected actionTexts = {
    habilitar: {
      title: 'HABILITAR USUARIO',
      apiEndpoint: 'procesarHabilitarUsuario',
    },
    deshabilitar: {
      title: 'DESHABILITAR USUARIO',
      apiEndpoint: 'procesarBajausuario',
    },
  };

  constructor(
    private readonly bajaUsuarioService: BajaUsuarioService,
    private readonly config: DynamicDialogConfig,
    private readonly dataBrowserService: DataBrowserService,
    private readonly dialogService: DialogService,
    private readonly formBuilder: FormBuilder,
    private readonly messageService: MessageService,
    private readonly ref: DynamicDialogRef,
    private readonly userService: Auth2Service,
  ) { }

  ngOnInit(): void {
    this.actionType = this.config.data.actionType; // 'habilitar' or 'deshabilitar'
    this.isHabilitar = this.actionType == 'habilitar';

    this.userRow = { ...this.config.data };
    this.userDetail = Object.create(null);
    this.usuarioSesion = this.userService.getUserInfo();
    this.initializeForm();
    this.getUsuarioDetalle(this.userRow.idUsuario);
  }

  private initializeForm() {
    this.formGroup = this.formBuilder.group({
      noVObservaciones: new FormControl('', [
        Validators.required,
        Validators.pattern(patron.PATRON_TEXTO_SIN_DOBLE_ESPACIO),
        Validators.maxLength(300),
      ]),
      flCAceptaCondiciones: new FormControl(false, [Validators.requiredTrue]),
    });
  }

  protected getUsuarioDetalle(idVUsuario: string) {
    this.bajaUsuarioService.getUsuarioDetalle(idVUsuario).subscribe({
      next: (response) => (this.userDetail = response),
      error: (err) => console.error("Error al obtener datos del usuario:", err),
    });
  }

  protected async procesarUsuario() {
    if (this.formGroup.invalid) {
      this.marcarCamposComoTocados(this.formGroup);
      return;
    }

    const { title, apiEndpoint } = this.actionTexts[this.actionType];

    this.refModal = this.dialogService.open(AlertModalComponent, {
      width: '50%',
      showHeader: false,
      data: {
        icon: 'question',
        title,
        confirm: true,
        description: `A continuación, se procederá a ${this.actionType} al usuario <b>${this.userDetail.nuVDocumento}</b>. ¿Esta seguro de realizar esta acción?`,
        confirmButtonText: 'Aceptar',
      },
    });

    this.refModal.onClose.subscribe(async (resp) => {
      if (resp === 'confirm') {
        const requestData = this.prepareRequestData();
        const response = await this.bajaUsuarioService.procesarUsuario_Baja(apiEndpoint, requestData);

        if (response.PO_V_ERR_COD === '0') {
          this.refModal = this.dialogService.open(AlertModalComponent, {
            width: '600px',
            showHeader: false,
            data: {
              icon: 'success',
              title: 'Proceso realizado correctamente',
              description: `El proceso de ${this.actionType} al usuario <b>${this.userDetail.nuVDocumento}</b> fue realizado exitosamente`,
              confirmButtonText: 'Listo'
            },
          });

          this.refModal.onClose.subscribe({
            next: resp => {
              if (resp === 'confirm') {
                this.ref.close('confirm');
              }
            }
          });
        } else {
          this.messageService.add({ severity: 'error', detail: response.PO_V_ERR_MSG });
        }
      }
    });
  }

  protected prepareRequestData() {
    const ippublica = this.usuarioSesion?.usuario.ip;

    return {
      ...this.formGroup.value,
      idVUsuario: this.userDetail.idVUsuario,
      coVUsername: this.usuarioSesion?.usuario.usuario,
      noVNavegador: this.dataBrowserService.getBrowserName(),
      deVNavegVers: this.dataBrowserService.getBrowserVersion(),
      noVSistOpe: this.dataBrowserService.getDeviceName(),
      deVSistOpeVers: this.dataBrowserService.getOSVersion(),
      deVDisptvo: this.dataBrowserService.getDeviceName(),

      idNTipoDisptvo: null,//aun no han enviado el dato, no está poblado
      ipVAcceso: ippublica,
      idNTipoIp: null,//aun no han enviado el dato, no está poblado

      coVUsUsuario: this.usuarioSesion?.usuario.usuario,
    };
  }

  protected marcarCamposComoTocados(formGroup: FormGroup) {
    Object.values(formGroup.controls).forEach((control) => {
      control.markAsTouched();

      if (control instanceof FormGroup) {
        this.marcarCamposComoTocados(control);
      }
    });
  }

  protected icon(name: string): string {
    return `assets/icons/${name}.svg`;
  }

  protected closeAction(): void {
    this.ref.close('closed');
  }

  protected cancelAction(): void {
    this.ref.close('cancel');
  }
}
