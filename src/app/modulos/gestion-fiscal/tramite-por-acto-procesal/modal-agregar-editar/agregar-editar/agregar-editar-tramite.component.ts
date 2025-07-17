import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { DynamicDialogRef } from 'primeng/dynamicdialog';
import { TableModule } from 'primeng/table';
import { TablaModalAgregarEditarTramiteComponent } from '../tabla/tabla-modal-agregar-editar-tramite.component';
import {NgIf} from "@angular/common";

@Component({
  selector: 'app-agregar-editar-tramite',
  standalone: true,
  templateUrl: './agregar-editar-tramite.component.html',
  styleUrls: ['./agregar-editar-tramite.component.scss'],
    imports: [
        TableModule,
        ButtonModule,
        TablaModalAgregarEditarTramiteComponent,
        NgIf
    ]
})
export class AgregarEditarTramiteComponent implements OnInit {
  @Input() idTramite: string = '';
  @Input() nombreTramite: string = '';
  @Input() showActions: boolean = false;
  @Output() anterior = new EventEmitter();

  loading: boolean = false;
  error: any;

  constructor(public ref: DynamicDialogRef) {
    // This is intentional
  }

  ngOnInit() {
    // This is intentional
  }

  previusPage(): void{
    this.anterior.emit();
  }

  public close(): void {
    this.ref.close();
  }

}
