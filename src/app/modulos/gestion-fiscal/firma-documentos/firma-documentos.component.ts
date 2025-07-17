import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { DropdownModule } from 'primeng/dropdown';
import { RadioButtonModule } from 'primeng/radiobutton';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { FiltrosComponent } from './filtros/filtros.component';
import { TablaComponent } from './tabla/tabla.component';
import { AccionesComponent } from './acciones/acciones.component';
import {
  DynamicDialog,
  DialogService,
  DynamicDialogConfig,
} from 'primeng/dynamicdialog';
import { Component } from '@angular/core';
import { Subscription } from 'rxjs';
import {
  FirmaDocumentoResponse,
  FirmaDocumentoTabla,
} from '@interfaces/firma-documento/firma-documento';
import { FirmaDocumentoService } from '@services/firma-documento/firma-documento.service';
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-firma-documentos',
  standalone: true,
  templateUrl: './firma-documentos.component.html',
  styleUrls: ['./firma-documentos.component.scss'],
  imports: [
    CommonModule,
    DropdownModule,
    RadioButtonModule,
    ReactiveFormsModule,
    TableModule,
    ButtonModule,
    FiltrosComponent,
    TablaComponent,
    AccionesComponent,
    DynamicDialog,
  ],
  providers: [DynamicDialogConfig, DialogService],
})
export class FirmaDocumentosComponent {
  firmaDocumentoResponse: FirmaDocumentoResponse;
  firmaDocumentoTabla: FirmaDocumentoTabla;

  nameExcel = 'TipoDocumentoxCargoParaFIrma.xlsx';
  public suscriptions: Subscription[] = [];
  error: any;
  searchTipoDocumento: any = null;

  constructor(private readonly firmaDocumentoService: FirmaDocumentoService) {}

  onFilter($event) {
    this.searchTipoDocumento = $event?.toString().toUpperCase(); //?.toString().length>2?$event?.toString():'-';

    this.actualizarTablaDocumentos();
  }

  actualizarTablaDocumentos(){
    this.suscriptions.push(
      this.firmaDocumentoService
        .buscarFirmaDocumentoPerfil(this.searchTipoDocumento)
        .subscribe({
          next: (resp) => {
            this.firmaDocumentoResponse = resp;
            this.firmaDocumentoTabla = resp.registros;
          },
          error: (error) => {
            console.error('error', error);
          },
        })
    );
  }

  exportToExcel(): void {
    let element = document.getElementById('idFirmaDocumentoTabla');
    const worksheet: XLSX.WorkSheet = XLSX.utils.table_to_sheet(element);

    const book: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(book, worksheet, 'Sheet1');

    XLSX.writeFile(book, this.nameExcel);
  }

  actualizarTabla() {
    this.actualizarTablaDocumentos();
  }
}
