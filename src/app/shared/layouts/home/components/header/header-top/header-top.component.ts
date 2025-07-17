import { Component } from '@angular/core';
import { ListarMisAplicacionesHeaderComponent } from '@modulos/sistemas/listar-mis-aplicaciones/header/listar-mis-aplicaciones-header.component';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { TokenService } from '@services/shared/token.service';

@Component({
  selector: 'app-header-top',
  standalone: true,
  templateUrl: './header-top.component.html',
  styleUrls: ['./header-top.component.scss'],
  providers: [DialogService],
})
export class HeaderTopComponent {
  public refModal: DynamicDialogRef;
  protected usuarioToken: any;
  public fiscalia: string = '';

  constructor(
    private dialogService: DialogService,
    private tokenService: TokenService
  ) {
    this.usuarioToken = this.tokenService.getDecoded().usuario;
  }

  ngOnInit(): void {
    this.fiscalia =
      this.usuarioToken.dependencia +
      '-' +
      this.usuarioToken.distrito +
      '-' +
      this.usuarioToken.despacho;
  }

  mostrarMisAplicaciones(event: MouseEvent) {
    const target = event.currentTarget as HTMLElement;
    const rect = target.getBoundingClientRect();
    const resetearContrasenaDialog = {};
    this.refModal = this.dialogService.open(
      ListarMisAplicacionesHeaderComponent,
      {
        width: '800px',
        showHeader: false,
        data: resetearContrasenaDialog,
        contentStyle: { padding: '0px' },
        style: {
          position: 'absolute',
          top: `${rect.bottom + window.scrollY + 2}px`,
          left: `${rect.left}px`,
          padding: '0px',
        },
        dismissableMask: true,
      }
    );
  }
}
