import { CommonModule } from '@angular/common';
import { Component, ElementRef, ViewChild } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { AlertModalComponent } from '@components/alert-modal/alert-modal.component';
import { CalendarioNoLaborableService } from '@services/calendario-no-laborable/calendario-no-laborable.service';
import { UsuarioService } from '@services/usuario/usuario.service';
import { obtenerIcono } from '@utils/icon';
import { CmpLibModule, ctrlErrorMsg } from 'ngx-mpfn-dev-cmp-lib';
import { NgxSpinnerService } from 'ngx-spinner';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { CalendarModule } from 'primeng/calendar';
import { CardModule } from 'primeng/card';
import { CheckboxModule } from 'primeng/checkbox';
import { DialogModule } from 'primeng/dialog';
import { DropdownModule } from 'primeng/dropdown';
import {
  DialogService,
  DynamicDialogConfig,
  DynamicDialogRef,
} from 'primeng/dynamicdialog';
import { InputMaskModule } from 'primeng/inputmask';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextarea } from 'primeng/inputtextarea';
import { MessagesModule } from 'primeng/messages';
import { RadioButtonModule } from 'primeng/radiobutton';
import { RippleModule } from 'primeng/ripple';
import { SelectButtonModule } from 'primeng/selectbutton';
import { Subject, Subscription } from 'rxjs';
import * as XLSX from 'xlsx';
import { AlertModalMasivoUsuarioComponent } from '@components/alert-modal-masivo-usuario/alert-modal-masivo-usuario.component';
import { Auth2Service } from '@services/auth/auth2.service';
import { UsuarioValidoExcel, Usuario } from '@interfaces/usuario/usuario';
import {
  ValidarUsuarioExcelFrontendService
} from "@modulos/usuario/usuario-general/admin-usuario/componentes/carga-masiva-usuarios/ValidarUsuarioExcelFrontendService";

@Component({
  selector: 'app-carga-masiva',
  standalone: true,
  imports: [
    CommonModule, ButtonModule, CalendarModule, CardModule, CheckboxModule, DropdownModule, InputMaskModule, InputTextModule,
    SelectButtonModule, RippleModule, InputTextarea, FormsModule, RadioButtonModule, ReactiveFormsModule, DialogModule, MessagesModule, CmpLibModule,
  ],
  templateUrl: './carga-masiva.component.html',
  styleUrls: ['./carga-masiva.component.scss'],
})
export class CargaMasivaComponent{
  titulo: string = '';
  public obtenerIcono = obtenerIcono;

  registerExcel: any;
  listaMasivo: Usuario[] = [];
  noRegistrado: UsuarioValidoExcel[] = [];
  sizeMaximo: any = 10; // Tamaño máximo en MB
  public formularioImportar: FormGroup;
  archivoValido: boolean = false;
  fileToUpload: File | null = null;
  files: File[] = [];
  fileName: any;
  format: any;
  size: any;
  public refModal: DynamicDialogRef;
  public subscriptions: Subscription[] = [];
  public data: any;

  keys: string[];
  dataSheet = new Subject();

  errorSize: boolean = false;
  enviarData: any;
  spinnerEnabled = false;

  usuarioSesion;

  @ViewChild('inputFile') inputFile: ElementRef;

  error: any;

  constructor(
    public readonly calendarioNoLaborableService: CalendarioNoLaborableService,
    private readonly formBuilder: FormBuilder,
    public readonly ref: DynamicDialogRef,
    public readonly config: DynamicDialogConfig,
    public readonly dialogService: DialogService,
    private readonly messageService: MessageService,
    private readonly userService: Auth2Service,
    private readonly usuarioService: UsuarioService,
    private readonly spinner: NgxSpinnerService,
    private validarUsuarioExcelService: ValidarUsuarioExcelFrontendService
  ) {
    this.formularioImportar = this.formBuilder.group({
      observaciones: [null],
      file: [null],
    });
  }
  public icon(name: string): string {
    return `assets/icons/${name}.svg`;
  }
  public logo(name: string): string {
    return `assets/images/${name}.png`;
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.usuarioSesion = this.userService.getUserInfo();
    }, 100);
  }

  enviarDataExcel() {
    this.confirmarimportacion();
  }

  public confirmarimportacion(): void {
    this.refModal = this.dialogService.open(AlertModalComponent, {
      width: '750px',
      showHeader: false,
      data: {
        icon: 'question',
        title: 'Registrar usuarios de forma masiva',
        confirm: true,
        description:
          'A continuación, se procederá a registrar de forma masiva los usuarios cargados. ¿Está seguro de realizar esta acción?',
      },
    });

    this.refModal.onClose.subscribe({
      next: (resp) => {
        if (resp === 'confirm') {
          this.validarCargaMasiva();
          //this.registrarCargaMasiva();
        }
      },
    })
    this.ref.close();
  }

  public descargarPlantilla() {
    const downloadInstance = document.createElement('a');
    downloadInstance.href = `assets/file/Carga_masiva_usuario.xlsx`;
    downloadInstance.download = `Carga_masiva_usuario.xlsx`;
    document.body.appendChild(downloadInstance);
    downloadInstance.click();
    document.body.removeChild(downloadInstance);
  }

  public close(): void {
    this.ref.close();
  }

  public validMaxLength(field: string = 'observaciones'): void {
    this.validMaxLengthCustom(field);
  }

  validMaxLengthCustom(field: string = 'observaciones') {
    let value: string = '';
    let maxLength: number = 300;
    let control: any = this.formularioImportar.get(field);
    value = control.value;

    if (value.length > maxLength) {
      control.setValue(value.slice(0, maxLength));
    }
  }

  errorMsg(ctrlName): any {
    if (ctrlName === 'observaciones')
      return ctrlErrorMsg(this.formularioImportar.get(ctrlName));
  }

  public getDescripcionFile(): any {
    return 'O arrastre el archivo a esta sección. Tamaño máximo de archivo: 10 MB';
  }
  get counterObservacion(): number {
    const value = this.formularioImportar.get('observaciones').value;
    return value ? value.trim().length : 0;
  }

  onLoad(event): void {
    const file = (event.target as HTMLInputElement).files[0];
    this.fileToUpload = file;

    this.archivoValido = false;
    const target: DataTransfer = <DataTransfer>event.target;

    if (file.size > this.sizeMaximo * 1024 * 1024) {
      //convertir MB a bytes
      this.errorSize = true;
      this.messageService.add({
        severity: 'error',
        detail:
          'Lo sentimos, el archivo seleccionado excede el tamaño máximo permitido de 10 MB. Por favor, revise el archivo y vuelva a intentarlo.',
      });
      return;
    }

    if (RegExp(/(.xlsx)/).exec(target.files[0].name)) {
      this.archivoValido = true;
      this.fileName = target.files[0].name;
      this.format = this.fileName.split('.').at(-1);
      this.size = target.files[0].size;

      const reader: FileReader = new FileReader();
      reader.onload = (e: any) => {
        /* Leer el workbook */
        const bstr: string = e.target.result;
        const wb: XLSX.WorkBook = XLSX.read(bstr, {type: 'binary'});

        /* Obtener la primera hoja */
        const wsname: string = wb.SheetNames[0];
        const ws: XLSX.WorkSheet = wb.Sheets[wsname];

        // Modificación aquí: forzar uso de índices numéricos
        this.data = XLSX.utils.sheet_to_json(ws, {header: 1});
        this.data = this.data.slice(3); // considerar desde el registro 4 hacia abajo

        //removemos filas con registros vacíos
        //this.removeEmptyRowsFronExcel();
        this.data = this.data.filter(row => Array.isArray(row) && row.length > 0 && row.some(cell => cell !== ''));

        //console.log("this.data:", this.data)

        // **Verificación de datos después de leer el archivo**
        if (!this.data || this.data.length === 0) {
          this.messageService.add({
            severity: 'error',
            detail: 'El archivo no contiene datos o el formato es incorrecto.',
          });
          this.quitarFile();
        }else{
          //validar los datos en esta linea, no considerar el primero registro ya que es una cabecera
          this.validarExcelCargadoFrontend(this.data)
        }
      };

      reader.readAsArrayBuffer(file);
      reader.onloadend = (e) => {
        this.spinnerEnabled = false;
        this.dataSheet.next(this.data);
      };
    } else {
      this.quitarFile();
      this.messageService.add({
        severity: 'error',
        summary: 'Rejected',
        detail:
          'Lo sentimos, el formato de archivo seleccionado no es compatible. Por favor, selecciona un archivo cuyo formato de extensión sea xlsx.',
      });
      return;
    }
    if (target.files.length > 1) {
      this.inputFile.nativeElement.value = '';
    }
  }

  validarExcelCargadoFrontend(data: any) {
    this.noRegistrado = this.validarUsuarioExcelService.validateExcelData(data);
    if (this.noRegistrado.length > 0) {
      this.mostrarExcelFrontendInvalid();
      return false;
    }
    return true;
  }

  leerCargaMasivaNuevo() {
    let countRegisterExcel = 0;

    this.data.forEach((p, idx) => {
      console.log(`Procesando registro ${idx}:`, p);

      const row = {
        idTipoDocumento: p[0] || '',        // Columna "Código tipo de documento"
        numeroDocumento: p[1] || '',        // Columna "Número de documento"
        nombres: p[2] || '',                // Columna "Nombres"
        primerApellido: p[3] || '',         // Columna "Apellido Paterno"
        segundoApellido: p[4] || '',        // Columna "Apellido Materno"
        codigoEntidad: p[5] || '',          // Columna "Código de dependencia"
        codigoDespacho: p[6] || '',         // Columna "Código de despacho"
        coVCargo: p[7] || '',                // Columna "Código de Cargo"
        idCargo:null,
        idRelacionLaboral: p[8] || '',      // Columna "Código relación laboral"
        correoPersonal: p[9] || '',         // Columna "Correo Personal"
        correoInstitucional: p[10] || '',   // Columna "Correo Institucional"
        celular: p[11] || '',               // Columna "Celular"
        fechaNacimiento: p[12] || '',       // Columna "Fecha de nacimiento"
        descripcionNacionalidad: p[13] || '',// Columna "País de origen/Nacionalidad"
        codigoSexo: p[14] || ''             // Columna "Código de sexo"
      };
      this.listaMasivo.push(row);
      countRegisterExcel++;
    });

    console.log('Registros procesados:', countRegisterExcel);
    console.log('Lista masiva final:', this.listaMasivo);
    console.log('No registrados:', this.noRegistrado);

    this.enviarData = {
      usuarioDTOList: this.listaMasivo,
      usuarioCreador: this.usuarioSesion?.usuario.usuario,
    };

    this.archivoValido = countRegisterExcel > 0;
  }

  quitarFile() {
    // Restablecer datos del archivo
    this.fileToUpload = null;
    this.files = [];
    this.fileName = '';
    this.format = '';
    this.size = 0;

    // Restablecer estados y validaciones
    this.archivoValido = false;
    this.errorSize = false;

    // Restablecer datos y registros
    this.data = [];
    this.listaMasivo = [];
    this.noRegistrado = [];
    this.enviarData = null;

    // Restablecer streams y observables
    this.dataSheet.next(null);
    this.keys = null;

    // Restablecer el input file de manera segura
    if (this.inputFile?.nativeElement) {
      this.inputFile.nativeElement.value = '';
    }
  }

  validarCargaMasiva(): void {
    this.leerCargaMasivaNuevo();
    if (this.listaMasivo.length === 0) {
      console.log("nada que enviar")
      return; // Ya se muestra un mensaje en leerCargaMasiva
    }

    this.spinner.show();

    this.usuarioService.validarCargaMasiva(this.enviarData).subscribe({
      next: (response) => {
        this.spinner.hide();
        if (!response.codigoRespuesta) {
          this.noRegistrado = response.respuestasUsuarios;
          this.mostrarExcelBackParcialInvalid();
        } else {
          //this.mostrarMensajeExito();
          this.registrarCargaMasiva();//registramos la carga masiva luego de haberse validado
        }
      },
      error: (err) => {
        this.spinner.hide();
        this.error = err;
        console.error('Error al realizar la validacion de la carga masiva', err);
        this.messageService.add({
          severity: 'error',
          detail: 'No se realizó la carga',
        });
      },
    })
  }

  registrarCargaMasiva(): void {
    this.listaMasivo = []; // Clear the array at the start
    this.leerCargaMasivaNuevo();
    if (this.listaMasivo.length === 0) {
      console.log("nada que enviar")
      return; // Ya se muestra un mensaje en leerCargaMasiva
    }
    this.spinner.show();

    this.usuarioService.registrarCargaMasiva(this.enviarData).subscribe({
      next: (response) => {
        this.spinner.hide();
        if (response.errores && response.errores.length > 0) {
          this.noRegistrado = response.errores;
          //this.mostrarExcelBackParcialInvalid();
          console.error("No se completó la carga masiva.")
        } else {
          this.mostrarMensajeExito();
        }
      },
      error: (err) => {
        this.spinner.hide();
        this.error = err;
        console.error('Error al realizar la carga masiva', err);
        this.messageService.add({
          severity: 'error',
          detail: 'No se realizó la carga',
        });
      },
    })
  }

  mostrarMensajeExito() {
    this.refModal = this.dialogService.open(AlertModalComponent, {
      width: '600px',
      showHeader: false,
      data: {
        icon: 'success',
        title: 'Usuarios registrados de manera masiva',
        description:
          'El registro de usuarios de manera masiva se realizó de forma exitosa.',
        confirmButtonText: 'Listo',
      },
    });

    // Cerrar el modal principal cuando se cierra el modal de éxito
    this.subscriptions.push(
      this.refModal.onClose.subscribe(() => {
        this.ref.close('success');
      })
    );
  }

  mostrarExcelFrontendInvalid(){
    this.refModal = this.dialogService.open(AlertModalMasivoUsuarioComponent, {
      width: '70%',
      showHeader: false,
      data: {
        icon: 'error',
        title: 'FALLÓ EN EL REGISTRO DE USUARIOS REGISTRADOS',
        subtitle: '',
        //        'Usuarios no registrados (' + this.cantidadNoRegistrados + ')',
        description:
          'El registro de usuarios no pudo ser realizado, favor de revisar los registros con error. A continuación, se muestra el detalle de los registros con error:',
        noRegistrados: this.noRegistrado,
        confirmButtonText: 'Listo',
      },
    });

    this.refModal.onClose.subscribe({
      next: (resp) => {
        if (resp === 'confirm') {
          console.log("confimado")
          //borrar archivo cargado, como si no se hubiera subido un archivo antes.
          this.quitarFile();
        }
      },
    });
  }

  mostrarExcelBackParcialInvalid() {
    this.refModal = this.dialogService.open(AlertModalMasivoUsuarioComponent, {
      width: '70%',
      showHeader: false,
      data: {
        icon: 'success',
        title: 'FALLÓ EN LA VALIDACION DE LOS REGISTROS EN EXCEL',
        subtitle: '',
        //        'Usuarios no registrados (' + this.cantidadNoRegistrados + ')',
        description:
          'A continuación, se muestra el detalle de los usuarios y la razón del por qué no pudieron ser registrados:',
        noRegistrados: this.noRegistrado,
        confirmButtonText: 'Listo',
      },
    });

    // Cerrar el modal principal cuando se cierra el modal de registro parcial
    this.refModal.onClose.subscribe(() => {
      this.ref.close('partial');
    })
  }

  FORMAT_FILE_SIZE(bytes: number, decimals = 2): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  }

  ngOnDestroy() {
    if (this.subscriptions) {
      this.subscriptions.forEach((sub) => sub.unsubscribe());
    }
  }
}
