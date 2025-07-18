import { Component } from '@angular/core';
import { UsuarioRow } from '@interfaces/agregar-dependencia-us/agregar-dependencia-us';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { DynamicDialogRef, DynamicDialogConfig, DialogService } from 'primeng/dynamicdialog';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { InputTextModule } from 'primeng/inputtext';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DropdownModule } from 'primeng/dropdown';
import { InputNumberModule } from 'primeng/inputnumber';
import { MenuModule } from 'primeng/menu';
import { TableModule } from 'primeng/table';
import { ToastModule } from 'primeng/toast';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { CheckboxModule } from 'primeng/checkbox';
import { AdminDistritalService } from '@services/admin-usuario/admin-distrital/admin-distrital.service';
import { AlertModalComponent } from '@components/alert-modal/alert-modal.component';
import { RadioButtonModule } from 'primeng/radiobutton';
import { convertirTexto } from '@utils/text';

@Component({
  selector: 'app-administrador-distrital',
  standalone: true,
  templateUrl: './administrador-distrital.component.html',
  styleUrls: ['./administrador-distrital.component.scss'],
  imports: [
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
    InputTextareaModule,
    CheckboxModule,
    RadioButtonModule,
  ],
  providers: [MessageService]
})
export class AdministradorDistritalComponent {

  userRow: UsuarioRow;
  dependenciasAdmin: any[] = [];
  distritosFiscalesAdmin: any[] = [];
  dependenciasDistritoAdmin: any[] = [];
  dependenciasUsuario: any[] = [];

  listaDistritosFiscalesAdmin: any[] = [];
  userDetail: any;//AdminDistrital;
  idUsuarioSelected: string;
  entidadSelect: any = null;
  anteriorSelect: any = null;
  dfiscalAdmin: any = null;
  dfiscalUsuario: any = null;
  dfiscalanteriorSelect: any = null;
  dfiscalSelect: any = null;

  selectAdmin: any = null;

  codigoEntidad: string;
  tipoEntidad: any;
  idDistritoFiscal: any;

  public refModal: DynamicDialogRef;
  public formDependencias: FormGroup;
  editar: boolean = true;
  nota: string = "Si todas las dependencias de un Distrito Fiscal, son eliminadas en la opción que corresponde; este usuario dejará de ser administrador distrital de forma automática.";
  constructor(
    public config: DynamicDialogConfig,
    private fb: FormBuilder,
    private adminDistritalService: AdminDistritalService,//comunicacion entre componentes de admin-usuario
    public ref: DynamicDialogRef,
    private dialogService: DialogService

  ) {
    this.formDependencias = fb.group({
      //optionDep: [this.fechaNoLaborable?.tipo||'NACIONAL',Validators.required],
      optionDep: [null, null],
    });
  }

  ngOnInit() {
    this.idUsuarioSelected = this.config.data?.usuarioSelected.idUsuario;
    this.editar = this.config.data?.editar;

    this.getUsuario(this.idUsuarioSelected);
  }

  asignaDistritoFiscal(item: any, $event) {
    this.entidadSelect = item;

  } 

  cancelarAsignarAdminDistrital() {
    this.close();
  }

  registrarAsignarAdminDistrital() {
    let tmpTitle = (this.editar ? 'EDITAR' : 'ASIGNAR') + ' ADMINISTRADOR DISTRITAL';
    let tmpDescription = 'A continuación, se procederá a <b>asignar</b> como administrador distrital del <b>Distrito Fiscal de ' + this.entidadSelect?.distritoFiscal + '</b>, al usuario \"'
      + this.userDetail?.nombreCiudadano + '\". ¿Está seguro de realizar esta acción?';

    if (this.editar)
      tmpTitle = 'EDITAR ADMINISTRADOR DISTRITAL';


    this.refModal = this.dialogService.open(
      AlertModalComponent,
      {
        width: '600px',
        contentStyle: { 'padding': '0', 'border-radius': '20px', 'border': 'none!important' },
        showHeader: false,
        data: {
          icon: 'question',
          title: tmpTitle,
          confirm: true,
          confirmButtonText: 'Aceptar',
          description: tmpDescription,
        }
      }
    )
    this.refModal.onClose.subscribe({
      next: resp => {
        if (resp === 'confirm') {
          this.servicioRegistrar();

        }
      }
    });
  }

  convertirTexto(textoIn: any) {
    convertirTexto(textoIn)
  }

  servicioRegistrar() {
    if (!this.editar) {
      let dependencias = this.dependencias(this.entidadSelect?.idDistritoFiscal);

      let request = {
        idUsuarioAdministrador: this.idUsuarioSelected,
        idDistritoFiscal: this.entidadSelect?.idDistritoFiscal,
        codigoEntidad: dependencias[0].codigoEntidad,
        idTipoEntidad: dependencias[0].tipoEntidad,
        idUsuario: '40291777'
      }

      this.adminDistritalService.asignarAdminDistrital(request).subscribe({
        next: (response) => {
          this.informarRegistro()

        },
        error: (err) => {
          console.error("error al consultar datos", err)
        }
      });
    }
    else {
      let dependencias = this.dependencias(this.entidadSelect?.idDistritoFiscal);
      let requestBaja = {
        idUsuarioAdministrador: this.idUsuarioSelected,
        idDistritoFiscal: this.anteriorSelect?.idDistritoFiscal,
        idTipoEntidad: 1,
        idUsuario: '40291777'
      }
      this.adminDistritalService.bajaAdminDistrital(requestBaja).subscribe({
        next: (response) => {
        },
        error: (err) => {
          console.error("error al consultar datos", err)
        }
      });

      let requestGuardar = {
        idUsuarioAdministrador: this.idUsuarioSelected,
        idDistritoFiscal: this.entidadSelect?.idDistritoFiscal,
        codigoEntidad: dependencias[0].codigoEntidad,
        idTipoEntidad: dependencias[0].tipoEntidad,
        idUsuario: '40291777'
      }

      this.adminDistritalService.asignarAdminDistrital(requestGuardar).subscribe({
        next: (response) => {
          this.informarRegistro()
        },
        error: (err) => {
          console.error("error al consultar datos", err)
        }
      });
    }
    this.close();
  }

  informarRegistro() {
    let tmpTitle = this.editar ? 'MODIFICACIÓN ADMINISTRADOR DISTRITAL' : 'ASIGNACIÓN REALIZADA CORRECTAMENTE';
    let tmpDescription = 'La asignación como administrador distrital del Distrito Fiscal de ' + this.entidadSelect?.distritoFiscal + ' para el usuario \"'
      + this.userDetail?.nombreCiudadano + '\", se realizó correctamente.';

    this.refModal = this.dialogService.open(
      AlertModalComponent,
      {
        width: '600px',
        showHeader: false,
        contentStyle: { 'padding': '0', 'border-radius': '20px', 'border': 'none!important' },
        data: {
          icon: 'success',
          title: tmpTitle,
          confirmButtonText: 'Listo',
          description: tmpDescription,
        }
      }
    )
  }

  bajaAsignarAdminDistrital() {
     this.refModal = this.dialogService.open(
      AlertModalComponent,
      {
        width: '600px',
        contentStyle: { 'padding': '0', 'border-radius': '20px', 'border': 'none!important' },
        showHeader: false,
        data: {
          icon: 'question',
          title: 'DEJAR DE SER ADMINISTRADOR DISTRITAL',
          confirm: true,
          confirmButtonText: 'Aceptar',
          description: 'A continuación, se procederá a <b>desasignar</b> como administrador distrital al usuario \"'
            + this.userDetail?.nombreCiudadano + '\". ¿Está seguro de realizar esta acción?',
        }
      }

    )
    this.refModal.onClose.subscribe({
      next: resp => {
        if (resp === 'confirm') {
          let request = {
            idUsuarioAdministrador: this.idUsuarioSelected,
            idTipoEntidad: 1,
            idUsuario: '40291777'
          }
          this.servicioBaja(request);
        }
      }
    });
  }
  public icon(name: string): string {
    return `assets/icons/${name}.svg`;
  }

  public close(): void {
    this.ref.close();
  }

  getLabelButton() {

    if (this.editar) return 'Guardar'
    return 'Registrar'
  }

  servicioBaja(request: any) {

    this.adminDistritalService.bajaAdminDistrital(request).subscribe({
      next: (response) => {
        this.informarBaja()
      },
      error: (err) => {
        console.error("error al consultar datos", err)
      }
    });
    this.close();
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
          description: 'La desasignación como administrador distrital para el usuario \"'
            + this.userDetail?.nombreCiudadano + '\", se realizó correctamente.',
        }
      }
    )

  }

  getUsuario(idUsuario: string) {
    this.adminDistritalService.getUsuarioDetalle(idUsuario).subscribe({
      next: (response) => {
        this.userDetail = response;
      },
      error: (err) => {
        console.error("error al consultar datos", err)
      }
    });

    this.adminDistritalService.getDependenciasUsuario(idUsuario).subscribe({
      next: (response) => {
        this.dependenciasUsuario = response;
      },
      error: (err) => {
        console.error("error al consultar datos", err)
      }
    });
    if (this.editar) {

      this.adminDistritalService.getDFiscalAdmin(idUsuario).subscribe({
        next: (response) => {
          this.selectAdmin = response[0];
          this.entidadSelect = response[0];
        },
        error: (err) => {
          console.error("error al consultar datos", err)
        }
      });
    }
    this.adminDistritalService.getDFiscalUsuario(idUsuario).subscribe({
      next: (response) => {
        this.dfiscalUsuario = response;
      },
      error: (err) => {
        console.error("error al consultar datos", err)
      }
    });
  }
  esFiscal(idDistritoFiscal: any) {
    if (this.selectAdmin?.idDistritoFiscal == idDistritoFiscal) return true
    return false
  }
  dependencias(idDistritoFiscal: any): any {
    let filtroDependencias: any = this.dependenciasUsuario.filter((item) => item.idDistritoFiscal == idDistritoFiscal)
    return filtroDependencias;
  }

  /*
    getUsuario(idUsuario: string) {
      this.adminDistritalService.getUsuarioDetalle(idUsuario).subscribe({
        next: (response) => {
          this.userDetail = response;
        },
        error: (err) => {
        }
      });
  
      if(this.editar){
        this.adminDistritalService.getDependenciasAdminDistrital(idUsuario).subscribe({
          next: (response) => {
            this.dependenciasAdmin = response;
            this.entidadSelect = response[0];
            this.anteriorSelect = response[0];
          },
          error: (err) => {
            this.getDependenciasUsuario(idUsuario)
          }
        });
        this.adminDistritalService.getDFiscalAdminDistrital(idUsuario).subscribe({
          next: (response) => {
            this.dfiscalAdmin = response;
  
          },
          error: (err) => {
            this.getDependenciasUsuario(idUsuario)
          }
        });
      }
      else{
        this.getDependenciasUsuario(idUsuario)
      }
    }
  
    getDependenciasUsuario(idUsuario: string) {
      this.adminDistritalService.getDependenciasUsuario(idUsuario).subscribe({
        next: (response) => {
          this.dependenciasAdmin = response;
        },
        error: (err) => {
        }
      });
  
      this.adminDistritalService.getDFiscalUsuario(idUsuario).subscribe({
        next: (response) => {
          this.dfiscalUsuario = response;
        },
        error: (err) => {
        }
      });
    }
  */

  get registroValido(): boolean {
    if (this.entidadSelect != null)
      return true;

    return false;
  }
}
