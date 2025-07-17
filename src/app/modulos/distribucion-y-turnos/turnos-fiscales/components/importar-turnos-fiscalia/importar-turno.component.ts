import {CommonModule} from '@angular/common';
import {HttpClient} from '@angular/common/http';

import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import {AlertModalComponent} from '@components/alert-modal/alert-modal.component';
import {AlertModalMasivoComponent} from '@components/alert-modal-masivo/alert-modal-masivo.component';
import {BACKEND} from '@environments/environment';
import {CalendarioNoLaborableService} from '@services/calendario-no-laborable/calendario-no-laborable.service';
import {MaestroService} from '@services/maestro/maestro.service';
import {TurnoService} from '@services/turno/turno.service';
import {FORMAT_FILE_SIZE} from '@utils/file';
import {obtenerIcono} from '@utils/icon';
import {CmpLibModule, ctrlErrorMsg} from 'ngx-mpfn-dev-cmp-lib';
import {MessageService} from 'primeng/api';
import {ButtonModule} from 'primeng/button';
import {
  DialogService,
  DynamicDialogConfig,
  DynamicDialogRef,
} from 'primeng/dynamicdialog';
import {firstValueFrom, Subject, Subscription} from 'rxjs';
import * as XLSX from 'xlsx';
import * as ExcelJS from 'exceljs';
import {ExcelService} from '@services/turno/excel.service';
import {Auth2Service} from "@services/auth/auth2.service";
import {ValidacionExcelFrontendService} from "./ValidacionExcelFrontendService"

@Component({
  selector: 'app-importar-turno',
  standalone: true,
  imports: [
    CommonModule,
    ButtonModule,
    FormsModule,
    ReactiveFormsModule,
    CmpLibModule,
  ],
  templateUrl: './importar-turno.component.html',
  styleUrls: ['./importar-turno.component.scss'],
})
export class ImportarTurnoComponent implements OnInit {
  titulo: string = '';
  public obtenerIcono = obtenerIcono;

  registerExcel: any;
  listaMasivo: any[] = [];
  sizeMaximo: any = 10 * 1024 * 1024; //102400
  public formularioImportar: FormGroup;

  archivoValido: boolean = false;
  noRegistrado: any = [];
  cantidadNoRegistrados = 0;
  fileToUpload: File | null = null;
  importarDespachos: any[] = [];
  files: File[] = [];
  fileName: any;
  format: any;
  size: any;
  listaDespachos: any = [];
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

  @ViewChild('inputFile') inputFile: ElementRef;

  error: any;

  public usuarioSesion;

  constructor(
    public readonly calendarioNoLaborableService: CalendarioNoLaborableService,
    private readonly formBuilder: FormBuilder,
    public readonly ref: DynamicDialogRef,
    public readonly config: DynamicDialogConfig,
    private readonly http: HttpClient,
    public readonly dialogService: DialogService,
    private readonly messageService: MessageService,
    private readonly maestroService: MaestroService,
    private readonly turnoService: TurnoService,
    private readonly excelService: ExcelService,
    private readonly userService: Auth2Service,
    private readonly validacionExcelFrontendService: ValidacionExcelFrontendService,
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
    // this.cargaDespachos();
    // this.listarDespachosDependencias();
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.usuarioSesion = this.userService.getUserInfo();
    }, 100);
  }

  /*cargaDespachos() {
    this.subscriptions.push(
      this.maestroService.listarDespachosActivos().subscribe({
        next: (resp) => {
          this.importarDespachos = resp;
        },
      })
    );
  }*/

  enviarDataExcel() {
    //aqui el metodo que valide this.data y que si pasa la validacion invoca a confirmar
    this.confirmarimportacion();
  }

  public confirmarimportacion(): void {
    this.refModal = this.dialogService.open(AlertModalComponent, {
      width: '750px',
      showHeader: false,
      data: {
        icon: 'question',
        title: 'REGISTRAR TURNOS MASIVAMENTE',
        confirm: true,
        confirmButtonText: 'Aceptar',
        description:
          'A continuación, se procederá a <b>registrar</b> de forma masiva los <b>Turnos</b> para las distintas fiscalías y despachos correspondientes. ¿Está seguro de realizar esta acción?',
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
    this.generateExcel();
  }

  /*listarDespachosDependencias() {
    this.subscriptions.push(
      this.turnoService.obtenerListaDespachos().subscribe({
        next: (resp) => {
          this.listaDespachos = resp?.despachos;
        },
      })
    );
  }

  loadExcelFromAssets(): boolean {
    this.loadAndModifyExcel();

    return true;
  }*/

  /*loadAndModifyExcel() {
    this.excelService.loadExcelFile().subscribe((blob) => {
      this.excelService.modifyExcelFile(blob, this.listaDespachos);
    });
  }*/

  async generateExcel() {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Sheet 1');

    // Descargar la imagen desde una URL o ruta local
    const imageUrl = 'assets/images/logo_fiscalia_horizontal_escudo_azul.png';
    const imageData = await firstValueFrom(
      this.http.get(imageUrl, {responseType: 'arraybuffer'})
    );

    const imageId = workbook.addImage({
      buffer: imageData,
      extension: 'png',
    });

    worksheet.addImage(imageId, {
      tl: {col: 0, row: 0},
      ext: {width: 200, height: 60},
    });

    worksheet.getColumn(1).width = 6; // Columna A
    worksheet.getColumn(2).width = 35;
    worksheet.getColumn(3).width = 55;
    worksheet.getColumn(4).width = 35;
    worksheet.getColumn(5).width = 25;
    worksheet.getColumn(6).width = 25;
    worksheet.getRow(2).height = 30; // Altura

    worksheet.getCell('C2').value = 'Turnos Fiscales';
    worksheet.getCell('C2').font = {
      name: 'Arial',
      size: 14,
      bold: true,
      color: {argb: '000000'},
    };
    worksheet.getCell('C2').alignment = {
      vertical: 'middle',
      horizontal: 'center',
    };

    worksheet.getCell('C3').value = 'Fecha y hora : ';
    worksheet.getCell('C3').alignment = {horizontal: 'right'};

    const now = new Date();
    const options: Intl.DateTimeFormatOptions = {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    };
    const formattedDate = now
      .toLocaleString('en-GB', {...options, timeZone: 'America/Lima'})
      .replace('am', 'AM')
      .replace('pm', 'PM');
    worksheet.getCell('D3').value = formattedDate;
    // worksheet.getCell('D3').numFmt = 'dd/mm/yyyy hh:mm AM/PM'; // Formato de fecha

    worksheet.getCell('E3').value = 'Total de turnos : ';
    worksheet.getCell('E3').alignment = {horizontal: 'right'};

    worksheet.getCell('F3').value = 1;

    worksheet.getCell('A4').value = 'N°';
    worksheet.getCell('B4').value = 'Distrito Fiscal';
    worksheet.getCell('C4').value = 'Dependencia';
    worksheet.getCell('D4').value = 'Despacho';
    worksheet.getCell('E4').value = 'Fecha hora inicio de turno';
    worksheet.getCell('F4').value = 'Fecha hora fin de turno';

    worksheet.getCell('A5').value = '1';
    worksheet.getCell('B5').value = 'Distrito Fiscal de Lima';
    worksheet.getCell('C5').value =
      '1ra. Fiscalía provincial penal transitoria de la Victoria';
    worksheet.getCell('D5').value = '1er Despacho';
    worksheet.getCell('E5').value = '14/08/2023 08:00:00';
    worksheet.getCell('F5').value = '21/08/2023 07:59:00';

    const startRow = 4; // Fila '4'
    const endRow = 1 + startRow + 1; //Despues del 4
    const startCol = 1; // Columna 'A'
    const endCol = 6;

    for (let row = startRow; row <= endRow; row++) {
      for (let col = startCol; col <= endCol; col++) {
        const cell = worksheet.getCell(row, col);
        cell.border = {
          top: {style: 'thin'},
          left: {style: 'thin'},
          bottom: {style: 'thin'},
          right: {style: 'thin'},
        };
      }
    }
    workbook.xlsx.writeBuffer().then((data: ArrayBuffer) => {
      const blob = new Blob([data], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });
      const url = window.URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = 'Carga_masiva_turnos.xlsx';
      anchor.click();
    });
  }

  /*public cargaInicialSatisfactorio(
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
  }*/

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
    return 'O arrastre el archivo a esta sección. Tamaño máximo de archivo';
  }

  /*readFiles() {
    // This is intentional
  }*/

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
        const wb: XLSX.WorkBook = XLSX.read(bstr, {type: 'binary'});

        /* grab first sheet */
        const wsname: string = wb.SheetNames[0];
        const ws: XLSX.WorkSheet = wb.Sheets[wsname];

        /* save data */
        //this.data = XLSX.utils.sheet_to_json(ws);

        // Modificación aquí: forzar uso de índices numéricos
        this.data = XLSX.utils.sheet_to_json(ws, {header: 1});
        this.data = this.data.slice(3); // considerar desde el registro 4 hacia abajo

        //removemos filas con registros vacíos
        //this.removeEmptyRowsFronExcel();
        this.data = this.data.filter(row => Array.isArray(row) && row.length > 0 && row.some(cell => cell !== ''));

        //console.log("this.data:", this.data)

        //validar los datos en esta linea, no considerar el primero registro ya que es una cabecera
        this.validarExcelCargadoFrontend(this.data)

      };

      reader.readAsArrayBuffer(target.files[0]);

      reader.onloadend = (e) => {
        this.spinnerEnabled = false;
        this.keys = Object.keys(this.data[0]);
        this.dataSheet.next(this.data);
      };
    } else {
      this.quitarFile();
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

  validarExcelCargadoFrontend(data: any) {

    this.noRegistrado = this.validacionExcelFrontendService.validateExcelData(data);

    if (this.noRegistrado.length > 0) {
      this.mostrarExcelFrontendInvalid();
      return false;
    }else{
      return true;
    }

  }

  mostrarExcelFrontendInvalid() {
    this.refModal = this.dialogService.open(AlertModalMasivoComponent, {
      width: '70%',
      showHeader: false,
      data: {
        title: 'FALLO EN EL REGISTRO DE TURNOS FISCALES',
        subtitle:
          'Días no registrados(' + this.cantidadNoRegistrados + ')',
        description:
          'El registro de los turnos fiscales no pudo ser realizado, favor de revisar los registros con error. A continuación, se muestra el detalle de los registros con error:',
        noRegistrados: this.noRegistrado,
        turno: true,
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


  //refactorizado
  /***leerCargaMasiva() {
    let countLine = 0;
    let countRegisterExcel = 0;

    if (this.data?.length > 0) {
      this.data.forEach((p, idx) => {
        countLine++;
        if (countLine > 3) {
          if (this.isRowValid(p)) {
            this.listaMasivo.push(this.buildRegistro(p, countLine));
            countRegisterExcel++;
          } else {
            this.noRegistrado.push(this.buildNoRegistrado(p));
          }
        }
      });
    }

    this.cantidadNoRegistrados = this.noRegistrado.length;
    this.enviarData = {
      listaMasivo: this.listaMasivo,
      codigoUserName: '32920589',
    };

    this.archivoValido = countRegisterExcel > 0;
  }***/

  //refactorizado por segunda ocasión.
  leerCargaMasivaNuevo(): void {
    let countRegisterExcel = 0;

    this.data.forEach((p, idx) => {
      console.log(`Procesando registro ${idx}:`, p);

      // Solo procesamos los registros sin la cabecera

        if (this.validRegister(p)) {
          const registroValido = {
            distritoFiscal: p[1] || '',
            dependencia: p[2] || '',
            despacho: p[3] || '',
            fechaInicio: p[4] || '',
            fechaFin: p[5] || '',
          };

          //console.log('Registro válido creado:', registroValido);
          this.listaMasivo.push(registroValido);
          countRegisterExcel++;
        }else{
          this.noRegistrado.push({
            fila: p[0] || idx + 1,
            error: 'Registro inválido o incompleto',
            nombre: p[6] || '',
            fechaInicio: p[1] || '',
            fechaFin: p[2] || '',
            usuario: this.usuarioSesion?.usuario.usuario,
          });
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

  validRegister(p: any): boolean {
    return p[0] && // N° (Número de registro)
      p[1] && // Distrito Fiscal
      p[2] && // Dependencia
      p[3] && // Despacho
      p[4] && // Fecha hora inicio de turno
      p[5];   // Fecha hora fin de turno
  }

  /*private isRowValid(p: any): boolean {
    return (
      this.validDate(p[this.keys[4]]) != null &&
      this.validDate(p[this.keys[5]]) != null
    );
  }

  private buildRegistro(p: any, countLine: number): any {
    return {
      codigoDespacho: this.importarDespachos[countLine],
      fechaInicio: p[this.keys[4]] || '',
      fechaFin: p[this.keys[5]] || '',
      usuario: '40291777',
    };
  }

  private buildNoRegistrado(p: any): any {
    return {
      fila: p[this.keys[0]] || '',
      error: '',
      dependencia: p[this.keys[2]] || '',
      despacho: p[this.keys[3]] || '',
      fechaInicio: p[this.keys[4]] || '',
      fechaFin: p[this.keys[5]] || '',
      usuario: '40291777',
    };
  }*/

  /*validDate(value: string): Date {
    let date: any;
    try {
      const [day, month, year] = value.split('/').map(Number);
      date = new Date(year, month - 1, day);
    } catch {
      return null;
    }

    return date;
  }*/

  quitarFile() {
    // Restablecer variables de datos
    this.dataSheet.next(null);
    this.keys = null;
    this.data = [];
    this.files = [];

    // Restablecer variables de archivo
    this.fileName = '';
    this.format = '';
    this.size = 0;
    this.archivoValido = false;
    this.fileToUpload = null;

    // Restablecer variables de validación
    this.noRegistrado = [];
    this.cantidadNoRegistrados = 0;
    this.listaMasivo = [];
    this.enviarData = null;

    // Limpiar el input file
    if (this.inputFile && this.inputFile.nativeElement) {
      this.inputFile.nativeElement.value = '';
    }

    // Restablecer error size si existe
    this.errorSize = false;

    // Restablecer spinner si estuviera activo
    this.spinnerEnabled = false;

    // Opcional: También podríamos restablecer el formulario
    if (this.formularioImportar) {
      this.formularioImportar.get('file').reset();
    }
  }

  registrarCargaMasiva() {
    this.leerCargaMasivaNuevo();
    console.log("this.enviarData:",this.enviarData)
    this.turnoService.cargaMasivaTurno(this.enviarData).subscribe({
      next: (response) => {
        console.log("response:", response)
        if (response?.responseMessageDTO?.code == "0") {
          this.refModal = this.dialogService.open(AlertModalComponent, {
            width: '600px',
            showHeader: false,
            data: {
              icon: 'success',
              title: 'REGISTRO REALIZADO CORRECTAMENTE',
              description:
                'El registro de forma masiva los <b>Turnos</b> para distintas fiscalías y despachos, se realizó correctamente.',
              confirmButtonText: 'Listo',
            },
          });
        } else {
          console.log("no se cargó")
          this.refModal = this.dialogService.open(AlertModalMasivoComponent, {
            width: '70%',
            showHeader: false,
            data: {
              title: 'FALLO EN EL REGISTRO DE TURNOS FISCALES',
              subtitle:
                'Días no registrados(' + this.cantidadNoRegistrados + ')',
              description:
                'El registro de los turnos fiscales no pudo ser realizado, favor de revisar los registros con error. A continuación, se muestra el detalle de los registros con error:',
              noRegistrado: this.noRegistrado,
              turno: true,
              confirmButtonText: 'Listo',
            },
          });
        }

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
    return true;
  }

  get counterObservacion(): number {
    return this.formularioImportar.get('observaciones').value?.trim().length !==
    0
      ? this.formularioImportar.get('observaciones').value?.length
      : 0;
  }

  FORMAT_FILE_SIZE(tamanioBytes: number, decimal: number) {
    return FORMAT_FILE_SIZE(tamanioBytes, decimal);
  }
}
