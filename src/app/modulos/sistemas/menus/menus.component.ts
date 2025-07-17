import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { AdminMenusService } from '@services/admin-menu/admin-menu.service';
import { TreeTableModule } from 'primeng/treetable';
import { MessageService, TreeDragDropService, TreeNode } from 'primeng/api';
import {
  ActualizarOrden,
  MenuInterface,
} from '@interfaces/admin-menu/admin-menu';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { NgxSpinnerService } from 'ngx-spinner';
import { ActivatedRoute, Router } from '@angular/router';
import { obtenerIcono } from '@utils/icon';
import { CmpLibModule } from 'ngx-mpfn-dev-cmp-lib';
import { AlertModalComponent } from '@components/alert-modal/alert-modal.component';
import { Tree, TreeModule } from 'primeng/tree';
import { DragDropModule } from 'primeng/dragdrop';
import { Auth2Service } from '@services/auth/auth2.service';
import { AddEditMenuComponent } from '@modulos/sistemas/menus/add-edit-menu/add-edit-menu.component';
import { ModalNotificationService } from '@services/modal-notification/modal-notification.service';

@Component({
  selector: 'app-menus',
  standalone: true,
  imports: [
    CommonModule,
    ButtonModule,
    TreeTableModule,
    CmpLibModule,
    TreeModule,
    DragDropModule,
  ],

  templateUrl: './menus.component.html',
  styleUrls: ['./menus.component.scss'],
  providers: [
    MessageService,
    DialogService,
    TreeDragDropService,
    ModalNotificationService,
  ],
})
export class MenusComponent implements OnInit {
  @ViewChild(Tree) tree: Tree;
  expandedNodeIds: Set<number> = new Set();

  usuarioSesion;

  error: any;

  files: TreeNode[];

  cols: any[];

  loading: boolean;
  selectedMenu: MenuInterface;

  editarIsVisible: boolean = false;

  public refModal: DynamicDialogRef;

  public coAplicacion: string;
  public devSiglas: string;
  public noVAplicacion: string;
  public idAplicacion: number;

  private readonly coAplicacionDefault: string = '';
  private readonly devSiglasDefault: string = '';
  private readonly noVAplicacionDefault: string = '';
  private readonly idAplicacionDefault: number = 0;
  public obtenerIcono = obtenerIcono;

  // nodes: any;

  constructor(
    private readonly adminMenusService: AdminMenusService,
    private readonly dialogService: DialogService,
    private readonly spinner: NgxSpinnerService,
    private readonly router: Router,
    private readonly route: ActivatedRoute,
    private readonly userService: Auth2Service,
    private readonly modalNotificationService: ModalNotificationService
  ) {
    this.cols = [
      { field: 'descripcionSiglas', header: '' },
      { field: 'nombreAplicacion', header: '' },
      { field: 'opciones', header: '' },
    ];
  }

  ngOnInit() {
    this.usuarioSesion = this.userService.getUserInfo();
    this.loading = true;
    this.optenerParametrosRemitidosPorElModuloAplicacion();
    this.listarMenus();
  }

  saveExpandedState(): void {
    this.expandedNodeIds.clear(); // Limpia el estado anterior
    this.collectExpandedNodes(this.files); // Llama a una función recursiva para obtener todos los nodos expandidos
  }

  collectExpandedNodes(nodes: TreeNode[]): void {
    nodes.forEach((node) => {
      if (node.expanded) {
        this.expandedNodeIds.add(node.data.idMenu); // Usa `idMenu`
      }
      if (node.children) {
        this.collectExpandedNodes(node.children); // Recurre en los hijos
      }
    });
  }

  restoreExpandedState(): void {
    this.applyExpandedState(this.files);
  }

  applyExpandedState(nodes: TreeNode[]): void {
    nodes.forEach((node) => {
      if (this.expandedNodeIds.has(node.data.idMenu)) {
        node.expanded = true;
      }
      if (node.children) {
        this.applyExpandedState(node.children); // Recurre en los hijos
      }
    });
  }

  // Función para calcular el nivel de un nodo
  getNodeLevel(node: any): number {
    let level = 0;
    while (node.parent) {
      level++;
      node = node.parent;
    }
    return level;
  }

  // Función allowDrop para controlar dónde se puede soltar el nodo
  allowDrop(event: any): void {
    // Para validacion de nivel superior
    const dragNode = event.dragNode;
    const dropNode = event.dropNode;

    // Para validacion de nivel inferior
    const dragNodeLevel = this.getNodeLevel(dragNode);
    const dropNodeLevel = this.getNodeLevel(dropNode);

    const dragNodeData = event.dragNode.data;

    const originalOrder = dragNodeData.numeroOrden;
    const targetOrder = dragNode ? dropNode.data.numeroOrden : null;
    //**const parentNode = dragNode.parent || dropNode.parent;
    //const numberOfSiblings = parentNode?.children?.length ?? 0; ***/

    // Determinar si estamos tratando con nodos de nivel superior o nodos anidados
    let numberOfSiblings;
    if (dragNodeLevel === 0) {
      // Para los nodos de nivel superior, utiliza la longitud de la matriz de archivos
      numberOfSiblings = this.files.length;
    } else {
      // Para los nodos anidados, utiliza la longitud de los hijos del padre.
      const parentNode = dragNode.parent || dropNode.parent;
      numberOfSiblings = parentNode.children.length;
    }

    // Ajusta el nuevo `numeroOrden` basado en la posición de destino
    let newOrder;

    if (targetOrder < numberOfSiblings) {
      // Si el nodo se mueve hacia abajo, ajusta restando 1
      newOrder = originalOrder < targetOrder ? targetOrder - 1 : targetOrder;
    } else {
      // Si el nodo se mueve al final, usa el último `numeroOrden`
      newOrder = numberOfSiblings;
    }

    if (
      dragNode.parent === dropNode.parent &&
      dragNodeLevel === dropNodeLevel
    ) {
      //
      this.actualizarOrden(dragNodeData, newOrder);

      event.accept();
    } else {
      console.error('NO SE PUEDE ARRASTRAR!!!!');
    }
  }

  private optenerParametrosRemitidosPorElModuloAplicacion(): void {
    // obtener los valores que vinieron por parametro
    this.route.queryParams.subscribe((params) => {
      this.coAplicacion = decodeURIComponent(
        params['coAplicacion'] ?? this.coAplicacionDefault
      );
      this.devSiglas = decodeURIComponent(
        params['deVSiglas'] ?? this.devSiglasDefault
      );
      this.noVAplicacion = decodeURIComponent(
        params['noVAplicacion'] ?? this.noVAplicacionDefault
      );
      this.idAplicacion = parseInt(
        decodeURIComponent(params['idAplicacion'] ?? this.idAplicacionDefault)
      );
    });
  }

  changeToggle(item: any): boolean {
    if (item.expanded) {
      item.expanded = !item.expanded;
    }
    return item.expanded;
  }

  iconItem(item: any): string {
    if (item.children?.lenght > 0) return 'pi-plus';

    return 'pi-minus';
  }

  public images(name: string): string {
    return `assets/images/${name}.png`;
  }

  public icon(name: string): string {
    return `assets/icons/${name}.svg`;
  }

  /*public icon(item: any): string {
    if (item?.expanded) {
      if (item?.children) {
        return 'assets/icons/expandedminus.svg';
      }
      return 'assets/icons/expandedplus.svg';
    }

    if (item?.children?.lenght > 0) {
      return 'assets/icons/plus.svg';
    }

    return `assets/icons/minus.svg`;
  }*/

  actualizarOrden(nodo: any, nuevaPosicion: number): void {
    const request: ActualizarOrden = {
      idMenu: nodo.idMenu,
      idPadreMenu: nodo.idPadreMenu,
      nuevoOrden: nuevaPosicion,
      codigoUsuarioActualiza: this.usuarioSesion?.usuario.usuario,
    };

    // Guarda el estado de expansión antes de actualizar
    this.saveExpandedState();

    this.adminMenusService.actualizarOrden(request).subscribe({
      next: (response) => {
        this.listarMenus();
      },
      error: (err) => {
        this.error = err;
        console.error('Error al arrastrar:', err);
      },
    });
  }

  listarMenus(): void {
    this.spinner.show();
    this.adminMenusService
      .obtenerListaMenus(BigInt(this.idAplicacion))
      .subscribe({
        next: (response) => {
          this.spinner.hide();
          this.files = response;

          this.loading = false;

          // Restaura el estado de expansión después de cargar los datos
          this.restoreExpandedState();
        },
        error: (err) => {
          this.spinner.hide();
          this.error = err;
          console.error('Error al obtener el menu:', err);
        },
      });
  }

  agregarNodo(idMenuPadre: number, isNodoPrimerNivel: boolean): void {
    this.refModal = this.dialogService.open(AddEditMenuComponent, {
      width: '750px',
      showHeader: false,
      data: {
        idAplicacionActual: this.idAplicacion, //id de aplicacion donde se creará el nodo
        devSiglasAplicacionActual: this.devSiglas,
        nombreAplicacionActual: this.noVAplicacion,
        idMenuPadre: idMenuPadre,
        isEditModal: false,
        isNodoPrimerNivel: isNodoPrimerNivel,
      },
    });

    this.refModal.onClose.subscribe((response: any) => {
      if (response) {
        if (response === 'confirm') {
          this.listarMenus();
        }
      }
    });
  }

  agregarNodoPrimerNivel() {
    let idMenuPadreParam = Number(
      this.route.snapshot.queryParamMap.get('idAplicacion')
    );
    this.agregarNodo(idMenuPadreParam, true);
  }

  public informarAgregarMenu(
    icon: string,
    title: string,
    description: string
  ): void {
    this.refModal = this.dialogService.open(AlertModalComponent, {
      width: '600px',
      showHeader: false,
      data: {
        icon: icon,
        title: title,
        description: description,
        confirmButtonText: 'Listo',
      },
    });
  }

  public onCloseEditarDialog(event: any): void {
    this.editarIsVisible = false;
  }
  /*
  eliminarMenu(idx:any,turnoObject:any){
    let descriptionsatisfactorio = `El <b>Turno</b> para la <b>"${turnoObject?.dependencia?.toLowerCase()}"</b> perteneciente al <b>${turnoObject?.despacho?.toLowerCase()}</b>, el cual iniciaba el ${turnoObject?.fechaInicio?formatDateTextCut(turnoObject.fechaInicio):' '} y finalizaba el ${turnoObject?.fechaFin?formatDateTextCut(turnoObject.fechaFin):' '}, ha sido eliminado.`

    this.turnoService.eliminarTurno(turnoObject.idTurno,'40291777').subscribe(
      {
         next: (response) => {
          this.turnoLista.splice(idx, 1)
            this.informarEliminacionTurno(descriptionsatisfactorio);
          },
          error: (err) => {
            this.error = err;
            console.error('Error al eliminar el turno: ', err);
          }
      });
    }
 */
  /*editarMenu_old(nodo: MenuInterface): void {
    this.refModal = this.dialogService.open(EditarMenuComponent, {
      width: '750px',
      showHeader: false,
      data: {
        idAplicacionPadre: nodo.idAplicacionPadre,
        nodo: nodo,
      },
    });

    this.refModal.onClose.subscribe((response: any) => {
      if (response) {
        if (response.mensaje == 'LA OPERACION SE REALIZO SATISFACTORIAMENTE') {
          this.informarAgregarMenu(
            'success',
            'NODO/MENÚ EDITADO',
            `Se actualizó correctamente el nodo  <b>${response.nombreAplicacion}</b> ` +
            `en el sistema <b>${this.noVAplicacion}</b>`
          );
          this.refModal.onClose.subscribe({
            next: (resp) => {
              if (resp === 'confirm') {
                this.listarMenus();
              }
            },
          });
        }
      }
    });
  }*/

  editarNodo(nodo: MenuInterface): void {
    this.refModal = this.dialogService.open(AddEditMenuComponent, {
      width: '750px',
      showHeader: false,
      data: {
        idAplicacionActual: this.idAplicacion, //id de aplicacion donde se creará el nodo
        devSiglasAplicacionActual: this.devSiglas,
        nombreAplicacionActual: this.noVAplicacion,
        nodo: nodo,
        isEditModal: true,
      },
    });

    this.refModal.onClose.subscribe((response: any) => {
      if (response) {
        if (response.mensaje == 'LA OPERACION SE REALIZO SATISFACTORIAMENTE') {
          this.informarAgregarMenu(
            'success',
            'NODO/MENÚ EDITADO',
            `Se actualizó correctamente el nodo  <b>${response.nombreAplicacion}</b> ` +
              `en el sistema <b>${this.noVAplicacion}</b>`
          );
          this.refModal.onClose.subscribe({
            next: (resp) => {
              if (resp === 'confirm') {
                this.listarMenus();
              }
            },
          });
        }
      }
    });
  }

  confirmaEliminarMenu(nodo: MenuInterface): void {
    let numberChildren: any = 0;
    numberChildren = this.files.find((x) => x.data.idMenu == nodo?.idMenu)
      ?.children?.length;
    numberChildren = numberChildren || 0;

    let descriptionconfirma = `Esta a punto de eliminar el nodo "${nodo.nombreAplicacion}" (el cual cuenta con ${numberChildren} subnodos asociados). Esta acción es <b>irreversible</b>, ¿Desea eliminarlo?`;
    this.refModal = this.dialogService.open(AlertModalComponent, {
      width: '750px',
      showHeader: false,
      contentStyle: {
        padding: '0',
        'border-radius': '20px',
        border: 'none!important',
      },
      data: {
        icon: 'question',
        title: 'ELIMINAR NODO/MENÚ',
        confirmButtonText: 'Aceptar',
        confirm: true,
        description: descriptionconfirma,
      },
    });

    this.refModal.onClose.subscribe((response: any) => {
      if (response) {
        if (response === 'confirm') {
          this.eliminarMenu(nodo, numberChildren);
        }
      }
    });
  }

  eliminarMenu(nodo: MenuInterface, numberChildren: any): void {
    let codigoUsuarioActualiza: string = this.usuarioSesion?.usuario.usuario;

    nodo.codigoUsuarioActualiza = codigoUsuarioActualiza;
    this.adminMenusService.eliminarNodoMenu(nodo).subscribe({
      next: (response) => {
        this.refModal = this.dialogService.open(AlertModalComponent, {
          width: '750px',
          showHeader: false,
          contentStyle: {
            padding: '0',
            'border-radius': '20px',
            border: 'none!important',
          },
          data: {
            icon: 'success',
            title: 'NODO/MENÚ ELIMINADO',
            confirmButtonText: 'Listo',
            description: `Se eliminó el nodo ${nodo.nombreAplicacion} y sus ${numberChildren} subnodos asociados.`,
          },
        });
        this.listarMenus();
      },
      error: (err) => {
        this.error = err;
        console.error('Error al eliminar el nodo/menu: ', err);
      },
    });
  }

  public regresar(event: Event): void {
    event.preventDefault(); // Evitar el comportamiento por defecto del enlace

    this.router.navigateByUrl('/app/bandeja-aplicacion');
  }
}
