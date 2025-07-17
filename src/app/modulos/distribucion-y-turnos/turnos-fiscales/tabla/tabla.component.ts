import { Component, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { Menu, MenuModule } from 'primeng/menu';
import { MenuItem, MessageService } from 'primeng/api';
import { DialogService, DynamicDialogConfig, DynamicDialogRef,DynamicDialog  } from 'primeng/dynamicdialog';
import { BuscarDependenciaResRow } from '@interfaces/administrar-dependencia/administrar-dependencia';
import { TurnoService } from '@services/turno/turno.service';
import { CmpLibModule } from 'ngx-mpfn-dev-cmp-lib';
import { obtenerIcono } from '@utils/icon';
import { VerTurnoFiscaliaComponent } from '../components/ver-turno/ver-turno-fiscalia.component';
import {formatDate, formatDateTextCut, formatDateTimeTextCut, formatDateTimeTextCut24H} from '@utils/utils';
import { AlertModalComponent } from '@components/alert-modal/alert-modal.component';
import { EditarTurnoComponent } from '../components/editar-turno-fiscalia/editar-turno.component';

@Component({
  selector: 'app-tabla',
  standalone: true,
  imports: [
    CommonModule,
    TableModule,
    ButtonModule,
    MenuModule,
    CmpLibModule,
    DynamicDialog,
    ],
  templateUrl: './tabla.component.html',
  styleUrls: ['./tabla.component.scss'],
  providers: [MessageService,DynamicDialogRef,DynamicDialogConfig],
})

export class TablaComponent {
  @Input() turnoLista : any;
  @Output() clicked = new EventEmitter();
  @ViewChild('menu') menu: Menu;

  public turnoSelected : any = null;

  public obtenerIcono = obtenerIcono;

  dependenciaSeleted: BuscarDependenciaResRow;
  buscarDependenciaResLst: BuscarDependenciaResRow[];

  public refModal: DynamicDialogRef;

  actionsitems: MenuItem[];

  activeItem:any;
  error :any;

  constructor(public ref: DynamicDialogRef,
              public config: DynamicDialogConfig,
              private turnoService :TurnoService,
              private dialogService: DialogService)
            {
            }

  public logo(name: string): string {
    return `assets/images/${name}.png`;
  }

  public icon(name: string): string {
    return `assets/icons/${name}.svg`;
  }
  prepareAndShowMenu(event: MouseEvent, item: any,idx: any) {
    this.actionsitems = [
      {
        label: 'Modificar',
        command: () => {
          this.onEditarTurno(item);
        },
      },
      {
        label: 'Ver detalle',
        command: () => {
          this.DetallesTurno(item);
        },
      },
      {
        label: 'Eliminar',
        command: () => {
          this.confirmaEliminarTurno(idx,item);
        },
      },
    ];
    this.menu.toggle(event);
  }

  mensajeSiTurno($event):string{
    return `Este despacho se encuentra de turno del ${formatDateTextCut($event.fechaInicio)} al ${formatDateTextCut($event.fechaFin)}.`
  }
  mensajeNoTurno():string{
    return `El turno no está vigente.`
  }

  onClicked() {
    this.clicked.emit();
  }

  formatDateSimple(date:any){
    formatDate(date)
  }
  llenarvariable(grupo: any){
    this.activeItem = grupo;
  }

  DetallesTurno(indiceTurno: any){

      this.turnoSelected = indiceTurno;

      this.refModal = this.dialogService.open(
        VerTurnoFiscaliaComponent,
        {
          width: '80%',
          height: '300px',
          contentStyle: { 'padding':'10px','border-radius': '10px','top':'100px','left':'100px' },
          showHeader: false,
          data: this.turnoSelected
        });
        this.onClicked()
  }

  onEditarTurno(indiceTurno: any){

    this.turnoSelected = indiceTurno;
    this.refModal = this.dialogService.open(
      EditarTurnoComponent,
      {
        width: '1180px',
        height: 'auto'  ,
        contentStyle: { 'padding':'10px','border-radius': '10px','top':'100px','left':'100px' },
        showHeader: false,
        data:{  turnoSelected:this.turnoSelected,
                editar:true
              }
      });
      this.onClicked()
  }

  confirmaEliminarTurno(idx: any,turnoObject: any)
  { let descriptionconfirma = `A continuación, se procederá a eliminar el <b>Turno</b> para el(la) <b>${turnoObject?.despacho?.toLowerCase()}</b> de la "${turnoObject?.dependencia?.toLowerCase()}", la cual inicia el ${turnoObject?.fechaInicio?formatDateTextCut(turnoObject.fechaInicio):' '} y finaliza el ${turnoObject?.fechaFin?formatDateTextCut(turnoObject.fechaFin):' '}. ¿Está seguro de realizar esta acción?`

        this.confirmarEliminacionTurno(descriptionconfirma)
        this.refModal.onClose.subscribe({
          next: resp => {
              if ( resp === 'confirm' ) {
               this.eliminarTurno(idx,turnoObject)
              }
          }
        });
  }

  eliminarTurno(idx:any,turnoObject:any){
  let descriptionsatisfactorio = `El <b>Turno</b> para la <b>"${turnoObject?.dependencia?.toLowerCase()}"</b> perteneciente al <b>${turnoObject?.despacho?.toLowerCase()}</b>, el cual iniciaba el ${turnoObject?.fechaInicio?formatDateTextCut(turnoObject.fechaInicio):' '} y finalizaba el ${turnoObject?.fechaFin?formatDateTextCut(turnoObject.fechaFin):' '}, ha sido eliminado.`

  this.turnoService.eliminarTurno(turnoObject.idTurno,'40291777').subscribe(
    {
       next: (response) => {
        this.turnoLista.splice(idx, 1)
          this.informarEliminacionTurno(descriptionsatisfactorio);
        },
        error: (err) => {
          this.error = err;
          console.error('Error al eliminar el turno: ', err);
        }
    });
  }

  confirmarEliminacionTurno(description: string){

    this.refModal = this.dialogService.open(
      AlertModalComponent,
      {
          width: '750px',
          showHeader: false,
          contentStyle: { 'padding':'0', 'border-radius': '20px','border':'none!important' },
          data: {
              icon: 'question',
              title: 'ELIMINAR TURNO',
              confirmButtonText: 'Aceptar',
              confirm : true,
              description: description,
          }
      })
  }

  informarEliminacionTurno(description: string){

    this.refModal = this.dialogService.open(
      AlertModalComponent,
      {
          width: '750px',
          showHeader: false,
          contentStyle: { 'padding':'0', 'border-radius': '20px','border':'none!important' },
          data: {
              icon: 'success',
              title: 'TURNO ELIMINADO',
              description: description,
              confirmButtonText: 'Listo'
          }
      })
  }
  formatDateTimeTextCut(fecha:any){
    return formatDateTimeTextCut(fecha)
  }

  formatDateTimeTextCut24H(fecha:any){
    return formatDateTimeTextCut24H(fecha)
  }
}
