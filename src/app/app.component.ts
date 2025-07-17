import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { PrimeNGConfig } from 'primeng/api';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NgxSpinnerModule } from 'ngx-spinner';

@Component({
  standalone: true,
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  imports: [
    CommonModule,
    RouterModule,
    NgxSpinnerModule,
  ],
  schemas: [ CUSTOM_ELEMENTS_SCHEMA ]
})
export class AppComponent {

  title = 'cfng-sad-administracion-frontend';
  date: any;
  subscription: Subscription;

  constructor(
    private primeNGConfig: PrimeNGConfig,
    private translateService: TranslateService
  ) {

    this.translateService.setDefaultLang('es');
    this.translateService.use('es');

    this.subscription = this.translateService
      .stream('primeng')
      .subscribe((data) => {
        this.primeNGConfig.setTranslation(data);
      });
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}
