import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { TooltipModule } from 'primeng/tooltip';
import { AgregarEditarDistribucionAleatoriaComponent } from '../../agregar-editar/agregar-editar-distribucion-aleatoria.component';
import { obtenerIcono } from '@utils/icon';
import { CmpLibModule } from 'ngx-mpfn-dev-cmp-lib';

@Component({
  selector: 'app-acciones-distribucion-aleatoria',
  standalone: true,
  imports: [
    CommonModule,
    ButtonModule,
    TooltipModule,
    CmpLibModule
  ],
  templateUrl: './acciones-distribucion-aleatoria.component.html',
  styleUrls: ['./acciones-distribucion-aleatoria.component.scss']
})
export class AccionesDistribucionAleatoriaComponent implements OnInit {

  @Input() totalElementos: number = 0;
  @Input() inNotaPeriodo: boolean = false;
  @Output() exportar = new EventEmitter<any>();
  @Output() refrescar = new EventEmitter();

  // displayAgregar:boolean = false;
  public refModal: DynamicDialogRef;
  public obtenerIcono = obtenerIcono;
  constructor(
    public dialogService: DialogService
  ) { }

  ngOnInit() {
    // This is intentional
  }

  public icon(name: string): string {
    return `assets/icons/${name}.svg`;
  }

  exportarBandeja() {
    this.exportar.emit();
  }

  onOpenAgregarGrupoModal() {

    this.refModal = this.dialogService.open(
      AgregarEditarDistribucionAleatoriaComponent,
      {
        width: '1180px',
        showHeader: false,
        data: {
          tipo: 'agregar'
        }
      });
    this.refModal.onClose.subscribe((data: any) => {
      console.log("data retorno:",data)
      if(data?.id==1){
        this.refrescar.emit();
      }
     });


  }

}
