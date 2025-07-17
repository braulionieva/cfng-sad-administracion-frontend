import { CommonModule } from '@angular/common';
import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { Auth2Service } from '@services/auth/auth2.service';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { DialogService } from 'primeng/dynamicdialog';
import { catchError, tap } from 'rxjs';
import { UtilTokenService } from '@services/auth/util.service';
import { JwtPayload } from '@interfaces/sesion/sesion';

@Component({
  standalone: true,
  selector: 'app-modal-confirm-close',
  templateUrl: './modal-confirm-close.component.html',
  styleUrls: ['./modal-confirm-close.component.scss'],
  imports: [CommonModule, ReactiveFormsModule, DialogModule, ButtonModule],
  providers: [DialogService],
})
export class ModalConfirmCloseComponent {
  private readonly auth2Service: Auth2Service = inject(Auth2Service);
  private readonly utilTokenService: UtilTokenService =
    inject(UtilTokenService);

  @Input() visible: boolean;

  @Output() close = new EventEmitter<boolean>();
  @Output() visibleChange = new EventEmitter<boolean>();
  @Output() clicked = new EventEmitter<void>();

  protected cierraModal() {
    this.visible = false;
    this.visibleChange.emit(this.visible);
  }

  protected onClicked() {
    const token: JwtPayload = this.utilTokenService.getDecodedToken();
    const { sub } = token;
    // const username = JSON.parse(sub);
    const username = sub;

    this.auth2Service
      .logoutSesion(username)
      .pipe(
        tap(() => {
          this.clicked.emit();
          this.visible = false;
          this.visibleChange.emit(this.visible);
        }),
        catchError((error) => {
          throw error;
        })
      )
      .subscribe()
      .add(() => {});
  }

  protected icon(name: string): string {
    return `assets/icons/${name}.svg`;
  }
}
