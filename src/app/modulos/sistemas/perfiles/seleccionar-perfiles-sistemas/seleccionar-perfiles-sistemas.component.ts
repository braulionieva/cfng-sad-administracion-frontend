import { Component } from '@angular/core';
import { MessageService, TreeNode } from 'primeng/api';
import { SpinnerModule } from 'primeng/spinner';
import { ToastModule } from 'primeng/toast';
import { TreeTableModule } from 'primeng/treetable';
import { CommonModule } from '@angular/common';
import { CheckboxModule } from 'primeng/checkbox';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { AdminPerfilesService } from '@services/admin-perfiles/admin-perfiles.service';
import {
  Aplicacion,
  DataTreeNode,
  DataTreeNodeRequestDTO,
  Perfil,
} from '@interfaces/admin-perfiles/admin-perfiles';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { AlertModalComponent } from '@components/alert-modal/alert-modal.component';
import { ComunDialogService } from '@services/dialog/comun-dialog.service';

@Component({
  selector: 'app-seleccionar-perfiles-sistemas',
  standalone: true,
  imports: [
    ToastModule,
    TreeTableModule,
    CommonModule,
    CheckboxModule,
    FormsModule,
    ButtonModule,
    DialogModule,
    SpinnerModule,
  ],
  templateUrl: './seleccionar-perfiles-sistemas.component.html',
  styleUrls: ['./seleccionar-perfiles-sistemas.component.scss'],
  providers: [MessageService, DynamicDialogRef],
})
export class SeleccionarPerfilesSistemasComponent {
  arbol: TreeNode[];

  modifiedNodes: DataTreeNode[] = [];

  visible: boolean; //mostrar ventana de dialogo
  error: any;

  public refModal: DynamicDialogRef;

  private aplicacion: Aplicacion;
  private perfil: Perfil;

  descripcionPerfil: string = '';

  loading: boolean = true;

  updateTblPerfiles: boolean;

  existeArbol: boolean = false; //para deshabilitar el boton de guardar cambios

  //guarda el estado inicial de los nodos
  initialState: { [key: string]: boolean } = {};

  constructor(
    private adminPerfilesService: AdminPerfilesService,
    private messageService: MessageService,
    private dialogService: DialogService,
    private dialogComunService: ComunDialogService
  ) {
    this.dialogComunService.showDialog$.subscribe((params) => {
      this.arbol = [];
      this.visible = true;
      this.loading = true;
      this.updateTblPerfiles = false;
      this.aplicacion = params.aplicacion;
      this.perfil = params.perfil;
      this.descripcionPerfil = this.perfil.descripcionPerfil;

      let data: DataTreeNodeRequestDTO = {
        idPerfilAplicacion: null,
        idPerfil: this.perfil.idPerfil,
        idAplicacion: this.aplicacion.idAplicacion,
        idOpcion: this.aplicacion.idOpcion,
        estado: null,
        direccionIp: null,
        coUsuario: null,
        noUsuario: null,
      };
      console.log('Data antes de enviar al servicio:', data);
      this.obtenerArbolOpcionesMenu(data);
    });

    this.dialogComunService.hideDialog$.subscribe(() => {
      this.visible = false;
    });
  }

  obtenerArbolOpcionesMenu(data: DataTreeNodeRequestDTO) {
    console.log(
      'Data recibida en el servicio antes de enviarla al backend:',
      data
    );
    this.adminPerfilesService.obtenerArbolOpcionesMenu(data).subscribe({
      next: (response) => {
        this.arbol = response;
        this.existeArbol = this.arbol?.length > 0;
        this.modifiedNodes = [];
        this.loading = false;

        // Guardar estado inicial
        this.initialState = {};
        this.saveInitialState(this.arbol);

      },
      error: (err) => {
        this.error = err;
      },
    });
  }

  // Método auxiliar para guardar el estado inicial de los nodos recursivamente
  private saveInitialState(nodes: TreeNode[]) {
    nodes.forEach(node => {
      const data = node.data as DataTreeNode;
      this.initialState[data.key] = data.esEstado;

      if (node.children) {
        this.saveInitialState(node.children);
      }
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
      posBuscado = this.modifiedNodes.findIndex(
        (p) => p.key === rowData.key && p.idAplicacion === rowData.idAplicacion
      );
      perfilAppRegistrado = rowData.esEstado;
    }

    // Si el estado actual es igual al inicial, removemos el nodo de modificados
    if (rowData.esEstado === this.initialState[rowData.key]) {
      if (posBuscado > -1) {
        this.modifiedNodes.splice(posBuscado, 1);
      }
    } else {
      // Si el estado es diferente al inicial, agregamos o actualizamos el nodo
      if (posBuscado > -1) {
        this.modifiedNodes[posBuscado] = rowData;
      } else if (perfilAppRegistrado) {
        this.modifiedNodes.push(rowData);
      }
    }
  }

  grabarOpcionesMenuPerfil() {
    let canOpcSelected = this.modifiedNodes.length;
    if (canOpcSelected > 0) {
      let requestLs: Array<DataTreeNodeRequestDTO> = [];
      //let request: DataTreeNodeRequestDTO;
      this.modifiedNodes.forEach((dataTreeNode) => {
        console.log('this.perfil.idPerfil:', this.perfil.idPerfil); // Log para idPerfil
        console.log(
          'this.aplicacion.idAplicacion:',
          this.aplicacion.idAplicacion
        ); // Log para idAplicacion
        console.log('dataTreeNode:', dataTreeNode); // Log para el nodo actual
        // request = {
        //   estado: dataTreeNode.esEstado ? '1' : '2',
        //   direccionIp: null,
        //   coUsuario: null,
        //   noUsuario: null,
        //   idOpcion: null,
        //   idAplicacion: this.aplicacion.idAplicacion,
        //   idPerfil: this.perfil.idPerfil,
        //   ...dataTreeNode,
        // };

        // let request = {
        //   ...dataTreeNode, // Usa dataTreeNode, pero
        //   idPerfil: this.perfil.idPerfil // Sobrescribe idPerfil con el valor correcto
        //   // idAplicacion: this.aplicacion.idAplicacion, // Sobrescribe idAplicacion con el valor correcto
        //   // estado: dataTreeNode.esEstado ? '1' : '2',
        //   // direccionIp: null,
        //   // coUsuario: null,
        //   // noUsuario: null,
        //   // idOpcion: null,
        // };

        let request: DataTreeNodeRequestDTO = {
          idOpcion: null,
          estado: dataTreeNode.esEstado ? '1' : '2',
          direccionIp: null,
          coUsuario: null,
          noUsuario: null,
          idPerfil: this.perfil.idPerfil,
          idAplicacion: dataTreeNode.idAplicacion,
          idPerfilAplicacion: dataTreeNode.idPerfilAplicacion,
        };

        requestLs.push(request);
      });

      this.adminPerfilesService.registrarOpcionesMenu(requestLs).subscribe({
        next: (response) => {
          this.modifiedNodes = [];
          this.updateTblPerfiles = true;
          this.mensajeOpcMenuGuardado(
            'success',
            this.perfil.descripcionPerfil,
            this.aplicacion.deSiglas
          );
          let data: DataTreeNodeRequestDTO = {
            idPerfilAplicacion: null,
            idPerfil: this.perfil.idPerfil,
            idAplicacion: this.aplicacion.idAplicacion,
            idOpcion: this.aplicacion.idOpcion,
            estado: null,
            direccionIp: null,
            coUsuario: null,
            noUsuario: null,
          };
          this.obtenerArbolOpcionesMenu(data);
          this.handleHide();
        },
        error: (err) => {
          this.messageService.add({
            severity: 'error',
            summary: 'error',
            detail: 'Error modificando perfil',
          });
          this.error = err;
          console.error(
            'Error al modificar las opciones de menu del perfil',
            err
          );
        },
      });
    }
  }

  mensajeOpcMenuGuardado(icon: string, desPerfil: string, nomSistema: string) {
    this.refModal = this.dialogService.open(AlertModalComponent, {
      width: '600px',
      showHeader: false,
      data: {
        icon: icon,
        title: 'PERFIL MODIFICADO',
        description:
          'Se modificaron las opciones de menú para el perfil <strong>'
            .concat(desPerfil)
            .concat('</strong> en el sistema <strong>')
            .concat(nomSistema)
            .concat('</strong>'),
        confirmButtonText: 'Listo',
      },
    });
  }

  public icon(name: string): string {
    return `assets/icons/${name}.svg`;
  }

  handleHide() {
    this.visible = false;
    const params = { updTablaPerfiles: this.updateTblPerfiles };
    this.dialogComunService.hideDialog(params); // Comunicar datos al cerrar la modal
    this.updateTblPerfiles = false;
  }

  esBotonGrabarHabilitado() {
    //console.log("this.modifiedNodes.length:",this.modifiedNodes.length)
    return this.modifiedNodes.length > 0;
  }

  // *********************
  get closeIcon(): string {
    return 'assets/icons/close_new.svg';
  }
}
