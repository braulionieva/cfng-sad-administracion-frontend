import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { IconType } from '@core/types/IconType';
import { obtenerIcono } from '@utils/icon';
import { CmpLibModule } from 'ngx-mpfn-dev-cmp-lib';

@Component({
  selector: 'app-nota-info',
  standalone: true,
  imports: [
    CommonModule,
    CmpLibModule,
  ],
  templateUrl: './nota-info.component.html',
  styleUrls: ['./nota-info.component.scss']
})
export class NotaInfoComponent {
  @Input() icon: IconType = 'iInfo';
  @Input() name: IconType = 'iInfo';
  @Input() description: string = '';
  @Input() color: string = '#F7EED4';
  @Input() bgColor: string = '#F7EED4';
  @Input() iconColor: string = '#F7EED4';

  public obtenerIcono = obtenerIcono;
  constructor(
    private readonly sanitizer: DomSanitizer
  ) { }

  public alertIcon(name: string): string {
    return `assets/icons/${this.name}.svg`;
  }

  public getDescription(): any {
    return this.sanitizer.bypassSecurityTrustHtml(this.description);
  }
}