import { CommonModule } from "@angular/common";
import { Component, Output, EventEmitter, Input } from "@angular/core";
import { AlertModalComponent } from "@components/alert-modal/alert-modal.component";
import { Aplicacion, Perfil, IListPerfilesRequest } from "@interfaces/admin-perfiles/admin-perfiles";
import { AdminPerfilesService } from "@services/admin-perfiles/admin-perfiles.service";
import { ComunDialogService } from "@services/dialog/comun-dialog.service";
import { MessageService} from "primeng/api";
import { TableLazyLoadEvent } from 'primeng/table';
import { ButtonModule } from "primeng/button";
import { DynamicDialog, DynamicDialogRef, DynamicDialogConfig, DialogService } from "primeng/dynamicdialog";
import { MenuModule } from "primeng/menu";
import { TableModule } from "primeng/table";
import { AdicionarPerfilComponent } from "../adicionar-perfil/adicionar-perfil.component";
import { EditPerfilComponent } from "../edit-perfil/edit-perfil.component";

@Component({
  selector: 'app-tabla',
  standalone: true,
  imports: [
    CommonModule,
    TableModule,
    ButtonModule,
    MenuModule,
    DynamicDialog,
    AdicionarPerfilComponent,
    EditPerfilComponent,
  ],
  templateUrl: './tabla.component.html',
  styleUrls: ['./tabla.component.scss'],
  providers: [
    MessageService,
    DynamicDialogRef,
    DynamicDialogConfig,
    EditPerfilComponent,
  ],
})
export class TablaComponent {
  @Output() clicked = new EventEmitter();
  @Input() aplicacion: Aplicacion;

  // @Input() listaPerfiles: Perfil[] = [];

  error: any;
  selectedPerfil: Perfil;

  protected refModal: DynamicDialogRef;

  listaPerfiles: Perfil[] = [];
  totalRegistros: number = 0;
  filasPorPagina: number = 10;
  paginaActual: number = 1;
  loading: boolean = false;
  //selectedPerfil: Perfil;
  first: number = 0;

  constructor(
    // private ref: DynamicDialogRef,
    // private config: DynamicDialogConfig,
    private adminPerfilesService: AdminPerfilesService,
    private dialogService: DialogService,
    private dialogComunService: ComunDialogService,
    private editComponent: EditPerfilComponent
  ) {
    this.dialogComunService.hideDialog$.subscribe((params) => {
      if (params.updTablaPerfiles) {
        this.onClicked();
      }
    });
  }

  ngOnInit() {
    this.cargarPerfiles();
  }

  cargarPerfiles() {
    this.loading = true;

    const request: IListPerfilesRequest = {
      idAplicacion: this.aplicacion.idAplicacion,
      pagina: this.paginaActual,
      registrosPorPagina: this.filasPorPagina,
    };

    this.adminPerfilesService.obtenerPerfilesByAplicacion(request).subscribe({
      next: (response) => {
        this.listaPerfiles = response.registros;
        this.totalRegistros = response.totalElementos;
        this.loading = false;
      },
      error: (err) => {
        this.error = err;
        this.loading = false;
        console.error('Error al obtener los perfiles:', err);
      },
    });
  }

  onLazyLoad(event: TableLazyLoadEvent) {
    this.first = event.first;
    this.paginaActual = Math.floor(event.first / event.rows) + 1;
    this.filasPorPagina = event.rows;
    this.cargarPerfiles();
  }

  public onClicked() {
    this.cargarPerfiles();
  }

  protected obtenerDescripcion(selectedPerfil: Perfil) {
    this.editComponent.actualizarValorDescripcion(selectedPerfil);
  }

  protected eliminarPerfil(perfil: Perfil) {
    const idPerfil = perfil.idPerfil;

    //llamo para confirmar si quiero eliminar o no
    this.confirmarEliminacionDePerfil('warning', perfil);

    // si confirma entonces paso a consumir el servicio
    this.refModal.onClose.subscribe({
      next: (resp) => {
        if (resp === 'confirm') {
          this.llamarServicio(idPerfil, perfil);
        }
      },
    });
  }

  private llamarServicio(id: any, perfil: Perfil) {
    this.adminPerfilesService.eliminarPerfil(id).subscribe({
      next: (response) => {
        this.informarEliminacionDePerfil('success', perfil);
        //luego refrescar la lista perfiles

        this.refModal.onClose.subscribe({
          next: (resp) => {
            if (resp === 'confirm') {
              this.onClicked();
            }
          },
        });
      },
      error: (err) => {
        this.error = err;
      },
    });
  }

  private confirmarEliminacionDePerfil(icon: string, perfil: Perfil) {
    this.refModal = this.dialogService.open(AlertModalComponent, {
      width: '700px',
      showHeader: false,
      data: {
        icon: 'question',
        title: 'Eliminar perfil',
        confirm: true,
        confirmButtonText: 'Aceptar',
        description: `A continuación, se procederá a eliminar el perfil <strong>
          ${perfil.descripcionPerfil.toUpperCase()}</strong>. Esta acción es <strong>irreversible</strong>. ¿Está seguro de realizar esta acción?`,

        //confirmButtonColor: '#FF0000',
      },
    });
  }

  private informarEliminacionDePerfil(icon: string, perfil: Perfil) {
    this.refModal = this.dialogService.open(AlertModalComponent, {
      width: '600px',
      showHeader: false,
      data: {
        icon: icon,
        title: 'Perfil Eliminado',
        description: 'La eliminación del perfil <b>'
          .concat(perfil.descripcionPerfil.toUpperCase())
          .concat('</b> se realizó de forma exitosa.'),
        confirmButtonText: 'Listo',
        confirmButtonColor: 'azul',
      },
    });
  }

  protected onRowSelect(event: any) {
    this.selectedPerfil = event.data;
  }

  protected actualizarTablaPerfilesDesdeEditar() {
    this.selectedPerfil = null;
    this.paginaActual = 1; // Regresar a la página 1 después de editar
    this.first = 0; // Reiniciar el índice del primer registro
    this.cargarPerfiles();
  }

  protected actualizarTablaPerfilesDesdeAgregar() {
    this.paginaActual = 1; // Regresar a la página 1 después de agregar
    this.first = 0; // Reiniciar el índice del primer registro
    this.cargarPerfiles();
  }

  protected showModalOpcionesMenuPerfilSistema(perfil: Perfil) {
    const params =
    {
      perfil: perfil,
      aplicacion: this.aplicacion
    };

    this.dialogComunService.showDialog(params);
  }

  protected getIconSVG(name: string): string {
    return `assets/icons/${name}.svg`;
  }
}
