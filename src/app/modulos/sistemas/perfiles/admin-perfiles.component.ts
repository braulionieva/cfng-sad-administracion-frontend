import { CommonModule } from "@angular/common";
import { Component, OnInit } from "@angular/core";
import { TabsViewComponent } from "@components/tabs-view/tabs-view.component";
import { Aplicacion, Perfil, IListPerfilesRequest, Categoria } from "@interfaces/admin-perfiles/admin-perfiles";
import { Tab } from "@interfaces/comunes/tab";
import { AdminPerfilesService } from "@services/admin-perfiles/admin-perfiles.service";
import { DynamicDialogConfig, DialogService } from "primeng/dynamicdialog";
import { TabViewModule } from "primeng/tabview";
import { SeleccionarPerfilesSistemasComponent } from "./seleccionar-perfiles-sistemas/seleccionar-perfiles-sistemas.component";
import { TablaComponent } from "./tabla/tabla.component";

@Component({
  selector: 'app-admin-perfiles',
  standalone: true,
  templateUrl: './admin-perfiles.component.html',
  styleUrls: ['./admin-perfiles.component.scss'],
  imports: [
    CommonModule,
    TabViewModule,
    TablaComponent,
    TabsViewComponent,
    SeleccionarPerfilesSistemasComponent,
  ],
  providers: [DynamicDialogConfig, DialogService],
})
export class AdminPerfilesComponent implements OnInit {
  categorias: Categoria[];
  tabAplicaciones: Aplicacion[];
  listaPerfiles: Perfil[];
  tabCategoriaActivaIndex: number;
  tabAplicacionActivaIndex: number;
  indexAplicacionSelected: number;
  error: any;
  tabsCategoria: Tab[] = [];
  totalRegistros: number = 0;

  constructor(private adminPerfilesService: AdminPerfilesService) { }

  ngOnInit() {
    this.listarCategorias();
  }

  listarCategorias() {
    this.adminPerfilesService.obtenerCategorias().subscribe({
      next: (response) => {
        this.categorias = response;
        this.categorias.forEach((f, idx) => {
          this.tabsCategoria.push({
            titulo: f.nombreCategoria,
            ancho: 290,
          });
        });
        if (this.categorias.length > 0)
          this.listarAplicacionesByCategoria(this.categorias[0]?.idCategoria);
      },
      error: (err) => {
        this.error = err;
      },
    });
  }

  listarAplicacionesByCategoria(idCategoria: number) {
    this.adminPerfilesService
      .obtenerAplicacionesByCategoria(idCategoria)
      .subscribe({
        next: (response) => {
          this.tabAplicaciones = response;
          if (this.tabAplicaciones.length > 0)
            this.listarPerfilesByAplicacion(
              this.tabAplicaciones[0]?.idAplicacion,
              0
            );
        },
        error: (err) => {
          this.error = err;
        },
      });
  }

  onTabCategoriaChange(indiceTab: number) {
    // Actualiza el índice de la pestaña activa
    this.tabCategoriaActivaIndex = indiceTab;
    this.tabAplicacionActivaIndex = 0;
    this.indexAplicacionSelected = 0;
    this.listarAplicacionesByCategoria(
      this.categorias[this.tabCategoriaActivaIndex].idCategoria
    );
  }

  onTabAplicacionChange(event: any) {
    // Actualiza el índice de la pestaña activa
    this.tabAplicacionActivaIndex = event.index;
    this.indexAplicacionSelected = event.index;
    this.listarPerfilesByAplicacion(
      this.tabAplicaciones[this.tabAplicacionActivaIndex].idAplicacion,
      this.indexAplicacionSelected
    );
  }

  listarPerfilesByAplicacion(
    idAplicacion: number,
    indexAplicacionSelected: number
  ) {
    const request: IListPerfilesRequest = {
      idAplicacion: idAplicacion,
      pagina: 1, // Puedes ajustar la página según necesites
      registrosPorPagina: 10, // O el número de registros que desees por página
    };

    this.adminPerfilesService.obtenerPerfilesByAplicacion(request).subscribe({
      next: (response) => {
        this.indexAplicacionSelected = indexAplicacionSelected;
        this.listaPerfiles = response.registros;
        this.totalRegistros = response.totalElementos;
      },
      error: (err) => {
        this.error = err;
      },
    });
  }

  actualizarTablaPerfiles() {
    this.listarPerfilesByAplicacion(
      this.tabAplicaciones[this.indexAplicacionSelected].idAplicacion,
      this.indexAplicacionSelected
    );
  }
}
