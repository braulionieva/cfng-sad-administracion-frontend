import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MenuItem } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { InputTextModule } from 'primeng/inputtext';
import { StepsModule } from 'primeng/steps';
import { BuscarTramiteComponent } from './buscar/buscar-tramite.component';
import { AgregarEditarTramiteComponent } from './agregar-editar/agregar-editar-tramite.component';

@Component({
  selector: 'app-agregar-tramite-por-acto-procesal',
  standalone: true,
  imports: [
    CommonModule,
    InputTextModule,
    ButtonModule,
    FormsModule,
    ReactiveFormsModule,
    StepsModule,
    DialogModule,
    BuscarTramiteComponent,
    AgregarEditarTramiteComponent
  ],
  templateUrl: './agregar-tramite-por-acto-procesal.component.html',
  styleUrls: ['./agregar-tramite-por-acto-procesal.component.scss']
})
export class AgregarTramitePorActoProcesalComponent implements OnInit {
  items: MenuItem[];
  activeIndex: number = 0;
  idTramite: string = '';
  nombreTramite: string = '';
  tipoLlamado: string = 'agregar';

  constructor(
    public ref: DynamicDialogRef,
    public config: DynamicDialogConfig
  ) { }

  ngOnInit() {
    this.tipoLlamado = this.config.data?.tipo;
    this.items = [
      { label: 'Buscar trámite' },
      { label: 'Agregar o editar configuración' }
    ];
  }

  getTitulo(): string {
    return (this.tipoLlamado == 'agregar') ? 'Nuevo Trámite' : 'Editar Trámite';
  }

  public close(): void {
    this.ref.close();
  }

  anterior(): void {
    this.activeIndex--;
  }

  siguiente(): void {
    this.activeIndex++;
  }

  setIdTramite(id: string): void {
    this.idTramite = id;
  }

  setNombreTramite(nombre: string): void {
    this.nombreTramite = nombre;
  }
}
