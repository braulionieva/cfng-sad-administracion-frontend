import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActoProcesalRelacionadoResponse } from '@interfaces/admin-tramite-por-acto-procesal/tramite-por-acto-procesal';
import { MaestroGenerico } from '@interfaces/maestro-generico/maestro-generico';
import { AdminTramiteActoProcesalService } from '@services/admin-tramite-acto-procesal/admin-tramite-acto-procesal.service';
import { MaestroService } from '@services/maestro/maestro.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { ButtonModule } from 'primeng/button';
import { DropdownModule } from 'primeng/dropdown';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { InputSwitchModule } from 'primeng/inputswitch';
import { TableModule } from 'primeng/table';

@Component({
  selector: 'app-modal-formulario-configuracion-tramite',
  standalone: true,
  templateUrl: './modal-formulario-configuracion-tramite.component.html',
  styleUrls: ['./modal-formulario-configuracion-tramite.component.scss'],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    DropdownModule,
    ButtonModule,
    InputSwitchModule,
    TableModule
  ]
})
export class ModalFormularioConfiguracionTramiteComponent implements OnInit {
  estadoCaso: MaestroGenerico[] = [];
  actoProcesal: MaestroGenerico[] = [];
  configuracionForm: FormGroup;
  actosRelacionados: ActoProcesalRelacionadoResponse[] = [];
  showRadioButton: boolean = false;

  constructor(
    public ref: DynamicDialogRef,
    private maestroService: MaestroService,
    private tramiteService: AdminTramiteActoProcesalService,
    private spinner: NgxSpinnerService,
    private config: DynamicDialogConfig,
    private fb: FormBuilder
  ) { 
    this.configuracionForm = this.fb.group({
      idEstadoCaso: [null],
      idActoProcesal: [null]
    });
  }

  ngOnInit() {
    this.loadEstadoTramite();
    this.loadActoProcesal();
  }

  private loadEstadoTramite(): void {
    this.spinner.show();
    this.maestroService.listarEstadoCaso().subscribe(
      {
        next: (response) => {
          this.spinner.hide();
          response.sort((a, b) => a.nombre.localeCompare(b.nombre));
          this.estadoCaso = response;
        }
      }
    );
  }

  private loadActoProcesal(): void {
    this.spinner.show();
    this.maestroService.listarActoProcesal().subscribe(
      {
        next: (response) => {
          this.spinner.hide();
          response.data.sort((a, b) => a.nombre.localeCompare(b.nombre));
          this.actoProcesal = response.data;
        }
      }
    );
  }

  public onChange(event: any): void {
    
    this.spinner.show();
    this.tramiteService.listarActoProcesalRelacionado(event.value).subscribe(
      {
        next: (response) => {
          this.spinner.hide();
          this.actosRelacionados = response;
        }
      }
    );
  }

  public close(): void { 
    this.ref.close(); 
  }

  public icon(name: string): string {
    return `assets/icons/${name}.svg`;
  }

  onSubmit(){
  
  }

}
