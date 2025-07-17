import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BACKEND } from '@environments/environment';
import { DataFile } from '@interfaces/grupo-aleatorio/grupo-aleatorio';
import { GrupoAleatorioService } from '@services/grupo-aleatorio/grupo-aleatorio.service';
import { obtenerIcono } from '@utils/icon';
import { CmpLibModule, ctrlErrorMsg } from 'ngx-mpfn-dev-cmp-lib';
import { NgxSpinnerService } from 'ngx-spinner';
import { ButtonModule } from 'primeng/button';

import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';

import { Subject, throwError } from 'rxjs';

@Component({
  selector: 'app-uploadSustento',
  standalone: true,
  imports: [
    CommonModule,
    ButtonModule,
    FormsModule,
    ReactiveFormsModule,
    CmpLibModule,
  ],
  templateUrl: './upload-sustento.component.html',
  styleUrls: ['./upload-sustento.component.scss']
})
export class UploadSustentoComponent implements OnInit {
  @Input() idGrupoAleatorio: string = null;
  @Output() onFile = new EventEmitter<DataFile>();
  datosDocumento: any = {};
  titulo: string = '';
  public obtenerIcono = obtenerIcono;

  public formularioCarga: FormGroup;
  archivoValido: boolean = false;
  files: File[] = [];
  fileName: any
  format: any
  size: any
  sizeMaximo: any = 10 * 1024 * 1024

  public data: any;
  keys: string[];
  dataSheet = new Subject();

  isExcelFile: boolean;
  spinnerEnabled = false;
  deleteURL: string = `${BACKEND.MS_DOCUMENTO}eliminar?filename=`
  url: string = `${BACKEND.MS_REPOSITORIO}cargar`

  @ViewChild('inputFile') inputFile: ElementRef;

  public cargaInicialOptions = [
    { label: 'Sí', value: true },
    { label: 'No', value: false },
  ];
  constructor(
    private grupoAleatorioService: GrupoAleatorioService,
    private http: HttpClient,
    private formBuilder: FormBuilder,
    public ref: DynamicDialogRef,
    public config: DynamicDialogConfig,
    private spinner: NgxSpinnerService,
  ) {
    this.formularioCarga = this.formBuilder.group({

      observaciones: [' ']
    });
  }

  ngOnInit() {
    if (this.idGrupoAleatorio != null && this.idGrupoAleatorio != undefined)
      this.getArchivoDocument();
    //this.consultarDocumentos()
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

  onLoadFile(event) {
    const files = event.target.files;
    if (!files.length) return;

    const target: DataTransfer = <DataTransfer>event.target;
    const file = target.files[0];
    const fileName = file.name;
    const fileSize = file.size;
    const fileExtension = fileName.split('.').pop()?.toLowerCase();

    this.files = files;
    this.archivoValido = false;
    this.fileName = fileName;
    this.format = '';
    this.size = fileSize;

    if (fileSize > this.sizeMaximo) return;

    if (['pdf', 'doc', 'docx'].includes(fileExtension)) {
      this.format = fileExtension === 'pdf' ? '.pdf' : '.doc';
      this.archivoValido = true;
      this.emitFile(file);
    } else {
      this.archivoValido = false;
      this.onFile.emit(null);
    }

    if (target.files.length > 1) {
      this.clearInputFile();
    }
  }

  private emitFile(file: File) {
    const dataEmit: DataFile = {
      File: file,
      idGrupoAleatorio: this.idGrupoAleatorio,
      observacion: this.formularioCarga.get('observaciones')?.value || ''
    };
    this.onFile.emit(dataEmit);
  }

  private clearInputFile() {
    this.inputFile.nativeElement.value = '';
  }

  onUpload() {
    if (this.files.length) {
      const formData = new FormData();

      [...this.files].forEach((file) => {
        formData.append("file", file, file.name);
      });

      const upload$ = this.http.post(this.url, formData);

      upload$.subscribe({
        next: () => {
        },
        error: (error: any) => {
          return throwError(() => error);
        },
      });
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


  async getArchivoDocument() {
    let dataEmit: DataFile;
    this.spinner.show()
    this.grupoAleatorioService.obtenerDocumentoServidor(this.idGrupoAleatorio).subscribe({
      next: (resp) => {
        this.spinner.hide()
        if (resp) {
          this.formularioCarga.get("observaciones").setValue(resp.observaciones != null ? resp.observaciones : ' ');

          let tmpFile = this.blobToFile(resp?.archivo, resp?.nombreDocumento);

          this.fileName = resp?.nombreDocumento;
          this.archivoValido = true;
          this.size = tmpFile.size;
          this.format = tmpFile.type ? tmpFile.type : 'pdf/doc';

          dataEmit = {
            File: tmpFile,
            idGrupoAleatorio: this.idGrupoAleatorio,
            observacion: resp?.observaciones ? resp.observaciones : ''
          }

          this.onFile.emit(dataEmit);

        }
      }, error: (error) => {//mostrar mensaje
        this.spinner.hide()
      }
    });
    this.spinner.hide()
  }
  public blobToFile = (theBlob: Blob, fileName: string): File => {
    return new File(
      [theBlob as any], // cast as any
      fileName,
      {
        lastModified: new Date().getTime(),
        type: theBlob.type
      }
    )
  }

}
