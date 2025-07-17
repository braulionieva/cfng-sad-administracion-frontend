import { Component, LOCALE_ID, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { DynamicDialogRef, DynamicDialogConfig } from 'primeng/dynamicdialog';
import { TableModule } from 'primeng/table';
import { NgxSpinnerService } from 'ngx-spinner';
import { DomSanitizer } from '@angular/platform-browser';
import { descargarArchivoB64 } from '@utils/file';
import { VisorPdfFrameComponent } from './visor-usuario/visor-pdf-frame.component';
import { AdjuntoData } from './visor-usuario/adjunto-data.interface';
import { UsuarioService } from '@services/usuario/usuario.service';

export class ArchivoDocumento {
  idDocumento: string;
  archivo: string;
}

@Component({
  selector: 'app-ficha-usuario',
  standalone: true,
  imports: [
    CommonModule,
    TableModule,
    ButtonModule,
    TooltipModule,
    VisorPdfFrameComponent,
  ],

  templateUrl: './ficha-usuario.component.html',
  styleUrls: ['./ficha-usuario.component.scss'],
  providers: [
    {
      provide: LOCALE_ID,
      useValue: 'es-PE',
    },
  ],
})
export class FichaUsuarioComponent implements OnInit {
  titulo: string = '';

  public documentos: any[] = [];
  public archivoDocumento: ArchivoDocumento[] = [];

  distritoFiscal: string;
  descargarArchivoB64 = descargarArchivoB64;
  tipoEspecialidad: string;
  especialidad: string;
  distrito: string;
  idGrupoAleatorio: any;
  datosDocumento: any = {};
  public documento: any = {};
  public searchDocument;
  public dependenciaAnio: string = '0-0';
  public numeroSecuencia: string = '-0-0';
  public countDocument: any;

  public emisorCaso: string;
  public observaciones: string;
  public codigoDocumento: string;

  public loading: boolean = true;
  public urlPdf: string = '';

  documentoAdjunto: AdjuntoData = {
    id: null,
    urlPdf: null,
    preNamePdf: 'Sin vista previa de documento',
    namePdf: '',
    isSign: false,
    base64: null,
    fromServer: false,
  };
  usuario: any;

  constructor(
    private readonly usuarioService: UsuarioService,
    // public grupoAleatorioService:GrupoAleatorioService,
    public ref: DynamicDialogRef,
    private readonly spinner: NgxSpinnerService,
    private readonly sanitizer: DomSanitizer,
    public config: DynamicDialogConfig
  ) {
    this.countDocument = 0;
  }

  ngOnInit(): void {
    this.titulo = this.config.data?.title;
    this.usuario = this.config.data?.usuario;
    this.generateReport();
  }

  public close(): void {
    this.ref.close();
  }
  public icon(name: string): string {
    return `assets/icons/${name}.svg`;
  }
  public img(name: string): string {
    return `assets/images/${name}.png`;
  }
  /*descargarArchivo() {
    descargarArchivoB64(this.documentoAdjunto.base64, this.documentoAdjunto.namePdf)
  }

  setDocumento(documento: any, download: boolean): void {
    let documento2 = {
      idDocumento: "220683A57E01E9C3E0650250569D508A",
      nombreDocumento: "nombre.pdf"
    }
    this.codigoDocumento = documento2.nombreDocumento
    this.getArchivoDocument(documento2, download)
    this.spinner.hide();
  }


  public getArchivoDocument(documento: any, download: boolean) {
    this.spinner.show()

    this.grupoAleatorioService.obtenerDocumentoServidor(documento.idDocumento)
      .subscribe({
        next: resp => {
          if (resp ) {
            // this.saveDocument(documento.idDocumento, resp.archivo)
            this.getUrl(resp.archivo, download, documento.nombreDocumento)
          }
        }, error: (error) => {//mostrar mensaje
          this.spinner.hide()
        }
      });
    this.spinner.hide()
  }

  saveDocument(idDocument: string, archivo: string) {
    this.archivoDocumento.push({
      idDocumento: idDocument,
      archivo: archivo
    });
  }
*/
  public getUrl(
    dataB64: string,
    download: boolean,
    nombreDocumento: string
  ): void {
    //this.spinner.show()
    const data = dataB64;
    if (data != null) {
      const base64str = data;
      const binary = atob(base64str.replace(/\s/g, ''));
      const len = binary.length;
      const buffer = new ArrayBuffer(len);
      const bytes = new Uint8Array(buffer);
      for (let i = 0; i < len; i++) {
        bytes[i] = binary.charCodeAt(i);
      }
      const file = new Blob([bytes], { type: 'application/pdf' });
      this.loading = false;

      let urlPdf = URL.createObjectURL(file);

      this.documentoAdjunto = {
        id: null,
        urlPdf: this.sanitizer.bypassSecurityTrustResourceUrl(urlPdf),
        preNamePdf: '',
        namePdf: `${nombreDocumento}`,
        isSign: false,
        base64: dataB64,
        fromServer: true,
      };
      // if (download) {
      //   this.downloadDocument(dataB64, nombreDocumento, urlPdf);
      // }
    }
    this.spinner.hide();
  }

  descargarPDF() {
    const nombreDocumento = `Ficha_Usuario_${
      this.usuario?.nombre || 'SinNombre'
    }_${this.usuario?.apellido || 'SinApellido'}`;

    this.downloadDocument(this.documentoAdjunto.base64, nombreDocumento);
  }

  downloadDocument(dataB64: string, nombreDocumento: string) {
    // this.spinner.show()
    try {
      // const name = `Ficha_Usuario_${nombreDocumento}`; //nombreDocumento//
      // const link = document.createElement('a');
      // link.href = urlPdf;
      // link.setAttribute('download', `${name}.pdf`);
      // document.body.appendChild(link);
      // link.click();
      // this.spinner.hide();

      // Convierte el base64 en un Blob
      const byteCharacters = atob(dataB64);
      const byteNumbers = new Array(byteCharacters.length)
        .fill(0)
        .map((_, i) => byteCharacters.charCodeAt(i));
      const byteArray = new Uint8Array(byteNumbers);
      const file = new Blob([byteArray], { type: 'application/pdf' });

      // Crea un enlace de descarga con un nombre definido
      const link = document.createElement('a');
      const url = URL.createObjectURL(file);
      link.href = url;
      link.setAttribute('download', `${nombreDocumento}.pdf`); // Asigna el nombre deseado
      document.body.appendChild(link);
      link.click();

      // Limpia el enlace después de usarlo
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      this.spinner.hide();
    }
  }

  generateReport() {
    this.usuarioService.generateReport(this.usuario).subscribe({
      next: (resp) => {
        //con modal para descarga automatica en false
        this.getUrl(resp.reporte, false, 'Report - Usuario');
        // this.documentoAdjunto = {
        //   id: null,
        //   base64: resp.reporte,
        //   namePdf: 'Report - Usuario', // Nombre que mostrar
        //   preNamePdf: '',
        //   isSign: false,
        //   fromServer: true,
        //   urlPdf: null,
        // };
      },
      error: (error) => {
        //mostrar mensaje
        console.error('error:', error);
        this.spinner.hide();
      },
    });
  }

  base64ToBlob(base64: string, contentType: string): Blob {
    const byteCharacters = atob(base64);
    const byteNumbers = new Array(byteCharacters.length)
      .fill(0)
      .map((_, i) => byteCharacters.charCodeAt(i));
    const byteArray = new Uint8Array(byteNumbers);
    return new Blob([byteArray], { type: contentType });
  }
}
