import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActoProcesalBandejaDetalleResponse } from '@interfaces/admin-acto-procesal/acto-procesal';
import { DialogModule } from 'primeng/dialog';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { TableModule } from 'primeng/table';

@Component({
  selector: 'app-detalle-tramite-actoprocesal',
  standalone: true,
  imports: [
    CommonModule,
    DialogModule,
    TableModule
  ],
  templateUrl: './detalle-tramite-acto-procesal.component.html',
  styleUrls: ['./detalle-tramite-acto-procesal.component.scss']
})
export class DetalleTramiteActoProcesalComponent implements OnInit {

  detalles: ActoProcesalBandejaDetalleResponse[] = [];


  constructor(
    public ref: DynamicDialogRef,
    public config: DynamicDialogConfig,
  ) { }

  ngOnInit() {
    this.detalles = this.config.data?.detalles;
  }

  public close(): void {
    this.ref.close();
  }



}
