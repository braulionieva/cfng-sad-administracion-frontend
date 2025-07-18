import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import {
  FormsModule,
  ReactiveFormsModule,
  FormGroup,
  FormBuilder,
} from '@angular/forms';
import { UsuarioService } from '@services/usuario/usuario.service';
import { obtenerIcono } from '@utils/icon';
import { CmpLibModule } from 'ngx-mpfn-dev-cmp-lib';
import { ButtonModule } from 'primeng/button';
import { CalendarModule } from 'primeng/calendar';
import { CardModule } from 'primeng/card';
import { CheckboxModule } from 'primeng/checkbox';
import { DialogModule } from 'primeng/dialog';
import { DropdownModule } from 'primeng/dropdown';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { InputMaskModule } from 'primeng/inputmask';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { MessagesModule } from 'primeng/messages';
import { RadioButtonModule } from 'primeng/radiobutton';
import { RippleModule } from 'primeng/ripple';
import { SelectButtonModule } from 'primeng/selectbutton';
import { TableModule } from 'primeng/table';
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';

const EXCEL_TYPE =
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';

@Component({
  selector: 'app-historial-contrasenias',
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
    InputTextareaModule,
    TableModule,
    FormsModule,
    RadioButtonModule,
    ReactiveFormsModule,
    DialogModule,
    MessagesModule,
    CmpLibModule,
  ],
  templateUrl: './historial-contrasenias.component.html',
  styleUrls: ['./historial-contrasenias.component.scss'],
})
export class HistorialContraseniasComponent {
  @Input() usuario;
  public registrador: string;

  historial: any;
  error: string;

  filtroForm: FormGroup;
  public obtenerIcono = obtenerIcono;
  imgDefault: string = null;

  constructor(
    private readonly fb: FormBuilder,
    public config: DynamicDialogConfig,
    public usuarioService: UsuarioService,
    public ref: DynamicDialogRef
  ) {
    this.filtroForm = this.fb.group({
      registrador: [null],
    });
  }

  ngOnInit(): void {
    if (this.usuario) {
      this.registrador = this.filtroForm.value.registrador;
      this.loadHistorial();
    }
  }
  loadHistorial() {
    this.usuarioService
      .historialUsuario(this.usuario?.idUsuario, this.registrador)
      .subscribe({
        next: (response) => {
          this.historial = response?.HistorialContrasenias;
        },
        error: (err) => {
          this.error = err;
          console.error(
            'Error al intentar obtener historial del usuario: ',
            err
          );
        },
      });
  }
  exportarExcelHistorial(): void {
    const historialConNumeracion = this.historial.map((item, index) => ({
      N: index + 1, // Columna de numeración
      Fecha: item.fecha,
      Dispositivo: item.dispositivo,
      'Sistema Operativo': item.sistemaOperativo,
      Navegador: item.navegador,
      IP: item.ip,
      'Tipo Ip': item.tipoIp,
      Registrador: item.registrador,
    }));

    const hojaTrabajo: XLSX.WorkSheet = XLSX.utils.json_to_sheet(
      historialConNumeracion
    );
    const libroTrabajo: XLSX.WorkBook = {
      Sheets: { Datos: hojaTrabajo },
      SheetNames: ['Datos'],
    };
    const excelBuffer: any = XLSX.write(libroTrabajo, {
      bookType: 'xlsx',
      type: 'array',
    });

    this.guardarExcel(excelBuffer, 'CambiosContraseña');
  }

  private guardarExcel(buffer: any, nombreArchivo: string): void {
    const data: Blob = new Blob([buffer], { type: EXCEL_TYPE });

    saveAs(data, `${nombreArchivo}.xlsx`);
  }
  submit() {
    this.onFilter();
  }

  /********************* */
  onFilter() {
    this.registrador = this.filtroForm.value?.registrador
      ? this.filtroForm.value.registrador
      : null;
    this.loadHistorial();
  }

  onClearFilters() {
    this.filtroForm.reset();
  }
  public close(): void {
    this.ref.close();
  }

  public icon(name: string): string {
    return `assets/icons/${name}.svg`;
  }
}
