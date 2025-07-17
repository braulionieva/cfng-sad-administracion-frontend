import { Component } from '@angular/core';
import { AccionesTramitePorActoProcesalComponent } from './acciones/acciones-tramite-por-acto-procesal.component';
import { TablaTramitePorActoProcesalComponent } from './tabla/tabla-tramite-por-acto-procesal.component';
import { MaestroGenerico } from '@interfaces/maestro-generico/maestro-generico';
import { MaestroService } from '@services/maestro/maestro.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { Filtros } from '@interfaces/shared/shared';
import { FiltroGenericoComponent } from '@components/filtro-generico/filtro-generico.component';
import { TramiteBandejaResponse } from '@interfaces/admin-tramite-por-acto-procesal/tramite-por-acto-procesal';
import { AdminTramiteActoProcesalService } from '@services/admin-tramite-acto-procesal/admin-tramite-acto-procesal.service';
import { saveAs } from 'file-saver';

@Component({
  selector: 'app-bandeja-tramite-por-acto-procesal',
  standalone: true,
  imports: [
    FiltroGenericoComponent,
    AccionesTramitePorActoProcesalComponent,
    TablaTramitePorActoProcesalComponent,
  ],
  templateUrl: './bandeja-tramite-por-acto-procesal.component.html',
  styleUrls: ['./bandeja-tramite-por-acto-procesal.component.scss'],
})
export class BandejaTramitePorActoProcesalComponent {
  tituloPage: string = 'Registro de Trámites por Acto Procesal';
  tramite: MaestroGenerico[] = [];
  actoProcesal: MaestroGenerico[] = [];
  carpetaCuaderno: MaestroGenerico[] = [];
  tipoEspecialidad: MaestroGenerico[] = [];
  especialidad: MaestroGenerico[] = [];
  jerarquia: MaestroGenerico[] = [];
  tipoProceso: MaestroGenerico[] = [];
  subTipoProceso: MaestroGenerico[] = [];
  // etapas: MaestroGenerico[] = [];
  bEspecialidad: boolean = true;

  bandejaTramitePorActoProcesal: TramiteBandejaResponse[] = [];
  contadorTramites: number = 0;

  loading: boolean = false;

  constructor(
    private readonly maestroService: MaestroService,
    private readonly tramiteService: AdminTramiteActoProcesalService,
    private readonly spinner: NgxSpinnerService
  ) {}

  public onFilter(filtros: Filtros): void {
    this.loadFiltros();
    this.loadBandejaTramitesActosProcesales();
  }

  private loadFiltros(): void {
    this.loadFiltroTramite();
    this.loadFiltroActoProcesal();
    this.loadFiltroCarpetaCuaderno();
    this.loadFiltroTipoEspecialidad();
    this.loadFiltroEspecialidad();
    this.loadFiltroJerarquia();
    this.loadFiltroTipoProceso();
  }

  private loadFiltroTramite(): void {
    this.spinner.show();
    this.maestroService.listarTramites().subscribe({
      next: (response) => {
        this.spinner.hide();

        this.tramite = response.data;
        this.contadorTramites = this.tramite.length;
      },
    });
  }

  private loadFiltroActoProcesal(): void {
    this.spinner.show();
    this.maestroService.listarActoProcesal().subscribe({
      next: (response) => {
        this.spinner.hide();
        response.data.sort((a, b) => a.nombre.localeCompare(b.nombre));
        this.actoProcesal = response.data;
      },
    });
  }

  private loadFiltroCarpetaCuaderno(): void {
    this.spinner.show();
    this.maestroService.listarCarpetaCuadernos().subscribe({
      next: (response) => {
        this.spinner.hide();
        response.data.sort((a, b) => a.nombre.localeCompare(b.nombre));
        this.carpetaCuaderno = response.data;
      },
    });
  }

  private loadFiltroTipoEspecialidad(): void {
    this.spinner.show();
    this.maestroService.listarTipoEspecialidad().subscribe({
      next: (response) => {
        this.spinner.hide();
        response.data.sort((a, b) => a.nombre.localeCompare(b.nombre));
        this.tipoEspecialidad = response.data;
      },
    });
  }

  private loadFiltroEspecialidad(): void {
    this.spinner.show();
    this.maestroService.listarEspecialidad().subscribe({
      next: (response) => {
        this.spinner.hide();
        response.data.sort((a, b) => a.nombre.localeCompare(b.nombre));
        this.especialidad = response.data;
      },
    });
  }

  private loadFiltroJerarquia(): void {
    this.spinner.show();
    this.maestroService.listarJerarquia().subscribe({
      next: (response) => {
        this.spinner.hide();
        response.data.sort((a, b) => a.nombre.localeCompare(b.nombre));
        this.jerarquia = response.data;
      },
    });
  }

  private loadFiltroTipoProceso(): void {
    this.spinner.show();
    this.maestroService.listarTipoProceso().subscribe({
      next: (response) => {
        this.spinner.hide();
        response.data.sort((a, b) => a.nombre.localeCompare(b.nombre));
        this.tipoProceso = response.data;
      },
    });
  }

  // private loadFiltroEtapas(): void {
  //   this.spinner.show();
  //   this.maestroService.listarEtapas().subscribe(
  //     {
  //       next: (response) => {
  //         this.spinner.hide();
  //         this.etapas = response.data;
  //       }
  //     }
  //   );
  // }

  private loadBandejaTramitesActosProcesales(): void {
    this.loading = true;

    this.spinner.show();
    this.tramiteService.listarBandejaTramiteActoProcesal('0').subscribe({
      next: (response) => {
        this.bandejaTramitePorActoProcesal = response;
        this.loading = false;
        this.spinner.hide();
      },
    });
  }

  public listarBandejaTramiteActoProcesalExcel(): void {
    this.loading = true;

    this.spinner.show();
    this.tramiteService.listarBandejaTramiteActoProcesalExcel('0').subscribe({
      next: (response) => {
        this.spinner.hide();
        saveAs(response, 'TramitesActoProcesal.xlsx');
      },
      error: (err) => {
        this.spinner.hide();
        console.error('Error en la solicitud [descargarExcel]: ', err);
      },
    });
  }

  public refrescarBandeja(): void {
    this.loadBandejaTramitesActosProcesales();
  }
}
