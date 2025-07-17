import { CommonModule } from '@angular/common';
import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MaestroGenerico } from '@interfaces/maestro-generico/maestro-generico';
import { MaestroService } from '@services/maestro/maestro.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { ButtonModule } from 'primeng/button';
import { DropdownModule } from 'primeng/dropdown';
import { InputTextModule } from 'primeng/inputtext';
import { debounceTime } from "rxjs";
import {FiltroActosProcesales} from "@modulos/gestion-fiscal/acto-procesal/interfaces/acto-procesal.interface";

@Component({
  selector: 'app-filtros',
  templateUrl: './filtros.component.html',
  standalone: true,
  imports:[CommonModule,
    DropdownModule,
    ReactiveFormsModule,
    InputTextModule,
    ButtonModule],
  styleUrls: ['./filtros.component.scss']
})
export class FiltrosComponent {
  @Output() filter = new EventEmitter<FiltroActosProcesales>();

  tituloPage: string = 'Registro de Actos Procesales';
  toggleOn: boolean = false;
  toggleIcon: string = 'pi-angle-double-down';

  actoProcesal: MaestroGenerico[] = [];
  carpetaCuaderno: MaestroGenerico[] = [];
  tipoEspecialidad: MaestroGenerico[] = [];
  especialidad: MaestroGenerico[] = [];
  jerarquia: MaestroGenerico[] = [];
  tipoProceso: MaestroGenerico[] = [];
  subTipoProceso: MaestroGenerico[] = [];
  etapas: MaestroGenerico[] = [];

  filtros: FiltroActosProcesales;
  filtroForm: FormGroup;

  constructor(
    private readonly fb: FormBuilder,
    private readonly maestroService: MaestroService,
    private readonly spinner: NgxSpinnerService
  ) {

  }

  ngOnInit() {
    this.initForm();
    this.loadInitialData();
    this.setupFormSubscription();
    this.buscarActoProcesal();
  }
  private initForm(): void {
    this.filtroForm = this.fb.group({
      idActoProcesalConfigura: [null],
      idActoProcesal: [null],
      idClasificadorExpediente: [null],
      idTipoEspecialidad: [null],
      idEspecialidad: [null],
      idJerarquia: [null],
      idTipoProceso: [null],
      idSubtipoProceso: [null],
      idEtapa: [null]
    });

  }

  private loadInitialData(): void {
    this.loadFiltroActoProcesal();
    this.loadFiltroCarpetaCuaderno();
    this.loadFiltroTipoEspecialidad();
    this.loadFiltroEspecialidad();
    this.loadFiltroJerarquia();
    this.loadFiltroTipoProceso();
    this.loadFiltroEtapas();
  }

  private setupFormSubscription(): void {
    this.filtroForm.valueChanges
      .pipe(debounceTime(500))
      .subscribe(() => this.buscarActoProcesal());
  }

  changeToggle(): void {
    this.toggleOn = !this.toggleOn;
    this.toggleIcon = this.toggleOn ? 'pi-angle-double-up' : 'pi-angle-double-down';
  }

  onTipoProcesoChange(event: any): void {
    this.loadFiltroSubTipoProceso(event.value);
  }

  private loadFiltroActoProcesal(): void {
    this.spinner.show();
    this.maestroService.listarActoProcesal().subscribe({
      next: (response) => {
        this.spinner.hide();
        this.actoProcesal = this.sortByName(response.data);
      },
      error: () => this.spinner.hide()
    });
  }

  private loadFiltroCarpetaCuaderno(): void {
    this.spinner.show();
    this.maestroService.listarCarpetaCuadernos().subscribe({
      next: (response) => {
        this.spinner.hide();
        this.carpetaCuaderno = this.sortByName(response.data);
      },
      error: () => this.spinner.hide()
    });
  }

  private loadFiltroTipoEspecialidad(): void {
    this.spinner.show();
    this.maestroService.listarTipoEspecialidad().subscribe({
      next: (response) => {
        this.spinner.hide();
        this.tipoEspecialidad = this.sortByName(response.data);
      },
      error: () => this.spinner.hide()
    });
  }

  private loadFiltroEspecialidad(): void {
    this.spinner.show();
    this.maestroService.listarEspecialidad().subscribe({
      next: (response) => {
        this.spinner.hide();
        this.especialidad = this.sortByName(response.data);
      },
      error: () => this.spinner.hide()
    });
  }

  private loadFiltroJerarquia(): void {
    this.spinner.show();
    this.maestroService.listarJerarquia().subscribe({
      next: (response) => {
        this.spinner.hide();
        this.jerarquia = this.sortByName(response.data);
      },
      error: () => this.spinner.hide()
    });
  }

  private loadFiltroTipoProceso(): void {
    this.spinner.show();
    this.maestroService.listarTipoProceso().subscribe({
      next: (response) => {
        this.spinner.hide();
        this.tipoProceso = this.sortByName(response.data);
      },
      error: () => this.spinner.hide()
    });
  }

  private loadFiltroSubTipoProceso(idProceso: number): void {
    this.spinner.show();
    this.maestroService.listarSubTipoProceso(idProceso).subscribe({
      next: (response) => {
        this.spinner.hide();
        this.subTipoProceso = this.sortByName(response.data);
      },
      error: () => this.spinner.hide()
    });
  }

  private loadFiltroEtapas(): void {
    this.spinner.show();
    this.maestroService.listarEtapas().subscribe({
      next: (response) => {
        this.spinner.hide();
        this.etapas = this.sortByName(response.data);
      },
      error: () => this.spinner.hide()
    });
  }

  private sortByName(data: MaestroGenerico[]): MaestroGenerico[] {
    return data.sort((a, b) =>
      a.nombre.localeCompare(b.nombre, 'es', { sensitivity: 'base' })
    );
  }

  private getPayload(): FiltroActosProcesales {
    return {
      idActoProcesalConfigura: this.filtroForm.value['idActoProcesalConfigura'],
      idActoProcesal: this.filtroForm.value['idActoProcesal'],
      idClasificadorExpediente: this.filtroForm.value['idClasificadorExpediente'],
      idTipoEspecialidad: this.filtroForm.value['idTipoEspecialidad'],
      idEspecialidad: this.filtroForm.value['idEspecialidad'],
      idJerarquia: this.filtroForm.value['idJerarquia'],
      idTipoProceso: this.filtroForm.value['idTipoProceso'],
      idSubtipoProceso: this.filtroForm.value['idSubtipoProceso'],
      idEtapa: this.filtroForm.value['idEtapa']
    };
  }

  public buscarActoProcesal(): void {
    this.filter.emit(this.getPayload());
  }

  public onClearFilters(): void {
    this.filtroForm.reset();// Este reset dispara el valueChanges
    //this.buscarActoProcesal();
  }
}
