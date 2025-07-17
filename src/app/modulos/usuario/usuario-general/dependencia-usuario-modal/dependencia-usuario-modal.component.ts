import { Component } from '@angular/core';
import { DialogService, DynamicDialogConfig, DynamicDialogRef } from "primeng/dynamicdialog";
import {
  DependenciaUsuarioDTO,
  DependenciaUsuarioLstDTORes, EliminarDependenciaUsReq, UsuarioDTOB, UsuarioRow
} from "@interfaces/agregar-dependencia-us/agregar-dependencia-us";
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from "@angular/forms";
import { ButtonModule } from "primeng/button";
import { Auth2Service } from "@services/auth/auth2.service";
import { AgregarDependenciaUsService } from "@services/agregar-dependencia-us/agregar-dependencia-us.service";
import { AlertModalComponent } from "@components/alert-modal/alert-modal.component";
import { MenuItem } from "primeng/api";
import { DropdownModule } from "primeng/dropdown";
import { InputTextModule } from "primeng/inputtext";
import { NgIf } from "@angular/common";
import { PaginatorModule } from "primeng/paginator";
import { TableModule } from "primeng/table";
import {
  FormDependenciaUsuarioComponent
} from "@modulos/usuario/usuario-general/dependencia-usuario-modal/form-dependencia-usuario/form-dependencia-usuario.component";
import { MenuModule } from "primeng/menu";
import { ModalNotificationService } from "@services/modal-notification/modal-notification.service";

@Component({
  selector: 'app-dependencia-usuario-modal',
  templateUrl: './dependencia-usuario-modal.component.html',
  standalone: true,
  imports: [
    ButtonModule,
    DropdownModule,
    InputTextModule,
    NgIf,
    PaginatorModule,
    ReactiveFormsModule,
    TableModule,
    MenuModule
  ],
  styleUrls: ['./dependencia-usuario-modal.component.scss'],
  providers: [ModalNotificationService,]
})
export class DependenciaUsuarioModalComponent {

  //dinamic dialog for confirm:
  public refModal: DynamicDialogRef;

  //flag de la ventana modal donde se muestra la tabla dep-us
  isVisibleModalDepUs: boolean;

  //cambia entre tabla o formulario dep us. false:muestra la tabla, true:muestra el formulario
  isVisibleFormDepUs: boolean;

  //variable que determinar si el boton a mostrar será agregar o actualizar. true:Insert 0:Update
  isInsertOrUpdateFormDepUs: boolean;

  //listado de dependencias del usuario
  dependenciaUsLst: DependenciaUsuarioLstDTORes[];

  dependenciaUsSelected: DependenciaUsuarioLstDTORes;

  //data id usuario enviado desde el componente tabla
  idVUsuarioSelected: string

  //datos del usuario desglosado como nombres y apellidos
  usuarioDto: UsuarioDTOB;

  //usuario seleccionado de la tabla de usuarios
  usuarioSelected: UsuarioRow; //un registro de la tabla

  //formulario con todos los datos dep-us a enviar
  dependenciaUsForm: DependenciaUsuarioDTO;

  formDepUsGroup: FormGroup;

  //usuario session
  public usuarioActual;

  //variables para items
  actionItems: MenuItem[];

  constructor(
    public readonly ref: DynamicDialogRef,
    public readonly config: DynamicDialogConfig,
    private readonly formBuilder: FormBuilder,
    //private confirmationService: ConfirmationService,
    //private messageService: MessageService,
    public readonly dialogService: DialogService,
    private readonly userService: Auth2Service,
    private readonly agregarDependenciaUsService: AgregarDependenciaUsService,
    private readonly modalNotificationService: ModalNotificationService,
  ) {

    this.usuarioSelected = this.config.data.usuarioSelected;
    this.usuarioDto = Object.create(null)

    this.openModalDepUsParent(this.usuarioSelected.idUsuario);

    this.dependenciaUsForm = Object.create(null)
    this.setDependenciaForm(this.dependenciaUsForm);

  }

  ngOnInit() {
    this.actionItems = [

      {
        label: 'Editar',
        //icon: 'pi pi-trash',
        command: () => {
          this.editarDepUsForm(this.dependenciaUsSelected)
        }
      },
      {
        label: 'Eliminar',
        //icon: 'pi pi-trash',
        command: () => {
          this.eliminarDepUs(this.dependenciaUsSelected)
        }
      },
    ];
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

  openModalDepUsParent(idVUsuario: string) {
    this.idVUsuarioSelected = idVUsuario;
    this.isVisibleModalDepUs = true;
    this.getUsuario(idVUsuario);
    this.getDependenciaUsuarioLst(idVUsuario);
  }

  setDependenciaForm(dependenciaUsForm: DependenciaUsuarioDTO) {
    this.formDepUsGroup = this.formBuilder.group({
      nuVDocumento: new FormControl(dependenciaUsForm.nuVDocumento),
      idNDistritoFiscal: new FormControl(dependenciaUsForm.idNDistritoFiscal, [Validators.required]),
      coVSede: new FormControl(dependenciaUsForm.coVSede, [Validators.required]),
      coVEntidad: new FormControl(dependenciaUsForm.coVEntidad, [Validators.required]),
      coVDespacho: new FormControl(dependenciaUsForm.coVDespacho,),
      idNCargo: new FormControl(dependenciaUsForm.idNCargo, [Validators.required]),
    })
  }

  agregarDepUsBtn() {
    this.isInsertOrUpdateFormDepUs = true;
    this.refModal = this.dialogService.open(FormDependenciaUsuarioComponent, {
      width: '1000px',
      showHeader: false,
      contentStyle: { overflow: 'auto' },
      data: {
        usuarioSelected: this.usuarioSelected,
        usuarioDto: this.usuarioDto,
        isInsertOrUpdateFormDepUs: this.isInsertOrUpdateFormDepUs,
      },
    });

    this.refModal.onClose.subscribe({
      next: (resp) => {
        if (resp === 'confirm') {
          this.getDependenciaUsuarioLst(this.usuarioDto.idVUsuario);
        }
      },
    });
  }

  getDependenciaUsuarioLst(idVUsuario: string) {
    this.agregarDependenciaUsService.getDependenciaUsuarioLst(idVUsuario).subscribe({
      next: (response) => {
        
        this.dependenciaUsLst = response;
  
        this.ordenarDependenciaPrincipalSecundaria();
  
        this.isVisibleFormDepUs = false;
        
      },
      error: (err) => {
        console.error("error al consultar datos", err);
      }
    });
  }

  private ordenarDependenciaPrincipalSecundaria(): void {
    const parseFecha = (fechaStr: string): Date => {
      const [ddMMyyyy, hhmm] = fechaStr.split(" ");
      const [dd, mm, yyyy] = ddMMyyyy.split("/").map(Number); 
      const [hh, min] = hhmm.split(":").map(Number);         
  
     
      return new Date(yyyy, mm - 1, dd, hh, min);
    };
  
    this.dependenciaUsLst.sort((a, b) => {
     if (a.noFlCTipoDependencia === "DEPENDENCIA PRINCIPAL" 
          && b.noFlCTipoDependencia === "DEPENDENCIA SECUNDARIA") {
        return -1; 
      }
      if (a.noFlCTipoDependencia === "DEPENDENCIA SECUNDARIA" 
          && b.noFlCTipoDependencia === "DEPENDENCIA PRINCIPAL") {
        return 1;
      }
  
      const fechaA = parseFecha(a.fechaCreacionStr);
      const fechaB = parseFecha(b.fechaCreacionStr);
        
      return fechaB.getTime() - fechaA.getTime();
    });
  }

  getUsuario(idVUsuario: string) {
    this.agregarDependenciaUsService.getUsuario(idVUsuario).subscribe({
      next: (response) => {
        this.usuarioDto = response;
      },
      error: (err) => {
        console.error("error al consultar datos", err)
      }
    });
  }

  editarDepUsForm(dependenciaUs: DependenciaUsuarioLstDTORes) {

    if (dependenciaUs.flCTipoDependencia == '1')//si es principal:
    {
      this.modalNotificationService.dialogError('Error', "No es posible editar la dependencia principal. Solo puede editar o eliminar las dependencias adicionales asociadas al usuario.");
      return;
    }

    this.isInsertOrUpdateFormDepUs = false;
    this.refModal = this.dialogService.open(FormDependenciaUsuarioComponent, {
      width: '1000px',
      showHeader: false,
      contentStyle: { overflow: 'auto' },
      data: {
        usuarioSelected: this.usuarioSelected,
        usuarioDto: this.usuarioDto,
        isInsertOrUpdateFormDepUs: this.isInsertOrUpdateFormDepUs,
        dependenciaUs: dependenciaUs
      },
    });

    this.refModal.onClose.subscribe({
      next: (resp) => {
        if (resp === 'confirm') {
          this.getDependenciaUsuarioLst(this.usuarioDto.idVUsuario);
        }
      },
    });

  }

  confirmarEliminarRegistro(dependenciaUs: DependenciaUsuarioLstDTORes) {
    this.refModal = this.dialogService.open(AlertModalComponent, {
      width: '700px',
      showHeader: false,
      data: {
        icon: 'question',
        title: 'Eliminar fiscalía de usuario',
        confirm: true,
        description:
          'A continuación, se procederá a eliminar la fiscalía ' +
          `del usuario <b>${dependenciaUs.nombreCompleto}</b>. ` +
          '¿Esta seguro de realizar esta acción?',
        confirmButtonText: 'Aceptar'
      },
    });
  }

  eliminarDepUs(dependenciaUs: DependenciaUsuarioLstDTORes) {

    if (dependenciaUs.flCTipoDependencia == '1')//si es principal:
    {
      this.modalNotificationService.dialogError('Error', "No es posible eliminar la dependencia principal. Solo puede editar o eliminar las dependencias adicionales asociadas al usuario.");
      return;
    }

    this.confirmarEliminarRegistro(dependenciaUs)
    this.refModal.onClose.subscribe({
      next: (resp) => {
        if (resp === 'confirm') {
          this.eliminarDepUsSubmit(dependenciaUs);
        }
      },
      error: (err) => {
        console.error('Error al agregar registro.', err);
        throw new Error('Error al agregar registro');
      },
    });
  }

  eliminarDepUsSubmit(dependenciaUs: DependenciaUsuarioLstDTORes) {

    const eliminarDependenciaUsReq: EliminarDependenciaUsReq = {
      idVDependenciaUsuario: dependenciaUs.idDependenciaUsuario,
      coVUsModificacion: null
    }

    this.agregarDependenciaUsService.eliminarDepUs(eliminarDependenciaUsReq).subscribe({
      next: (response) => {
        if (response.PO_V_ERR_COD === "0") {
          this.refModal = this.dialogService.open(AlertModalComponent, {
            width: '600px',
            showHeader: false,
            data: {
              icon: 'success',
              title: 'Fiscalía del usuario eliminada',
              description: `La eliminación de la fiscalía del usuario <b>${dependenciaUs.nombreCompleto}</b> se realizó de forma exitosa.`,
              confirmButtonText: 'Listo'
            },
          });

          this.refModal.onClose.subscribe({
            next: resp => {
              if (resp === 'confirm') {
                //actualizar bandeja despachos
                this.getDependenciaUsuarioLst(this.usuarioDto.idVUsuario);
              }
            }
          });

        } else if (response.PO_V_ERR_COD === "1") {
          this.modalNotificationService.dialogError('Error', "Se ha producido un error al eliminar el registro.");
        }
      },
      error: (err) => {
        this.modalNotificationService.dialogError('Error', "Se ha producido un error al eliminar el registro.");
      }
    });

  }

  itemSelected(activeItem: DependenciaUsuarioLstDTORes) {
    this.dependenciaUsSelected = activeItem;
  }
}
