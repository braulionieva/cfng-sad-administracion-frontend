import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { AlertData } from '../../../core/interfaces/alert';
import { IconType } from '@core/types/IconType';
import { ButtonModule } from 'primeng/button';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { TableModule } from 'primeng/table';

@Component({
  selector: 'app-alert-modal-masivo',
  standalone: true,
  imports: [CommonModule, ButtonModule, TableModule],
  templateUrl: './alert-modal-masivo.component.html',
  styleUrls: ['./alert-modal-masivo.component.scss']
})
export class AlertModalMasivoComponent {
  public icon: IconType = this.config.data.icon || 'error';
  public title: string = this.config.data.title || '';
  public confirmButtonText: string = this.config.data.confirmButtonText || 'Confirmar';
  public cancelButtonText: string = this.config.data.cancelButtonText || 'Cancelar';
  public irHechosCasosButtonText: string = this.config.data.irHechoCasoButtonText || 'Cancelar';
  public confirm: boolean = this.config.data.confirm || false;
  public confirmHechosCasos: boolean = this.config.data.confirmHechosCasos || false;
  public ocultarBotones: boolean = this.config.data?.ocultarBotones || false;
  public noRegistradosList: any = this.config.data?.noRegistrados || null;
  public subtitle: string = this.config.data?.subtitle || '';
  public description: string = this.config.data.description || '';
  public turno: boolean = this.config.data?.turno || false;

  constructor(
    public readonly ref: DynamicDialogRef,
    public readonly config: DynamicDialogConfig<AlertData>,
    private readonly sanitizer: DomSanitizer
  ) { }

  get closeIcon(): string {
    return `assets/icons/close_new.svg`;
  }

  get alertIcon(): string {
    return `assets/icons/${this.icon}.svg`;
  }

  get showDescription(): boolean {
    return this.description !== '';
  }

  public getDescription(): any {
    return this.sanitizer.bypassSecurityTrustHtml(this.description);
  }

  public confirmAction(): void {
    this.ref.close('confirm');
  }

  public cancelAction(): void {
    this.ref.close('cancel');
  }

  public closeAction(): void {
    this.ref.close('closed');
  }
}
