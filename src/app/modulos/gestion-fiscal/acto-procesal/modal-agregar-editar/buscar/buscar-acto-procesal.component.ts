import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { NotaInfoComponent } from '@components/nota-info/nota-info.component';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { ActoProcesalBandejaDetalleResponse, ActoProcesalConfiguracionRequest } from '@interfaces/admin-acto-procesal/acto-procesal';
import { DynamicDialogRef } from 'primeng/dynamicdialog';
import { MaestroGenerico } from '@interfaces/maestro-generico/maestro-generico';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { NgxSpinnerService } from 'ngx-spinner';
import { MaestroService } from '@services/maestro/maestro.service';
import { AdminActoProcesalService } from '@services/admin-acto-procesal/admin-acto-procesal.service';
import { TableModule } from 'primeng/table';
import { TablaModalAgregarEditarActoProcesalComponent } from '../tabla/tabla-modal-agregar-editar-acto-procesal.component';
import { CommonModule } from '@angular/common';
import { AutoCompleteCompleteEvent } from '@interfaces/shared/shared';


@Component({
  selector: 'app-buscar-acto-procesal',
  standalone: true,
  imports: [
    CommonModule,
    NotaInfoComponent,
    InputTextModule,
    ButtonModule,
    FormsModule,
    ReactiveFormsModule,
    AutoCompleteModule,
    TableModule,
    TablaModalAgregarEditarActoProcesalComponent
  ],
  templateUrl: './buscar-acto-procesal.component.html',
  styleUrls: ['./buscar-acto-procesal.component.scss']
})
export class BuscarActoProcesalComponent implements OnInit {
  @Input() tipoLlamado: string = '';
  @Output() siguiente = new EventEmitter();
  @Output() setIdActoProcesal = new EventEmitter();
  @Output() setNombreActoProcesal = new EventEmitter();

  actosProcesales: MaestroGenerico[] = [];
  detalleActoProcesal: ActoProcesalBandejaDetalleResponse[] = [];
  mensajeNoExisteActoProcesal: boolean = false;
  eventoOnSelectActive: boolean = false;
  public formularioBuscar: FormGroup;
  loading: boolean = false;
  filteredActoProcesal: MaestroGenerico[] | undefined;
  nombre: string = '';
  showActions: boolean = false;
  idActoProcesalSelected: string = '';
  colorBackgroundMensaje: string = "#e2f0fb";
  error: any;


  constructor(
    private fb: FormBuilder,
    public ref: DynamicDialogRef,
    private maestroService: MaestroService,
    private actoProcesalService: AdminActoProcesalService,
    private spinner: NgxSpinnerService
  ) {
    this.formularioBuscar = this.fb.group(
      {
        nombreActoProcesal: new FormControl(null, [
          Validators.required,
          Validators.maxLength(100),
        ])
      }
    );
  }

  ngOnInit() {
    this.loadActosProcesales();
  }

  private loadBandejaDetalleActosProcesales(idActoProcesal: string, nombreActoProcesal): void {
    this.nombre = nombreActoProcesal;
    this.loading = true;

    this.spinner.show();
    console.log("buscar acto procesar x idActoProcesal")
    this.actoProcesalService.listarDetalleActoProcesal(idActoProcesal).subscribe(
      {
        next: (response) => {
          console.log("response getActoProcesalXId",response )
          this.detalleActoProcesal = response;
          this.loading = false;
          this.spinner.hide();
        }
      }
    );

    // this.actoProcesalService.buscarActosProcesales(idActoProcesal).subscribe(
    //   {
    //     next: (response) => {
    //       this.detalleActoProcesal = response;
    //       this.loading = false;
    //       this.spinner.hide();
    //     }
    //   }
    // );


  }

  private loadActosProcesales(): void {
    this.spinner.show();
    this.maestroService.listarActoProcesal().subscribe(
      {
        next: (response) => {
          this.spinner.hide();
          response.data.sort((a, b) => a.nombre.localeCompare(b.nombre));
          this.actosProcesales = response.data;
        }
      }
    );
  }

  public icon(name: string): string {
    return `assets/icons/${name}.svg`;
  }

  public getDescripcionTop(): any {
    return "<b>Nota:</b> Antes de registrar un nuevo acto procesal, asegurarse si ya existe, ingresando como mínimo las tres primeras letras del nombre del acto procesal para la búsqueda.";
  }

  public getDescripcionButton(): any {
    return "<b>Nota:</b> Antes de continuar con el registro, por favor, asegúrese de que el nombre del acto procesal esté escrito correctamente, utilizando todas las letras de forma completa. Además de verificar que las tildes se hayan aplicado correctamente, evitando el uso indebido de tildes donde no corresponde.";
  }

  public getDescripcionNoExiste(): any {
    return "<b>Nota:</b> Al no haber encontrado y seleccionado un acto procesal existente, este acto procesal será registrado como <b>NUEVO.</b>";
  }

  /**startSearch(name: any): void {
    this.actosProcesales;
  }**/

  //refactorizado
  search(event: AutoCompleteCompleteEvent) {
    const query = event.query.toLowerCase();
    this.filteredActoProcesal = [];

    for (const actoProcesal of this.actosProcesales as any[]) {
      if (actoProcesal.nombre.toLowerCase().indexOf(query) === 0) {
        this.filteredActoProcesal.push(actoProcesal);
      }
    }
  }

  /**search(event: AutoCompleteCompleteEvent) {
    let filtered: any[] = [];
    let query = event.query;

    for (let i = 0; i < (this.actosProcesales as any[]).length; i++) {
        let actoProcesal = (this.actosProcesales as any[])[i];
        if (actoProcesal.nombre.toLowerCase().indexOf(query.toLowerCase()) == 0) {
            filtered.push(actoProcesal);
        }
    }
    this.filteredActoProcesal = filtered;
  }**/

  getSelectedItemName(item: { id: string; nombre: string }): string {
    return item.nombre;
  }

  onSelect(event: any) {
    this.eventoOnSelectActive = true;
    this.idActoProcesalSelected = '';

    this.idActoProcesalSelected = event.id;

    this.loadBandejaDetalleActosProcesales(this.idActoProcesalSelected, event.nombre);
    this.mensajeNoExisteActoProcesal = false;
  }

  onKeyUp(event: any) {
    this.eventoOnSelectActive = false;
    this.nombre = '';

    this.mensajeNoExisteActoProcesal = false;

    if (event.target.value.length > 3 && this.nombre.length == 0 && !this.eventoOnSelectActive) {
      const acto = this.actosProcesales.find(item => item.nombre.toLowerCase() == event.target.value.toLowerCase());

      if (acto === undefined) {
        this.nombre = '';
        this.detalleActoProcesal = [];
        this.idActoProcesalSelected = '';
        this.mensajeNoExisteActoProcesal = true;
      } else {
        this.mensajeNoExisteActoProcesal = false;

        this.idActoProcesalSelected = acto.id;
        this.nombre = event.target.value;
      }
    }
  }

  nextPage() {
    if (this.mensajeNoExisteActoProcesal) {
      this.agregarActoProcesal();
    } else {
      this.goToNextPage();
    }
  }

  private agregarActoProcesal(): void {
    this.spinner.show();
    const acto = this.obtenerActoProcesal();
    this.actoProcesalService.agregarActoProcesal(acto).subscribe(
      {
        next: (response) => {
          this.spinner.hide();
          this.idActoProcesalSelected = response.idActoProcesal;

          this.goToNextPage();
        },
        error: (err) => {
          this.error = err;
          console.error('Error al obtener servidores:', err);
          this.spinner.hide();
        }
      }
    );
  }

  private obtenerActoProcesal(): ActoProcesalConfiguracionRequest {
    const nuevoActoProcesal = {
      nombreActoProcesal: this.formularioBuscar.value.nombreActoProcesal,
      usuarioCreador: '44836273'
    };
    return nuevoActoProcesal;
  }

  private goToNextPage(): void {
    this.setIdActoProcesal.emit(this.idActoProcesalSelected);
    this.setNombreActoProcesal.emit(this.nombre)
    this.siguiente.emit();
  }

  public close(): void {
    this.ref.close();
  }

}
