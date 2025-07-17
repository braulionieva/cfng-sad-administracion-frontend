import { CommonModule } from '@angular/common';
import { Component, Input, EventEmitter, Output } from '@angular/core';
import { TipoIcono } from '@core/types/IconType';
import { CmpLibModule } from 'ngx-mpfn-dev-cmp-lib';
import { iHome } from 'ngx-mpfn-dev-icojs-regular';
import { Subscription } from "rxjs";
import { Tab } from '@interfaces/comunes/tab';

@Component({
  standalone: true,
  selector: 'app-tabs-view',
  templateUrl: './tabs-view.component.html',
  styleUrls: ['./tabs-view.component.scss'],
  imports: [
    CommonModule,
    CmpLibModule
  ]
})
export class TabsViewComponent {
  @Input() tabs: Tab[] = []
  @Input() indexSeleccionado: number = 0
  @Input() classContainer: string = ''
  @Output() onChangeIndex = new EventEmitter<number>();

  public subscriptions: Subscription[] = [];

  obtenerIcono(tipoIcono: TipoIcono): any {
    let icono = undefined
    if (tipoIcono === 'home') {
      icono = iHome;
    }
    return icono;
  }

  protected eventSeleccionar(index: number) {
    if (this.indexSeleccionado === index) {
      return;
    }
    this.indexSeleccionado = index;
    this.onChangeIndex.next(index);
  }

}
