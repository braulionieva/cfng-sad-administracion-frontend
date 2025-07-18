
import { Component} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ButtonModule} from "primeng/button";
import { FormGroup, ReactiveFormsModule} from "@angular/forms";
import { MessagesModule } from 'primeng/messages';
import { Message } from 'primeng/api/message';
import { Subscription } from 'rxjs';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { formatDateTextCut, formatDateTimeTextCut} from '@utils/utils';

@Component({
  selector: 'app-ver-turno-fiscalia',
  standalone: true,
  imports: [  CommonModule,
    ButtonModule,
    ReactiveFormsModule,
    MessagesModule],
  templateUrl: './ver-turno-fiscalia.component.html',
  styleUrls: ['./ver-turno-fiscalia.component.scss']
})
export class VerTurnoFiscaliaComponent {

  public tituloModal : string;
  infoMessage: Message[];
  turno:any;
  public validacion: any;

  public formularioVerTurno: FormGroup;

  public subscriptions: Subscription[] = [];

  constructor(public ref: DynamicDialogRef,
              public config: DynamicDialogConfig) {

    this.turno = this.config?.data;

   }
  ngOnInit(): void {
    this.infoMessage = [
      {
        severity: 'warn',
        summary: 'Nota:',
        detail:
          'Tener en cuenta solo se permite registrar el turno fiscal desde la fecha actual o una fecha futura (no se pueden registrar turno con fechas ya pasadas o anteriores).',
      },
    ];
  }

  close() {
   this.ref.close()
  }

  public icon(name: string): string {
    return `assets/icons/${name}.svg`;
  }

  formatDateTextCut(fecha:any){
    return formatDateTextCut(fecha)
  }
  formatDateTimeTextCut(fecha:any){
    return formatDateTimeTextCut(fecha)
  }
}

