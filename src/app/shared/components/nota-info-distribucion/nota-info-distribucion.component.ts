import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { DESCRIPCION_CORTA_TIPO_DISTRIBUCION } from '@constants/constantes';
import { IconType } from '@core/types/IconType';
import { obtenerIcono } from '@utils/icon';
import { CmpLibModule } from 'ngx-mpfn-dev-cmp-lib';

@Component({
  selector: 'app-nota-info-distribucion',
  standalone: true,
  imports: [
    CommonModule,
    CmpLibModule,
  ],
  templateUrl: './nota-info-distribucion.component.html',
  styleUrls: ['./nota-info-distribucion.component.scss']
})
export class NotaInfoDistribucionComponent implements OnInit {
  @Input() nota: any;
  @Input() tipo: any;
  @Input() description: string = '';

  icon: IconType = 'iInfo';
  // color: string = '#F7EED4';
  bgColor: string = '#F7EED4';
  iconColor: string = '#F19700';

  public obtenerIcono = obtenerIcono;
  constructor(private readonly sanitizer: DomSanitizer) { }

  ngOnInit(): void {
   
    const tipo_corto = this.tipo == 1 ?
      DESCRIPCION_CORTA_TIPO_DISTRIBUCION.POR_DESPACHO :
      DESCRIPCION_CORTA_TIPO_DISTRIBUCION.POR_FISCAL

    switch (this.nota) {
      case 'ACTIVA':
        this.description = "<b>Nota:</b> Tener en cuenta que si no se modifica el \"Estado\" de un " + tipo_corto + ", este será configurado" +
          " y registrado como ACTIVO. Así mismo, si no se modifica la columna \"¿Considera Turno?\", por defecto será registrado como \"Si\".";
        this.icon = 'iInfo';
        this.bgColor = '#F7EED4';
        this.iconColor = '#F19700';
        break;

      case 'CAMBIA':
        this.description = "<b>Nota:</b> Tener en cuenta que se está intentando registrar una fiscalía de una especialidad diferente a la del Grupo Aleatorio.";
        this.icon = 'iInfo';
        this.bgColor = '#F7EED4';
        this.iconColor = '#F19700';
        break;

      case 'DUPLICADO':
        this.description = "<b>Nota:</b> La fiscalía que intentas registrar ya pertenece a este grupo aleatorio. Por favor, revisa los datos e inténtalo nuevamente.";
        this.icon = 'iAlert';
        this.bgColor = '#F7EED4';
        this.iconColor = '#F19700';
        break;

      case 'MINIMO':
        this.description = "<b>Nota:</b> Para el registro de una fiscalía, se debe tener como mínimo un " + tipo_corto + " en estado \"Activo\"." +
          " Por favor, revise nuevamente los datos e inténtelo nuevamente.";
        this.icon = 'iAlert';
        this.bgColor = '#F7EED4';
        this.iconColor = '#F19700';
        break;

      case 'GUARDADO':
        this.description = 'La información ha sido actualizada con éxito';
        this.icon = 'iCheck';
        this.bgColor = '#d4f7d9';
        this.iconColor = '#008000';;
        break;

      case 'FALTA':
        this.description = 'Aún existen registro(s) sin actualizar. Por favor, ingresar la información solicitada para poder continuar.';
        this.icon = 'iClose';
        this.bgColor = '#F4D8D8';
        this.iconColor = '#C1292E';
        break;

      default:
        this.icon = 'iCheck';
        this.bgColor = '#d4f7d9';
        this.iconColor = '#008000';;
    }
  }

  public alertIcon(name: string): string {
    return `assets/icons/${name}.svg`;
  }

  public getDescription(): any {
    return this.sanitizer.bypassSecurityTrustHtml(this.description);
  }

}
