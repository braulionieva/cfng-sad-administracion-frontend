import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { InputTextModule } from 'primeng/inputtext';
import { MessageService } from 'primeng/api';
import { AgregarServidorComponent } from "../../agregar-servidor/agregar-servidor.component";

@Component({
    selector: 'app-acciones',
    standalone: true,
    providers: [MessageService],
    templateUrl: './acciones.component.html',
    styleUrls: ['./acciones.component.scss'],
    imports: [
        CommonModule,
        ButtonModule,
        InputTextModule,
        ToastModule,
        AgregarServidorComponent
    ]
})
export class AccionesComponent {

  @Input() totalElementos : number = 0;
  @Output() exportar = new EventEmitter<any>();
  public displayModalAgregar : boolean;

  constructor(public messageService: MessageService) {
    this.displayModalAgregar = false;
  }

  public icon(name: string): string {
    return `assets/icons/${name}.svg`;
  }

  public exportarBandeja(): void{
    
    this.exportar.emit();
    
  }

  public mostrarModalAgregar() : void {
    this.displayModalAgregar = true;
  }

}
