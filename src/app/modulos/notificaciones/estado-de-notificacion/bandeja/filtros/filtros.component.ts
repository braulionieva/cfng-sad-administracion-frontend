import { CommonModule } from '@angular/common';
import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { CalendarModule } from 'primeng/calendar';
import { InputTextModule } from 'primeng/inputtext';
import { debounceTime } from 'rxjs';
import {FiltroEstadoNotificacion} from "@interfaces/admin-estado-de-notificacion/estado-de-notificacion";

@Component({
  selector: 'app-filtros',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ButtonModule,
    CalendarModule,
    InputTextModule
  ],
  templateUrl: './filtros.component.html',
  styleUrls: ['./filtros.component.scss']
})
export class FiltrosComponent implements OnInit {
  @Output() filter = new EventEmitter<FiltroEstadoNotificacion>();

  tituloPage: string = 'Estados de la Cédula de Notificación y Citación';
  toggleOn: boolean = true;
  toggleIcon: string = 'pi-angle-double-down';
  filtroForm: FormGroup;

  constructor(private readonly fb: FormBuilder) {

  }

  ngOnInit(): void {
    this.initForm();
    this.setupFormSubscription();
    this.buscarEstadosCeduNotificacion()
  }

  private initForm(): void {
    this.filtroForm = this.fb.group({
      codigo: [''],
      filtroGn: [''],
      filtroGc: [''],
      filtroCn: [''],
      filtroApp: [''],
      dCreacionInicio: [null],
      dCreacionFin: [null],
      dModificacionInicio: [null],
      dModificacionFin: [null]
    });
  }

  private setupFormSubscription(): void {
    this.filtroForm.valueChanges
      .pipe(debounceTime(500))
      .subscribe(() => this.buscarEstadosCeduNotificacion());
  }

  changeToggle(): void {
    this.toggleOn = !this.toggleOn;
    this.toggleIcon = this.toggleOn ? 'pi-angle-double-up' : 'pi-angle-double-down';
  }

  private getPayload(): FiltroEstadoNotificacion {
    return {
      ...this.filtroForm.value,
    };
  }

  public buscarEstadosCeduNotificacion(): void {
    this.filter.emit(this.getPayload());
  }

  public onClearFilters(): void {
    this.filtroForm.reset();// Este reset dispara el valueChanges
    //this.buscarEstadoNotificaciones();
  }
}
