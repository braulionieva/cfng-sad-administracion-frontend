import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { VERSION } from '@environments/environment';

@Component({
  standalone: true,
  selector: 'app-tab-navigation',
  templateUrl: './tab-navigation.component.html',
  styleUrls: ['./tab-navigation.component.scss'],
  imports: [CommonModule],
})
export class TabNavigationComponent {
  public version: string = VERSION;
}
