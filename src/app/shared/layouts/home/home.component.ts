import { Component, OnInit } from '@angular/core';
import { HeaderComponent } from './components/header/header.component';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { TabNavigationComponent } from './components/tab-navigation/tab-navigation.component';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  standalone: true,
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  imports: [
    CommonModule,
    HeaderComponent,
    TabNavigationComponent,
    SidebarComponent,
    RouterModule,
  ],
})
export class HomeComponent implements OnInit {
  public sidebarCollapsed: boolean = false;

  constructor() {
    // This is intentional
  }

  ngOnInit() {
    // This is intentional
  }

  public actualizarSidebarCollapsed($event) {
    this.sidebarCollapsed = $event;
  }
}
