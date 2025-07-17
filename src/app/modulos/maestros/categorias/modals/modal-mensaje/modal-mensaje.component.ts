import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { ButtonModule } from 'primeng/button';

@Component({
  standalone: true,
  selector: 'app-modal-mensaje',
  templateUrl: './modal-mensaje.component.html',
  styleUrls: ['./modal-mensaje.component.scss'],
  imports: [CommonModule, ButtonModule],
})
export class ModalMensajeComponent implements OnInit {
  protected icon = '';
  protected title = '';
  protected subTitle = '';
  protected textButton = '';
  protected textButtonSecondary = '';
  protected showOnlySecondaryButton: boolean = false;

  constructor(
    private readonly ref: DynamicDialogRef,
    public readonly config: DynamicDialogConfig
  ) { }

  ngOnInit(): void {
    this.setData();
  }

  setData() {
    if (this.config) {
      if (this.config.data.icon)
        this.icon = this.config.data.icon;

      if (this.config.data.title)
        this.title = this.config.data.title;

      if (this.config.data.subTitle)
        this.subTitle = this.config.data.subTitle;

      if (this.config.data.textButton)
        this.textButton = this.config.data.textButton;

      if (this.config.data.textButtonSecondary)
        this.textButtonSecondary = this.config.data.textButtonSecondary;

      if (this.config.data.showOnlySecondaryButton !== undefined)
        this.showOnlySecondaryButton = this.config.data.showOnlySecondaryButton;
    }
  }

  public iconX(name: string): string {
    return `assets/icons/${name}.svg`;
  }

  clickAction() {
    if (this.config.data.onConfirm)
      this.config.data.onConfirm();

    this.closeModal();
  }

  closeModal() {
    this.ref.close();
  }

  get alertIcon(): string {
    return `assets/icons/${this.icon}.svg`;
  }
}
