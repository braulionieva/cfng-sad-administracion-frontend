import { CommonModule, NgIf } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActualizarDependenciaAtfRe, ActualizarDependenciaAtfReq, AgregarDependenciaAtfReq, AgregarDependenciaAtfRes, BuscarDependenciaAtfFiltro, BuscarDependenciaAtfReq, DepartamentoATF, DependenciaAtfObj, DependenciaAtfTRow, EliminarDependenciaAtfReq, EliminarDependenciaAtfRes, RegionATF, TipoATF } from '@interfaces/administrarDependenciasATF/administrarDependenciasATF';
import { ConfigPage } from '@interfaces/plazo-doc-obs/BuscarPlazoDocObsRes';
import { AdministrarDependenciasATFService } from '@services/administrarDependenciasATF/administrar-dependencias-atf.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { MessageService, ConfirmationService, MenuItem } from 'primeng/api';
import { TableLazyLoadEvent } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { CalendarModule } from 'primeng/calendar';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DialogModule } from 'primeng/dialog';
import { DropdownModule } from 'primeng/dropdown';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextarea } from 'primeng/inputtextarea';
import { MenuModule } from 'primeng/menu';
import { TableModule } from 'primeng/table';
import { ToastModule } from 'primeng/toast';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { AlertModalComponent } from '@components/alert-modal/alert-modal.component';
import { Auth2Service } from '@services/auth/auth2.service';
import { obtenerIcono } from "@utils/icon";
import { CmpLibModule } from "ngx-mpfn-dev-cmp-lib";
import { finalize } from 'rxjs';

@Component({
  selector: 'app-dependencias-atf',
  standalone: true,
  templateUrl: './dependencias-atf.component.html',
  styleUrls: ['./dependencias-atf.component.scss'],
  imports: [
    CommonModule, DropdownModule, ReactiveFormsModule, InputTextModule, ButtonModule,
    CalendarModule, TableModule, ToastModule, DialogModule, ConfirmDialogModule,
    MenuModule, NgIf, FormsModule, ReactiveFormsModule, InputTextModule,
    DropdownModule, InputNumberModule, CommonModule, InputTextarea, InputTextarea,
    CmpLibModule,
  ],
  providers: [MessageService, ConfirmationService, DialogService],
})
export class DependenciasAtfComponent implements OnInit {
  protected readonly usuarioActual = this.userService.getUserInfo(); // Información del usuario en sesion
  protected readonly obtenerIcono = obtenerIcono;

  protected formFiltroBuscar: FormGroup;
  protected showMoreFiltro: boolean = false;
  protected toggleIcon: string = 'pi-angle-double-down';

  //variables para acusacion y sobreseimiento
  protected configPage: ConfigPage;

  protected tipoATFLst: TipoATF[] = [];
  protected regionATFLst: RegionATF[] = [];

  //departamento puede variar de acuerdo a la region seleccionada, para filtro y formulario pueden ser diferentes
  protected departamentoATFLst: DepartamentoATF[] = []; //para filtro.
  //departamentoATFLstForm: DepartamentoATF[] = [];//para el formulario add y udp

  protected dependenciaAtfTRowLst: DependenciaAtfTRow[] = [];
  protected dependenciaAtfTRowSelected: DependenciaAtfTRow;
  protected dependenciaAtfTRowLstTotal: number = 0; //otal de registros de búsqueda

  //permite evitar la búsqueda cuando se carga la tabla por primera vez.
  //la primera vez no debe ejecutarse debido a que el usuario no ha enviado los parámetros de búsqueda
  protected onLazyLoadActivo: boolean = false;

  //variables para items de cada resultado
  protected actionItems: MenuItem[];

  //MODALNUEVO REGISTRO SOBRESEIMIENTO
  protected isVisibleModalNewForm: boolean = false;
  //formulario para los campos de nuevo registro y edicion
  protected formGroup: FormGroup;
  //flag para actualizar true para editar y false para nuevo registro
  protected isEditForm: boolean = false;
  //bean para cargar los datos del formulario de registro y edicion
  protected objForm: DependenciaAtfObj;

  //dinamic dialog for confirm:
  protected refModal: DynamicDialogRef;

  constructor(
    private readonly fb: FormBuilder,
    private readonly spinner: NgxSpinnerService,
    private readonly service: AdministrarDependenciasATFService,
    private readonly messageService: MessageService,
    protected readonly dialogService: DialogService,
    private readonly userService: Auth2Service
  ) { }

  ngOnInit() {
    this.initConfigPage();
    this.initFormFiltroBuscar();
    this.listarRegionATF();

    this.actionItems = [
      {
        label: 'Editar',
        command: () => {
          this.openModalUpdateForm();
        },
      },
      {
        label: 'Eliminar',
        command: () => {
          this.openModalDeleteForm();
        },
      },
    ];

    //inicializa formulario sobreseimiento
    this.initForm();
    this.buscarDependenciaATFFormFiltro();
  }

  private initFormFiltroBuscar() {
    this.toggleIcon = 'pi-angle-double-down';

    this.formFiltroBuscar = this.fb.group({
      noVDependenciaAtf: [null],
      coNRegion: [null],
      coNDepartamento: [null],
    });

    this.formFiltroBuscar.get('coNDepartamento').disable();
  }

  protected toggleMasFiltros(): void {
    this.showMoreFiltro = !this.showMoreFiltro;
    this.toggleIcon = this.showMoreFiltro ? 'pi-angle-double-up' : 'pi-angle-double-down';
  }

  private initConfigPage() {
    //configuracion de paginas
    this.configPage = {
      pages: 1, //pagina_i
      perPage: 10, //número de páginas
    };
  }

  public onClearFilters(): void {
    this.initConfigPage();
    this.initFormFiltroBuscar();
  }

  private async listarTipoATFAndSelectIML() {
    if (this.tipoATFLst.length <= 0) {
      try {
        const tipoATFLst = await this.service.listarTipoATF();

        this.tipoATFLst = tipoATFLst;
        this.seleccionarPrimerItemTipoATF(); //seteamos primero en la lista
      } catch (err) {
        this.messageService.add({ severity: 'error', summary: '', detail: 'Error en el proceso.' });
      }
    } else {
      this.seleccionarPrimerItemTipoATF(); //seteamos primero en la lista
    }
  }

  private async listarRegionATF() {
    try {
      this.spinner.show();
      this.regionATFLst = await this.service.listarRegionATF();

      this.regionATFLst.sort((a, b) =>
        a.noVRegion.localeCompare(b.noVRegion)
      );

    } catch (err) {
      this.messageService.add({ severity: 'error', summary: 'Rejected', detail: 'Error en el proceso.' });
    } finally {
      this.spinner.hide();
    }
  }

  private async listarDepartamentoATFPorRegion_Async(coNRegion: number) {
    try {
      const listarDepartamentoATFPorRegion: DepartamentoATF[] = await this.service.listarDepartamentoATFPorRegion_Async(coNRegion);

      listarDepartamentoATFPorRegion.sort((a, b) =>
        a.noVDepartamento.localeCompare(b.noVDepartamento)
      );

      this.departamentoATFLst = listarDepartamentoATFPorRegion;
      return listarDepartamentoATFPorRegion;
    } catch (err) {
      this.messageService.add({ severity: 'error', summary: 'Rejected', detail: 'Error en el proceso.' });
      this.spinner.hide();
      throw new Error('Error al obtener los datos');
    }
  }

  protected icon(name: string): string {
    return `assets/icons/${name}.svg`;
  }

  //basarse en buscarAcusacionFiltroForm
  protected buscarDependenciaATFFormFiltro() {
    this._buscarDependenciaATF();

    //activamos luego de los resultados de busqueda para que permita la paginación
    this.onLazyLoadActivo = true;
  }

  protected buscarDependenciaATFPaginacion(event: TableLazyLoadEvent) {
    if (this.onLazyLoadActivo) {
      //configurando page cuyos valores son (0,10,20,30,... deben ser convertidos a 1,2,3,...)
      this.configPage.pages = event.first / 10 + 1;
      this._buscarDependenciaATF();
    }
  }

  //copiar de _buscarAcusasionFiltro()
  private async _buscarDependenciaATF() {

    const filtros: BuscarDependenciaAtfFiltro = { ...this.formFiltroBuscar.value };

    const request: BuscarDependenciaAtfReq = {
      pages: this.configPage.pages,
      perPage: this.configPage.perPage,
      filtros: filtros,
    };

    try {
      this.spinner.show();

      const dependenciaAtfTRowRes = await this.service.buscarDependenciasATF(request);

      this.dependenciaAtfTRowLst = dependenciaAtfTRowRes.registros;
      this.dependenciaAtfTRowLstTotal = dependenciaAtfTRowRes.totalElementos;
    } catch (err) {
      this.messageService.add({ severity: 'error', summary: '', detail: 'Error en el proceso.' });
    } finally {
      this.spinner.hide();
    }
  }

  protected exportarExcel() {
    const request: BuscarDependenciaAtfFiltro = {
      ...this.formFiltroBuscar.value,
    };

    this.service.buscarDependenciasATFExcel(request)
      .pipe(finalize(() => { this.spinner.hide(); }))
      .subscribe({
        next: (response) => {
          const blob = new Blob([response], {
            type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          });

          const url = window.URL.createObjectURL(blob);
          const anchor = document.createElement('a');
          anchor.href = url;
          anchor.download = 'dependenciasATFExcel.xlsx';
          anchor.click();

          window.URL.revokeObjectURL(url);
        },
        error: (err) => {
          console.error('error al leer datos del servidor. ', err);
        },
      });
  }

  protected itemSelected(activeItem: any) {
    this.dependenciaAtfTRowSelected = activeItem;
  }

  protected async openModalNewForm() {
    this.isVisibleModalNewForm = true;
    this.formGroup.reset();

    this.isEditForm = false;
    this.formGroup.get('coNTipo').disable();

    await this.listarTipoATFAndSelectIML();
  }

  protected onCloseModalForm() {
    this.isVisibleModalNewForm = false;
  }

  private initForm() {
    this.objForm = Object.create(null);

    this.setDataForm(this.objForm);
  }

  private setDataForm(objForm: DependenciaAtfObj) {
    this.formGroup = this.fb.group({
      coNDependencia: new FormControl(objForm.coNDependencia),
      coNTipo: new FormControl(objForm.coNTipo, [
        Validators.required
      ]),
      coNRegion: new FormControl(objForm.coNRegion, [
        Validators.required
      ]),
      coNDepartamento: new FormControl(objForm.coNDepartamento, [
        Validators.required,
      ]),
      noVDependenciaAtf: new FormControl(objForm.noVDependenciaAtf, [
        Validators.required,
        Validators.maxLength(100),
      ]),
    });
  }

  private marcarCamposComoTocados(formGroup: FormGroup) {
    Object.values(formGroup.controls).forEach((control) => {
      control.markAsTouched();

      if (control instanceof FormGroup) {
        this.marcarCamposComoTocados(control);
      }
    });
  }

  protected async addFormBtn() {
    const coNTipo = this.formGroup.get('coNTipo').value;

    if (this.formGroup.valid && coNTipo) {
      this.confirmarAgregarRegistro('question');

      this.refModal.onClose
        .pipe(finalize(() => { this.spinner.hide(); }))
        .subscribe({
          next: (resp) => {
            if (resp === 'confirm') {
              this._addForm();
            }
          },
          error: (err) => {
            throw new Error('Error al agregar registro');
          },
        });
    } else {
      this.messageService.add({ severity: 'warn', summary: '', detail: 'Campos sin completar o inválidos' });

      this.marcarCamposComoTocados(this.formGroup);
    }
  }

  private async _addForm() {
    this.spinner.show();

    const coNTipo = this.formGroup.get('coNTipo').value;
    const noVDependenciaAtf = this.formGroup.get('noVDependenciaAtf').value;

    const request: AgregarDependenciaAtfReq = {
      ...this.formGroup.value,
      coNTipo: coNTipo,
      coVUsCreacion: '45259009',
    };

    const response: AgregarDependenciaAtfRes = await this.service.agregarDependenciaAtf(request);

    if (response.PO_V_ERR_COD == '0') {
      this.onOpenModalNotificationSuccess2('success', 'Dependencia de ATF registrada',
        `El registro de la nueva dependencia <strong>"${noVDependenciaAtf}"</strong> se realizó de forma exitosa`
      );

      this.refModal.onClose
        .pipe(finalize(() => { this.spinner.hide(); }))
        .subscribe({
          next: (resp) => {
            if (resp === 'confirm') {
              this.onCloseModalForm();
              this.buscarDependenciaATFFormFiltro();
            }
          },
          error: (err) => {
            console.error('Error al agregar registro.', err);
            throw new Error('Error al agregar registro');
          },
        });
    } else {
      this.messageService.add({ severity: 'error', summary: '', detail: response.PO_V_ERR_MSG });
    }

    this.spinner.hide();
  }

  protected async updFormBtn() {
    const coNTipo = this.formGroup.get('coNTipo').value;

    if (this.formGroup.valid && coNTipo) {
      this.confirmarActualizarRegistro('question');
      this.refModal.onClose.subscribe({
        next: (resp) => {
          if (resp === 'confirm') {
            this._updateForm();
          }
        },
      });
    } else {
      this.messageService.add({ severity: 'warn', summary: '', detail: 'Campos sin completar o inválidos' });
      this.marcarCamposComoTocados(this.formGroup);
    }
  }

  protected async openModalUpdateForm() {
    this.isVisibleModalNewForm = true;
    this.isEditForm = true;

    await this.listarTipoATFAndSelectIML();

    //this.listarDepartamentoATFPorRegionAndSelected(this.dependenciaAtfTRowSelected.coNRegion)
    this.departamentoATFLst = await this.listarDepartamentoATFPorRegion_Async(
      this.dependenciaAtfTRowSelected.coNRegion
    );
    this.objForm = { ...this.dependenciaAtfTRowSelected };
    this.setDataForm(this.objForm);
    this.formGroup.get('coNTipo').disable();
  }

  private confirmarAgregarRegistro(icon: string): void {
    const noVDependenciaAtf = this.formGroup.get('noVDependenciaAtf').value;

    this.refModal = this.dialogService.open(AlertModalComponent, {
      width: '750px',
      showHeader: false,
      data: {
        icon: icon,
        title: 'Registrar nueva dependia de ATF',
        confirm: true,
        description:
          `A continuación, se procederá a registrar los datos <strong> de la dependencia de IML "${noVDependenciaAtf}". </strong>
           ¿Esta seguro de realizar esta acción?`,
        confirmButtonText: 'Aceptar',
      },
    });
  }

  private confirmarActualizarRegistro(icon: string): void {
    const noVDependenciaAtf = this.formGroup.get('noVDependenciaAtf').value;

    this.refModal = this.dialogService.open(AlertModalComponent, {
      width: '750px',
      showHeader: false,
      data: {
        icon: icon,
        title: 'Editar datos de la dependencia de ATF',
        confirm: true,
        description:
          `A continuación, se procederá a modificar los datos de la <strong> dependencia de IML "${noVDependenciaAtf}". </strong> ¿Esta seguro de realizar esta acción?`,
        confirmButtonText: 'Aceptar',
      },
    });
  }

  private confirmarEliminacionRegistro(icon: string): void {
    this.refModal = this.dialogService.open(AlertModalComponent, {
      width: '750px',
      showHeader: false,
      data: {
        icon: icon,
        title: 'Eliminar dependencia de ATF',
        confirm: true,
        description:
          `A continuación, se procederá a eliminar la <strong> dependencia de IML "${this.dependenciaAtfTRowSelected.noVDependenciaAtf}" </strong> ¿Esta seguro de realizar esta acción?`,
        confirmButtonText: 'Aceptar',
      },
    });
  }

  private openModalDeleteForm() {
    this.confirmarEliminacionRegistro('question');

    this.refModal.onClose.subscribe({
      next: (resp) => {
        if (resp === 'confirm') {
          this._deleteForm();
        }
      },
    });
  }

  private async _updateForm() {
    this.spinner.show();

    const coNTipo = this.formGroup.get('coNTipo').value;
    const noVDependenciaAtf = this.formGroup.get('noVDependenciaAtf').value;

    const request: ActualizarDependenciaAtfReq = {
      ...this.formGroup.value,
      coNTipo: coNTipo,
      coVUsModificacion: '45259009',
    };

    const response: ActualizarDependenciaAtfRe = await this.service.actualizarDependenciaAtf(request);

    if (response.PO_V_ERR_COD == '0') {
      this.onOpenModalNotificationSuccess2('success', 'Dependencia ATF editada',
        `La actualización de los datos de la dependencia de IML <strong>"${noVDependenciaAtf}"</strong> se realizó de forma exitosa.`
      );

      this.refModal.onClose
        .pipe(finalize(() => { this.spinner.hide(); }))
        .subscribe({
          next: (resp) => {
            if (resp === 'confirm') {
              this.onCloseModalForm();
              this.buscarDependenciaATFFormFiltro();
            }
          },
          error: (err) => {
            console.error('Error al actualizar registro.', err);
            throw new Error('Error al actualizar registro');
          },
        });
    } else {
      this.messageService.add({ severity: 'error', summary: '', detail: response.PO_V_ERR_MSG });
    }

    this.spinner.hide();
  }

  private async _deleteForm() {
    this.spinner.show();

    const request: EliminarDependenciaAtfReq = {
      coNDependencia: this.dependenciaAtfTRowSelected.coNDependencia,
      coVUsModificacion: '45259009',
      coVUsDesactivacion: '45259009',
    };

    const response: EliminarDependenciaAtfRes = await this.service.eliminarDependenciaAtf(request);

    if (response.PO_V_ERR_COD == '0') {
      this.onOpenModalNotificationSuccess2('success', 'Dependencia de ATF eliminada',
        `La elimininación de la dependencia de IML <strong>" ${this.dependenciaAtfTRowSelected.noVDependenciaAtf}" </strong> se realizó de forma exitosa.`
      );

      this.refModal.onClose
        .pipe(finalize(() => { this.spinner.hide(); }))
        .subscribe({
          next: (resp) => {
            if (resp === 'confirm') {
              this.onCloseModalForm();
              this.buscarDependenciaATFFormFiltro();
            }
          },
          error: (err) => {
            throw new Error('Error al eliminar registro');
          },
        });
    } else {
      this.messageService.add({ severity: 'error', summary: '', detail: response.PO_V_ERR_MSG });
    }

    this.spinner.hide();
  }

  // ahora tambien tenemos para warning y error usando onOpenModalNotification2
  private onOpenModalNotificationSuccess2(icon: string, title: string, description: string) {
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

  protected onChangeRegionFilter(coNRegion: number) {

    this.listarDepartamentoATFPorRegion_Async(coNRegion).then(() => {

      this.buscarDependenciaATFFormFiltro();
    });

    this.formFiltroBuscar.get('coNDepartamento').enable();
  }

  protected onChangeDepartmentFilter(coNDepartamento: number) {
    this.buscarDependenciaATFFormFiltro();
  }

  //selecciona el único Tipo ATF, en este caso IML. Porque se supone que en servidor enviará sólo 1 correspondiente a IML
  //en caso envíe dos, se selecciona al primero de la lista
  private seleccionarPrimerItemTipoATF() {
    if (this.tipoATFLst.length > 0) {
      const primeraOpcion = this.tipoATFLst[0];
      //solo aplicable al fomulario de add y upd, mas no al formulario de filtro
      this.formGroup.get('coNTipo').setValue(primeraOpcion.coNTipo);
    }
  }

  protected onChangeRegionFormNewEdit(coNRegion: number) {
    this.listarDepartamentoATFPorRegion_Async(coNRegion);
  }
}
