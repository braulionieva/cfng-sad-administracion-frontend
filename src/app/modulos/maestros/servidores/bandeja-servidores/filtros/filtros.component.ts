import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup , ReactiveFormsModule } from '@angular/forms';

import { DropdownModule } from 'primeng/dropdown';
import { RadioButtonModule } from 'primeng/radiobutton';



import { InputTextModule } from 'primeng/inputtext';

import { ButtonModule } from 'primeng/button';

import { Filtros } from '@interfaces/shared/shared';

@Component({
  selector: 'app-filtros',
  standalone: true,
  imports: [CommonModule,DropdownModule,RadioButtonModule, ReactiveFormsModule, InputTextModule, ButtonModule],
  templateUrl: './filtros.component.html',
  styleUrls: ['./filtros.component.scss']
})
export class FiltrosComponent implements OnInit {


  @Output() filter = new EventEmitter<Filtros>();
  filtros : Filtros;
  filtroForm: FormGroup;


  constructor(private fb: FormBuilder) {
    this.filtroForm = this.fb.group({
      nombreServidor: [null]
    });
  }

  ngOnInit() {

    this.buscarServidores();

  }

  public getPayload() : Filtros {

    this.filtros = {

      nombreServidor: this.filtroForm.value.nombreServidor

    };

    return this.filtros;
  }


  public buscarServidores() : void {
    this.filter.emit(this.getPayload());
  }

  //FUNCIÓN LIMPIAR FILTROS
  public onClearFilters() : void {
    this.filtroForm.reset();
    this.buscarServidores();
  }

}
