import { Component, OnInit } from '@angular/core';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { CommonModule, DatePipe } from '@angular/common';
import { TableModule } from 'primeng/table';
import { GrupoAleatorioService } from '@services/grupo-aleatorio/grupo-aleatorio.service';
import { NotaInfoComponent } from '@components/nota-info/nota-info.component';

@Component({
  selector: 'app-detalle-distribucion-aleatoria',
  standalone: true,
  imports: [
    CommonModule,
    TableModule,
    NotaInfoComponent,
  ],
  templateUrl: './detalle-distribucion-aleatoria.component.html',
  styleUrls: ['./detalle-distribucion-aleatoria.component.scss'],
  providers: [DatePipe]
})
export class DetalleDistribucionAleatoriaComponent implements OnInit {

  error: any;
  grupoAleatorio = {
    nombreGrupoAleatorio: null,
    fechaApertura: null,
    fechaCierre: null,
    articulo: null,
    tipoDistribucion: null,
    inNotaPeriodo: null
  };
  fiscaliasGrupoAleatorio = [
    {
      nombreFiscalia:"",
      lsDespachos:
      [
        {despacho: "", nombreFiscales:"", estadoDespacho:"", consideraTurno: "", ultimaModificacion: ""},
      ]
    }
    ];

  constructor(
    public ref: DynamicDialogRef,
    public config: DynamicDialogConfig,
    private grupoAleatorioService: GrupoAleatorioService,
    private datePipe: DatePipe
  ) {}

  ngOnInit() {
    //this.titulo = this.config!.data?.title;
    const idGrupo = this.config.data.id;
    //obtener VerDetalleGrupoAleatorio la CABECERA
    let requestCabeceraVerDetalleGrupoAleatorio = {
      idGrupo : idGrupo
    };
    this.grupoAleatorioService.obtenerCabeceraVerDetalleGrupoAleatorio(requestCabeceraVerDetalleGrupoAleatorio).subscribe({
      next: (response) => {
        this.grupoAleatorio =
        {
          ...response,
          articulo: response.articulo?.substring(0, response.articulo.length - 2),
          fechaApertura: (this.datePipe.transform(response.fechaApertura, 'dd/MM/yyyy')? this.datePipe.transform(response.fechaApertura, 'dd/MM/yyyy'): ''),
          fechaCierre: (this.datePipe.transform(response.fechaCierre, 'dd/MM/yyyy') ? this.datePipe.transform(response.fechaCierre, 'dd/MM/yyyy'): '')
        };

        this.obtenerVerDetalleGrupoAleatorio(idGrupo, this.grupoAleatorio.tipoDistribucion);
      },
      error: (err) => {
        this.error = err;
        console.error('Error al obtener cabecera para Ver Detalle del grupo aleatorio:', err);
      },
    });
  }

  private obtenerVerDetalleGrupoAleatorio(idGrupo: string, tipoDistribucion: number){
    //obtener VerDetalleGrupoAleatorio el DETALLE
    let requestVerDetalleGrupoAleatorio = {
      idGrupo : idGrupo,
      tipoDistribucion : tipoDistribucion //1 distribucion por despacho, 2 por fiscal
    };
    this.grupoAleatorioService.verDetalleGrupoAleatorio(requestVerDetalleGrupoAleatorio).subscribe({
      next: (response) => {
        this.fiscaliasGrupoAleatorio = response;
      },
      error: (err) => {
        this.error = err;
        console.error('Error al obtener detalle del grupo aleatorio:', err);
      },
    });
  }

  public close(): void {
    this.ref.close();
  }
  public icon(name: string): string {
    return `assets/icons/${name}.svg`;
  }
  public getNotaFinalizaPeriodo(): any {
    return "<b>Nota:</b> Tener en cuenta que el periodo configurado para el grupo aleatorio, esta cerca de finalizar. Por favor, revisar esta fecha y si se considera pertinente, actualizar esta información.";
  }
}
