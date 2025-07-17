import { Component,Input, LOCALE_ID, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { DynamicDialogRef, DynamicDialogConfig } from 'primeng/dynamicdialog';
import { TableModule } from 'primeng/table';
import { NgxSpinnerService } from 'ngx-spinner';
import { DomSanitizer } from '@angular/platform-browser';
import { VisorPdfFrameComponent } from './visor-pdf-frame/visor-pdf-frame.component';
import { AdjuntoData } from './visor-pdf-frame/adjunto-data.interface';
import { GrupoAleatorioService } from '@services/grupo-aleatorio/grupo-aleatorio.service';
import { descargarArchivoB64 } from '@utils/file';
export class ArchivoDocumento {
  idDocumento: string;
  archivo: string;
}

@Component({
  selector: 'app-documento-adjunto-distribucion-aleatoria',
  standalone: true,
  imports: [
    CommonModule,
    TableModule,
    ButtonModule,
    TooltipModule,
    VisorPdfFrameComponent
  ],

  templateUrl: './documento-adjunto-distribucion-aleatoria.component.html',
  styleUrls: ['./documento-adjunto-distribucion-aleatoria.component.scss'],
  providers: [
    {
      provide: LOCALE_ID,
      useValue: "es-PE"
    }
  ],
})
export class DocumentoAdjuntoDistribucionAleatoriaComponent implements OnInit {
  titulo: string = '';

  @Input() public idDistribucionAleatoria;
  public documentos: any[] = []
  public archivoDocumento: ArchivoDocumento [] = []

  distritoFiscal : string
  descargarArchivoB64 = descargarArchivoB64
  tipoEspecialidad : string
  especialidad : string
  distrito : string
  idGrupoAleatorio: any
  datosDocumento: any = {};
  public documento: any = {};
  public searchDocument
  public dependenciaAnio : string = '0-0'
  public numeroSecuencia : string = '-0-0'
  public countDocument : any

  public emisorCaso : string
  public observaciones : string
  public codigoDocumento : string

  public loading: boolean = true
  public urlPdf: string = ''

  documentoAdjunto: AdjuntoData = {
    id: null,
    urlPdf: null,
    preNamePdf: 'Sin vista previa de documento',
    namePdf: '',
    isSign: false,
    base64: null,
    fromServer: false
  };

constructor(
   private grupoAleatorioService: GrupoAleatorioService,
    public ref : DynamicDialogRef,
    private spinner: NgxSpinnerService,
    private sanitizer: DomSanitizer,

   // private mesaDocumentoService: MesaDocumentoService,
    public config : DynamicDialogConfig) {
    this.countDocument = 0
  }

  ngOnInit(): void {
    this.titulo = this.config.data?.title;
    this.idGrupoAleatorio = this.config.data?.idGrupoAleatorio;

    this.datosDocumento = this.config.data?.datosDocumento;
    //this.consultarDocumentos()
    this.setDocumento(this.datosDocumento,false)
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
  descargarArchivo(){
    descargarArchivoB64(this.documentoAdjunto.base64,this.documentoAdjunto.namePdf)
  }

  public consultarDocumentos():void{
    this.spinner.show();
    this.grupoAleatorioService.consultaDocumentos(this.idGrupoAleatorio).subscribe({
        next: resp => {
          this.datosDocumento = {
            "distritoFiscal":resp.distritoFiscal,
            "distrito":resp.distrito,
            "tipoEspecialidad":resp.tipoEspecialidad,
            "especialidad":resp.especialidad,
            "totalArchivo":'1',
            "nombreDocumento":resp.nombreDocumento,
            "idDocumento": resp.idGrupoAleatorio
          }
          this.setDocumento(resp,false)
      },error: (error) => {//mostrar mensaje
        this.spinner.hide()
        this.searchDocument.loading = false;
      }})
      this.spinner.hide();
  }

  setDocumento(documento: any,download: boolean): void {
    this.codigoDocumento = documento.nombreDocumento
      this.getArchivoDocument(documento,download)
      this.spinner.hide();
  }
/**
  getArchivoList( idDocument : string ){
    let archivo : any = null
    this.archivoDocumento.forEach((d) => {
        if(d.idDocumento === idDocument)
          archivo = d.archivo
    });
    return archivo
  }**/

  public getArchivoDocument(documento : any, download:boolean){
    this.spinner.show()
    this.grupoAleatorioService.obtenerDocumentoServidor(documento.idDocumento)
    .subscribe({
      next: resp => {
        if ( resp /*&& resp.code === 200*/ ){
          this.saveDocument(documento.idDocumento,resp.archivo)
          this.getUrl(resp.archivo,download,documento.nombreDocumento)
        }
       },error: (error) => {//mostrar mensaje
        this.spinner.hide()
      }
    });
    this.spinner.hide()
  }

  saveDocument(idDocument: string,archivo:string ){
    this.archivoDocumento.push({
      idDocumento: idDocument,
      archivo: archivo
    });
  }

  public getUrl(dataB64 : string,download : boolean,nombreDocumento:string): void {
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
      const file = new Blob([bytes], {type: 'application/pdf'});
      this.loading = false
      let urlPdf = URL.createObjectURL(file);
      this.documentoAdjunto = {
        id: null,
        urlPdf: this.sanitizer.bypassSecurityTrustResourceUrl(urlPdf),
        preNamePdf: '',
        namePdf: `${nombreDocumento}`,
        isSign: false,
        base64: dataB64,
        fromServer: true
      };
      if(download){
        this.downloadDocument(dataB64,nombreDocumento,urlPdf)
      }
    }
    this.spinner.hide();
  }

  downloadDocument(dataB64:string,nombreDocumento:string,urlPdf: string){
   // this.spinner.show()
    try{
      const name = nombreDocumento//
      const link = document.createElement('a');
      link.href =  urlPdf;
      link.setAttribute("download", `${ name }.pdf`);
      document.body.appendChild(link);
      link.click();
      this.spinner.hide()
    } catch(error) {
      this.spinner.hide()
    }
  }
}

