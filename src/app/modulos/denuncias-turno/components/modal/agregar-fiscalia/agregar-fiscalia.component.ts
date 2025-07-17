import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output, OnInit } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { DropdownModule } from 'primeng/dropdown';
import { TableModule } from 'primeng/table';
import { CalendarModule } from 'primeng/calendar';
import { articulos, estados } from '@modulos/denuncias-turno/data/dropdowns';
import { FormGroup, FormControl, ReactiveFormsModule } from '@angular/forms';
import { FiscaliaAgregada } from '@interfaces/grupo-aleatorio/grupo-aleatorio';
import {
  DialogService,
  DynamicDialog,
  DynamicDialogRef,
} from 'primeng/dynamicdialog';
import { DialogDataTransferService } from '@services/shared/dataTransfer.service';

@Component({
  standalone: true,
  selector: 'app-agregar-fiscalia',
  templateUrl: './agregar-fiscalia.component.html',
  styleUrls: ['./agregar-fiscalia.component.scss'],
  imports: [
    CommonModule,
    DropdownModule,
    TableModule,
    ButtonModule,
    CalendarModule,
    ReactiveFormsModule,
    DynamicDialog,
  ],
  providers: [DialogService, DynamicDialogRef],
})
export class AgregarFiscaliaComponent implements OnInit {
  //ref: DynamicDialogRef;

  fiscalias: Array<any>;
  distritosFiscales: Array<any>;
  especialidades: Array<any>;
  estados: Array<any>;
  articulos: Array<any>;
  observaciones: string;

  despachosFake: Array<any>;

  loading: boolean = false;
  form: FormGroup;

  @Output() fiscaliaPasar = new EventEmitter<any>();
  @Output() onClose = new EventEmitter<void>();

  distritoFiscalOpciones = [
    { label: 'Lima Centro', value: 5 } /* otros valores */,
  ];
  especialidadOpciones = [
    { label: 'Violencia contra la Mujer', value: 9 } /* otros valores */,
  ];
  fiscaliasOpciones = [
    { label: 'Fiscalia de Prueba', value: 10 } /* otros valores */,
  ];

  constructor(
    private dialogDataTransferService: DialogDataTransferService,
    public ref: DynamicDialogRef
  ) {
    this.form = new FormGroup({
      distritoFiscal: new FormControl(null),
      especialidad: new FormControl(null),
      fiscalia: new FormControl(null),
      observaciones: new FormControl(''),
    });
  }

  ngOnInit(): void {
    this.getDespachosFake();
    this.dropdownsData();
  }

  dropdownsData() {
    this.getEstadosDropdownData();
    this.getArticulosDropdownData();
  }

  agregarFiscalia() {
    // listaFiscaliasAgregadas: FiscaliaAgregada[];
    const fiscalia: FiscaliaAgregada = {
      idDitritoFiscal: this.form.value.distritoFiscal
        ? this.form.value.distritoFiscal
        : null,
      idEspecialidad: this.form.value.especialidad
        ? this.form.value.especialidad
        : null,
      idFiscalia: this.form.value.fiscalia ? this.form.value.fiscalia : null,
      observacion: this.form.value.observaciones
        ? this.form.value.observaciones
        : null,
    };
    this.fiscaliaPasar.emit(fiscalia);
    this.ref.close();
  }

  getDespachosFake() {
    this.loading = true;
    this.despachosFake = [
      {
        id: 1,
        nombre_despacho: 'Despacho 1',
        fiscales: [
          { name: 'Fiscal 1', isActive: true },
          { name: 'Fiscal 2', isActive: false },
          { name: 'Fiscal 3', isActive: true },
        ],
        fecha_inicio: '2024-12-12T00:00:00.000Z',
        fecha_fin: '2024-12-14T00:00:00.000Z',
        ultima_modificacion: [
          {
            nombre_usuario: 'Jose Perez',
            fecha_modificacion: '2024-12-14T00:00:00.000Z',
          },
        ],
      },
    ];
  }

  // dropdowns data
  getEstadosDropdownData() {
    this.estados = estados;
  }
  getArticulosDropdownData() {
    this.articulos = articulos;
  }
}
