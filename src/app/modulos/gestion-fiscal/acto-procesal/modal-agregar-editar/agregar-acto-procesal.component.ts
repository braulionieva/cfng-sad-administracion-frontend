import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MenuItem } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { InputTextModule } from 'primeng/inputtext';
import { StepsModule } from 'primeng/steps';
import { BuscarActoProcesalComponent } from './buscar/buscar-acto-procesal.component';
import { AgregarEditarActoProcesalComponent } from './agregar-editar/agregar-editar-acto-procesal.component';

@Component({
  selector: 'app-agregar-acto-procesal',
  standalone: true,
  imports: [
    CommonModule,
    InputTextModule,
    ButtonModule,
    FormsModule,
    ReactiveFormsModule,
    StepsModule,
    DialogModule,
    BuscarActoProcesalComponent,
    AgregarEditarActoProcesalComponent
  ],
  templateUrl: './agregar-acto-procesal.component.html',
  styleUrls: ['./agregar-acto-procesal.component.scss']
})
export class AgregarActoProcesalComponent implements OnInit {

  items: MenuItem[];
  nActiveIndex: number = 0;
  idActoProcesalSelected: string = '';
  nombreActoProcesalSelected: string = '';
  tipoLlamado: string = 'agregar';

  constructor(
    public dialogRef: DynamicDialogRef,
    public config: DynamicDialogConfig
  ) { }

  ngOnInit() {
    this.tipoLlamado = this.config.data?.tipo;
    this.items = [
      { label: 'Buscar acto procesal' },
      { label: 'Agregar o editar configuración' }
    ];
  }

  getTitulo(): string {
    return (this.tipoLlamado == 'agregar') ? 'Nuevo Acto Procesal' : 'Editar Acto Procesal';
  }

  public close(): void {
    this.dialogRef.close();
  }

  anterior(): void {
    this.nActiveIndex--;
  }

  siguiente(): void {
    this.nActiveIndex++;
  }

  setIdActoProcesal(id: string): void {
    this.idActoProcesalSelected = id;
  }

  setNombreActoProcesal(nombre: string): void {
    this.nombreActoProcesalSelected = nombre;
  }

}
