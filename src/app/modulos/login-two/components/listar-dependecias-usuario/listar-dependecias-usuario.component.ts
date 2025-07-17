import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { DropdownModule } from 'primeng/dropdown';
import { ButtonModule } from 'primeng/button';
import { Auth2Service } from "@services/auth/auth2.service";
import { ActivatedRoute } from "@angular/router";

@Component({
  selector: 'app-listar-dependecias-usuario',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, DropdownModule, ButtonModule],
  templateUrl: './listar-dependecias-usuario.component.html',
  styleUrls: ['./listar-dependecias-usuario.component.scss'],
  providers: [Auth2Service]
})
export class ListarDependeciasUsuarioComponent implements OnInit {
  private username: string;
  public myForm: FormGroup;
  public nombreUsuario: string;
  public tiposDistribucion: any;
  public textoSeleccionDependencia: string = 'Usted se encuentra habilitado para trabajar en más de una dependencia, por favor seleccione la dependencia/fiscalía en la cual desea trabajar:';
  public textoWarnig: string = 'Para iniciar sesión en una dependencia distinta usted deberá cerrar sesión e ingresar nuevamente seleccionando otra dependencia/fiscalía.';

  private readonly auth2Service: Auth2Service = inject(Auth2Service);
  private readonly route: ActivatedRoute = inject(ActivatedRoute);
  private readonly fb: FormBuilder = inject(FormBuilder);

  constructor() {
    this.nombreUsuario = 'Augusto Braulio José Nieva Cruz';
    this.myForm = this.fb.group({
      dependenciaUsuario: [null]
    });
  }

  ngOnInit(): void {
    this.username = this.route.snapshot.paramMap.get('username');
    this.obtenerDependenciasUsuario();
  }

  private obtenerDependenciasUsuario() {
    this.auth2Service
      .obtenerDependenciasUsuario(this.username)
      .subscribe({
        next: (resp) => {
          resp.map(r => (
            this.tiposDistribucion = [{
              label: r.nombreCombo,
              value: r.idDependenciaUsuario
            }]
          ));
        },
        error: (error) => {
          console.error('Error al validar la dependencia del usuario', error);
        }
      });
  }
}
