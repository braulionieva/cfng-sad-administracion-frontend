import { CommonModule } from '@angular/common';
import { Component, Input, OnInit, inject } from '@angular/core';
import { UsuarioDetalle } from '@interfaces/baja-usuario/baja-usuario';
import { DialogModule } from 'primeng/dialog';
import { ListenerAdminUsuarioService } from '../listener-admin-usuario/listener-admin-usuario.service';
import { ConstanteMenuUsuario } from '../ConstanteAdminUsuario';
import { TabViewModule } from 'primeng/tabview';
import { CheckboxModule } from 'primeng/checkbox';
import {
  PerfilCategoria,
  PerfilSistema,
} from '@interfaces/perfiles-usuario/perfiles-usuario';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { PerfilesUsuarioService } from '@services/admin-usuario/perfiles-usuario/perfiles-usuario.service';
import {
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { TreeTableModule } from 'primeng/treetable';
import { SpinnerModule } from 'primeng/spinner';
import { SeleccionarOpcionesMenuComponent } from '../seleccionar-opciones-menu/seleccionar-opciones-menu.component';
import { ComunDialogService } from '@services/dialog/comun-dialog.service';

@Component({
  standalone: true,
  selector: 'app-anadir-perfiles',
  templateUrl: './anadir-perfiles.component.html',
  styleUrls: ['./anadir-perfiles.component.scss'],
  imports: [
    CommonModule,
    DialogModule,
    TabViewModule,
    ButtonModule,
    CheckboxModule,
    TableModule,
    FormsModule,
    ReactiveFormsModule,
    TreeTableModule,
    SpinnerModule,
    SeleccionarOpcionesMenuComponent,
  ],
})
export class AnadirPerfilesComponent implements OnInit {
  userRow: any;
  userDetail: UsuarioDetalle;

  @Input() infoUsuario: any;

  // usuarios
  loadingTablePerfiles: boolean = false;
  loadingTableOpcionesMenu: boolean = false;

  isVisibleModalPerfilesUs: boolean = false;
  isVisibleModalOpcionesMenu: boolean = false;

  categoriaTabs: PerfilCategoria[] = [];
  sistemaTabs: PerfilSistema[] = [];

  usuarioSistema: any;
  perfilesTableData: any = [];

  isEditingModalPerfilesUs: boolean = false;
  isSaveModalPerfilesUs: boolean = false;

  isCustomiseModalPerfilesUs: boolean = false;

  perfilesFormArray: FormArray;

  idTabAplicacion: number;

  perfilesRequest: any = [];

  // opciones
  opcionesMenuTableData: any = [];

  showPerfilesTable: boolean = false; // Controla si la tabla se muestra

  //private readonly ref: DynamicDialogRef = inject(DynamicDialogRef);

  private readonly perfilesUsuarioService: PerfilesUsuarioService = inject(
    PerfilesUsuarioService
  );

  constructor(
    private listenerAdminUsuarioService: ListenerAdminUsuarioService,
    private formBuilder: FormBuilder,
    private dialogComunService: ComunDialogService
  ) {
    this.perfilesFormArray = new FormArray([]);
  }

  ngOnInit(): void {
    this.userRow = Object.create(null);
    this.userDetail = Object.create(null);

    //el escucha para las opciones de las acciones
    this.listenerAdminUsuarioService
      .getUsuarioMenuOpcionId()
      .subscribe((usuarioMenuOpcionId) => {
        if (
          usuarioMenuOpcionId &&
          usuarioMenuOpcionId.menuOpcionId ===
            ConstanteMenuUsuario.PERFILES_USAURIO
        ) {
          this.userRow = usuarioMenuOpcionId.usuarioRow;
          this.onOpenModalPerfilesUs();
          this.getCategorias();
          if (!usuarioMenuOpcionId?.usuarioRow) return;
          this.usuarioSistema = usuarioMenuOpcionId.usuarioRow;
        }
      });

    this.listenerAdminUsuarioService.getInfoUsuario().subscribe((info) => {
      this.infoUsuario = info;
    });
  }

  toggleTableVisibility() {
    this.showPerfilesTable = true; // Mostrar la tabla cuando se haga clic en Editar
  }

  cierraAddAppModal() {
    this.closeModal();
  }

  protected closeModal() {
    // this.closeModal();
    this.isVisibleModalPerfilesUs = false;
  }

  public icon(name: string): string {
    return `assets/icons/${name}.svg`;
  }

  getCategorias() {
    this.perfilesUsuarioService.getCategorias().subscribe({
      next: (response) => {
        this.categoriaTabs = response;
        if (this.categoriaTabs?.length === 0) return;
        const firstCategory = this.categoriaTabs[0];
        this.getSistemas(firstCategory.id);
      },
      error: (err) => {
        console.error('error al leer datos del servidor. ', err);
      },
    });
  }

  getSistemas(idCategoria) {
    this.perfilesUsuarioService.getSistemas(idCategoria).subscribe({
      next: (response) => {
        this.sistemaTabs = response;
        if (this.sistemaTabs.length <= 0) return;
        const firstSistema = this.sistemaTabs[0];
        this.idTabAplicacion = firstSistema.id;
        this.getListaPerfiles();
      },
      error: (err) => {
        console.error('error al leer datos del servidor. ', err);
      },
    });
  }

  getListaPerfiles() {
    if (!this.idTabAplicacion) return;

    const datosSolicitud = {
      idAplicacion: this.idTabAplicacion,
      idUsuario: this.userRow.idUsuario, //idVUsuario,
    };

    this.loadingTablePerfiles = true;
    this.perfilesUsuarioService.getListaPerfiles(datosSolicitud).subscribe({
      next: (response) => {
        this.perfilesTableData = response;
        if (this.perfilesTableData?.length <= 0) return;
        // creacion de formArray
        this.perfilesFormArray = this.formBuilder.array(
          this.perfilesTableData.map((perfil) =>
            this.buildPerfilFormGroup(perfil)
          )
        );
        // estableciendo arreglo de perfilesRequest
        this.perfilesRequest = this.perfilesTableData.map((perfil) => {
          return this.mutatePerfilObj(perfil);
        });
        // habilitando accion editar perfiles
        this.handleStateIsEditingPerfiles(true);
        // cambiar estado de personalizar en caso exista algun perfil seleccionado (true)
        this.handleStateCustomisePerfiles(
          this.verifyStateTruePerfiles(this.perfilesTableData)
        );
      },
      error: (err) => {
        console.error('Error en la operacion: ', err);
      },
      complete: () => {
        this.loadingTablePerfiles = false;
      },
    });
  }

  arrayPerfilesTrue(perfiles) {
    return perfiles
      .filter((perfil) => perfil.estadoPerfilUsuario === '1')
      .map((perfilFiltrado) => perfilFiltrado.idPerfil);
  }

  // funcion para verificar si existe algun perfil en estado "1" (true)
  verifyStateTruePerfiles(perfilesArray) {
    return perfilesArray.some((perfil) => perfil.estado === '1');
  }

  handleSelectPerfiles(index: number) {
    const perfilFormGroup = this.perfilesFormArray.at(index) as FormGroup;
    const perfilFiltrado = perfilFormGroup.value;

    if (perfilFiltrado) {
      const perfilModificado = this.mutatePerfilObj(perfilFiltrado);

      const perfilIndex = this.perfilesRequest.findIndex(
        (perfil) => perfil.idPerfil === perfilModificado.idPerfil
      );

      if (perfilIndex > -1) {
        this.perfilesRequest[perfilIndex] = perfilModificado;
      } else {
        this.perfilesRequest.push(perfilModificado);
      }
    }
  }

  savePerfiles() {
    if (this.perfilesRequest?.length <= 0) return;

    const datosSolicitud = {
      listaPerfiles: this.perfilesRequest,
      idAplicacion: this.idTabAplicacion,
    };

    this.perfilesUsuarioService.agregarPerfil(datosSolicitud).subscribe({
      next: (response) => {
        this.getListaPerfiles();
        this.handleStateIsSavePerfiles(false);
        this.showPerfilesTable = false; // Para ocultar la tabla después de guardar
      },
      error: (err) => {
        console.error('Error en la operacion: ', err);
      },
    });
  }

  buildPerfilFormGroup(perfilData: any): FormGroup {
    /**const estadoControl = new FormControl(
      perfilData.estado === '1'
        ? true
        : perfilData.estado === '2'
        ? false
        : null
    );**/
    let estadoValue: boolean | null = null;

    if (perfilData.estado === '1') {
      estadoValue = true;
    } else if (perfilData.estado === '2') {
      estadoValue = false;
    }

    const estadoControl = new FormControl(estadoValue);

    estadoControl.disable();

    return this.formBuilder.group({
      id: new FormControl(perfilData.id),
      idSistema: new FormControl(perfilData.idSistema),
      sistema: new FormControl(perfilData.sistema),
      idPerfil: new FormControl(perfilData.idPerfil),
      perfil: new FormControl(perfilData.perfil),
      estado: estadoControl,
      idPerfilUsuario: new FormControl(perfilData.idPerfilUsuario),
    });
  }

  onCategoriaTabChange(categoria) {
    this.clearListaPerfiles(); // reset
    const selectedTabId = this.categoriaTabs[categoria?.index].id;
    if (!selectedTabId) return;
    this.getSistemas(selectedTabId);
  }

  onSistemaTabChange(sistema) {
    this.clearListaPerfiles(); // reset
    const selectedTabId = this.sistemaTabs[sistema?.index].id;
    if (!selectedTabId) return;
    this.idTabAplicacion = selectedTabId;
    this.getListaPerfiles();
  }

  clearListaPerfiles() {
    this.perfilesTableData = [];
    if (!this.perfilesFormArray?.value) return;
    this.perfilesFormArray = new FormArray([]);
    this.handleStateIsEditingPerfiles(false);
    this.handleStateIsSavePerfiles(false);
  }

  enabledCheckboxesPerfiles() {
    this.handleStateIsEditingPerfiles(true);
    // habilitar checkboxes perfiles
    this.perfilesFormArray.controls.forEach((perfilFormGroup: FormGroup) => {
      const estadoControl = perfilFormGroup.get('estado') as FormControl;
      estadoControl.enable(); // Habilitando el control
    });
    // activar guardar edicion perfiles
    this.handleStateIsSavePerfiles(true);
    // deshabilitar estado personalizar
    this.handleStateCustomisePerfiles(false);
  }

  handlePersonalizar() {
    this.onOpenModalOpcionesMenu();
  }

  handleStateIsEditingPerfiles(state) {
    this.isEditingModalPerfilesUs = state;
  }

  handleStateIsSavePerfiles(state) {
    this.isSaveModalPerfilesUs = state;
  }

  handleStateCustomisePerfiles(state) {
    this.isCustomiseModalPerfilesUs = state;
  }

  resetData() {
    this.categoriaTabs = [];
    this.sistemaTabs = [];
    this.usuarioSistema = {};
    this.clearListaPerfiles();
    this.perfilesRequest = [];
  }

  //refactorizado
  mutatePerfilObj(perfil) {
    let estadoPerfilUsuario;

    if (perfil.estado === true || perfil.estado === '1') {
      estadoPerfilUsuario = '1';
    } else if (perfil.estado === false || perfil.estado === '2') {
      estadoPerfilUsuario = '2';
    } else {
      estadoPerfilUsuario = '2'; // Valor por defecto
    }

    return {
      idPerfil: perfil.idPerfil,
      estadoPerfilUsuario: estadoPerfilUsuario,
      idUsuarioPerfil: perfil.idPerfilUsuario,
      idUsuario: this.usuarioSistema.idUsuario, //idVUsuario,
      ipAcceso: '127.0.0.1',
      codUser: this.infoUsuario.usuario.usuario, //this.usuarioSistema.idUsuario, //.usuario,
    };
  }

  /**mutatePerfilObj(perfil) {
    return {
      idPerfil: perfil.idPerfil,
      estadoPerfilUsuario:
        perfil.estado === true || perfil.estado === '1'
          ? '1'
          : perfil.estado === false || perfil.estado === '2'
          ? '2'
          : '2',
      idUsuarioPerfil: perfil.idPerfilUsuario,
      idUsuario: this.usuarioSistema.idUsuario, //idVUsuario,
      ipAcceso: '127.0.0.1',
      //codUser: this.usuarioSistema.nuVDocumento,
      codUser: this.infoUsuario.usuario.usuario, //this.usuarioSistema.idUsuario, //.usuario,
    };
  }**/

  verifySelectedPerfiles() {
    this.perfilesRequest.filter((perfil) => {
      perfil.estadoPerfilUsuario();
    });
  }

  onOpenModalPerfilesUs() {
    this.isVisibleModalPerfilesUs = true;
  }

  onOpenModalOpcionesMenu() {
    this.isVisibleModalOpcionesMenu = true;

    const params = {
      perfiles: this.arrayPerfilesTrue(this.perfilesRequest),
      aplicacion: this.idTabAplicacion,
      infoUsuario: this.infoUsuario,
    };
    console.log('Perfiles para asignar opciones: ', params);

    this.dialogComunService.showDialog(params);
  }

  onCloseModalPerfilesUs() {
    this.isVisibleModalPerfilesUs = false;
    this.resetData();

    // Restablecer el BehaviorSubject al cerrar el modal
    this.listenerAdminUsuarioService.resetUsuarioMenuOpcionId();
  }

  onCloseModalOpcionesMenu() {
    this.isVisibleModalOpcionesMenu = false;
  }
}
