import { CommonModule } from "@angular/common";
import { Component } from "@angular/core";
import { IconType } from "@core/types/IconType";
import { AlertData } from "@interfaces/alert";
import { ButtonModule } from "primeng/button";
import { DynamicDialogRef, DynamicDialogConfig } from "primeng/dynamicdialog";

@Component({
  selector: 'app-alert-modal',
  standalone: true,
  imports: [CommonModule, ButtonModule],
  templateUrl: './alert-modal.component.html',
  styleUrls: ['./alert-modal.component.scss'],
})
export class AlertModalComponent {
  public icon: IconType = this.config.data.icon || 'iInfo';
  public title: string = this.config.data.title || '';
  public confirmButtonText: string = this.config.data.confirmButtonText || 'Confirmar';
  public confirmButtonColor: string = this.config.data.confirmButtonColor || '#0000FF';
  public description: string = this.config.data.description || '';
  public cancelButtonText: string = this.config.data.cancelButtonText || 'Cancelar';
  public irHechosCasosButtonText: string = this.config.data.irHechoCasoButtonText || 'Cancelar';
  public confirm: boolean = this.config.data.confirm || false;
  public confirmHechosCasos: boolean = this.config.data.confirmHechosCasos || false;
  public hiddenButtons: boolean = this.config.data.ocultarBotones || false;

  constructor(
    public readonly ref: DynamicDialogRef,
    public readonly config: DynamicDialogConfig<AlertData>,
  ) { }

  get closeIcon(): string {
    return 'assets/icons/close_new.svg';
  }

  get alertIcon(): string {
    return `assets/icons/${this.icon}.svg`;
  }

  get showDescription(): boolean {
    return this.description !== '';
  }

  public getDescription(): any {
    return this.description;
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
