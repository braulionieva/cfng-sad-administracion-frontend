import { Component, Input, OnInit } from '@angular/core';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-tabla-menus',
  standalone: true,
  imports: [
    TableModule,
    ButtonModule
  ],
  templateUrl: './tabla.component.html',
  styleUrls: ['./tabla.component.scss']
})
export class TablaComponent implements OnInit {
  @Input() listarMenusPadre : Menus[] = [];
  error :any;

  constructor(
    // private adminMenusService :AdminMenusService
    ) {
    // This is intentional
    }

  ngOnInit() {
    // This is intentional
  }

  agregarNodo(idMenuPadre: string): void{
    // This is intentional
  }

  editarNodo(idMenuPadre: string): void{
    // This is intentional
  }

  eliminarNodo(idMenuPadre: string): void{
    // This is intentional
  }

  // listarMenus(): void {
  //   this.adminMenusService.obtenerListaMenus().subscribe(
  //     {
  //       next: (response) => {
  //
  //         this.listarMenusPadre = response;
  //         //this.listarMenus()
  //       },
  //       error: (err) => {
  //         this.error = err;
  //         console.error('Error al obtener las categorias:', err);
  //       }

  //     }
  //   );

  // }

}
