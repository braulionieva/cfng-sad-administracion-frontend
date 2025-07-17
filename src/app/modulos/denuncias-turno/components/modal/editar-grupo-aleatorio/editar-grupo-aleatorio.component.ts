import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DropdownModule } from 'primeng/dropdown';
import { ProgressSpinnerModule } from 'primeng/progressspinner';

import {
  tiposDistribucion,
  distritosFiscales,
  especialidades,
} from '@modulos/denuncias-turno/data/dropdowns';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { DialogService, DynamicDialog } from 'primeng/dynamicdialog';
import { AgregarFiscaliaComponent } from '../agregar-fiscalia/agregar-fiscalia.component';
import { MessagesModule } from 'primeng/messages';

@Component({
  standalone: true,
  selector: 'app-default-modal',
  templateUrl: './editar-grupo-aleatorio.component.html',
  styleUrls: ['./editar-grupo-aleatorio.component.scss'],
  imports: [
    CommonModule,
    InputTextModule,
    InputNumberModule,
    FormsModule,
    ReactiveFormsModule,
    DropdownModule,
    ButtonModule,
    TableModule,
    ProgressSpinnerModule,
    MessagesModule,
    AgregarFiscaliaComponent,
    DynamicDialog,
  ],
})
export class EditarGrupoAleatorio implements OnInit {
  tiposDistribucion: Array<any>;
  distritosFiscales: Array<any>;
  especialidades: Array<any>;


  loading: boolean = false;

  agregarFiscaliaDialog: { isVisible: boolean; documents: any };

  constructor(private dialogService: DialogService) {
    this.agregarFiscaliaDialog = {
      isVisible: false,
      documents: {},
    };
  }

  ngOnInit(): void {
    this.dropdownsData();
  }

  dropdownsData() {
    this.getTiposDistribucionDropdownData();
    this.getDistritosFiscalesDropdownData();
    this.getEspecialidadesDropdownData();
  }


  showModalAgregarFiscalia() {
    this.dialogService.open(AgregarFiscaliaComponent, {
      header: 'Agregar Fiscalia',
      contentStyle: { overflow: 'auto' },
    });
  }

  onOpenAgregarFiscaliaModal() {
    this.agregarFiscaliaDialog.isVisible = true;
  }

  onCloseAgregarFiscaliaModal() {
    this.agregarFiscaliaDialog.isVisible = false;
  }

  // dropdowns data
  getTiposDistribucionDropdownData() {
    this.tiposDistribucion = tiposDistribucion;
  }
  getDistritosFiscalesDropdownData() {
    this.distritosFiscales = distritosFiscales;
  }
  getEspecialidadesDropdownData() {
    this.especialidades = especialidades;
  }
}
