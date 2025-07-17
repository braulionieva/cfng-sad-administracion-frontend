import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CmpLibModule } from 'ngx-mpfn-dev-cmp-lib';
import { obtenerIcono } from '@utils/icon';
import { descargarArchivoB64 } from '@utils/file';
import { AdjuntoData } from './adjunto-data.interface';

@Component({
  selector: 'app-visor-pdf-frame',
  standalone: true,
  imports: [CommonModule, CmpLibModule],
  templateUrl: './visor-pdf-frame.component.html',
  styleUrls: ['./visor-pdf-frame.component.scss'],
})
export class VisorPdfFrameComponent {
  obtenerIcono = obtenerIcono;
  descargarArchivoB64 = descargarArchivoB64;
  closable: boolean = false;

  @Input() documentoAdjunto: AdjuntoData;

  get pdfIcon(): string {
    return 'assets/images/pdf_img.png';
  }

  descargarArchivo() {
    descargarArchivoB64(
      this.documentoAdjunto.base64,
      this.documentoAdjunto.namePdf
    );
  }

  getPdfTitle() {
    return this.documentoAdjunto?.preNamePdf || 'PDF Reader';
  }
}
