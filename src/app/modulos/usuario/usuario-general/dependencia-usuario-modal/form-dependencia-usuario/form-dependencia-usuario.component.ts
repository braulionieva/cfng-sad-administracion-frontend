import { Component } from '@angular/core';
import { DialogService, DynamicDialogConfig, DynamicDialogRef } from "primeng/dynamicdialog";
import { NgxSpinnerService } from "ngx-spinner";
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from "@angular/forms";
import { Auth2Service } from "@services/auth/auth2.service";
import { AgregarDependenciaUsService } from "@services/agregar-dependencia-us/agregar-dependencia-us.service";
import {
  ConfigurarMasDeUnaFiscaliaService
} from "@services/configurarMasDeUnaFiscalia/configurar-mas-de-una-fiscalia.service";
import { ButtonModule } from "primeng/button";
import { DropdownModule } from "primeng/dropdown";
import { InputTextModule } from "primeng/inputtext";
import { NgClass, NgIf } from "@angular/common";
import { PaginatorModule } from "primeng/paginator";
import {
  CargoDTOB,
  DependenciaDTOB,
  DependenciaUsuarioDTO, DependenciaUsuarioLstDTORes, DespachoDTOB,
  SedeDTOB,
  UsuarioDTOB, UsuarioRow
} from "@interfaces/agregar-dependencia-us/agregar-dependencia-us";
import { getValueByCodeInDropdown } from "@utils/utils";
import { AlertModalComponent } from "@components/alert-modal/alert-modal.component";
import { DistritoFiscalDTOB } from '@interfaces/plazo-doc-obs/BuscarPlazoDocObsRes';

@Component({
  selector: 'app-form-dependencia-usuario',
  templateUrl: './form-dependencia-usuario.component.html',
  standalone: true,
  imports: [
    ButtonModule,
    DropdownModule,
    InputTextModule,
    NgIf,
    PaginatorModule,
    ReactiveFormsModule,
    NgClass,
  ],
  styleUrls: ['./form-dependencia-usuario.component.scss']
})
export class FormDependenciaUsuarioComponent {

  //dinamic dialog for confirm:
  public refModal: DynamicDialogRef;

  //variable que determinar si el boton a mostrar será agregar o actualizar. true:Insert 0:Update
  isInsertOrUpdateFormDepUs: boolean;

  //datos del usuario desglosado como nombres y apellidos
  usuarioDto: UsuarioDTOB;

  //usuario seleccionado de la tabla de usuarios
  usuarioSelected: UsuarioRow; //un registro de la tabla

  //formulario con todos los datos dep-us a enviar
  dependenciaUsForm: DependenciaUsuarioDTO;

  formDepUsGroup: FormGroup;

  modalTitle: string;

  sedeLst: SedeDTOB[] = [];
  distritoFiscalLst: DistritoFiscalDTOB[] = [];
  dependenciaLst: DependenciaDTOB[] = [];
  despachoLst: DespachoDTOB[] = [];
  cargoLst: CargoDTOB[] = [];

  //response de un registo Dependencia usuario. para Editar dep-us
  dependenciaUsuarioSelected: DependenciaUsuarioDTO;

  //usuario session
  public usuarioActual;

  constructor(
    public readonly ref: DynamicDialogRef,
    public readonly config: DynamicDialogConfig,
    private readonly spinner: NgxSpinnerService,
    private readonly formBuilder: FormBuilder,
    public readonly dialogService: DialogService,
    private readonly userService: Auth2Service,
    private readonly agregarDependenciaUsService: AgregarDependenciaUsService,
    private readonly configurarMasDeUnaFiscaliaService: ConfigurarMasDeUnaFiscaliaService,
  ) {

  }
  ngOnInit() {

   

    this.setDependenciaForm(Object.create(null));

    this.usuarioSelected = this.config.data.usuarioSelected
    this.usuarioDto = this.config.data.usuarioDto
    this.isInsertOrUpdateFormDepUs = this.config.data.isInsertOrUpdateFormDepUs

    if (this.isInsertOrUpdateFormDepUs) {
      //nuevo
      this.dependenciaUsForm = Object.create(null)
      this.dependenciaUsForm.nuVDocumento = this.usuarioDto.nuVDocumento;
      this.setDependenciaForm(this.dependenciaUsForm);

      //desabilitar coVSede
      this.formDepUsGroup.get('coVSede').disable();
      //desabilitar fiscalía
      this.formDepUsGroup.get('coVEntidad').disable();
      //desabilitar despacho
      this.formDepUsGroup.get('coVDespacho').disable();

      this.getDistritoFiscalLst();
      this.getCargoLst();
    }

    else {
      //editar:
      const dependenciaUs: DependenciaUsuarioLstDTORes = this.config.data.dependenciaUs
      //dependenciaUsuarioReq
      this.agregarDependenciaUsService.getDependenciaUsuario(dependenciaUs.idDependenciaUsuario).subscribe({
        next: (response) => {
          this.dependenciaUsuarioSelected = response;
          this.dependenciaUsuarioSelected.nuVDocumento = this.usuarioDto.nuVDocumento;
          this.dependenciaUsuarioSelected.coVSede = response.coVSede;
          this.setDependenciaForm(this.dependenciaUsuarioSelected);

          this.getDistritoFiscalLst();
          this.getCargoLst();

          this.getSedeLstXDFForm(this.dependenciaUsuarioSelected.idNDistritoFiscal)
          this.getFiscaliasXSedeForm(this.dependenciaUsuarioSelected.coVSede + '');

          this.getDespachoLst(this.dependenciaUsuarioSelected.coVEntidad);
        },
        error: (err) => {
          console.error("error al consultar datos", err)
        }
      });
    }

    this.modalTitle = this.isInsertOrUpdateFormDepUs
    ? 'Agregar Dependencia a usuario'
    : 'Editar Dependencia de usuario';
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.usuarioActual = this.userService.getUserInfo();
    }, 100);
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

  setDependenciaForm(dependenciaUsForm: DependenciaUsuarioDTO) {
    this.formDepUsGroup = this.formBuilder.group({
      nuVDocumento: [{
        value: dependenciaUsForm.nuVDocumento,
        disabled: true
      }],
      idNDistritoFiscal: new FormControl(dependenciaUsForm.idNDistritoFiscal, [Validators.required]),
      coVSede: new FormControl(dependenciaUsForm.coVSede, [Validators.required]),
      coVEntidad: new FormControl(dependenciaUsForm.coVEntidad, [Validators.required]),
      coVDespacho: new FormControl(dependenciaUsForm.coVDespacho,),
      idNCargo: new FormControl(dependenciaUsForm.idNCargo, [Validators.required]),
    })
  }

  onChangeDistritoFiscal(idNDistritoFiscal: number) {
    //eventos en combo Sede
    this.getSedeLstXDFForm(idNDistritoFiscal)
    //habilitamos sede
    this.formDepUsGroup.get('coVSede').enable();
  }

  getDespachoLst(coVEntidad: string) {
    this.agregarDependenciaUsService.getDespachoLst(coVEntidad).subscribe({
      next: (response) => {
        this.despachoLst = response || [];
        this.despachoLst.sort((a, b) =>
          a.noVDespacho.localeCompare(b.noVDespacho)
        );
      },
      error: (err) => {
        console.error("error al leer datos del servidor. ", err);
      }
    });
  }

  getSedeLstXDFForm(idNDistritoFiscal: number) {
    this.spinner.show();
    this.configurarMasDeUnaFiscaliaService.getSedesXDF(idNDistritoFiscal).subscribe({
      next: (response) => {
        this.sedeLst = response || [];
        this.sedeLst.sort((a, b) =>
          a.noVSede.localeCompare(b.noVSede)
        );
        this.spinner.hide();
      },
      error: (err) => {
        console.error("error al leer datos del servidor. ", err);
        this.spinner.hide();
      }
    });
  }

  onChangeSedeForm(coVSede: string) {
    this.getFiscaliasXSedeForm(coVSede)

    this.formDepUsGroup.get('coVEntidad').enable();
  }

  getFiscaliasXSedeForm(coVSede: string) {
    this.spinner.show();
    this.configurarMasDeUnaFiscaliaService.getFiscaliasXSede(coVSede).subscribe({
      next: (response) => {
        this.dependenciaLst = response || [];
        this.dependenciaLst.sort((a, b) =>
          a.noVEntidad.localeCompare(b.noVEntidad)
        );
        this.spinner.hide();
      },
      error: (err) => {
        console.error("error al leer datos del servidor. ", err);
        this.spinner.hide();
      }
    });
  }

  onChangeFiscaliaForm(coVEntidad: string) {
    this.getDespachoLst(coVEntidad)

    //habilitamos despacho
    this.formDepUsGroup.get('coVDespacho').enable();
  }

  cancelarAddDepUsSend() {
    this.closeAction();
  }

  agregarDependenciaUsSend() {

    if (this.formDepUsGroup.valid) {
      this.confirmarAgregarRegistro('question');
      this.refModal.onClose.subscribe({
        next: (resp) => {
          if (resp === 'confirm') {
            this._agregarDependenciaUsSend();
          }
        },
        error: (err) => {
          console.error('Error al agregar registro.', err);
          throw new Error('Error al agregar registro');
        },
      });
    } else {
      this.formDepUsGroup.markAllAsTouched();
    }
  }

  private confirmarAgregarRegistro(icon: string): void {
    const fullName = this.usuarioDto?.noVCiudadano + ' ' + this.usuarioDto?.apVPaterno + ' ' + this.usuarioDto?.apVMaterno;
    const coVEntidad = this.formDepUsGroup.get('coVEntidad').value
    const noVEntidad = getValueByCodeInDropdown(this.dependenciaLst, coVEntidad, "coVEntidad", 'noVEntidad')
    this.refModal = this.dialogService.open(AlertModalComponent, {
      width: '750px',
      showHeader: false,
      data: {
        icon: icon,
        title: 'Registrar fiscalía de usuario',
        confirm: true,
        description:
          'A continuación, se procederá a registrar los datos de la fiscalía ' +
          `<b>${noVEntidad}</b> al usuario <b>${fullName}</b>. ` +
          '¿Esta seguro de realizar esta acción?',
        confirmButtonText: 'Aceptar'
      },
    });

  }

  private confirmarModificarRegistro(icon: string): void {
    const fullName = this.usuarioDto?.noVCiudadano + ' ' + this.usuarioDto?.apVPaterno + ' ' + this.usuarioDto?.apVMaterno;

    this.refModal = this.dialogService.open(AlertModalComponent, {
      width: '750px',
      showHeader: false,
      data: {
        icon: icon,
        title: 'Editar fiscalía de usuario',
        confirm: true,
        description:
          'A continuación, se procederá a modificar los datos de la fiscalía ' +
          `del usuario <b>${fullName}</b>. ` +
          '¿Esta seguro de realizar esta acción?',
        confirmButtonText: 'Aceptar'
      },
    });

  }
  //procesa envío datos para la nuevo registro
  _agregarDependenciaUsSend() {

    const fullName = this.usuarioDto?.noVCiudadano + ' ' + this.usuarioDto?.apVPaterno + ' ' + this.usuarioDto?.apVMaterno;

    this.dependenciaUsForm = {
      ...this.formDepUsGroup.value,
      idVUsuario: this.usuarioDto.idVUsuario,
      esCDependenciaUsuario: "1",
      coVUsCreacion: this.usuarioActual?.usuario.usuario,
    }

    this.agregarDependenciaUsService.agregarDependenciaUsuario(this.dependenciaUsForm).subscribe({
      next: (response) => {
        this.refModal = this.dialogService.open(AlertModalComponent, {
          width: '600px',
          showHeader: false,
          data: {
            icon: 'success',
            title: 'Fiscalía de usuario registrada',
            description: `La actualización de la fiscalía del usuario <b>${fullName}</b> se realizó de forma exitosa.`,
            confirmButtonText: 'Listo'
          },
        });

        this.refModal.onClose.subscribe({
          next: resp => {
            if (resp === 'confirm') {
              //actualizar bandeja despachos
              this.confirmAction();
            }
          }
        });
      },
      error: (err) => {
        console.error("error al leer datos del servidor. ", err);
      }
    })

  }

  actualizarAddDepUsSend() {
    if (this.formDepUsGroup.valid) {
      this.confirmarModificarRegistro('question');
      this.refModal.onClose.subscribe({
        next: (resp) => {
          if (resp === 'confirm') {
            this._actualizarAddDepUsSend();
          }
        },
        error: (err) => {
          console.error('Error al agregar registro.', err);
          throw new Error('Error al agregar registro');
        },
      });
    } else {
      this.formDepUsGroup.markAllAsTouched();
    }
  }
  //envia datos para la actualizacion del registro
  _actualizarAddDepUsSend() {
    const fullName = this.usuarioDto?.noVCiudadano + ' ' + this.usuarioDto?.apVPaterno + ' ' + this.usuarioDto?.apVMaterno;

    this.dependenciaUsForm = {
      ...this.formDepUsGroup.value,
      idVUsuario: this.dependenciaUsuarioSelected.idVUsuario,
      idVDependenciaUsuario: this.dependenciaUsuarioSelected.idVDependenciaUsuario,
      coVUsModificacion: this.usuarioActual?.usuario.usuario,
    }
    this.agregarDependenciaUsService.actualizarDependenciaUsuario(this.dependenciaUsForm).subscribe({
      next: (response) => {
        this.refModal = this.dialogService.open(AlertModalComponent, {
          width: '600px',
          showHeader: false,
          data: {
            icon: 'success',
            title: 'Fiscalía de usuario editada',
            description: `La actualización de la fiscalía del usuario <b>${fullName}</b> se realizó de forma exitosa.`,
            confirmButtonText: 'Listo'
          },
        });

        this.refModal.onClose.subscribe({
          next: resp => {
            if (resp === 'confirm') {
              //actualizar bandeja despachos
              this.confirmAction();
            }
          }
        });
      },
      error: (err) => {
        console.error("error al leer datos del servidor. ", err);
      }
    })
  }

  getDistritoFiscalLst() {
    this.agregarDependenciaUsService.getDistritoFiscalLst().subscribe({
      next: (response) => {
        this.distritoFiscalLst = response || [];
        this.distritoFiscalLst.sort((a, b) =>
          a.noVDistritoFiscal.localeCompare(b.noVDistritoFiscal)
        );
      },
      error: (err) => {
        console.error("error al leer datos del servidor. ", err);
      }
    });
  }

  getCargoLst() {
    this.agregarDependenciaUsService.getCargoLst().subscribe({
      next: (response) => {
        this.cargoLst = response || [];
        this.cargoLst.sort((a, b) =>
          a.noVCargo.localeCompare(b.noVCargo)
        );
      },
      error: (err) => {
        console.error("error al leer datos del servidor. ", err);
      }
    });
  }
}
