import { Injectable } from '@angular/core';
import {AlertModalComponent} from "@components/alert-modal/alert-modal.component";
import {DialogService, DynamicDialogRef} from "primeng/dynamicdialog";

@Injectable({
  providedIn: 'root'
})
export class ModalNotificationService {

  public refModal: DynamicDialogRef;

  constructor(
    public dialogService: DialogService,
  ) { }

  private openDialog(icon: string, title: string, description: string): void {
    this.refModal = this.dialogService.open(AlertModalComponent, {
      width: '700px',
      showHeader: false,
      data: {
        icon,
        title,
        description,
        confirmButtonText: 'Listo'
      },
    });
  }

  public dialogSuccess(title: string, description: string): void {
    this.openDialog('success', title, description);
  }

  public dialogWarning(title: string, description: string): void {
    this.openDialog('warning', title, description);
  }

  public dialogError(title: string, description: string): void {
    this.openDialog('error', title, description);
  }

}
