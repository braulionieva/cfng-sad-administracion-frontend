import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MostrarMisAplicacionesService } from '@services/mostrar-mis-aplicaciones/mostrar-mis-aplicaciones.service';
import { DynamicDialogRef } from 'primeng/dynamicdialog';
import { Auth2Service } from '@services/auth/auth2.service';
import { RequestCategoria } from '@interfaces/mis-aplicaciones/mis-aplicaciones';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-listar-mis-aplicaciones-header',
  standalone: true,
  templateUrl: './listar-mis-aplicaciones-header.component.html',
  styleUrls: ['./listar-mis-aplicaciones-header.component.scss'],
  imports: [CommonModule, RouterModule],
})
export class ListarMisAplicacionesHeaderComponent {
  error: any;
  userInfo: any;
  coUser: string;

  /**
  // misAplicaciones: any =
  //   [
  //     // {
  //     //   categoria: {
  //     //     "id": 1,
  //     //     "nombre": "Carpeta Fiscal Electrónica"
  //     //   },
  //     //   sistemas: [
  //     //     {
  //     //       "id": 1,
  //     //       "nombre": "Expediente Fiscal Electrónico"
  //     //     },
  //     //     {
  //     //       "id": 2,
  //     //       "nombre": "Sistema de administración de usuarios"
  //     //     },
  //     //     // {
  //     //     //   "id": 3,
  //     //     //   "nombre": "sistema3"
  //     //     // }
  //     //   ]
  //     // },
  //     // // {
  //     // //   categoria: {
  //     // //     "id": 2,
  //     // //     "nombre": "categoria 2"
  //     // //   },
  //     // //   sistemas: [
  //     // //     {
  //     // //       "id": 4,
  //     // //       "nombre": "sistema4"
  //     // //     }
  //     // //     // {
  //     // //     //   idSistema: 5,
  //     // //     //   sistema: "sistema5"
  //     // //     // },
  //     // //     // {
  //     // //     //   idSistema: 6,
  //     // //     //   sistema: "sistema6"
  //     // //     // }
  //     // //   ]
  //     // // }
  //   ];**/

  sistemas: any[];

  constructor(
    public ref: DynamicDialogRef,
    private mostrarMisAplicacionesService: MostrarMisAplicacionesService,
    private userService: Auth2Service
  ) {}

  ngOnInit() {
    this.userInfo = this.userService.getUserInfo();
    this.coUser = this.userInfo?.usuario?.usuario;
    const request: RequestCategoria = { coUser: this.coUser };
    this.mostrarMisAplicacionesService
      .getMisAccesosAplicacionesHeaderTop(request)
      .subscribe({
        next: (response) => {
          this.sistemas = response;
        },
        error: (err) => {
          this.error = err;
        },
      });
  }

  public icon(name: string): string {
    return `assets/icons/${name}.svg`;
  }

  public close(): void {
    this.ref.close();
  }

  public navegarAUrl(url: string, nombre: string): void {
    if (nombre === 'SISTEMA DE ADMINISTRACION DE USUARIOS') {
      // No hacer nada si es el sistema actual
      return;
    }
    this.close();
    window.open(url, '_blank');
  }
}
