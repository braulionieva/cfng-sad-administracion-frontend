import { CommonModule } from '@angular/common';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { AlertModalComponent } from '@components/alert-modal/alert-modal.component';
import { NotaInfoComponent } from '@components/nota-info/nota-info.component';
import { BACKEND } from '@environments/environment';
import { GrupoAleatorioService } from '@services/grupo-aleatorio/grupo-aleatorio.service';
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
import { RadioButtonModule } from 'primeng/radiobutton';
import { RippleModule } from 'primeng/ripple';
import { SelectButtonModule } from 'primeng/selectbutton';
import { ToastModule } from 'primeng/toast';
import { Subject, Subscription } from 'rxjs';

@Component({
  selector: 'app-carga-inicial-distribucion-aleatoria',
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
    ToastModule,
    NotaInfoComponent,
    CmpLibModule,
  ],
  templateUrl: './carga-inicial-distribucion-aleatoria.component.html',
  styleUrls: ['./carga-inicial-distribucion-aleatoria.component.scss'],
  providers: [MessageService]
})
export class CargaInicialDistribucionAleatoriaComponent implements OnInit {
  titulo: string = '';
  public obtenerIcono = obtenerIcono;

  public formularioCarga: FormGroup;
  archivoValido: boolean = false;
  sizeMaximo: any = 10 * 1024 * 1024;//102400
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

  valueToAction: any;
  isExcelFile: boolean;
  spinnerEnabled = false;
  deleteURL: string = `${BACKEND.MS_DOCUMENTO}eliminar?filename=`;
  url: string = `${BACKEND.MS_REPOSITORIO}cargar`;

  @ViewChild('inputFile') inputFile: ElementRef;
  idGrupoAleatorio: any;
  nombreGrupoAleatorio: string;
  // @Input()

  error: any;
  public cargaInicialOptions = [
    { label: 'Sí', value: '0' },
    { label: 'No', value: '1' },
  ];
  constructor(
    private readonly grupoAleatorioService: GrupoAleatorioService,
    private readonly formBuilder: FormBuilder,
    public ref: DynamicDialogRef,
    public config: DynamicDialogConfig,
    public dialogService: DialogService,
    private readonly spinner: NgxSpinnerService,
    private readonly messageService: MessageService,
  ) {
    this.formularioCarga = this.formBuilder.group({
      cargaInicialcheck: new FormControl(null),
      observaciones: [null],
      file: [null],
    });
  }
  public icon(name: string): string {
    return `assets/icons/${name}.svg`;
  }

  ngOnInit() {
    this.titulo = this.config.data?.title;
    this.idGrupoAleatorio = this.config.data?.idGrupoAleatorio;
    this.nombreGrupoAleatorio = this.config.data?.nombreGrupoAleatorio;
    this.formularioCarga.get('cargaInicialcheck').setValue('0');
  }

  public confirmarCargaInicial(): void {
    this.refModal = this.dialogService.open(AlertModalComponent, {
      width: '750px',
      showHeader: false,
      data: {
        icon: 'question',
        title: 'REGISTRAR CONFIGURACIÓN DE CARGA INICIAL',
        confirm: true,
        description:
          'A continuación, se procederá a <b>registrar la configuración de carga inicial</b> para el “' +
          this.nombreGrupoAleatorio +
          '”.<br>¿Esta seguro de realizar esta acción?',
      },
    });

    this.refModal.onClose.subscribe({
      next: (resp) => {
        if (resp === 'confirm') {
          this.guardarCargaInicial();
        }
      },
    });
    this.ref.close();
  }

  /*private guardarCargaInicial(): void {
    this.spinner.show();
      var data={
        'idGrupoAleatorio': this.idGrupoAleatorio,
        'cargaInicial': this.formularioCarga.get('cargaInicialcheck')?.value,
        'observaciones': this.formularioCarga.get('observaciones')?.value,
        'usuario': '40291777',
        'admin': '40291777'
      }
    this.grupoAleatorioService.cargaInicial(data).subscribe(
      {
        next: (response) => {
          this.spinner.hide();
          this.cargaInicialSatisfactorio('success', 'REGISTRO REALIZADO CORRECTAMENTE', 'El registro de la configuración de carga inicial del “' + this.nombreGrupoAleatorio + '” fue realizado exitosamente');

        },
        error: (err) => {
          this.spinner.hide();
          this.error = err;
          console.error('No se realizó la carga inicial.', err);
        }
      }
    );
  }*/

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
        confirmButtonText: 'Listo'
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
    let control: any = this.formularioCarga.get(field);
    value = control.value;
    value.length > maxLength && control.setValue(value.slice(0, maxLength));
  }
  errorMsg(ctrlName): any {
    if (ctrlName === 'observaciones')
      return ctrlErrorMsg(this.formularioCarga.get(ctrlName));
  }
  public getDescripcionFile(): any {
    return 'o arrastre el archivo a esta sección. Tamaño máximo de archivo.';
  }

  public getDescripcionTop(): any {
    return (
      '<b>Nota:</b> Al seleccionar "Si", todas las fiscalías del Grupo Aleatorio, iniciarán el año fiscal con carga en cero. Al seleccionar.' +
      '"No", la carga inicial de casos serán los que se trabajaron el año anterior.'
    );
  }
  onLoad(event): void {
    const file = (event.target as HTMLInputElement).files[0];
    this.fileToUpload = file;

    this.archivoValido = false;

    const target: DataTransfer = <DataTransfer>event.target;
    this.fileName = target.files[0].name;
    this.format = this.fileName.split('.').at(-1);

    this.size = target.files[0].size;
    if (!!target.files[0].name.match(/(.pdf)/)) {
      this.archivoValido = true;
    } else if (!!target.files[0].name.match(/(.doc|.docx)/)) {
      this.archivoValido = true;
    } else {
      this.archivoValido = false;
    }
    if (target.files.length > 1) {
      this.inputFile.nativeElement.value = '';
    }
    if (this.size > this.sizeMaximo) {
      this.messageService.add({ severity: 'error', detail: 'Lo sentimos, el archivo seleccionado excede el tamaño máximo permitido. Por favor, revise el archivo para que no sobrepase el peso máximo permitido de 10 MB' })
      /**return;**/
    }
  }

  quitarFile() {
    this.dataSheet.next(null);
    this.keys = null;

    this.data = [];
    this.files = [];
    this.fileName = "";
    this.format = ""
    this.size = 0
    this.archivoValido = false
  }
  get urlUpload(): string {
    return `${BACKEND.MS_REPOSITORIO}cargar`;
  }

  private guardarCargaInicial(): void {
    this.spinner.show();
    const data = {
      idGrupoAleatorio: this.idGrupoAleatorio,
      cargaInicial: this.formularioCarga.get('cargaInicialcheck')?.value,
      observaciones: this.formularioCarga.get('observaciones')?.value,
      usuario: '40291777',
      admin: '40291777',
    };

    const formData: FormData = new FormData();

    formData.append('file', this.fileToUpload, this.fileToUpload.name);
    formData.append('idGrupoAleatorio', data.idGrupoAleatorio);
    formData.append('cargaInicial', data.cargaInicial);
    formData.append('observaciones', data.observaciones);
    formData.append('usuario', data.usuario);
    formData.append('admin', data.admin);

    this.grupoAleatorioService.cargaInicial(formData).subscribe({
      next: (response) => {
        this.spinner.hide();
        this.cargaInicialSatisfactorio(
          'success',
          'Configuración Registrada',
          'El registro de la configuración de carga inicial del “' +
          this.nombreGrupoAleatorio +
          '” se realizó de forma exitosa.'
        );
      },
      error: (err) => {
        this.spinner.hide();
        this.error = err;
        console.error('No se realizó la carga inicial.', err);
      },
    });
  }
}
