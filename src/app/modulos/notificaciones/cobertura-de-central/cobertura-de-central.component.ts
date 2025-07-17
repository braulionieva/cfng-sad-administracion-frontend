import { CommonModule } from "@angular/common";
import { Component, OnInit, inject } from "@angular/core";
import { FormsModule, ReactiveFormsModule, FormGroup, FormArray, FormControl, FormBuilder, AbstractControl } from "@angular/forms";
import { ModalMensajeComponent } from "@modulos/maestros/categorias/modals/modal-mensaje/modal-mensaje.component";
import { CoberturaCentralesService } from "@services/cobertura-centrales/cobertura-centrales.service";
import { TableLazyLoadEvent } from 'primeng/table';
import { ButtonModule } from "primeng/button";
import { CheckboxModule } from "primeng/checkbox";
import { DropdownModule } from "primeng/dropdown";
import { DialogService } from "primeng/dynamicdialog";
import { InputTextModule } from "primeng/inputtext";
import { TableModule } from "primeng/table";
import { debounceTime } from "rxjs";

@Component({
  selector: 'app-cobertura-de-central',
  standalone: true,
  imports: [
    CommonModule,
    DropdownModule,
    InputTextModule,
    TableModule,
    CheckboxModule,
    FormsModule,
    ReactiveFormsModule,
    ButtonModule,
  ],
  providers: [DialogService],
  templateUrl: './cobertura-de-central.component.html',
  styleUrls: ['./cobertura-de-central.component.scss'],
})
export class CoberturaDeCentralComponent implements OnInit {
  public formCobertura: FormGroup;
  public formFiscalia: FormGroup;

  distritosTableData: any = [];
  fiscaliasTableData: any = [];

  distritosFormArray: FormArray;
  fiscaliasFormArray: FormArray;

  // cobertura
  departamentosDropdown: any = [];
  provinciasDropdown: any = [];
  centralesCoberturaDropdown: any = [];

  public filasPorPagina: number = 10;
  totalRegistrosGeografico: number = 0;
  totalRegistrosFiscalia: number = 0;

  formCoberturaObj = {
    departamento: new FormControl<any>(null),
    provincia: new FormControl<any>(null),
  };

  //fiscalia
  distritosFiscalesDropdown: any = [];
  sedesDropdown: any = [];
  centralesFiscaliaDropdown: any = [];

  previousRequestListaFiscalias = {};

  formFiscaliaObj = {
    distritoFiscal: new FormControl<any>(null),
    sede: new FormControl<any>(null),
    codigo: new FormControl<any>(''),
    nombre: new FormControl<any>(''),
  };

  private readonly dialogService: DialogService = inject(DialogService);
  private readonly coberturaCentralesService: CoberturaCentralesService =
    inject(CoberturaCentralesService);

  constructor(private readonly formBuilder: FormBuilder) {
    this.formCobertura = new FormGroup(this.formCoberturaObj);
    this.formFiscalia = new FormGroup(this.formFiscaliaObj);
  }

  ngOnInit(): void {
    this.getListaDepartamentos();
    this.getListaCentrales();
    this.getListaDistritosFiscales();

    this.codigoField?.disable();
    this.nombreField?.disable();

    this.distritoFiscalField?.valueChanges.subscribe((value) => {
      if (value) {
        this.codigoField?.enable();
        this.nombreField?.enable();
      } else {
        this.codigoField?.disable();
        this.nombreField?.disable();
      }
    });

    this.formFiscalia.valueChanges.pipe(debounceTime(300)).subscribe(() => {
      this.previousRequestListaFiscalias = {};
      this.getFiscaliasNotificacionFiscalia(1, this.filasPorPagina);
    });
  }

  getListaDepartamentos() {
    this.coberturaCentralesService.getListaDepartamentos().subscribe({
      next: (response) => {
        this.departamentosDropdown = response
          .map((departamento) => ({
            name: departamento.departamento,
            value: departamento.codigoReniec,
          }))
          .sort((a, b) => a.name.localeCompare(b.name));
      },
      error: (err) => {
        console.error('Error en la operacion: ', err);
      },
    });
  }

  getListaProvincias(codigoDeptoReniec: any) {
    this.coberturaCentralesService.getListaProvincias(codigoDeptoReniec).subscribe({
      next: (response) => {
        this.provinciasDropdown = response
          .map((provincia) => ({
            ...provincia,
            name: provincia.provincia,
            value: provincia.codigoProvReniec,
          }))
          .sort((a, b) => a.name.localeCompare(b.name));
      },
      error: (err) => {
        console.error('Error en la operacion: ', err);
      },
    });
  }

  getListaDistritosFiscales() {
    this.coberturaCentralesService.getListaDistritosFiscales().subscribe({
      next: (response) => {
        this.distritosFiscalesDropdown = response
          .map((distrito) => ({
            name: distrito.distritoFiscal,
            value: distrito.idDistritoFiscal,
          }))
          .sort((a, b) => a.name.localeCompare(b.name));
      },
      error: (err) => {
        console.error('Error en la operacion: ', err);
      },
    });
  }

  getListaSedes(idDistritoFiscal) {
    this.coberturaCentralesService.getListaSedes(idDistritoFiscal).subscribe({
      next: (response) => {
        this.sedesDropdown = response
          .map((sede) => ({
            name: sede.sede,
            value: sede.idSede,
          }))
          .sort((a, b) => a.name.localeCompare(b.name));
      },
      error: (err) => {
        console.error('Error en la operacion: ', err);
      },
    });
  }

  getListaCentrales() {
    this.coberturaCentralesService.getListaCentrales().subscribe({
      next: (response) => {
        if (!response.data) return;

        // Para cobertura
        this.centralesCoberturaDropdown = response.data
          .map((central) => ({
            name: central.nombre,
            value: central.codigo,
          }))
          .sort((a, b) => a.name.localeCompare(b.name));

        this.centralesFiscaliaDropdown = response.data
          .map((central) => ({
            name: central.nombre,
            value: central.codigo,
          }))
          .sort((a, b) => a.name.localeCompare(b.name));
      },
      error: (err) => {
        console.error('Error en la operacion: ', err);
      },
    });
  }

  loadDistritos(event: TableLazyLoadEvent) {
    const pagina = event.first / event.rows + 1; // Calcula el número de página
    const registrosPorPagina = event.rows; // Tamaño de página

    const codigoDeptoReniec = this.departamentoField.value;
    const codigoProvReniec = this.provinciaField.value;

    if (codigoDeptoReniec && codigoProvReniec) {
      this.getDistritosCobertura(
        codigoDeptoReniec,
        codigoProvReniec,
        pagina,
        registrosPorPagina
      );
    }
  }

  getDistritosCobertura(codigoDeptoReniec, codigoProvReniec, pagina = 1, registrosPorPagina = this.filasPorPagina) {
    const datosSolicitud = {
      codigoDeptoReniec,
      codigoProvReniec,
      pagina,
      registrosPorPagina,
    };

    this.coberturaCentralesService.getDistritos(datosSolicitud).subscribe({
      next: (response) => {
        this.distritosTableData = response.registros
          .sort((a, b) => a.distrito.localeCompare(b.distrito));

        this.totalRegistrosGeografico = response.totalElementos;

        if (this.distritosTableData?.length <= 0) return;

        this.distritosFormArray = this.formBuilder.array(
          this.distritosTableData.map((distrito) => this.buildDistritoFormGroup(distrito))
        );
      },
      error: (err) => {
        console.error('Error en la operacion: ', err);
      },
    });
  }

  loadFiscalias(event: TableLazyLoadEvent) {
    const pagina = event.first / event.rows + 1; // Calcula el número de página
    const registrosPorPagina = event.rows; // Tamaño de página

    if (this.distritoFiscalField.value) {
      this.getFiscaliasNotificacionFiscalia(pagina, registrosPorPagina);
    }
  }

  getFiscaliasNotificacionFiscalia(
    pagina: number = 1,
    registrosPorPagina: number = this.filasPorPagina
  ) {
    if (!this.distritoFiscalField.value) return;
    const requestData = {
      idDistritoFiscal: this.distritoFiscalField?.value
        ? Number(this.distritoFiscalField?.value)
        : '',
      codigoSede: this.sedeField?.value ? this.sedeField?.value : '',
      codigoEntidad: this.codigoField?.value,
      nombreEntidad: this.nombreField?.value,
      pagina: pagina,
      registrosPorPagina: registrosPorPagina,
    };
    function compareObjs(request, previousRequest) {
      return JSON.stringify(request) === JSON.stringify(previousRequest);
    }
    if (compareObjs(requestData, this.previousRequestListaFiscalias)) return;

    this.coberturaCentralesService.getFiscalias(requestData).subscribe({
      next: (response) => {
        this.fiscaliasTableData = response.registros
          .sort((a, b) => a.nombreEntidad.localeCompare(b.nombreEntidad));

        this.totalRegistrosFiscalia = response.totalElementos;
        this.previousRequestListaFiscalias = requestData;
        this.fiscaliasFormArray = this.formBuilder.array(
          this.fiscaliasTableData.map((fiscalia) => this.buildFiscaliaFormGroup(fiscalia))
        );
      },
      error: (err) => {
        console.error('Error en la operacion: ', err);
      },
    });
  }

  buildDistritoFormGroup(distritoData: any): FormGroup {
    return this.formBuilder.group({
      distrito: new FormControl(distritoData.distrito),
      idCentralInei: distritoData.idCentralInei,
      idCentralReniec: distritoData.idCentralReniec,

      estado: new FormControl(distritoData.estado === '0'),
      idUbigeo: new FormControl<number>(distritoData.idUbigeo),
      idCentral: new FormControl(distritoData.idCentral),
      idCentralCobertura: new FormControl(distritoData.idCentralCobertura),
      flagInei: new FormControl(distritoData.flagInei),
      flagReniec: new FormControl(distritoData.flagReniec),
    });
  }

  buildFiscaliaFormGroup(fiscaliaData: any): FormGroup {
    return this.formBuilder.group({
      nombreEntidad: new FormControl(fiscaliaData.nombreEntidad),
      idDependenciaCentral: new FormControl(fiscaliaData.idDependenciaCentral),
      idCentralDependencia: new FormControl(fiscaliaData.idCentralDependencia),
      idDistritoFiscalEntidad: new FormControl(
        fiscaliaData.idDistritoFiscalEntidad
      ),
      codigoEntidad: new FormControl(fiscaliaData.codigoEntidad),
      idTipoEntidad: new FormControl(fiscaliaData.idTipoEntidad),
      estado: new FormControl(fiscaliaData.estado),
    });
  }

  //refactorizado
  asignarCentralCoberturas(index: number, centralFlag?: string): void {
    if (!this.departamentoField.value && !this.provinciaField.value) return;

    const distritoFormGroup = this.obtenerDistritoFormGroup(index);
    if (!distritoFormGroup) return;

    const { nombreCentralSeleccionada } = this.obtenerCentralSeleccionada(
      centralFlag,
      distritoFormGroup.value
    );

    const requestData = this.crearRequestData(
      distritoFormGroup.value,
      centralFlag
    );

    this.coberturaCentralesService
      .asignarCentralCoberturas(requestData)
      .subscribe({
        next: () =>
          this.procesarRespuestaExitosa(
            requestData,
            centralFlag,
            nombreCentralSeleccionada
          ),
        error: (err) => console.error(err),
      });
  }

  private obtenerDistritoFormGroup(index: number): FormGroup | null {
    return this.distritosFormArray.at(index) as FormGroup;
  }

  private obtenerCentralSeleccionada(
    centralFlag: string | undefined,
    distritoFiltrado: any
  ): { idCentralSeleccionada: string; nombreCentralSeleccionada: string } {
    let idCentralSeleccionada = '';
    let nombreCentralSeleccionada = 'Sin central seleccionada';

    if (centralFlag === 'inei') {
      idCentralSeleccionada = distritoFiltrado.idCentralInei;
      nombreCentralSeleccionada = this.buscarNombreCentral(
        idCentralSeleccionada
      );
    } else if (centralFlag === 'reniec') {
      idCentralSeleccionada = distritoFiltrado.idCentralReniec;
      nombreCentralSeleccionada = this.buscarNombreCentral(
        idCentralSeleccionada
      );
    }

    return { idCentralSeleccionada, nombreCentralSeleccionada };
  }

  private buscarNombreCentral(idCentral: string): string {
    return (
      this.centralesCoberturaDropdown.find(
        (central) => central.value === idCentral
      )?.name || 'Sin central seleccionada'
    );
  }

  private crearRequestData(distritoFiltrado: any, centralFlag?: string): any {
    return {
      idUbigeo: distritoFiltrado.idUbigeo || null,
      nombreDistrito: distritoFiltrado.distrito || null,
      idCentralReniec: distritoFiltrado.idCentralReniec || '',
      idCentralInei: distritoFiltrado.idCentralInei || '',
      idCentralCobertura: distritoFiltrado.idCentralCobertura || '',
      flagInei:
        centralFlag === 'inei' || distritoFiltrado.idCentralInei ? '1' : '0',
      flagReniec:
        centralFlag === 'reniec' || distritoFiltrado.idCentralReniec
          ? '1'
          : '0',
      usuarioCreacion: '40123366',
      estado: distritoFiltrado.estado ? '0' : '1',
    };
  }

  private procesarRespuestaExitosa(
    requestData: any,
    centralFlag?: string,
    nombreCentralSeleccionada?: string
  ): void {
    this.getDistritosCobertura(
      this.departamentoField.value,
      this.provinciaField.value
    );
    if (centralFlag) {
      this.openModalSuccess(
        'geografica',
        requestData.nombreDistrito,
        centralFlag,
        nombreCentralSeleccionada
      );
    }
  }

  asignarCentralFiscalias(index: number) {
    if (!this.distritoFiscalField.value) return;

    // Obteniendo los datos de la fila
    const fiscaliaFormGroup = this.fiscaliasFormArray.at(index) as FormGroup;
    const fiscaliaFiltrada = fiscaliaFormGroup.value;

    if (!fiscaliaFiltrada) return;

    const idDependenciaCentral = fiscaliaFiltrada.idDependenciaCentral;

    // Obtener el nombre de la central seleccionada para fiscalía
    const nombreCentralSeleccionada =
      this.centralesFiscaliaDropdown.find(
        (central) => central.value === idDependenciaCentral
      )?.name || 'Sin central seleccionada';

    // Armando la request para enviar al servicio
    const requestData = {
      idCentralDependencia: fiscaliaFiltrada.idCentralDependencia
        ? fiscaliaFiltrada.idCentralDependencia
        : null,
      idDistritoFiscal: fiscaliaFiltrada.idDistritoFiscalEntidad
        ? fiscaliaFiltrada.idDistritoFiscalEntidad
        : null,
      nombreFiscalia: fiscaliaFiltrada.nombreEntidad
        ? fiscaliaFiltrada.nombreEntidad
        : null,
      codigoEntidad: fiscaliaFiltrada.codigoEntidad
        ? fiscaliaFiltrada.codigoEntidad
        : '',
      idTipoEntidad: fiscaliaFiltrada.idTipoEntidad
        ? fiscaliaFiltrada.idTipoEntidad
        : null,
      idDependenciaCentral: fiscaliaFiltrada.idDependenciaCentral
        ? fiscaliaFiltrada.idDependenciaCentral
        : null,
      estado: '1',
      usuarioCreacion: '40123366',
    };

    this.coberturaCentralesService
      .asignarCentralFiscalias(requestData)
      .subscribe({
        next: () => {
          this.getFiscaliasNotificacionFiscalia();
          this.openModalSuccess(
            'fiscalia',
            requestData.nombreFiscalia,
            null,
            nombreCentralSeleccionada
          );
        },
        error: (err) => {
          console.error('Error en la operacion: ', err);
        },
      });
  }

  //refactorizado
  private openModalSuccess(
    setAction: 'geografica' | 'fiscalia',
    distrito: string,
    centralFlag?: string,
    nombreCentralSeleccionada?: string
  ): void {
    let title: string;
    let subTitle: string;

    if (setAction === 'geografica') {
      title = 'Central de notificaciones de distrito registrada';
      subTitle = `El registro de la Central de Notificaciones para el Distrito Geográfico de <strong>${distrito}</strong> se realizó de forma exitosa. Su Central para el ubigeo <strong>${centralFlag?.toUpperCase()}</strong> es <strong>${nombreCentralSeleccionada}</strong>`;
    } else if (setAction === 'fiscalia') {
      title = 'Central de notificaciones de fiscalía editada';
      subTitle = `La actualización de la Central de Notificaciones  para la <strong>${distrito}</strong> se realizó de forma exitosa. Su Central asignada es <strong>${nombreCentralSeleccionada}</strong>.`;
    }

    this.dialogService.open(ModalMensajeComponent, {
      width: '596px',
      contentStyle: { overflow: 'auto' },
      closable: false,
      showHeader: false,
      data: {
        icon: 'success',
        title: title,
        subTitle: subTitle,
        textButton: 'Listo',
      },
    });
  }

  handleSelectDepartamento(departamento) {
    this.clearDistritosCoberturaData(); // reset
    this.provinciaField.reset();
    this.getListaProvincias(departamento.value);
  }

  handleSelectProvincia(provincia) {
    this.clearDistritosCoberturaData(); // Reiniciar datos

    if (this.departamentoField.value) {
      const codigoDeptoReniec = this.departamentoField.value;
      const codigoProvReniec = provincia.value;
      const pagina = 1;
      const registrosPorPagina = this.filasPorPagina;

      this.getDistritosCobertura(
        codigoDeptoReniec,
        codigoProvReniec,
        pagina,
        registrosPorPagina
      );
    }
  }

  handleSelectDistritoFiscal(distritoFiscal) {
    this.clearFiscaliasNotiFiscaliaData(); // reset
    this.sedeField.reset();
    this.getListaSedes(distritoFiscal.value);
    if (this.distritoFiscalField.value) {
      this.getFiscaliasNotificacionFiscalia(1, this.filasPorPagina);
    }
  }

  handleSelectSede(sede) {
    this.clearFiscaliasNotiFiscaliaData(); // reset
    if (this.distritoFiscalField.value) {
      this.getFiscaliasNotificacionFiscalia(1, this.filasPorPagina);
    }
  }

  clearDistritosCoberturaData() {
    this.distritosTableData = [];
  }

  clearFiscaliasNotiFiscaliaData() {
    this.fiscaliasTableData = [];
  }

  clearFiltros(central) {
    if (central === 'cobertura') {
      this.clearDistritosCoberturaData();
      this.provinciasDropdown = [];
      this.formCobertura.reset();
    }
    if (central === 'fiscalia') {
      this.clearFiscaliasNotiFiscaliaData();
      this.sedesDropdown = [];
      this.formFiscalia.reset();
    }
  }

  get departamentoField(): AbstractControl {
    return this.formCobertura.get('departamento');
  }
  get provinciaField(): AbstractControl {
    return this.formCobertura.get('provincia');
  }

  get distritoFiscalField(): AbstractControl {
    return this.formFiscalia.get('distritoFiscal');
  }
  get sedeField(): AbstractControl {
    return this.formFiscalia.get('sede');
  }
  get codigoField(): AbstractControl {
    return this.formFiscalia.get('codigo');
  }
  get nombreField(): AbstractControl {
    return this.formFiscalia.get('nombre');
  }
}
