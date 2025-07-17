import {
  Component,
  EventEmitter,
  OnInit,
  Output,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { MenuModule } from 'primeng/menu';
import { MenuItem, MessageService } from 'primeng/api';
import {
  DialogService,
  DynamicDialogConfig,
  DynamicDialogRef,
  DynamicDialog,
} from 'primeng/dynamicdialog';
import { VerDetalleFechaComponent } from '../components/ver-detalle-fecha/ver-detalle-fecha.component';
import { CalendarModule } from 'primeng/calendar';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import {
  formatDateSimple,
  formatDateString,
  getDateFormatString,
} from '@utils/utils';
import { CalendarioNoLaborableService } from '@services/calendario-no-laborable/calendario-no-laborable.service';
import { obtenerIcono } from '@utils/icon';
import { CmpLibModule } from 'ngx-mpfn-dev-cmp-lib';

@Component({
  selector: 'app-calendario-anual',
  standalone: true,
  imports: [
    CommonModule,
    TableModule,
    ButtonModule,
    CalendarModule,
    ReactiveFormsModule,
    MenuModule,
    DynamicDialog,
    CmpLibModule,
  ],
  templateUrl: './calendario-anual.component.html',
  styleUrls: ['./calendario-anual.component.scss'],
  providers: [MessageService, DynamicDialogRef, DynamicDialogConfig],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TablaComponent implements OnInit {
  @Output() clicked = new EventEmitter();
  @Output() deleted = new EventEmitter();

  public date: Date;
  public es: any;

  //@Input() calendarioNoLaborable : any[] = [];
  rect: any = { top: 400, left: 400 };

  invalidDates: Array<Date>;
  //datosDateSelect:any;
  listaNoLaborables: any[] = [];
  public grupoAleatorioSelected: any = null;
  bdcalendar: any;
  displayModalCargaInicial: boolean = false;
  displayModalVer: boolean = false;
  displayModalEditarGrupo: boolean = false;
  actionItems: MenuItem[];

  activeItem: any;
  error: any;

  yearSelect: any = 2024;
  public obtenerIcono = obtenerIcono;
  public refModal: DynamicDialogRef;
  public calendarioForm: FormGroup;
  valueToAction: any;

  // Declaramos un Map para cachear la busqueda de tipo de dia
  private dayTypeCache: Map<string, string> = new Map();

  constructor(
    private readonly fb: FormBuilder,
    public readonly ref: DynamicDialogRef,
    public readonly config: DynamicDialogConfig,
    private readonly calendarioNoLaborableService: CalendarioNoLaborableService,
    private readonly dialogService: DialogService,
    private readonly cdr: ChangeDetectorRef
  ) {
    // this.actualizarCalendario();
    this.calendarioForm = fb.group({
      mes1: [this.bdcalendar?.mes2 || this.inicializaDate(1)],
      mes2: [this.bdcalendar?.mes2 || this.inicializaDate(2)],
      mes3: [this.bdcalendar?.mes3 || this.inicializaDate(3)],
      mes4: [this.bdcalendar?.mes4 || this.inicializaDate(4)],
      mes5: [this.bdcalendar?.mes5 || this.inicializaDate(5)],
      mes6: [this.bdcalendar?.mes6 || this.inicializaDate(6)],
      mes7: [this.bdcalendar?.mes7 || this.inicializaDate(7)],
      mes8: [this.bdcalendar?.mes8 || this.inicializaDate(8)],
      mes9: [this.bdcalendar?.mes9 || this.inicializaDate(9)],
      mes10: [this.bdcalendar?.mes10 || this.inicializaDate(10)],
      mes11: [this.bdcalendar?.mes11 || this.inicializaDate(11)],
      mes12: [this.bdcalendar?.mes12 || this.inicializaDate(12)],
    });
  }

  ngOnInit(): void {
    this.yearSelect = new Date().getFullYear();
    this.actualizarCalendario();
    this.cargarCalendario();
  }

  cargarCalendario() {
    this.listaNoLaborables = null;
  }

  public icon(name: string): string {
    return `assets/icons/${name}.svg`;
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

          this.buildDayTypeCache(); // Actualiza el cache
          this.cdr.detectChanges();
        },
        error: (err) => {
          this.error = err;
          console.error('Error al obtener datos:', err);
        },
      });
  }

  // Construimos el Map para búsquedas rápidas
  private buildDayTypeCache(): void {
    this.dayTypeCache.clear();
    this.listaNoLaborables?.forEach((f) => {
      // Con 'formatDateString' conviertes la fecha a "dd/MM/yyyy"
      const key = formatDateString(f.fecha);
      this.dayTypeCache.set(key, f.tipoDia);
    });
  }

  public getDate(value: string): Date {
    if (value === null) return null;

    const [day, month, year] = value.split('/').map(Number);
    const date = new Date(year, month - 1, day);
    return date;
  }

  public inicializaDate(
    month: number,
    year: number = new Date().getFullYear()
  ): Date {
    if (month >= 1 && month <= 12) {
      return this.getDate(`01/${month.toString().padStart(2, '0')}/${year}`);
    }

    return new Date();
  }

  // formato($event): string {
  //   let daySelect = formatDateSimple(
  //     getDateFormatString(
  //       $event.day + '/' + ($event.month + 1) + '/' + $event.year
  //     )
  //   );

  //   let formato: string;

  //   this.listaNoLaborables?.forEach((f, idx) => {
  //     if (daySelect == formatDateString(f.fecha)) {
  //       formato = f.tipoDia;
  //     }
  //   });

  //   return formato;
  // }

  public formato($event: any): string {
    const daySelect = formatDateSimple(
      getDateFormatString(`${$event.day}/${$event.month + 1}/${$event.year}`)
    );

    return this.dayTypeCache.get(daySelect) || '';
  }

  nolaborable($event): boolean {
    /*
    let daySelect = formatDateSimple($event)
    let dayExist = this.listaNoLaborables.find((f) => (f.fecha == daySelect && f.tipoDia=='NO LABORABLE'));
    if(dayExist)
      return true
    else*/
    return false;
  }

  findesemana($event): boolean {
    /*let daySelect = formatDateSimple($event)
    let dayExist = this.listaNoLaborables.find((f) => (f.fecha == daySelect && (f.fechaDia=='SÁBADO'||f.fechaDia=='DOMINGO')));

    if(dayExist)
      return true
    else*/
    return false;
  }

  verClick($event: MouseEvent) {
    const target = $event.currentTarget as HTMLElement;
    this.rect = target.getBoundingClientRect();
  }

  verDetalle($event: any) {
    // Extraer día, mes, año:
    const day = $event.getDate();
    const month = $event.getMonth() + 1; // getMonth() va de 0 a 11
    const year = $event.getFullYear();

    // Construccion el string “dd/MM/yyyy”
    const dateStr =
      day.toString().padStart(2, '0') +
      '/' +
      month.toString().padStart(2, '0') +
      '/' +
      year;

    let datosDateSelect = this.listaNoLaborables.find(
      (f) => formatDateString(f.fecha) === dateStr //formatDateSimple($event)
    );

    console.log('Datos: ', datosDateSelect);

    const idConfiguraNoLaborable = datosDateSelect.idConfiguraNoLaborable;
    console.log('idNoLaborable: ', idConfiguraNoLaborable);

    this.calendarioNoLaborableService
      .consultarFechaNoLaborable(idConfiguraNoLaborable)
      .subscribe({
        next: (response) => {
          // ‘response’ es el array con uno o varios registros
          const dataToSend = {
            feriadoCompleto: response,
          };

          console.log('dataToSend: ', dataToSend);

          if (datosDateSelect) {
            this.refModal = this.dialogService.open(VerDetalleFechaComponent, {
              width: '400px',
              height: 'auto',
              style: {
                position: 'absolute',
                top: `${this.rect.top + 110}px`,
                left: `${this.rect.left + 153}px`,
              },
              showHeader: false,
              data: {
                datosDateSelect: datosDateSelect,
                dataToSend: dataToSend,
              },
            });

            this.refModal.onClose.subscribe((data) => {
              this.actualizarCalendario();
              if (data !== null) {
                this.deleted.emit(data);
              }
            });
          }
          // // 4. Abres el modal pasándole ese array
          // this.refModal = this.dialogService.open(VerDetalleFechaComponent, {
          //   data: dataToSend,
          //   showHeader: false,
          //   width: '400px',
          //   // ...
          // });
          // this.refModal.onClose.subscribe(...);
        },
        error: (err) => console.error(err),
      });

    // if (datosDateSelect) {
    //   this.refModal = this.dialogService.open(VerDetalleFechaComponent, {
    //     width: '400px',
    //     height: 'auto',
    //     style: {
    //       position: 'absolute',
    //       top: `${this.rect.top + 110}px`,
    //       left: `${this.rect.left + 153}px`,
    //     },
    //     showHeader: false,
    //     data: datosDateSelect,
    //   });
    //   this.refModal.onClose.subscribe((data) => {
    //     this.actualizarCalendario();
    //     if (data !== null) {
    //       this.deleted.emit(data);
    //     }
    //   });
    // }
  }

  onClicked() {
    this.clicked.emit();
  }
}
