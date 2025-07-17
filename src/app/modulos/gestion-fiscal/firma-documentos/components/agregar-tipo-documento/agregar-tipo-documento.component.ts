
import { DialogModule } from 'primeng/dialog';
import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from "primeng/button";
import { CalendarModule } from "primeng/calendar";
import { CardModule } from "primeng/card";
import { CheckboxModule } from "primeng/checkbox";
import { DropdownModule } from "primeng/dropdown";
import { InputMaskModule } from "primeng/inputmask";
import { InputTextModule } from "primeng/inputtext";
import { SelectButtonModule } from "primeng/selectbutton";
import { RouterLink } from "@angular/router";
import { RippleModule } from "primeng/ripple";
import { InputTextarea } from "primeng/inputtextarea";
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from "@angular/forms";
import { RadioButtonModule } from "primeng/radiobutton";
import { MessagesModule } from 'primeng/messages';
import { Message } from 'primeng/api';
import { Subscription } from 'rxjs';
import { obtenerIcono } from '@utils/icon';
import { CmpLibModule } from 'ngx-mpfn-dev-cmp-lib';
import { FirmaDocumentoService } from '@services/firma-documento/firma-documento.service';
import { TableModule } from 'primeng/table';
import { DialogService, DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { FirmaDocumentoCargo } from '@interfaces/firma-documento/firma-documento';
import { AlertModalComponent } from '@components/alert-modal/alert-modal.component';
import { MessageService } from 'primeng/api';
import { NotaInfoDistribucionComponent } from '@components/nota-info-distribucion/nota-info-distribucion.component';
import { Auth2Service } from '@services/auth/auth2.service';

@Component({
  selector: 'app-agregar-tipo-documento',
  standalone: true,
  imports: [CommonModule,
    ButtonModule,
    CalendarModule,
    CardModule,
    CheckboxModule,
    DropdownModule,
    InputMaskModule,
    InputTextModule,
    SelectButtonModule,
    RouterLink,
    RippleModule,
    InputTextarea,
    FormsModule,
    TableModule,
    RadioButtonModule,
    ReactiveFormsModule,
    DialogModule,
    MessagesModule,
    NotaInfoDistribucionComponent,
    CmpLibModule,],
  templateUrl: './agregar-tipo-documento.component.html',
  styleUrls: ['./agregar-tipo-documento.component.scss'],
  providers: [MessageService, DialogService],
})
export class AgregarTipoDocumentoComponent {

  @Output() public close = new EventEmitter<boolean>();
  public obtenerIcono = obtenerIcono;
  showGuardarCargo: boolean = false
  public tipoDocumentoList = [];
  public cargosLista = [];
  public firmaDocumentoCargos: FirmaDocumentoCargo[] = [];

  enableSave: boolean = false;
  enableCheck: boolean = false;
  enableSaved: boolean = false;
  editar: boolean = false;
  tipoDocumentoActivo: any = '';

  public tituloModal: string = "Agregar ";
  infoMessage: Message[];

  enableAgregarCargo: boolean = false;
  public validacion: any;
  listaCargos: any = [];
  listaCargosGeneral: any = [];
  listaCargosAdicional: any = [];
  listaTipoDocumentoSad: any = []
  listaTipoDocumentoAdicional: any = []
  listaTipoDocumento: any = []
  listaTipoAmbito: any = []
  public infoUsuario: any;

  listaFirmaDocumentoCargo: any;
  showNotaExiste: boolean = false;
  error: any;
  public formularioTipoDocumento: FormGroup;
  public subscriptions: Subscription[] = [];
  public refModal: DynamicDialogRef;
  public notaExiste = 'El tipo de documento ya se encuentra registrado, por favor verificarlo. Para modificar un tipo de documento ir a su opción Editar';

  constructor(private formBuilder: FormBuilder,
    private firmaDocumentoService: FirmaDocumentoService,
    public ref: DynamicDialogRef,
    public config: DynamicDialogConfig,
    public dialogService: DialogService,
    public messageService: MessageService,
    private userService: Auth2Service) {

    this.tipoDocumentoActivo = this.config?.data.tipoDocumentoSelect;
    this.listaFirmaDocumentoCargo = this.config?.data.listaFirma

    this.editar = this.config?.data.editar;

    this.infoUsuario = this.userService.getUserInfo();

    this.formularioTipoDocumento = this.formBuilder.group({
      inTipoDocumento: [null, [Validators.required, Validators.minLength(3)]],
      inPrefijo: [null],
      coTipoAmbito: ['1', Validators.required],
      checkVisibilidad: [false],
      checkFormaParteEfe: [false],
      checkFoliacion: [false],
      cargosAdicionales: [null],
    });
  }

  ngOnInit(): void {
    this.loadTipoAmbito();

    if (this.editar) {
      this.formularioTipoDocumento.get('inTipoDocumento').setValue(this.tipoDocumentoActivo.tipoDocumento);
      this.formularioTipoDocumento.get('inPrefijo').setValue(this.tipoDocumentoActivo.prefijo);
      this.formularioTipoDocumento.get('coTipoAmbito').setValue(this.tipoDocumentoActivo.tipoAmbito);
      this.formularioTipoDocumento.get('checkVisibilidad').setValue(this.tipoDocumentoActivo.visibilidad === '1');
      this.formularioTipoDocumento.get('checkFormaParteEfe').setValue(this.tipoDocumentoActivo.formaParteEfe === '1');
      this.formularioTipoDocumento.get('checkFoliacion').setValue(this.tipoDocumentoActivo.foliacion === '1');

      this.tituloModal = "Editar ";
      this.deshabilitarCamposTipoDocumento();

      this.enableAgregarCargo = true;
      this.enableCheck = true;
      this.loadcargos();
      this.loadTipoDocumento();
    }
    /** this.infoMessage = [{
         severity: 'warn',
         summary: 'Nota:',
         detail:
           'Tener en cuenta solo se permite registrar ).',
       },];
 **/
    /**
    //this.loadTipoDocumento();
    //this.loadTipoDocumentoSad();
    //this.listaTipoDocumentoAdicional=this.listaTipoDocumento.filter( (item) => item?.tipoAmbito == '1');**/
  }

  private deshabilitarCamposTipoDocumento(){
      //this.formularioTipoDocumento.disable();
      this.formularioTipoDocumento.get('inTipoDocumento').disable()
      this.formularioTipoDocumento.get('inPrefijo').disable()
      this.formularioTipoDocumento.get('coTipoAmbito').disable()
      this.formularioTipoDocumento.get('checkVisibilidad').disable()
      this.formularioTipoDocumento.get('checkFormaParteEfe').disable()
      this.formularioTipoDocumento.get('checkFoliacion').disable()
  }

  activaGuardarCargo() {
    this.showGuardarCargo = true;
  }

  /*loadTipoDocumentoSad(){
      this.maestroService.listarTipoDocumentoSad().subscribe({
        next: (response) => {
          this.listaTipoDocumentoSad = response;
          let strTipoDocumento=this.formularioTipoDocumento.get('inTipoDocumento').value;
          this.tipoDocumento=this.listaTipoDocumentoSad.find((d)=>d.nombre==strTipoDocumento)

        },
      });
  }*/

  loadTipoAmbito() {
    this.listaTipoAmbito = [
      { codigo: '1', tipoAmbito: 'INTERNO' },
      { codigo: '2', tipoAmbito: 'EXTERNO' },
      { codigo: '3', tipoAmbito: 'MIXTO' },
    ];
  }

  loadTipoDocumento() {
    let strTipoDocumento = this.formularioTipoDocumento.get("inTipoDocumento").value;
    this.firmaDocumentoService.listarTipoDocumento().subscribe({
      next: (response) => {
        this.listaTipoDocumento = response;
        this.tipoDocumentoActivo = this.listaTipoDocumento.find((d) => d.tipoDocumento == strTipoDocumento)
      },
    });
  }

  onTipoAmbito() {
    console.log('entro onTipoAmbito')
    // También puedes refrescar el formulario completo si es necesario
    this.formularioTipoDocumento.updateValueAndValidity();
  }

  buscarTipoDocumento() {
    let strTipoDocumento = this.formularioTipoDocumento.get("inTipoDocumento").value;
    let strTipoAmbito = this.formularioTipoDocumento.get("coTipoAmbito").value;
    console.log('strTipstrTipoDocumentooAmbito = ', strTipoDocumento);
    console.log('strTipoAmbito = ', strTipoAmbito);

    if (strTipoDocumento.length < 3) {
      this.showNotaExiste = false
      this.enableSave = false;
      return;
    }

    /**if (!strTipoAmbito) {
      this.showNotaExiste = false
      this.enableSave = false;
      return;
    }**/

    this.subscriptions.push(this.firmaDocumentoService.buscarTipoDocumentoActivo(strTipoDocumento).subscribe({
      next: (resp) => {
        let isNumber = /^[0-9]+$/.test(resp);
        if (isNumber) {
          if (parseInt(resp) === 0) {
            console.log('NO EXISTE TIPO DOCUMENTO')
            this.showNotaExiste = false;
            this.enableSave = true;
            return
          }
        }

        this.messageService.add({ severity: 'error', detail: 'El tipo de documento ya se encuentra registrado, por favor verificarlo. Para modificar un tipo de documento ir a su opción Editar' })

        this.enableSave = false
        this.enableAgregarCargo = false
        this.showNotaExiste = true
      },
    }));
  }

  /**guardarTipoDocumento() {
    let strTipoDocumento = this.formularioTipoDocumento.get("inTipoDocumento").value;
    let usuario = this.infoUsuario?.usuario.usuario;

    this.subscriptions.push(this.firmaDocumentoService.guardarTipoDocumento(strTipoDocumento, usuario).subscribe({
      next: (resp) => {
        this.enableCheck = true;

        this.enableSave = false;//
        this.enableSaved = true;

        this.loadTipoDocumento();
        this.loadcargos();
      },
    }));
  }**/

  guardarTipoDocumento() {
    let strTipoDocumento = this.formularioTipoDocumento.get("inTipoDocumento").value;
    let strPrefijo = this.formularioTipoDocumento.get("inPrefijo").value;
    let strTipoAmbito = this.formularioTipoDocumento.get("coTipoAmbito").value;
    let strVisibilidad = this.formularioTipoDocumento.get("checkVisibilidad").value;
    let strFormaParteEfe = this.formularioTipoDocumento.get("checkFormaParteEfe").value;
    let strFoliacion = this.formularioTipoDocumento.get("checkFoliacion").value;

    let usuario = this.infoUsuario?.usuario.usuario;

    let request = {
      tipoDocumento: strTipoDocumento,
      prefijo: strPrefijo,
      tipoAmbito: strTipoAmbito,
      visibilidad: strVisibilidad ? 1 : 0,
      formaParteEfe: strFormaParteEfe ? 1 : 0,
      foliacion: strFoliacion ? 1 : 0,
      usuario: usuario,
    }

    this.firmaDocumentoService.guardarTipoDocumento(request).subscribe({
      next: (resp) => {
        this.enableCheck = true;

        this.enableSave = false;//
        this.enableSaved = true;

        this.deshabilitarCamposTipoDocumento();

        this.loadTipoDocumento();
        this.loadcargos();
      },
      error: (err) => {
        this.error = err;
        console.error('Error en guardar el tipo de documento', err);
      }
    });

  }

  agregarCargo() {
    this.enableAgregarCargo = true
  }

  guardarCargo() {

    let codigoCargo = this.formularioTipoDocumento.get("cargosAdicionales").value;

    let usuario = this.infoUsuario?.usuario.usuario;
    this.firmaDocumentoService.guardarCargo(codigoCargo, usuario).subscribe({
      next: (response) => {
        this.loadcargos();
        this.enableAgregarCargo = false;
        this.formularioTipoDocumento.get("cargosAdicionales").setValue(null);
      },
      error: (err) => {
        this.error = err;
        console.error('Error al guardar cargo', err);
      }
    });

  }

  registroValido(): boolean {
    return true;
  }

  cierraModal() {
    // This is intentional
  }
  public clickea(item: any, $event: any): void {

    item.firmaCheck = !item.firmaCheck
  }
  public icon(name: string): string {
    return `assets/icons/${name}.svg`;
  }
  public image(name: string): string {
    return `assets/images/${name}.png`;
  }
  public getTitulo(): string {
    return this.tituloModal;
  }

  public updateVisible(): void {
    this.ref.close();
  }

  private loadcargosAdicionales(): void {
    this.firmaDocumentoService.listarCargoGeneral().subscribe({
      next: (response) => {
        this.listaCargosGeneral = response;
      },
    });
  }

  private loadcargos(): void {

    this.firmaDocumentoService?.listarCargoActivo().subscribe({
      next: (response) => {

        this.listaCargosGeneral = response;//temporal
        /**this.listaCargos = this.listaCargosGeneral?.filter((f) => (f.jerarquia > 0));
        this.listaCargosAdicional = response?.filter((f) => (f.jerarquia != 2 && f.jerarquia != 3));**/
        this.listaCargos = this.listaCargosGeneral;
        this.listaCargosAdicional = this.listaCargosGeneral;
        this.firmaDocumentoCargos = []
        this.listaCargos?.forEach((c) => {
          let firmaCheck = this.listaFirmaDocumentoCargo?.find((f) => (f.idTipoDocumento == this.tipoDocumentoActivo?.idTipoDocumento &&
            f.idCargo == c?.idCargo)) ? true : false
          this.firmaDocumentoCargos.push(
            {
              idTipoDocumento: this.tipoDocumentoActivo?.idTipoDocumento,
              idCargo: c?.idCargo,
              cargo: c?.cargo,
              codigoCargo: c?.codigoCargo,
              firmaCheck: firmaCheck
            }
          )
        });
        this.enableAgregarCargo = false;
        this.enableCheck = true;
      },
    });
  }

  validarSeleccionCargos(): boolean {
    return this.firmaDocumentoCargos.length > 0 && this.firmaDocumentoCargos.some(cargo => cargo.firmaCheck);
  }

  validarBotonGuardar(): boolean {
    return this.formularioTipoDocumento.invalid ? true : !this.validarSeleccionCargos();
  }

  valorFirmaCheck(item): boolean {
    return true;
  }

  private loadFirmaCargoPerfil(): void {

    let searchTipoDocumento = ''

    /** if(this.editar){
       searchTipoDocumento = this.tipoDocumento.nombre;
     }
     else{
       searchTipoDocumento = this.formularioTipoDocumento?.get("inTipoDocumento")?.value;
     }
 **/
    this.firmaDocumentoService.listarFirmaDocumentoPerfil().subscribe({
      next: (response) => {
        this.listaFirmaDocumentoCargo = response;
      },
    });
  }

  requestFirmaTipoDocumento() {
    let usuario = this.infoUsuario?.usuario.usuario;
    let responses: any[] = []; // Almacenar respuestas
    let totalRequests = this.firmaDocumentoCargos.length; // Número total de peticiones
    let completedRequests = 0; // Contador de peticiones completadas


    this.firmaDocumentoCargos.forEach((f) => {
      let request = {
        idTipoDocumento: this.tipoDocumentoActivo.idTipoDocumento,
        idCargo: f.idCargo,
        usuario: usuario,
        estado: f.firmaCheck ? 1 : 0
      }
      this.firmaDocumentoService.guardarFirmaDocumentoCargo(request).subscribe({
        next: (response) => {
          completedRequests++;

          if (completedRequests === totalRequests) {
            responses.push(response.PO_V_ERR_MSG);
            this.informarGuardadoFirma();
            this.ref.close(responses);
          }
        },
        error: (err) => {
          this.error = err;
          console.error('Error al actualizar firma según perfil', err);
        }
      });
    });
  }

  informarGuardadoFirma() {
    let title : string = 'Tipo de documento para firma según perfil registrado';
    let description : string = 'El registro del tipo de documento <b>' + this.tipoDocumentoActivo.tipoDocumento + '</b> para firma con su relación de cargos se realizó de forma exitosa.';
    if (this.editar) {
      title = 'Tipo de documento y cargos para firmas editado'
      description = 'La actualización de la firma del tipo de documento <b>' + this.tipoDocumentoActivo.tipoDocumento + '</b> se realizó de forma exitosa.'
    }
    this.refModal = this.dialogService.open(
      AlertModalComponent,
      {
        width: '700px',
        showHeader: false,
        data: {
          icon: 'success',
          title: title,
          description: description,
          confirmButtonText: 'Listo'
        }
      })
  }

  eliminarCargo(item: any, i) {
    /**const idCargo = item?.idCargo;**/
    this.confirmarEliminacionFirma(item?.cargo);
    // si confirma entonces paso a consumir el servicio
    this.refModal.onClose.subscribe({
      next: resp => {
        if (resp === 'confirm') {
          this.servicioEliminar(item, i);//se debe eliminar el id de documento firma
        }
      }
    });
  }

  servicioEliminar(item: any, i: any) {
    let usuario = this.infoUsuario?.usuario.usuario;
    this.firmaDocumentoService.eliminaCargo(item?.idCargo, usuario).subscribe(
      {
        next: (response) => {
          this.firmaDocumentoCargos.splice(i, 1);
          this.informarEliminacionFirma(item?.cargo);
        },
        error: (err) => {
          this.error = err;
          console.error('Error al eliminar cargo', err);
        }
      });
  }

  confirmarEliminacionFirma(cargo: string) {

    this.refModal = this.dialogService.open(
      AlertModalComponent,
      {
        width: '700px',
        showHeader: false,
        data: {
          icon: 'warning',
          title: 'Eliminar Cargo para firmas',
          confirm: true,
          description: '¿Está seguro de eliminar el cargo <b>' + cargo + '</b>?<br>Este cambio eliminará el cargo para todos los Tipos de Documento registrados<br>¿Desea continuar?'
        }
      })
  }

  informarEliminacionFirma(cargo: string) {
    this.refModal = this.dialogService.open(
      AlertModalComponent,
      {
        width: '700px',
        showHeader: false,
        data: {
          icon: 'success',
          title: 'Cargo para firmas eliminado',
          description: 'Se eliminó el Cargo ' + cargo + ' correctamente.<br>Este cargo ya no será considerado para firmas en los sistemas',
          confirmButtonText: 'Listo'
        }
      }
    )

  }
}

