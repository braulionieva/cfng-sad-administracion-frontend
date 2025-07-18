import { DialogModule } from 'primeng/dialog';
import { Component, ElementRef, EventEmitter, Output, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from "primeng/button";
import { CalendarModule } from "primeng/calendar";
import { CardModule } from "primeng/card";
import { CheckboxModule } from "primeng/checkbox";
import { DropdownModule } from "primeng/dropdown";
import { InputMaskModule } from "primeng/inputmask";
import { InputTextModule } from "primeng/inputtext";
import { SelectButtonModule } from "primeng/selectbutton";
import { RippleModule } from "primeng/ripple";
import { InputTextarea } from "primeng/inputtextarea";
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from "@angular/forms";
import { RadioButtonModule } from "primeng/radiobutton";
import { MessagesModule } from 'primeng/messages';
import { Message } from 'primeng/message';
import { MaestroService } from '@services/maestro/maestro.service';
import { Subscription } from 'rxjs';
import { TableModule } from 'primeng/table';
import { TurnoService } from '@services/turno/turno.service';
import { DialogService, DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { CmpLibModule } from 'ngx-mpfn-dev-cmp-lib';
import { obtenerIcono } from '@utils/icon';
import { AlertModalComponent } from '@components/alert-modal/alert-modal.component';
import { formatDateSimple, formatTime, getDate } from '@utils/utils';
import { horaAmPm } from '@utils/date';

@Component({
  selector: 'app-editar-turno',
  standalone: true,
  imports: [
    CommonModule,
    ButtonModule,
    CalendarModule,
    CardModule,
    CheckboxModule,
    DropdownModule,
    InputMaskModule,
    InputTextModule,
    SelectButtonModule,
    RippleModule,
    InputTextarea,
    TableModule,
    FormsModule,
    RadioButtonModule,
    ReactiveFormsModule,
    DialogModule,
    MessagesModule,
    CmpLibModule
  ],
  templateUrl: './editar-turno.component.html',
  styleUrls: ['./editar-turno.component.scss']
})
export class EditarTurnoComponent {
  @ViewChild('calendar') calendar!: ElementRef;
  @Output() filter = new EventEmitter();

  public distritosFiscalesList = [];
  public dependenciasFiscalesList = [];
  turnoDependenciaList = [];
  despachosList: any[] = [];
  despachoTurnoList = [];
  turnoDespachoLast: any;

  turnoSelect: any;
  dependenciaActual: any;
  descripcionDespacho: any;
  requestUpdate: any = null;

  infoMessage: Message[];
  fechaMinima: any = null;
  error: any;
  public validacion: any;
  editar: boolean = false;

  erroresFechas: boolean = true;
  messaggeFecha: any[] = [
    {
      mensaje: 'Tener en cuenta que solo se permite registrar el turno fiscal desde la fecha actual o una fecha futura.',
      mostrar: true,
      type: 'info'
    },
    {
      mensaje: 'Por favor complete la fecha y hora de inicio y de fin para el despacho.',
      mostrar: false,
      type: 'error'
    },
    {
      mensaje: 'Tener en cuenta, que si existe uno o más despachos con la mima configuración de fecha y hora de turno. Por favor, revisar estos datos y asignar un turno diferente para cada despacho.',
      mostrar: false,
      type: 'error'
    },
    {
      mensaje: 'Tener en cuenta, que si existe uno o más despachos con la mima configuración de fecha y hora de turno, en otra dependencia del mismo Distrito Fiscal.',
      mostrar: false,
      type: 'info'
    },
    {
      mensaje: 'Tener en cuenta, que existe uno o más despachos con la misma configuración de fecha y hora de turno para esta dependencia. Por favor, revisar estos datos y asignar un turno diferente para cada despacho.',
      mostrar: false,
      type: 'error'
    },
  ];

  public formularioNuevoTurno: FormGroup;
  public refModal: DynamicDialogRef;
  public subscriptions: Subscription[] = [];

  txtConsecutivo: string = '';
  esConsecutivo: boolean = false;

  stateOptions: any[] = [
    { label: 'AM', value: 'AM' },
    { label: 'PM', value: 'PM' }
  ];

  minTime: Date;
  maxTime: Date;
  public obtenerIcono = obtenerIcono;

  // >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
  // Propiedades para control de cambios en el formulario
  private initialFormValue: string = '';   // aquí guardaremos el estado inicial en formato JSON
  public isFormChanged: boolean = false;   // indicará si hubo cambios reales
  // <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<

  constructor(
    private readonly formBuilder: FormBuilder,
    private readonly maestrosService: MaestroService,
    private readonly dialogService: DialogService,
    private readonly turnoService: TurnoService,
    public config: DynamicDialogConfig,
    public ref: DynamicDialogRef
  ) {

    this.turnoSelect = this.config?.data.turnoSelected;
    this.editar = this.config?.data.editar;

    this.formularioNuevoTurno = this.formBuilder.group({
      distritoFiscal: [null],
      dependencia: [null],
      despacho: [null],
      turnos: [null],
      ampmIni: ['AM'],
      ampmFin: ['AM'],
      fechaInicio: [null],
      fechaFin: [null],
      horaInicio: [null],
      horaFin: [null],
      validoInicio: [null],
      validoFin: [null],
      validado: [null]
    });
  }

  ngOnInit(): void {
    this.infoMessage = [
      {
        severity: 'warn',
        summary: 'Nota:',
        detail:
          'Tener en cuenta que solo se permite registrar el turno fiscal desde la fecha actual o una fecha futura.',
      },
    ];
    this.loadDistritosFiscales();

    if (this.editar) {
      const { dateOnly: fechaInicioDate, timeOnly: horaInicioDate, ampm: ampmIni }
      = this.fromDbStringToDateTimeAmPm(this.turnoSelect.fechaInicio);

      const { dateOnly: fechaFinDate, timeOnly: horaFinDate, ampm: ampmFin }
      = this.fromDbStringToDateTimeAmPm(this.turnoSelect.fechaFin);

    this.formularioNuevoTurno.get('fechaInicio')?.setValue(fechaInicioDate);
    this.formularioNuevoTurno.get('fechaFin')?.setValue(fechaFinDate);

    this.formularioNuevoTurno.get('horaInicio')?.setValue(horaInicioDate);
    this.formularioNuevoTurno.get('horaFin')?.setValue(horaFinDate);

    this.formularioNuevoTurno.get('ampmIni')?.setValue(ampmIni);
    this.formularioNuevoTurno.get('ampmFin')?.setValue(ampmFin);

    this.formularioNuevoTurno.get('distritoFiscal')?.disable();
    this.formularioNuevoTurno.get('dependencia')?.disable();
    this.formularioNuevoTurno.get('despacho')?.disable();
    }
    this.fechaMinima = new Date();

    this.minTime = new Date();
    this.minTime.setHours(0, 0, 0);

    this.maxTime = new Date();
    this.maxTime.setHours(12, 59, 0);

    setTimeout(() => {
      const rawInitial = this.formularioNuevoTurno.getRawValue();

      if (rawInitial.fechaInicio instanceof Date) {
        rawInitial.fechaInicio = this.toSimpleDateString(rawInitial.fechaInicio);
      }
      if (rawInitial.fechaFin instanceof Date) {
        rawInitial.fechaFin = this.toSimpleDateString(rawInitial.fechaFin);
      }
      if (rawInitial.horaInicio instanceof Date) {
        rawInitial.horaInicio = this.toTimeString(rawInitial.horaInicio);
      }
      if (rawInitial.horaFin instanceof Date) {
        rawInitial.horaFin = this.toTimeString(rawInitial.horaFin);
      }

      this.initialFormValue = JSON.stringify(rawInitial);

      this.subscribeToFormChanges();
    }, 0);
  }

  private subscribeToFormChanges(): void {
    this.formularioNuevoTurno.valueChanges.subscribe(() => {
      const rawValues = this.formularioNuevoTurno.getRawValue();

      if (rawValues.fechaInicio instanceof Date) {
        rawValues.fechaInicio = this.toSimpleDateString(rawValues.fechaInicio);
      }
      if (rawValues.fechaFin instanceof Date) {
        rawValues.fechaFin = this.toSimpleDateString(rawValues.fechaFin);
      }
      if (rawValues.horaInicio instanceof Date) {
        rawValues.horaInicio = this.toTimeString(rawValues.horaInicio);
      }
      if (rawValues.horaFin instanceof Date) {
        rawValues.horaFin = this.toTimeString(rawValues.horaFin);
      }

      const currentValue = JSON.stringify(rawValues);

      this.isFormChanged = (currentValue !== this.initialFormValue);
    });
  }

  private toSimpleDateString(date: Date): string {
    const year = date.getFullYear();
    const month = ('0' + (date.getMonth() + 1)).slice(-2);
    const day = ('0' + date.getDate()).slice(-2);
    return `${day}/${month}/${year}`;
  }

  private toTimeString(date: Date): string {
    const hours = ('0' + date.getHours()).slice(-2);
    const minutes = ('0' + date.getMinutes()).slice(-2);
    return `${hours}:${minutes}`;
  }

  // Getter que combina la lógica de validación previa (turnoDespachoValido)
  // con la verificación de cambios reales en el formulario (isFormChanged).
  // De esta manera, si se edita => solo habilita si hay al menos un cambio.
  get canSave(): boolean {
    if (this.editar) {
      // Debe cumplir la validación general (turnoDespachoValido) y tener cambios
      return this.turnoDespachoValido && this.isFormChanged;
    } else {
      // En modo crear, solo importa la validación general que ya tenías
      return this.turnoDespachoValido;
    }
  }

  evaluamin() {
    return false;
  }

  getMessage(id: number) {
    return this.messaggeFecha[id].mensaje;
  }

  input(item, $event, ini) {
    if (ini) item.horaInicio = $event;
  }

  setHoraInicio(item: any, $event: any) {
    item.horaInicio = $event;
    this.validarHorario(item);
  }

  setHoraFin(item: any, $event: any): boolean {
    item.horaFin = $event;
    this.validarHorario(item);
    return false;
  }

  setFechaInicio(item: any, $event: any) {
    item.fechaInicio = $event;
    if (this.despachoTurnoList.find((i) => i.dateInicio <= item.fechaInicio && i.dateFin >= item.fechaInicio))
      this.messaggeFecha[3].mostrar = true;
    else this.messaggeFecha[3].mostrar = false;

    this.validarHorario(item);
  }

  setFechaFin(item: any, $event: any) {
    item.fechaFin = $event;

    if (this.despachoTurnoList.find((i) => i.dateInicio <= item.fechaInicio && i.dateFin >= item.fechaInicio)) {
      this.messaggeFecha[3].mostrar = true;
    } else {
      this.messaggeFecha[3].mostrar = false;
    }

    this.validarHorario(item);
  }

  public validarFormatoHora(event: any): any {
    const code = event.which ? event.which : event.keyCode;
    if (code === 8) {
      return true;
    } else if (code >= 48 && code <= 58) {
      return true;
    } else {
      return false;
    }
  }

  getDate(fechaString: string): Date {
    return getDate(fechaString);
  }

  public close(): void {
    this.ref.close();
  }

  valorAMPM(event: any) {
    // This is intentional
  }

  loadturnoDependencia() {
    let tmpCodigo: any;

    if (this.editar) {
      tmpCodigo = this.turnoSelect?.codigoDependencia;
    } else {
      tmpCodigo = this.dependenciaActual.codigoDependencia;
    }

    this.turnoService.obtenerTurnosDependencia(tmpCodigo).subscribe({
      next: (response) => {
        this.turnoDependenciaList = response;
        this.createTurnoList(response.turnosDespacho);
      },
      error: (err) => {
        this.error = err;
        console.error('Error al eliminar el turno: ', err);
      },
    });
  }

  createTurnoList(lista: any) {
    this.despachoTurnoList = [];
    lista.forEach((l, idx) => {
      this.despachoTurnoList.push({
        idTurno: l.idTurno,
        codigoDependencia: l.codigoDependencial,
        codigoDespacho: l.codigoDespacho,
        dependencia: l.dependencia,
        despacho: l.despacho,
        distritoFiscal: l.distritoFiscal,
        fechaInicio: '',
        fechaFin: '',
        dateInicio: '',
        horaInicio: '',
        amInicio: '',
        dateFin: '',
        horaFin: '',
        amFin: '',
        validoInicio: false,
        validoFin: false,
        validado: false
      });
    });
  }

  loadDistritosFiscales() {
    this.subscriptions.push(
      this.maestrosService.listarDistritosFiscalesActivos().subscribe({
        next: (resp) => {
          this.distritosFiscalesList = resp;
        },
      })
    );
  }

  validarHorario(item: any): boolean {
    if (!item.fechaInicio || !item.horaInicio || !item.fechaFin || !item.horaFin) {
      item.validado = false;
      item.validadoInicio = !!(item.fechaInicio && item.horaInicio);
      item.validadoFin = !!(item.fechaFin && item.horaFin);
      return false;
    }
    const fechaHoraInicio = this.crearFechaCompleta(item.fechaInicio, item.horaInicio);
    const fechaHoraFin = this.crearFechaCompleta(item.fechaFin, item.horaFin);

    if (fechaHoraInicio <= fechaHoraFin) {
      item.validado = true;
      item.validadoInicio = true;
      item.validadoFin = true;
      return true;
    } else {
      item.validado = false;
      item.validadoInicio = true;
      item.validadoFin = true;
      return false;
    }
  }

  private crearFechaCompleta(fecha: Date, hora: Date): Date {
    const nuevaFecha = new Date(fecha.getTime());
    nuevaFecha.setHours(hora.getHours());
    nuevaFecha.setMinutes(hora.getMinutes());
    nuevaFecha.setSeconds(0);
    nuevaFecha.setMilliseconds(0);
    return nuevaFecha;
  }

  inputId() {
    // This is intentional
  }

  validarHorarioEdit(): boolean {
    let ini = this.formularioNuevoTurno.get('fechaInicio')?.value;
    let fin = this.formularioNuevoTurno.get('fechaFin')?.value;
    let hoy = new Date();
    if (ini < hoy) {
      if (fin > ini) {
        this.formularioNuevoTurno.get('validado').setValue(true);
        return true;
      }
    }
    this.formularioNuevoTurno.get('validado').setValue(false);
    return false;
  }

  renuevaDependencia(event: any) {
    let idDistritoFiscal = this.formularioNuevoTurno.get('distritoFiscal').value;

    this.subscriptions.push(
      this.turnoService.listarDependenciasPorDistrito(idDistritoFiscal).subscribe({
        next: (resp) => {
          this.dependenciasFiscalesList = resp.dependencias;
        },
      })
    );
  }

  renuevaDespacho(event: any) {
    let codigoDependencia = event.codigoDependencia;
    this.dependenciaActual = this.dependenciasFiscalesList.find(
      (f) => f.codigoDependencia == codigoDependencia
    );

    this.subscriptions.push(
      this.maestrosService.listarDespachoPorEntidad(codigoDependencia).subscribe({
        next: (resp) => {
          this.despachosList = resp;
          this.despachoTurnoList = [];
          this.loadturnoDependencia();
        },
      })
    );
  }

  async requestTurno(): Promise<void> {
    this.validarTodosLosDespachos();

    if (!this.turnoDespachoValido) {
      console.warn('Hay campos incompletos. No se puede grabar.');
      return;
    }

    let objOperacion: any;
    let request: any;
    let requestMasivo = [];

    if (this.editar) {
      request = this.buildRequestForEdit();
      objOperacion = this.buildObjOperacionForEdit();
      this.txtConsecutivo = '';
    } else {
      requestMasivo = this.buildRequestMasivo();
      objOperacion = this.buildObjOperacionForCreate(requestMasivo);
    }

    this.confirmaGuardar(objOperacion);
    this.handleOnClose(request, requestMasivo, objOperacion);
  }

  private validarTodosLosDespachos(): void {
    this.despachoTurnoList.forEach(dep => {
      this.validarHorario(dep);
    });
  }

  fromDbStringToDateTimeAmPm(dbString: string): {
    dateOnly: Date;
    timeOnly: Date;
    ampm: 'AM' | 'PM';
  } {
    const [datePart, timePartRaw] = dbString.split(' ');
    const timePart = timePartRaw.split('.')[0];

    const [yyyy, mm, dd] = datePart.split('-').map(Number);
    const [hh, min, ss] = timePart.split(':').map(Number);

    const dateOnly = new Date(yyyy, mm - 1, dd, 0, 0, 0);

    const timeOnly = new Date(0, 0, 0, hh, min, ss);

    let ampm: 'AM' | 'PM' = 'AM';
    if (hh >= 12) {
      ampm = 'PM';
    }

    return { dateOnly, timeOnly, ampm };
  }

  private buildRequestForEdit() {
    return {
      codigoDespacho: this.turnoSelect.codigoDespacho,
      fechaInicio: this.buildFechaInicio(),
      fechaFin: this.buildFechaFin(),
      usuario: '40291777',
    };
  }

  private buildObjOperacionForEdit() {
    return {
      despacho: this.turnoSelect.despacho,
      dependencia: this.turnoSelect.dependencia,
      fechaInicio: formatDateSimple(this.formularioNuevoTurno.get('fechaInicio')?.value),
      fechaFin: formatDateSimple(this.formularioNuevoTurno.get('fechaFin')?.value),
    };
  }

  private buildRequestMasivo() {
    return this.despachoTurnoList
      .filter((dt) => dt.validado)
      .map((dt) => ({
        codigoDespacho: dt.codigoDespacho,
        fechaInicio: formatDateSimple(dt.fechaInicio) + ' ' + formatTime(dt.horaInicio),
        fechaFin: formatDateSimple(dt.fechaFin) + ' ' + formatTime(dt.horaFin),
        usuario: '40291777',
      }));
  }

  private buildObjOperacionForCreate(requestMasivo) {
    const firstValidated = this.despachoTurnoList.find((dt) => dt.validado);
    if (firstValidated) {
      this.txtConsecutivo = `, este turno inicia el ${formatDateSimple(firstValidated.fechaInicio)} y finaliza el ${formatDateSimple(firstValidated.fechaFin)}.`;
      return {
        despacho: firstValidated.despacho?.toLowerCase(),
        dependencia: this.dependenciaActual?.dependencia?.toLowerCase(),
        fechaInicio: formatDateSimple(firstValidated.fechaInicio),
        fechaFin: formatDateSimple(firstValidated.fechaFin),
      };
    }
    return null;
  }

  private buildFechaInicio(): string {
    const fecha = this.formularioNuevoTurno.get('fechaInicio')?.value as Date;
    const hora = this.formularioNuevoTurno.get('horaInicio')?.value as Date;
    const ampm = this.formularioNuevoTurno.get('ampmIni')?.value; // "AM" o "PM"

    const date24h = this.combinarFechaHora(fecha, hora, ampm); // Conviertes a 24h
    return formatDateSimple(date24h) + ' ' + formatTime(date24h);
  }

  private buildFechaFin(): string {
    const fecha = this.formularioNuevoTurno.get('fechaFin')?.value as Date;
    const hora = this.formularioNuevoTurno.get('horaFin')?.value as Date;
    const ampm = this.formularioNuevoTurno.get('ampmFin')?.value; // "AM" o "PM"

    const date24h = this.combinarFechaHora(fecha, hora, ampm);
    return formatDateSimple(date24h) + ' ' + formatTime(date24h);
  }

  private combinarFechaHora(fecha: Date, hora: Date, ampm: string): Date {
    const result = new Date(fecha.getTime());

    let hours = hora.getHours();
    const minutes = hora.getMinutes();

    if (ampm === 'PM' && hours < 12) {
      hours += 12;
    } else if (ampm === 'AM' && hours === 12) {
      hours = 0;
    }

    result.setHours(hours);
    result.setMinutes(minutes);
    result.setSeconds(0);
    result.setMilliseconds(0);

    return result;
  }

  private handleOnClose(request: any, requestMasivo: any[], objOperacion: any) {
    this.refModal.onClose.subscribe({
      next: (resp) => {
        if (resp === 'confirm') {
          if (this.editar) {
            this.submitEditTurno(request, objOperacion);
          } else {
            this.submitMasivoTurno(requestMasivo, objOperacion);
          }
        }
      },
    });
  }

  private submitEditTurno(request: any, objOperacion: any) {
    this.turnoService.editarTurno(request).subscribe({
      next: () => this.informarRegistroExitoso(objOperacion),
      error: (error) => {
        console.error('error registro', error);
        return false;
      },
    });
  }

  private submitMasivoTurno(requestMasivo: any[], objOperacion: any) {
    requestMasivo.forEach((req) => {
      if (!this.registrarTurno(req, objOperacion)) {
        return false;
      }
      this.informarRegistroExitoso(objOperacion);
      return true;
    });
  }

  confirmaGuardar(objOperacion: any) {
    if (!this.turnoDespachoValido) {
      console.warn('Campos incompletos. No se abrirá el modal.');
      return;
    }

    this.refModal = this.dialogService.open(AlertModalComponent, {
      width: '600px',
      showHeader: false,
      data: {
        icon: 'question',
        title: 'REGISTRAR TURNO',
        confirm: true,
        confirmButtonText: 'Aceptar',
        description: `A continuación, se procederá a registrar un nuevo <b>Turno</b> para el (la) <b>${this.titleCase(
          objOperacion?.despacho
        )} del (de la) ${this.titleCase(
          objOperacion?.dependencia
        )}</b>${this.txtConsecutivo}.¿Está seguro de realizar esta acción?`,
      },
    });
  }

  async registrarTurno(request: any, objOperacion: any): Promise<boolean> {
    this.turnoService.agregarTurno(request).subscribe({
      next: (response) => {
        return true;
      },
      error: (error) => {
        return false;
      },
    });
    return false;
  }

  informarRegistroExitoso(objOperacion: any) {
    this.refModal = this.dialogService.open(AlertModalComponent, {
      width: '700px',
      showHeader: false,
      data: {
        icon: 'success',
        title: 'REGISTRO REALIZADO CORRECTAMENTE',
        description: `Se registró el <b>Turno</b> para el (la) <b>${this.titleCase(
          objOperacion?.despacho
        )}</b> del (de la) <b>
                              ${this.titleCase(
                                objOperacion?.dependencia
                              )}</b>${this.txtConsecutivo}, ha sido registrado correctamente`,
        confirmButtonText: 'Listo',
      },
    });
    this.refModal.onClose.subscribe((data: any) => {
      this.filter.emit();
      this.close();
    });
  }

  titleCase(texto: string): string {
    const newText = texto
      ?.split(' ')
      .map((l: string) => l.charAt(0).toUpperCase() + l.slice(1))
      .join(' ');
    return newText || '';
  }

  get diferentes() {
    // Antes tu lógica solo veía si las fechas eran diferentes.
    // Podrías mantenerlo si así lo deseas, pero ahora tenemos isFormChanged,
    // que es más completo y detecta TODO cambio en el formulario.
    if (
      this.turnoSelect.fechaInicio == this.formularioNuevoTurno.get('fechaInicio').value ||
      this.turnoSelect.fechaFin == this.formularioNuevoTurno.get('fechaFin').value
    ) {
      return false;
    }
    return true;
  }

  get turnoDespachoValido(): boolean {
    // Lógica previa
    if (this.editar) {
      // ejemplo: usabas "diferentes"; podrías combinarlo con otras validaciones
      return this.diferentes;
    }

    const todosEstanCompletadosOCero = this.despachoTurnoList.every((dep) => {
      const empezoLlenado =
        !!dep.fechaInicio || !!dep.horaInicio || !!dep.fechaFin || !!dep.horaFin;
      if (empezoLlenado) {
        return dep.validado === true;
      } else {
        return true;
      }
    });

    const alMenosUnoLleno = this.despachoTurnoList.some((dep) => dep.validado === true);

    return todosEstanCompletadosOCero && alMenosUnoLleno;
  }

  turnoValido(): boolean {
    if (
      this.despachoTurnoList.find(
        (i) => i.fechaInicio != null && i.fechaFin != null && i.horaInicio != null && i.horaFin != null
      )
    ) {
      return true;
    }
    return false;
  }

  public icon(name: string): string {
    return `assets/icons/${name}.svg`;
  }

  public getHour(value: string): Date {
    if (value === null) return null;

    const newTime = new Date();
    const [hours, minutes] = value.split(':').map(Number);
    newTime.setHours(hours);
    newTime.setMinutes(minutes);
    newTime.setSeconds(0);
    newTime.setMilliseconds(0);
    return newTime;
  }

  simulateEscapeKey() {
    const event = new KeyboardEvent('keydown', {
      key: 'Escape',
      keyCode: 27,
      code: 'Escape',
      bubbles: true,
    });
    document.dispatchEvent(event);
  }

  clearHoraFin(item: any) {
    item.horaFin = null;
    this.validarHorario(item);
  }

  onChangeHoraFin(item: any, valor: any) {
    if (!(valor instanceof Date)) {
      item.horaFin = null;
    } else {
      item.horaFin = valor;
    }
    this.validarHorario(item);
  }
}
