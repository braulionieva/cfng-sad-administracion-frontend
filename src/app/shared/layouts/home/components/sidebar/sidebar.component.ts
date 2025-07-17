import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { Constants } from '@constants/constantes';
import { Option, Module } from '@interfaces/module';
import { Auth2Service } from '@services/auth/auth2.service';
import { MenuService } from '@services/menu/menu.service';
import { filter } from 'rxjs';

@Component({
  standalone: true,
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss'],
  imports: [CommonModule, RouterModule],
})
export class SidebarComponent implements OnInit {
  @Input() collapsed: boolean;
  @Output() onSidebarCollapse = new EventEmitter<boolean>();

  private readonly MD_SIZE: number = 993;

  protected readonly usuarioActual = this.userService.getUserInfo(); // Información del usuario en sesion

  private RUTA_ACTUAL: string = '';
  protected elements: any[] = [];
  protected idSelected: number = 0;

  private idAplication: string;

  constructor(
    private router: Router,
    private menuService: MenuService,
    private readonly userService: Auth2Service
  ) {
    this.idAplication = sessionStorage.getItem(Constants.ID_APPLICATION);
    /***this.idAplication = '7';***/
  }

  ngOnInit() {
    this.obtenerModulosMenu();
    //this.obtenerModulosMenuLocal();

    this.router.events.pipe(filter(event => event instanceof NavigationEnd)).subscribe((event: NavigationEnd) => {
      const urlActual = event.urlAfterRedirects;

      for (const element of this.elements) {
        const optPadre = this.buscarUrlEnOpciones(element, urlActual);

        const existsCode = optPadre?.options.some((x) => x.idOrder === this.idSelected);

        if (optPadre && !existsCode) {
          this.elementoSeleccionado(optPadre);

          for (const opt of optPadre.options) {
            const optHijo = this.buscarUrlEnOpciones(opt, urlActual);

            if (optHijo)
              this.elementoSeleccionado(optHijo, opt.idOrder);
          }
        }
      }
    });
  }

  private buscarUrlEnOpciones(element: any, url: string) {
    if (url.includes(element.url)) {
      return element;
    }

    for (const option of element.options) {
      const result = this.buscarUrlEnOpciones(option, url);

      if (result) {
        return element;
      }
    }

    return null;
  }


























  private obtenerModulosMenu() {
    const data = {
      usuario: this.usuarioActual?.usuario.usuario,
      codigoAplicacion: this.idAplication,
    };
    this.menuService.obtenerModulosMenu(data).subscribe({
      next: (res) => {
        if (!res) return;

        this.elements = this.establecerIndexElementos(res);
        this.RUTA_ACTUAL = this.extraerUrlInicial(this.elements);
        if (!this.RUTA_ACTUAL) return;

        this.router.navigate([`app/${this.RUTA_ACTUAL}`]);
        this.seleccionInicial(this.elements, this.RUTA_ACTUAL);
      },
      error: (err) => {
        console.error(
          'Error en la solicitud [listarOpcionesByUsuarioApliacion]: ',
          err
        );
      },
    });
  }

  private establecerIndexElementos(elements: Module[]): Module[] {
    let list: Module[] = [...elements];
    let index: number = 0;

    elements.forEach((x) => {
      index++;
      x.idOrder = index;
      if (x.options && Array.isArray(x.options)) {
        x.options.forEach((child) => {
          index++;
          child.idOrder = index;
        });
      }
    });

    return list;
  }

  private seleccionInicial(elements, url) {
    for (const item of elements) {
      // Si tiene hijos, verificando si el url coincide en algun chldren
      if (item.options && item.options.length > 0) {
        for (const option of item.options) {
          if (option.url === url) {
            item.extended = true;
            this.idSelected = option.idOrder;
            return;
          }
        }
      }
    }
  }

  private extraerUrlInicial(elements: any[]): string | null {
    if (
      elements.length > 0 &&
      elements[0].options &&
      Array.isArray(elements[0].options) &&
      elements[0].options.length > 0 &&
      elements[0].options[0].url
    ) {
      return elements[0].options[0].url;
    }
    return null;
  }

  public elementoSeleccionado(element: any | Option, moduleId?: number) {
    if (element.url && element.url !== '') {
      this.idSelected = element.idOrder;
    }
    // si no se recibe un moduleId, la funcion se ejecuta desde un modulo y no desde una opcion
    if (!moduleId) {
      this.alternarModuloSeleccionado(element);
    }
  }

  public alternarModuloSeleccionado(modulo): void {
    const valorOpcionSeleccionada = modulo.extended;

    this.elements.forEach((element) => {
      element.extended = false;
    });

    modulo.extended = !valorOpcionSeleccionada;
  }

  public alternarSidebarColapsado(): void {
    this.onSidebarCollapse.emit(!this.collapsed);
  }

  public onWindowResize($event: any): void {
    if (!$event) return;

    this.onSidebarCollapse.emit($event.target.innerWidth < this.MD_SIZE);
  }

  get urlMenuIcon(): string {
    return 'assets/icons/menu.svg';
  }

  get urlDropDown(): string {
    return 'assets/icons/downrow.svg';
  }

  get urlMenuCollapsedIcon(): string {
    return 'assets/icons/collapsed.svg';
  }

  private obtenerModulosMenuLocal() {
    // Validación de entorno al inicio del método
    const currentHost = window.location.hostname;
    if (currentHost !== 'localhost' && currentHost !== '127.0.0.1') {
      console.error(
        'Error: Este método solo puede ser ejecutado en ambiente local'
      );
      return;
    }

    this.idAplication = '7';
    const modulosMenu = [
      {
        idOrder: 1,
        idAplicacion: 1334,
        code: '001',
        name: 'Administrar cuenta',
        url: 'https://sad.mpfn.gob.pe/admin-cuenta',
        count: 0,
        extended: false,
        idAplicacionPadre: 7,
        options: [
          {
            idOrder: 1,
            idAplicacion: 1335,
            code: '001',
            name: 'Seguridad',
            url: 'seguridad-cuenta',
            count: 0,
            extended: false,
            idAplicacionPadre: 1334,
            options: [],
          },
        ],
      },
      {
        idOrder: 2,
        idAplicacion: 150,
        code: '002',
        name: 'Maestros',
        url: 'https://sad.mpfn.gob.pe/maestros',
        count: 0,
        extended: false,
        idAplicacionPadre: 7,
        options: [
          {
            idOrder: 1,
            idAplicacion: 161,
            code: '001',
            name: 'Sedes',
            url: 'administracion-menu/administracion-de-sede',
            count: 0,
            extended: false,
            idAplicacionPadre: 150,
            options: [],
          },
          {
            idOrder: 2,
            idAplicacion: 162,
            code: '002',
            name: 'Fiscalías',
            url: 'administrar-dependencia',
            count: 0,
            extended: false,
            idAplicacionPadre: 150,
            options: [],
          },
          {
            idOrder: 3,
            idAplicacion: 1353,
            code: '003',
            name: 'Despachos',
            url: 'bandeja-despachos',
            count: 0,
            extended: false,
            idAplicacionPadre: 150,
            options: [],
          },
          {
            idOrder: 4,
            idAplicacion: 163,
            code: '004',
            name: 'Cargos',
            url: 'cargos',
            count: 0,
            extended: false,
            idAplicacionPadre: 150,
            options: [],
          },
          {
            idOrder: 5,
            idAplicacion: 164,
            code: '005',
            name: 'Categorías',
            url: 'aplicaciones-categorias',
            count: 0,
            extended: false,
            idAplicacionPadre: 150,
            options: [],
          },
          {
            idOrder: 6,
            idAplicacion: 1336,
            code: '006',
            name: 'Fiscalias padre',
            url: 'configurar-fiscalia-padre',
            count: 0,
            extended: false,
            idAplicacionPadre: 150,
            options: [],
          },
        ],
      },
      {
        idOrder: 3,
        idAplicacion: 151,
        code: '003',
        name: 'Notificaciones',
        url: 'https://sad.mpfn.gob.pe/notificaciones',
        count: 0,
        extended: false,
        idAplicacionPadre: 7,
        options: [
          {
            idOrder: 1,
            idAplicacion: 181,
            code: '001',
            name: 'Centrales de Notificación',
            url: 'centrales-notificacion',
            count: 0,
            extended: false,
            idAplicacionPadre: 151,
            options: [],
          },
          {
            idOrder: 2,
            idAplicacion: 182,
            code: '002',
            name: 'Cobertura de Central',
            url: 'cobertura-central',
            count: 0,
            extended: false,
            idAplicacionPadre: 151,
            options: [],
          },
          {
            idOrder: 3,
            idAplicacion: 183,
            code: '003',
            name: 'Estado de Notificación',
            url: 'centrales-notificacion/estado-de-notificacion',
            count: 0,
            extended: false,
            idAplicacionPadre: 151,
            options: [],
          },
        ],
      },
      {
        idOrder: 4,
        idAplicacion: 152,
        code: '004',
        name: 'Gestión Fiscal',
        url: 'https://sad.mpfn.gob.pe/gestion-fiscal',
        count: 0,
        extended: false,
        idAplicacionPadre: 7,
        options: [
          {
            idOrder: 1,
            idAplicacion: 185,
            code: '001',
            name: 'Actos procesales',
            url: 'administracion-casos/administracion-de-acto-procesal',
            count: 0,
            extended: false,
            idAplicacionPadre: 152,
            options: [],
          },
          {
            idOrder: 2,
            idAplicacion: 1337,
            code: '002',
            name: 'Calendario de dias no laborables',
            url: 'calendario-no-laborables',
            count: 0,
            extended: false,
            idAplicacionPadre: 152,
            options: [],
          },
          {
            idOrder: 3,
            idAplicacion: 1338,
            code: '003',
            name: 'Contenido Obligatorio en Intermedia',
            url: 'etapa-intermedia',
            count: 0,
            extended: false,
            idAplicacionPadre: 152,
            options: [],
          },
          {
            idOrder: 4,
            idAplicacion: 1339,
            code: '004',
            name: 'Firma de Documentos',
            url: 'firma-documentos',
            count: 0,
            extended: false,
            idAplicacionPadre: 152,
            options: [],
          },
          {
            idOrder: 5,
            idAplicacion: 187,
            code: '005',
            name: 'Plazos de etapa, acto y trámite',
            url: 'plazos-etapa-acto-tramite',
            count: 0,
            extended: false,
            idAplicacionPadre: 152,
            options: [],
          },
          {
            idOrder: 6,
            idAplicacion: 1355,
            code: '006',
            name: 'Plazos detención flagrancia',
            url: 'plazos-detencion',
            count: 0,
            extended: false,
            idAplicacionPadre: 152,
            options: [],
          },
          {
            idOrder: 7,
            idAplicacion: 1356,
            code: '007',
            name: 'Plazos Documentos Observados',
            url: 'plazo-doc-obs',
            count: 0,
            extended: false,
            idAplicacionPadre: 152,
            options: [],
          },
          {
            idOrder: 8,
            idAplicacion: 1357,
            code: '008',
            name: 'Plazos Bandeja Derivación',
            url: 'configuracion-plazos',
            count: 0,
            extended: false,
            idAplicacionPadre: 152,
            options: [],
          },
          {
            idOrder: 9,
            idAplicacion: 1358,
            code: '009',
            name: 'Reglas de Conducta en Ejecución Sentencia',
            url: 'bandeja-regla-conducta',
            count: 0,
            extended: false,
            idAplicacionPadre: 152,
            options: [],
          },
          {
            idOrder: 10,
            idAplicacion: 186,
            code: '010',
            name: 'Trámites por acto procesal',
            url: 'administracion-casos/administracion-de-tramite-por-acto-procesal',
            count: 0,
            extended: false,
            idAplicacionPadre: 152,
            options: [],
          },
        ],
      },
      {
        idOrder: 5,
        idAplicacion: 153,
        code: '005',
        name: 'Distribución y Turnos',
        url: 'https://sad.mpfn.gob.pe/distribucion-turnos',
        count: 0,
        extended: false,
        idAplicacionPadre: 7,
        options: [
          {
            idOrder: 1,
            idAplicacion: 188,
            code: '0051',
            name: 'Configurar distribución de denuncias',
            url: 'bandeja-configurar-grupo-aleatorio',
            count: 0,
            extended: false,
            idAplicacionPadre: 153,
            options: [],
          },
          {
            idOrder: 2,
            idAplicacion: 189,
            code: '002',
            name: 'Turnos fiscales',
            url: 'turnos-fiscales',
            count: 0,
            extended: false,
            idAplicacionPadre: 153,
            options: [],
          },
        ],
      },
      {
        idOrder: 6,
        idAplicacion: 154,
        code: '006',
        name: 'Sistemas',
        url: 'https://sad.mpfn.gob.pe/sistemas',
        count: 0,
        extended: false,
        idAplicacionPadre: 7,
        options: [
          {
            idOrder: 1,
            idAplicacion: 190,
            code: '001',
            name: 'Aplicaciones',
            url: 'bandeja-aplicacion',
            count: 0,
            extended: false,
            idAplicacionPadre: 154,
            options: [],
          },
          {
            idOrder: 2,
            idAplicacion: 192,
            code: '002',
            name: 'Pefiles',
            url: 'listar-perfiles',
            count: 0,
            extended: false,
            idAplicacionPadre: 154,
            options: [],
          },
        ],
      },
      {
        idOrder: 7,
        idAplicacion: 155,
        code: '007',
        name: 'Usuario',
        url: 'https://sad.mpfn.gob.pe/usuario',
        count: 0,
        extended: false,
        idAplicacionPadre: 7,
        options: [
          {
            idOrder: 1,
            idAplicacion: 195,
            code: '001',
            name: 'Gestionar usuarios',
            url: 'usuario-general',
            count: 0,
            extended: false,
            idAplicacionPadre: 155,
            options: [],
          },
          {
            idOrder: 2,
            idAplicacion: 196,
            code: '0072',
            name: 'Listar mis aplicaciones',
            url: 'listar-mis-aplicaciones',
            count: 0,
            extended: false,
            idAplicacionPadre: 155,
            options: [],
          },
        ],
      },
      {
        idOrder: 8,
        idAplicacion: 1359,
        code: '008',
        name: 'Gestión ATF',
        url: 'https://sad.mpfn.gob.pe/atf',
        count: 0,
        extended: false,
        idAplicacionPadre: 7,
        options: [
          {
            idOrder: 1,
            idAplicacion: 1360,
            code: '001',
            name: 'Dependencias ATF',
            url: 'dependencias-atf',
            count: 0,
            extended: false,
            idAplicacionPadre: 1359,
            options: [],
          },
        ],
      },
    ];

    // Procesamos la data de la misma manera que el método original
    this.elements = this.establecerIndexElementos(modulosMenu);
    this.RUTA_ACTUAL = this.extraerUrlInicial(this.elements);
    if (!this.RUTA_ACTUAL) return;

    this.router.navigate([`app/${this.RUTA_ACTUAL}`]);
    this.seleccionInicial(this.elements, this.RUTA_ACTUAL);
  }
}
