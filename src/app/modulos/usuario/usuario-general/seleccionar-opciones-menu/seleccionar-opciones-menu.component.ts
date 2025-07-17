import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastModule } from 'primeng/toast';
import { TreeTableModule } from 'primeng/treetable';
import { CheckboxModule } from 'primeng/checkbox';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { MessageService, TreeNode } from 'primeng/api';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import {
  Aplicacion,
  DataTreeNode,
} from '@interfaces/admin-perfiles/admin-perfiles';
import { ComunDialogService } from '@services/dialog/comun-dialog.service';
import { AlertModalComponent } from '@components/alert-modal/alert-modal.component';
import { DataTreeNodeRequest } from '@interfaces/perfiles-usuario/perfiles-usuario';
import { PerfilesUsuarioService } from '@services/admin-usuario/perfiles-usuario/perfiles-usuario.service';

@Component({
  selector: 'app-seleccionar-opciones-menu',
  standalone: true,
  imports: [
    CommonModule,
    ToastModule,
    TreeTableModule,
    CheckboxModule,
    FormsModule,
    ButtonModule,
    DialogModule,
  ],
  templateUrl: './seleccionar-opciones-menu.component.html',
  styleUrls: ['./seleccionar-opciones-menu.component.scss'],
  providers: [MessageService, DynamicDialogRef],
})
export class SeleccionarOpcionesMenuComponent implements OnInit {
  public infoUsuario;
  arbol: TreeNode[];

  modifiedNodes: DataTreeNode[] = [];

  visible: boolean; //mostrar ventana de dialogo
  error: any;

  public refModal: DynamicDialogRef;

  private perfiles: Array<number>;
  private aplicacion: Aplicacion;

  loading: boolean = true;

  updateTblPerfiles: boolean;

  private readonly perfilesUsuarioService: PerfilesUsuarioService = inject(
    PerfilesUsuarioService
  );

  constructor(
    private messageService: MessageService,
    private dialogService: DialogService,
    private dialogComunService: ComunDialogService
  ) {
    this.dialogComunService.showDialog$.subscribe((params) => {
      console.log(
        'Parámetros recibidos en SeleccionarOpcionesMenuComponent:',
        params
      );
      this.arbol = [];
      this.visible = true;
      this.loading = true;
      this.updateTblPerfiles = false;
      this.aplicacion = params.aplicacion;
      this.perfiles = params.perfiles;
      this.infoUsuario = params.infoUsuario;

      console.log('Perfiles recibidos:', this.perfiles);

      let data: DataTreeNodeRequest = {
        idPerfilAplicacion: null,
        idPerfiles: this.perfiles,
        idAplicacion: this.aplicacion,
        estado: '1',
        ipAcceso: null,
        codUser: null,
        noUsuario: null,
      };
      this.obtenerArbolOpcionesMenu(data);
    });

    this.dialogComunService.hideDialog$.subscribe(() => {
      this.visible = false;
    });
  }

  ngOnInit(): void {
    // This is intentional
  }

  cierraAddAppModal() {
    this.closeModal();
  }

  protected closeModal() {
    this.visible = false;
  }

  public icon(name: string): string {
    return `assets/icons/${name}.svg`;
  }

  obtenerArbolOpcionesMenu(data: DataTreeNodeRequest) {
    // this.loading = true;
    this.perfilesUsuarioService.getListaOpcionesPerfil(data).subscribe({
      next: (response) => {
        this.arbol = response;
        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
      },
      complete: () => {
        //this.visible = true;
        this.loading = false;
      },
    });
  }

  onCheckboxChange(rowData: DataTreeNode) {
    let posBuscado = -1;
    let perfilAppRegistrado = true;
    //verificar si el nodo cuenta con idPerfilAplicacion
    if (rowData.idPerfilAplicacion > 0) {
      posBuscado = this.modifiedNodes.findIndex(
        (p) => p.idPerfilAplicacion === rowData.idPerfilAplicacion
      );
    } else {
      //se trata de una opcion no registrada aún
      posBuscado = this.modifiedNodes.findIndex(
        (p) => p.key === rowData.key && p.idAplicacion === rowData.idAplicacion
      );
      perfilAppRegistrado = rowData.esEstado;
    }
    if (posBuscado > -1) {
      this.modifiedNodes.splice(posBuscado, 1);
    }
    if (perfilAppRegistrado) {
      rowData.idPerfil = this.perfiles[0];
      this.modifiedNodes.push(rowData);
    }
  }

  grabarOpcionesMenuPerfil() {
    // this.arbol = null;
    let canOpcSelected = this.modifiedNodes.length;
    if (canOpcSelected > 0) {
      let requestLs: Array<DataTreeNodeRequest> = [];
      let request: any;

      this.modifiedNodes.forEach((dataTreeNode) => {
        request = {
          idPerfilAplicacion: dataTreeNode.idPerfilAplicacion,
          idPerfil: dataTreeNode.idPerfil,
          idAplicacion: dataTreeNode.idAplicacion,
          estado: dataTreeNode.esEstado ? '1' : '2',
          direccionIp: '127.0.0.1',
          coUsuario: this.infoUsuario?.usuario.usuario,
          noUsuario: this.infoUsuario?.usuario.fiscal,
        };
        requestLs.push(request);
      });

      console.log('Payload a registrar:', requestLs);

      this.perfilesUsuarioService.registrarOpcionesMenu(requestLs).subscribe({
        next: (response) => {
          this.modifiedNodes = [];
          this.updateTblPerfiles = true;
          let data: DataTreeNodeRequest = {
            idPerfilAplicacion: null,
            idPerfiles: this.perfiles,
            idAplicacion: this.aplicacion,
            estado: '1',
            ipAcceso: null,
            codUser: null,
            noUsuario: null,
          };
          this.obtenerArbolOpcionesMenu(data);
          this.loading = true;
          this.handleHide();
        },
        error: (err) => {
          this.messageService.add({
            severity: 'error',
            summary: 'error',
            detail: 'Error en la modificacion',
          });
          this.error = err;
          console.error('Error al modificar las opciones de menu', err);
        },
      });
    }
  }

  mensajeOpcMenuGuardado(icon: string) {
    this.refModal = this.dialogService.open(AlertModalComponent, {
      width: '600px',
      showHeader: false,
      data: {
        icon: icon,
        title: 'MODIFICADO',
        description: 'Se modificaron las opciones de menú.',
        confirmButtonText: 'Listo',
      },
    });
  }

  handleHide() {
    this.visible = false;
    const params = { updTablaPerfiles: this.updateTblPerfiles };
    this.dialogComunService.hideDialog(params); // Comunicar datos al cerrar la modal
    this.updateTblPerfiles = false;
  }
}
