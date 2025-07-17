import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { DialogModule } from 'primeng/dialog';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { TableModule } from 'primeng/table';

@Component({
  selector: 'app-modal-detalle-tabla',
  standalone: true,
  imports: [
    CommonModule,
    DialogModule,
    TableModule
  ],
  templateUrl: './modal-detalle-tabla.component.html',
  styleUrls: ['./modal-detalle-tabla.component.scss']
})
export class ModalDetalleTablaComponent implements OnInit {
  @Input() titulo: string = '';
  @Input() cols: any[] = [];
  @Input() rows: any[] = [];
  @Input() showPagination: boolean = false;
  @Input() rowsPerPage: number = 10;

  constructor(
    public ref: DynamicDialogRef,
    public config: DynamicDialogConfig
  ) { }

  ngOnInit() {
    const data = this.config?.data;

    if (data) {
      this.titulo = data.title;
      this.cols = data.cols;
      this.rows = data.rows;
      this.showPagination = data.showPagination;
      this.rowsPerPage = data.rowsPerPage;
    } else {
      console.warn('Los datos de configuración no están definidos.');
    }
  }

  public close(): void {
    this.ref.close();
  }

}
