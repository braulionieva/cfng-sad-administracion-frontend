


import { DialogModule } from 'primeng/dialog';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from "primeng/button";
import { CalendarModule } from "primeng/calendar";
import { CardModule } from "primeng/card";
import { CheckboxModule } from "primeng/checkbox";
import { DropdownModule } from "primeng/dropdown";
import { InputMaskModule } from "primeng/inputmask";
import { InputTextModule } from "primeng/inputtext";
import { SelectButtonModule } from "primeng/selectbutton";
import { RippleModule } from "primeng/ripple";
import { InputTextarea } from "primeng/inputtextarea";
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from "@angular/forms";
import { RadioButtonModule } from "primeng/radiobutton";
import { ServidorDTO } from '@interfaces/servidor/servidor';

@Component({
  selector: 'app-agregar-servidor',
  standalone: true,
  imports: [
    CommonModule,
    ButtonModule,
    CalendarModule,
    CardModule,
    CheckboxModule,
    DropdownModule,
    InputMaskModule,
    InputTextModule,
    SelectButtonModule,
    RippleModule,
    InputTextarea,
    FormsModule,
    RadioButtonModule,
    ReactiveFormsModule,
    DialogModule
  ],
  templateUrl: './agregar-servidor.component.html',
  styleUrls: ['./agregar-servidor.component.scss']
})
export class AgregarServidorComponent implements OnInit {

  @Input() public displayModal: boolean;
  @Output() public onGuardarServidor = new EventEmitter<ServidorDTO>();
  @Output() public close = new EventEmitter<boolean>();



  public tituloModal: string;
  public tipoServidor: any[] = [];
  public disponibilidad: any[] = [];
  public ambiente: any[] = [];

  public validacion: any;

  public formularioServidor: FormGroup;



  constructor(private formBuilder: FormBuilder) {
    this.tituloModal = "Agregar servidor";
    this.displayModal = false;
    this.formularioServidor = this.formBuilder.group({
      nombreServidor: [null],
      departamento: [null],
      provincia: [null],
      distrito: [null],
      descripcion: [null],
      central: [null],
      nocentral: [null]
    });
    this.tipoServidor = [{ "codigo": "01", "nombre": "INTERNO" }, { "codigo": "02", "nombre": "EXTERNO" }];
    this.disponibilidad = [{ "codigo": "01", "nombre": "PUBLICA" }, { "codigo": "02", "nombre": "PRIVADA" }];
    this.ambiente = [{ "codigo": "01", "nombre": "DESARROLLO" }, { "codigo": "02", "nombre": "QA" }, { "codigo": "03", "nombre": "PRODUCCIÓN" }];

  }



  ngOnInit(): void {
    // This is intentional
  }

  cierraModal() {
    this.close.emit(this.validacion);
  }

  public icon(name: string): string {
    return `assets/icons/${name}.svg`;
  }

  public getTitulo(): string {
    return this.tituloModal;
  }

  public updateVisible(): void {
    this.displayModal = false;
  }


}
