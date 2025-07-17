import { CommonModule } from '@angular/common';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { AlertModalComponent } from '@components/alert-modal/alert-modal.component';
import { AlertModalMasivoComponent } from '@components/alert-modal-masivo/alert-modal-masivo.component';
import { BACKEND } from '@environments/environment';
import { CalendarioNoLaborableService } from '@services/calendario-no-laborable/calendario-no-laborable.service';
import { obtenerIcono } from '@utils/icon';
import { CmpLibModule, ctrlErrorMsg } from 'ngx-mpfn-dev-cmp-lib';
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
import { Auth2Service } from '@services/auth/auth2.service';

@Component({
  selector: 'app-carga-masiva',
  standalone: true,
  imports: [
    CommonModule,
    ButtonModule,
    CalendarModule,
    CardModule,
    CheckboxModule,
    DropdownModule,
    InputMaskModule,
    InputTextModule,
    SelectButtonModule,
    RippleModule,
    InputTextarea,
    FormsModule,
    RadioButtonModule,
    ReactiveFormsModule,
    DialogModule,
    MessagesModule,
    CmpLibModule,
  ],
  templateUrl: './carga-masiva.component.html',
  styleUrls: ['./carga-masiva.component.scss'],
})
export class CargaMasivaComponent implements OnInit {
  titulo: string = '';
  public obtenerIcono = obtenerIcono;

  registerExcel: any;
  listaMasivo: any[] = [];
  sizeMaximo: any = 100 * 1024 * 1024;
  archivoValido: boolean = false;
  noRegistrado: any = [];
  cantidadNoRegistrados = 0;
  fileToUpload: File | null = null;
  files: File[] = [];
  fileName: any;
  format: any;
  size: any;
  public formularioImportar: FormGroup;
  public refModal: DynamicDialogRef;
  public subscriptions: Subscription[] = [];
  public data: any;

  keys: string[];
  dataSheet = new Subject();

  errorSize: boolean = false;
  enviarData: any;
  valueToAction: any;
  isExcelFile: boolean;
  spinnerEnabled = false;
  deleteURL: string = `${BACKEND.MS_DOCUMENTO}eliminar?filename=`;
  url: string = `${BACKEND.MS_REPOSITORIO}cargar`;

  @ViewChild('inputFile', { static: false }) inputFile: ElementRef;

  error: any;

  public usuarioSesion;

  constructor(
    public calendarioNoLaborableService: CalendarioNoLaborableService,
    private formBuilder: FormBuilder,
    public ref: DynamicDialogRef,
    public config: DynamicDialogConfig,
    public dialogService: DialogService,
    private messageService: MessageService,
    private readonly userService: Auth2Service
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

  ngOnInit() {
    // This is intentional
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
        title: 'REGISTRAR DÍAS FESTIVOS/NO LABORABLES MASIVAMENTE',
        confirm: true,
        description:
          'A continuación, se procederá a <b>registrar</b> de forma masiva los <b>días festivos/no laborables</b>.¿Está seguro de realizar esta acción?',
      },
    });

    this.refModal.onClose.subscribe({
      next: (resp) => {
        if (resp === 'confirm') {
          this.registrarCargaMasiva();
        }
      },
    });

    this.ref.close();
  }

  public descargarPlantilla() {
    const downloadInstance = document.createElement('a');
    downloadInstance.href = `assets/file/Carga_masiva_calendario.xlsx`;
    downloadInstance.download = `Carga_masiva_calendario.xlsx`;
    document.body.appendChild(downloadInstance);
    downloadInstance.click();
    document.body.removeChild(downloadInstance);
  }

  public cargaInicialSatisfactorio(
    icon: string,
    title: string,
    description: string
  ): void {
    this.refModal = this.dialogService.open(AlertModalComponent, {
      width: '600px',
      showHeader: false,
      data: {
        icon: icon,
        title: title,
        description: description,
      },
    });
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
    value.length > maxLength && control.setValue(value.slice(0, maxLength));
  }

  errorMsg(ctrlName): any {
    if (ctrlName === 'observaciones')
      return ctrlErrorMsg(this.formularioImportar.get(ctrlName));
  }

  public getDescripcionFile(): any {
    return 'o arrastre el archivo a esta sección: El documento se cargará en formato xlsx';
  }

  onLoad(event): void {
    const file = (event.target as HTMLInputElement).files[0];
    this.fileToUpload = file;
    this.archivoValido = false;
    const target: DataTransfer = <DataTransfer>event.target;

    if (this.size > this.sizeMaximo) {
      this.errorSize = true;
      this.messageService.add({
        severity: 'error',
        detail:
          'Lo sentimos, el archivo seleccionado excede el tamaño máximo permitido. Por favor, revise el archivo para que no sobrepase el peso máximo permitido de 100 MB',
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
        /* read workbook */
        const bstr: string = e.target.result;
        const wb: XLSX.WorkBook = XLSX.read(bstr, { type: 'binary' });

        /* grab first sheet */
        const wsname: string = wb.SheetNames[0];
        const ws: XLSX.WorkSheet = wb.Sheets[wsname];

        /* save data */
        //this.data = XLSX.utils.sheet_to_json(ws);

        // Modificación aquí: forzar uso de índices numéricos
        this.data = XLSX.utils.sheet_to_json(ws, { header: 1 });
        this.data = this.data.slice(3); // considerar desde el registro 4 hacia abajo

        //removemos filas con registros vacíos
        //this.removeEmptyRowsFronExcel();
        this.data = this.data.filter(
          (row) =>
            Array.isArray(row) &&
            row.length > 0 &&
            row.some((cell) => cell !== '')
        );

        console.log('this.data:', this.data);
      };

      reader.readAsArrayBuffer(target.files[0]);
      // reader.readAsBinaryString(target.files[0]); //DEPRECADO

      reader.onloadend = (e) => {
        this.spinnerEnabled = false;
        this.keys = Object.keys(this.data[0]);
        this.dataSheet.next(this.data);
      };
    } else {
      this.inputFile.nativeElement.value = '';
      this.archivoValido = false;
      this.messageService.add({
        severity: 'error',
        summary: 'Rejected',
        detail: 'Error en el proceso',
      });
      return;
    }
    if (target.files.length > 1) {
      this.inputFile.nativeElement.value = '';
    }
  }

  //refactorizado
  leerCargaMasiva(): void {
    console.log('Iniciando leerCargaMasiva con datos:', this.data);
    let countRegisterExcel = 0;

    this.data.forEach((p, idx) => {
      if (this.esLineaValida(idx)) {
        if (this.procesarRegistro(p)) {
          countRegisterExcel++;
        } else {
          this.agregarNoRegistrado(p);
        }
      }
    });

    this.enviarData = this.crearDatosEnvio();
    this.archivoValido = countRegisterExcel > 0;
  }

  //refactorizado por segunda ocasión.
  leerCargaMasivaNuevo(): void {
    let countRegisterExcel = 0;

    this.data.forEach((p, idx) => {
      //console.log(`Procesando registro ${idx}:`, p);

      // Solo procesamos los registros sin la cabecera
      if (idx >= 1) {
        //no considerar la cabecera
        if (this.validRegister(p)) {
          const registroValido = {
            fechaInicio: p[1] || '',
            fechaFin: p[2] || '',
            diaFestivo: p[3] || '',
            tipo: p[4] || '',
            distritoFiscal: p[5] || '',
            nombre: p[6] || '',
            descripcion: p[7] || '',
          };

          //console.log('Registro válido creado:', registroValido);
          this.listaMasivo.push(registroValido);
          countRegisterExcel++;
        } else {
          //console.log('Registro inválido, agregando a noRegistrado');
          this.noRegistrado.push({
            fila: p[0] || idx + 1,
            error: 'Registro inválido o incompleto',
            nombre: p[6] || '',
            fechaInicio: p[1] || '',
            fechaFin: p[2] || '',
            usuario: this.usuarioSesion?.usuario.usuario,
          });
        }
      }
    });

    console.log('Registros procesados:', countRegisterExcel);
    console.log('Lista masiva final:', this.listaMasivo);
    console.log('No registrados:', this.noRegistrado);

    this.enviarData = {
      listaMasivo: this.listaMasivo,
      codigoUserName: this.usuarioSesion?.usuario.usuario,
    };

    this.archivoValido = countRegisterExcel > 0;
  }

  // Solo procesamos los registros después de la fila 3
  private esLineaValida(idx: number): boolean {
    return idx >= 1; // Se salta las primeras 3 líneas
  }

  private procesarRegistro(p: any): boolean {
    if (this.validRegister(p)) {
      this.listaMasivo.push(this.crearRegistroValido(p));
      return true;
    }
    return false;
  }

  /*private crearRegistroValido(p: any): any {
    return {
      fechaInicio: this.obtenerValor(p, 1),
      fechaFin: this.obtenerValor(p, 2),
      diaFestivo: this.obtenerValor(p, 3),
      tipo: this.obtenerValor(p, 4),
      distritoFiscal: this.obtenerValor(p, 5),
      nombre: this.obtenerValor(p, 6),
      descripcion: this.obtenerValor(p, 7),
    };
  }*/

  private crearRegistroValido(p: any): any {
    const valores = {
      fechaInicio: p['__EMPTY_1'] || '',
      fechaFin: p['__EMPTY_2'] || '',
      diaFestivo: p['Días Festivos y No Laborables'] || '',
      tipo: p['__EMPTY_3'] || '',
      distritoFiscal: p['__EMPTY_4'] || '',
      nombre: p['__EMPTY_5'] || '',
      descripcion: p['__EMPTY_6'] || '',
    };
    console.log('valores:', valores);
    return valores;
  }

  private obtenerValor(p: any, keyIndex: number): string {
    return p[this.keys[keyIndex]] || '';
  }

  private agregarNoRegistrado(p: any): void {
    this.noRegistrado.push({
      fila: this.obtenerValor(p, 0),
      error: '',
      nombre: this.obtenerValor(p, 3),
      fechaInicio: this.obtenerValor(p, 4),
      fechaFin: this.obtenerValor(p, 5),
      usuario: this.usuarioSesion?.usuario.usuario,
    });
  }

  private crearDatosEnvio(): any {
    return {
      listaMasivo: this.listaMasivo,
      codigoUserName: '32920589',
    };
  }

  //

  /**leerCargaMasiva() {
   let countLine = 0;
   let countRegisterExcel = 0;
   this.data.forEach((p, idx) => {
   countLine++;
   if (countLine > 3) {
   if (this.validRegister(p)) {
   this.listaMasivo.push({
   fechaInicio: p[this.keys[1]] ? p[this.keys[1]] : '',
   fechaFin: p[this.keys[2]] ? p[this.keys[2]] : '',
   diaFestivo: p[this.keys[3]] ? p[this.keys[3]] : '',
   tipo: p[this.keys[4]] ? p[this.keys[4]] : '',
   distritoFiscal: p[this.keys[5]] ? p[this.keys[5]] : '',
   nombre: p[this.keys[6]] ? p[this.keys[6]] : '',
   descripcion: p[this.keys[7]] ? p[this.keys[7]] : '',
   });

   countRegisterExcel++;
   } else {
   this.noRegistrado.push({
   fila: p[this.keys[0]] ? p[this.keys[0]] : '',
   error: '',
   nombre: p[this.keys[3]] ? p[this.keys[3]] : '',
   fechaInicio: p[this.keys[4]] ? p[this.keys[4]] : '',
   fechaFin: p[this.keys[5]] ? p[this.keys[5]] : '',
   usuario: '40291777',
   });
   }
   }
   });

   this.enviarData = {
   listaMasivo: this.listaMasivo,
   codigoUserName: '32920589',
   };

   if (countRegisterExcel > 0) this.archivoValido = true;
   else this.archivoValido = false;
   }**/

  /***validRegister(p: any): boolean {
   console.log('Validando registro:', p);
   // Validamos que existan los campos requeridos
   const isValid = p['__EMPTY_1'] && // Fecha Inicio
   p['__EMPTY_2'] && // Fecha Fin
   p['Días Festivos y No Laborables'] && // Dia Festivo
   p['__EMPTY_3'] && // Tipo
   p['__EMPTY_4'] && // Distrito Fiscal
   p['__EMPTY_5'];  // Nombre

   console.log('Validando registro:', p, 'Resultado:', isValid);
   return isValid;
   }***/

  validRegister(p: any): boolean {
    return (
      p[1] && // Fecha Inicio
      p[2] && // Fecha Fin
      p[3] && // Dia Festivo
      p[4] && // Tipo
      p[5] && // Distrito Fiscal
      p[6] && // Nombre
      p[7]
    ); // Descripcion
  }

  quitarFile() {
    // this.inputFile.nativeElement.value = '';
    // this.dataSheet.next(null);
    // this.keys = null;
    if (this.inputFile && this.inputFile.nativeElement) {
      this.inputFile.nativeElement.value = '';
    }

    // Limpia las variables y estados relacionados
    this.fileToUpload = null;
    this.fileName = null;
    this.format = null;
    this.size = null;
    this.archivoValido = false; // Invalida el archivo subido

    // Limpia los datos procesados del archivo
    this.data = [];
    this.dataSheet.next(null);

    // Limpia cualquier mensaje de error o validación si es necesario
    this.errorSize = false;

    console.log('Archivo eliminado correctamente.');
  }

  registrarCargaMasiva(): boolean {
    this.leerCargaMasivaNuevo();

    this.calendarioNoLaborableService
      .cargaMasivaCalendario(this.enviarData)
      .subscribe({
        next: (response) => {
          //console.log("cargaMasivaCalendario:",response)
          if (response?.responseMessageDTO?.code == '0') {
            //console.log("carga masiva correcta");
            this.refModal = this.dialogService.open(AlertModalComponent, {
              width: '600px',
              showHeader: false,
              data: {
                icon: 'success',
                title: 'REGISTRO REALIZADO CORRECTAMENTE',
                description:
                  'El registro de forma masiva los días festivos/no laborables, se realizó correctamente',
                confirmButtonText: 'Listo',
              },
            });
          } else {
            console.log('no se cargó');
            this.refModal = this.dialogService.open(AlertModalMasivoComponent, {
              width: '70%',
              showHeader: false,
              data: {
                title: 'FALLO EN EL REGISTRO DE DÍAS FESTIVOS/NO LABORABLES',
                subtitle:
                  'Días no registrados(' + this.cantidadNoRegistrados + ')',
                description:
                  'El registro de días festivos y/o no laborables no pudo ser realizado, favor de revisar los registros con error y volver a intentar. Acontinuación, se muestra el detalle de los registros con error:',
                noRegistrado: this.noRegistrado,
                turno: false,
                confirmButtonText: 'Listo',
              },
            });
          }
          return true;
        },
        error: (err) => {
          this.error = err;
          console.error('Error al realizar la carga masiva', err);
          this.messageService.add({
            severity: 'error',
            detail: 'No se realizó la carga ',
          });
          return false;
        },
      });

    return false;
  }

  //remueve filas vacías del objeto excel
  // private removeEmptyRowsFronExcel(): void {
  //   this.data = this.data.filter(row => Array.isArray(row) && row.length > 0 && row.some(cell => cell !== ''));
  // }
}
