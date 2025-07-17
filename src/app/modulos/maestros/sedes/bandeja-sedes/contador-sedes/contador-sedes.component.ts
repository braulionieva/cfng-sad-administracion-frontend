import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-contador-sedes',
  standalone: true,
  templateUrl: './contador-sedes.component.html',
  styleUrls: ['./contador-sedes.component.scss']
})
export class ContadorSedesComponent {

  @Input() totalElementos : number = 0;

  constructor() {
    // This is intentional
  }
}
