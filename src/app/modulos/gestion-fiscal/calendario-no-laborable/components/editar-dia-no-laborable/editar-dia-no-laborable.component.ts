import { Component, OnInit } from '@angular/core';
import {
  DialogService,
  DynamicDialogConfig,
  DynamicDialogRef,
} from 'primeng/dynamicdialog';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { RadioButtonModule } from 'primeng/radiobutton';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { CmpLibModule, ctrlErrorMsg } from 'ngx-mpfn-dev-cmp-lib';
import { CalendarModule } from 'primeng/calendar';
import { CalendarioNoLaborableService } from '@services/calendario-no-laborable/calendario-no-laborable.service';
import { MaestroService } from '@services/maestro/maestro.service';
import { MaestroGenerico } from '@interfaces/maestro-generico/maestro-generico';
import { MultiSelectModule } from 'primeng/multiselect';
import {
  formatDate,
  formatDateSimple,
  formatDateString,
  getDateFormatString,
} from '@utils/utils';
import { obtenerIcono } from '@utils/icon';
import { AlertModalComponent } from '@components/alert-modal/alert-modal.component';

@Component({
  selector: 'app-editar-dia-no-laborable',
  standalone: true,
  imports: [
    CommonModule,
    CalendarModule,
    TableModule,
    FormsModule,
    RadioButtonModule,
    MultiSelectModule,
    ReactiveFormsModule,
    CmpLibModule,
  ],
  templateUrl: './editar-dia-no-laborable.component.html',
  styleUrls: ['./editar-dia-no-laborable.component.scss'],
})
export class EditarDiaNoLaborableComponent implements OnInit {
  fechaNoLaborable: any;
  fechaSelect: string;
  error: any;
  edicion: boolean = false;
  titleTask: string = '';
  isRegional: boolean = false;
  distritoFiscalList: MaestroGenerico[] = [];
  cadenaMessage: any = {
    tipoDia: 1,
    tipoAmbito: 1,
    fechas: '',
    distritosFiscales: ' para el(los) distrito(s) fiscal(es) de ',
  };

  yearSelect: any = 2024;

  public refModal: DynamicDialogRef;

  listaNoLaborables: any[] = [];
  public obtenerIcono = obtenerIcono;
  public formNoLaborable: FormGroup;
  objectNoLaborables: any;
  formGroup!: FormGroup;
  public festivoOptions = [
    { label: 'Feriado', value: true },
    { label: 'No Laborable', value: false },
  ];
  public tipoOptions = [
    { label: 'Nacional', value: true },
    { label: 'Regional', value: false },
  ];
  public protectionOptions = [
    { label: 'Sí', value: true },
    { label: 'no', value: false },
  ];
  es: any;
  public counterNombre: number = 0;

  constructor(
    private readonly fb: FormBuilder,
    public readonly ref: DynamicDialogRef,
    public readonly config: DynamicDialogConfig,
    private readonly calendarioNoLaborableService: CalendarioNoLaborableService,
    private readonly maestroService: MaestroService,
    public readonly dialogService: DialogService
  ) {
    this.fechaNoLaborable = this.config?.data.fechaNoLaborable;
    this.edicion = this.config?.data.editar;

    this.titleTask = this.edicion ? 'Editar' : 'Agregar';

    this.formNoLaborable = fb.group({
      optionTipo: [
        this.fechaNoLaborable?.tipo || 'NACIONAL',
        Validators.required,
      ],
      optionFestivo: [
        this.fechaNoLaborable?.festivo || 'SI',
        Validators.required,
      ],
      nombre: [this.fechaNoLaborable?.nombre || null, Validators.required],
      descripcion: [
        this.fechaNoLaborable?.descripcion || null,
        Validators.required,
      ],
      fecha: [null, Validators.required],
      distritoFiscal: [null],
    });

    if (this.edicion) {
      this.consultarNoLaborable(this.fechaNoLaborable?.idConfiguraNoLaborable);
      this.formNoLaborable
        .get('fecha')
        .setValue(new Date(this.fechaNoLaborable?.fecha));
      this.fechaSelect = this.fechaNoLaborable?.fecha;
      this.formNoLaborable
        .get('optionFestivo')
        .setValue(this.fechaNoLaborable?.tipoDia == 'FERIADO' ? 'SI' : 'NO');
      this.formNoLaborable
        .get('optionTipo')
        .setValue(this.fechaNoLaborable?.tipoAmbito);

      this.formNoLaborable.get('distritoFiscal').setValue([
        {
          id: this.fechaNoLaborable?.idDistritoFiscal,
          nombre: this.fechaNoLaborable?.distritoFiscal,
        },
      ]);
      this.isRegional = this.fechaNoLaborable?.tipoAmbito == 'REGIONAL';
    }
  }

  ngOnInit() {
    this.loadDistritoFiscal();
    this.es = {
      firstDayOfWeek: 1,
      dayNames: [
        'domingo',
        'lunes',
        'martes',
        'miércoles',
        'jueves',
        'viernes',
        'sábado',
      ],
      dayNamesShort: ['dom', 'lun', 'mar', 'mié', 'jue', 'vie', 'sáb'],
      dayNamesMin: ['DO', 'LU', 'MA', 'MI', 'JU', 'VI', 'SA'],
      monthNames: [
        'enero',
        'febrero',
        'marzo',
        'abril',
        'mayo',
        'junio',
        'julio',
        'agosto',
        'septiembre',
        'octubre',
        'noviembre',
        'diciembre',
      ],
      monthNamesShort: [
        'ene',
        'feb',
        'mar',
        'abr',
        'may',
        'jun',
        'jul',
        'ago',
        'sep',
        'oct',
        'nov',
        'dic',
      ],
      today: 'Hoy',
      clear: 'Borrar',
    };

    // Actualiza el contador manualmente si ya hay un valor inicial
    const nombreInicial = this.formNoLaborable.get('nombre')?.value;
    this.counterNombre = nombreInicial ? nombreInicial.trim().length : 0;

    this.formNoLaborable.get('nombre')?.valueChanges.subscribe((value) => {
      // En caso de querer un máximo de 100 caracteres
      if (value && value.length > 100) {
        this.formNoLaborable
          .get('nombre')
          .setValue(value.substring(0, 100), { emitEvent: false });
      }

      // Actualiza el conteo de caracteres
      this.counterNombre = value ? value.trim().length : 0;
    });
  }

  private loadDistritoFiscal(): void {
    this.maestroService.listarDistritosFiscalesActivos().subscribe({
      next: (response) => {
        this.distritoFiscalList = response;
      },
    });
  }

  consultarNoLaborable(idNoLaborable: any) {
    let objectNoLaborables: any;

    this.calendarioNoLaborableService
      .consultarFechaNoLaborable(idNoLaborable)
      .subscribe({
        next: (response) => {
          this.objectNoLaborables = response;
        },
        error: (err) => {
          this.error = err;
          console.error('Error al obtener datos:', err);
        },
      });
  }

  formato($event): string {
    let daySelect = formatDateSimple(
      getDateFormatString(
        $event.day + '/' + ($event.month + 1) + '/' + $event.year
      )
    );
    let formato: string;
    if (daySelect == formatDateString(this.fechaNoLaborable?.fecha)) {
      return this.fechaNoLaborable?.tipoDia;
    }

    return formato;
  }

  changeYear(accion: any) {
    if (accion == 1) {
      this.yearSelect = this.yearSelect + 1;
    } else {
      this.yearSelect = this.yearSelect - 1;
    }
    this.actualizarCalendario();
  }

  actualizarCalendario() {
    let request = {
      nombre: null,
      descripcion: null,
      idDistritoFiscal: null,
      fechaInicio: '01/01/' + this.yearSelect,
      fechaFin: '31/12/' + this.yearSelect,
      tipoDia: null,
      tipoAmbito: null,
      pagina: 1,
      porPagina: 100,
    };

    this.calendarioNoLaborableService
      .obtenerListaFechasNoLaborables(request)
      .subscribe({
        next: (response) => {
          this.listaNoLaborables = response;
        },
        error: (err) => {
          this.error = err;
          console.error('Error al obtener datos:', err);
        },
      });
  }

  changeAmbito() {
    if (this.formNoLaborable.get('optionTipo').value == 'NACIONAL')
      this.isRegional = true;
    else this.isRegional = false;
  }
  public getDate(value: string): Date {
    if (value === null) return null;

    const [day, month, year] = value.split('/').map(Number);
    const date = new Date(year, month - 1, day);
    return date;
  }

  errorMsg(ctrlName): any {
    if (ctrlName === 'descripcion')
      return ctrlErrorMsg(this.formNoLaborable.get(ctrlName));
  }

  public validMaxLength(field: string = 'descripcion'): void {
    this.validMaxLengthCustom(field);
  }

  // get counterNombre(): number {
  //   return this.formNoLaborable.get('nombre').value?.trim()
  //     .length !== 0 ? this.formNoLaborable.get('nombre').value?.length : 0;
  // }

  get counterDescripcion(): number {
    return this.formNoLaborable.get('descripcion').value?.trim().length !== 0
      ? this.formNoLaborable.get('descripcion').value?.length
      : 0;
  }

  validMaxLengthCustom(field: string = 'descripcion') {
    let value: string = '';
    let maxLength: number = 300;
    let control: any = this.formNoLaborable.get(field);
    value = control?.value;
    value.length > maxLength && control?.setValue(value.slice(0, maxLength));
  }

  selectCalendar($event) {
    this.fechaSelect = formatDate($event);
  }
  public close(): void {
    this.ref.close();
  }
  public icon(name: string): string {
    return `assets/icons/${name}.svg`;
  }
  public getNotaFinalizaPeriodo(): any {
    return '<b>Nota:</b> Tener en cuenta que el periodo configurado para el grupo aleatorio, esta cerca de finalizar. Por favor, revisar esta fecha y si se considera pertinente, actualizar esta información.';
  }
  get validatefecha() {
    if (
      this.fechaSelect &&
      this.counterNombre > 3 &&
      this.counterDescripcion > 3
    ) {
      if (
        (this.formNoLaborable.get('optionTipo').value == 'REGIONAL' &&
          this.formNoLaborable.get('distritoFiscal').value?.length > 0) ||
        this.formNoLaborable.get('optionTipo').value == 'NACIONAL'
      ) {
        return true;
      }
    }
    return false;
  }

  registrarFecha(): boolean {
    let tipoDia =
      this.formNoLaborable.get('optionFestivo').value == 'SI' ? 1 : 2;
    let tipoAmbito =
      this.formNoLaborable.get('optionTipo').value == 'NACIONAL' ? 1 : 2;

    // 1) Obtenemos las fechas seleccionadas del calendar.
    //    Puede ser un array de 1 elemento (un solo día)
    //    o de 2 elementos (rango de inicio y fin).
    const fechasSeleccionadas: Date[] =
      this.formNoLaborable.get('fecha').value || [];

    // 2) Convertimos a string "dd/MM/yyyy":
    //    Si el array tiene 1 fecha => fechaFin se mantiene como null.
    let fechaInicio: string = null;
    let fechaFin: string = null;

    if (fechasSeleccionadas.length > 0) {
      fechaInicio = formatDateSimple(fechasSeleccionadas[0]);
    }
    if (fechasSeleccionadas.length > 1) {
      fechaFin = formatDateSimple(fechasSeleccionadas[1]);
    }

    /////////////////////////////////////////
    if (this.formNoLaborable.get('optionTipo').value == 'REGIONAL') {
      let listaDistritosFiscales =
        this.formNoLaborable.get('distritoFiscal').value;

      const rangoFechas = this.expandDateRange(fechaInicio, fechaFin);

      listaDistritosFiscales?.forEach((df, idx) => {
        let requestguardarFecha = {
          // En lugar de "fechaSelect", enviamos "fechasSelect"
          // con [fechaInicio, fechaFin]
          // fechaSelect: this.fechaSelect,
          // fechasSelect: [fechaInicio, fechaFin],
          fechasSelect: rangoFechas,
          tipoDia: tipoDia,
          tipoAmbito: tipoAmbito,
          idDistritoFiscal: df.id,
          nombre: this.formNoLaborable.get('nombre').value,
          descripcion: this.formNoLaborable.get('descripcion').value,
          usuario: '45259009',
        };

        this.calendarioNoLaborableService
          .editarFechaNoLaborable(requestguardarFecha)
          .subscribe({
            next: (response) => {
              this.ref.close('exito');
              return true;
            },
            error: (err) => {
              this.error = err;
              console.error('Error al guardar:', err);
              return false;
            },
          });
      });
    } else {
      const rangoFechas = this.expandDateRange(fechaInicio, fechaFin);

      let requestguardarFecha = {
        // fechaSelect: this.fechaSelect,
        // fechasSelect: [fechaInicio, fechaFin],
        fechasSelect: rangoFechas,
        tipoDia: tipoDia,
        tipoAmbito: tipoAmbito,
        idDistritoFiscal: null,
        nombre: this.formNoLaborable.get('nombre').value,
        descripcion: this.formNoLaborable.get('descripcion').value,
        usuario: '45259009',
      };

      this.calendarioNoLaborableService
        .agregarFechaNoLaborable(requestguardarFecha)
        .subscribe({
          next: (response) => {
            this.ref.close('exito'); // <-- Notificamos "exito"
            return true;
          },
          error: (err) => {
            this.error = err;
            console.error('Error al guardar:', err);

            return false;
          },
        });
    }
    return false;
  }

  expandDateRange(dateStart: string, dateEnd: string): string[] {
    const resultado: string[] = [];

    // Prepara las funciones de parseo/formateo
    // En un proyecto Angular, podrías usar date-fns, moment, o la API nativa
    const parseDate = (str: string): Date => {
      // str = "21/01/2025"
      const [day, month, year] = str.split('/').map(Number);
      // Recuerda que el mes en Date se indexa desde 0
      return new Date(year, month - 1, day);
    };

    const formatDate = (date: Date): string => {
      // Devuelve en "dd/MM/yyyy"
      const dd = String(date.getDate()).padStart(2, '0');
      const mm = String(date.getMonth() + 1).padStart(2, '0');
      const yyyy = date.getFullYear();
      return `${dd}/${mm}/${yyyy}`;
    };

    // Parsear strings a Date
    const inicio = parseDate(dateStart);
    const fin = parseDate(dateEnd);

    // Asegurar que inicio <= fin
    if (inicio > fin) {
      // Si está invertido, podrías intercambiarlas o mostrar error
      console.warn(
        'Fecha de inicio mayor que fecha de fin. Se intercambiarán.'
      );
      // Opcional: [inicio, fin] = [fin, inicio];
    }

    // Recorrer día a día
    let current = new Date(inicio.getTime());
    while (current <= fin) {
      resultado.push(formatDate(current));
      // Avanza 1 día
      current.setDate(current.getDate() + 1);
    }

    return resultado;
  }

  guardarEdicion(cadenaMessage: any) {
    this.refModal = this.dialogService.open(AlertModalComponent, {
      width: '750px',
      showHeader: false,
      data: {
        icon: 'question',
        title: 'EDITAR DÍA FESTIVO/NO LABORABLE',
        confirm: true,
        confirmButtonText: 'Aceptar',
        description:
          '<p>A continuación, se procederá a <b>modificar los datos</b> del(los) día(s) ' +
          cadenaMessage.cadenaFechas +
          ': ' +
          cadenaMessage.nombre +
          ' </p>' +
          '<p><b>¿Este cambio afectará a todos los plazos que sean registrados a partir de la fecha, pero NO a los plazos registrados anteriormente</b> ¿Está seguro de realizar esta acción?</p>',
      },
    });
    this.refModal.onClose.subscribe({
      next: (resp) => {
        if (resp === 'confirm') {
          if (this.registrarFecha()) {
            this.refModal = this.dialogService.open(AlertModalComponent, {
              width: '600px',
              showHeader: false,
              data: {
                icon: 'success',
                title: 'REGISTRO REALIZADO CORRECTAMENTE',
                description:
                  'Se registró, de forma exitosa, los nuevos datos del(los) día(s) ' +
                  cadenaMessage.cadenaFechas +
                  ': ' +
                  cadenaMessage.nombre +
                  ' ¡Está seguro de realizar esta acción',
                confirmButtonText: 'Listo',
              },
            });
          }
        }
      },
    });
    this.ref.close();
  }

  public confirmarRegistro(): void {
    this.cadenaMessage.tipoDia =
      this.formNoLaborable.get('optionFestivo').value == 'SI'
        ? 'feriado'
        : 'no laborable';
    this.cadenaMessage.tipoAmbito = this.formNoLaborable
      .get('optionTipo')
      .value?.toLowerCase();
    this.cadenaMessage.cadenaFechas = formatDateSimple(
      this.formNoLaborable.get('fecha').value[0]
    );

    if (this.formNoLaborable.get('fecha').value[1] != null)
      this.cadenaMessage.cadenaFechas =
        this.cadenaMessage.cadenaFechas +
        '-' +
        formatDateSimple(this.formNoLaborable.get('fecha').value[1]);

    if (this.formNoLaborable.get('distritoFiscal').value?.length > 1) {
      for (
        let i = 0;
        i < this.formNoLaborable.get('distritoFiscal').value?.length;
        i++
      ) {
        this.cadenaMessage.distritosFiscales =
          this.cadenaMessage.distritosFiscales +
          this.formNoLaborable
            .get('distritoFiscal')
            .value[i].nombre.toLowerCase() +
          ', ';
      }
    }

    if (this.edicion) {
      this.cadenaMessage.nombre = this.fechaNoLaborable?.nombre;
      this.guardarEdicion(this.cadenaMessage);
      return;
    }

    this.refModal = this.dialogService.open(AlertModalComponent, {
      width: '750px',
      showHeader: false,
      data: {
        icon: 'question',
        title: 'REGISTRAR DÍA FESTIVO/NO LABORABLE',
        confirm: true,
        confirmButtonText: 'Aceptar',
        description:
          'A continuación, se procederá a <b>registrar</b> el(los) día(s) ' +
            this.cadenaMessage.cadenaFechas +
            ' como ' +
            this.cadenaMessage.tipoDia +
            ' ' +
            this.cadenaMessage.tipoAmbito +
            this.formNoLaborable.get('optionTipo').value ==
          'REGIONAL'
            ? this.cadenaMessage.distritosFiscales
            : ' ' +
              '<br><b>¿Este cambio afectará a todos los plazos que sean registrados a partir de la fecha, pero NO a los plazos registrados anteriormente</b> ¿Está seguro de realizar esta acción?',
      },
    });

    this.refModal.onClose.subscribe({
      next: (resp) => {
        if (resp === 'confirm') {
          if (this.registrarFecha()) {
            this.refModal = this.dialogService.open(AlertModalComponent, {
              width: '600px',
              showHeader: false,
              data: {
                icon: 'success',
                title: 'REGISTRO REALIZADO CORRECTAMENTE',
                description:
                  'Se registró, de forma exitosa, el(los) día(s) ' +
                  this.cadenaMessage.cadenaFechas +
                  ' como ' +
                  this.cadenaMessage.tipoDia +
                  ' ' +
                  this.cadenaMessage.tipoAmbito +
                  ' para el(los) distrito(s) fiscal(es) de ' +
                  this.cadenaMessage.distritosFiscales,
                confirmButtonText: 'Listo',
              },
            });
          }
        }
      },
    });
    this.ref.close();
  }
}
