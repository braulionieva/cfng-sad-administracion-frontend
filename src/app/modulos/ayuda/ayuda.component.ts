import {CommonModule, NgIf} from '@angular/common';
import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule} from '@angular/forms';
import {RegionATF} from '@interfaces/administrarDependenciasATF/administrarDependenciasATF';
import {ConfigPage} from '@interfaces/plazo-doc-obs/BuscarPlazoDocObsRes';
import {NgxSpinnerService} from 'ngx-spinner';
import {ConfirmationService, LazyLoadEvent, MenuItem, MessageService} from 'primeng/api';
import {ButtonModule} from 'primeng/button';
import {CalendarModule} from 'primeng/calendar';
import {ConfirmDialogModule} from 'primeng/confirmdialog';
import {DialogModule} from 'primeng/dialog';
import {DropdownModule} from 'primeng/dropdown';
import {InputNumberModule} from 'primeng/inputnumber';
import {InputTextModule} from 'primeng/inputtext';
import {InputTextareaModule} from 'primeng/inputtextarea';
import {MenuModule} from 'primeng/menu';
import {TableModule} from 'primeng/table';
import {ToastModule} from 'primeng/toast';
import {DialogService, DynamicDialogRef} from 'primeng/dynamicdialog';
import {AlertModalComponent} from '@components/alert-modal/alert-modal.component';
import {obtenerIcono} from "@utils/icon";
import {CmpLibModule} from "ngx-mpfn-dev-cmp-lib";
import {debounceTime, distinctUntilChanged, finalize} from 'rxjs';
import {RadioButtonModule} from "primeng/radiobutton";
import {AyudaDetalleObj, CategoriaListadoObj, CategoriasPadreObj, TagsObj} from "@interfaces/ayuda/ayuda";
import {MultiSelectModule} from "primeng/multiselect";
import {AyudaService} from "@services/ayuda/ayuda.service";
import {CKEditorModule} from '@ckeditor/ckeditor5-angular';
import * as ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import {AyudaTagComponent} from "@modulos/ayuda/tag/ayuda-tag.component";
import {BACKEND} from "@environments/environment";

@Component({
  selector: 'app-dependencias-atf',
  standalone: true,
  templateUrl: './ayuda.component.html',
  styleUrls: ['./ayuda.component.scss'],
  imports: [
    CommonModule, DropdownModule, ReactiveFormsModule, InputTextModule, ButtonModule,
    CalendarModule, TableModule, ToastModule, DialogModule, ConfirmDialogModule,
    MenuModule, NgIf, FormsModule, ReactiveFormsModule, InputTextModule,
    DropdownModule, InputNumberModule, CommonModule, InputTextareaModule, InputTextareaModule,
    CmpLibModule, RadioButtonModule, MultiSelectModule, CKEditorModule, AyudaTagComponent
  ],
  providers: [MessageService, ConfirmationService, DialogService],
})
export class AyudaComponent implements OnInit {
  public Editor = ClassicEditor;
  protected readonly obtenerIcono = obtenerIcono;
  protected formFiltroBuscar: FormGroup;
  protected showMoreFiltro: boolean = false;
  protected toggleIcon: string = 'pi-angle-double-down';
  protected configPage: ConfigPage;
  protected regionATFLst: RegionATF[] = [];
  protected categoriasPadre: CategoriasPadreObj[] = [];
  protected categoriaRowLst: CategoriaListadoObj[] = [];
  protected categoriaRowSelected: CategoriaListadoObj;
  protected categoriaRowLstTotal: number = 0;
  protected isVisibleModalNewForm: boolean = false;
  protected isVisibleModalTags: boolean = false;
  protected formGroup: FormGroup;
  protected isEditForm: boolean = false;
  protected objForm: AyudaDetalleObj;
  protected refModal: DynamicDialogRef;
  protected totalTags: TagsObj[] = [];
  protected tags: TagsObj[] = [];
  protected nuevoTag: string;
  protected contenido: string = '';

  protected actionItems: MenuItem[] = [
    {
      label: 'Editar',
      command: () => {
        this.openModalUpdateForm();
      },
    },
    {
      label: 'Eliminar',
      command: () => {
        this.openModalDeleteForm();
      },
    },
  ];

  public editorConfig = {
    image: {
      upload: {
        types: ['jpeg', 'png', 'gif']
      }
    },
    toolbar: {
      items: [
        'undo', 'redo', '|',
        'heading', '|',
        'bold', 'italic', '|',
        'link', 'blockQuote', '|',
        'bulletedList', 'numberedList', '|',
        'insertTable', '|',
        'imageUpload', 'mediaEmbed', '|',
        'indent', 'outdent'
      ]
    },
    table: {
      contentToolbar: [
        'tableColumn',
        'tableRow',
        'mergeTableCells',
        'tableCellProperties',
        'tableProperties'
      ]
    },
    mediaEmbed: {
      previewsInData: true
    }
  };

  constructor(
    private readonly fb: FormBuilder,
    private readonly spinner: NgxSpinnerService,
    private readonly service: AyudaService,
    private readonly messageService: MessageService,
    protected readonly dialogService: DialogService,
  ) {
  }

  ngOnInit() {
    this.initConfigPage();
    this.initFormFiltroBuscar();
    this.obtenerCategorias();
    this.initForm();
    this.formFiltroBuscar.get('titulo').valueChanges
      .pipe(debounceTime(500), distinctUntilChanged())
      .subscribe(async () => {
        await this.obtenerCategorias();
      });
  }

  /** GESTION DE FORMULARIO **/

  private initFormFiltroBuscar() {
    this.toggleIcon = 'pi-angle-double-down';
    this.formFiltroBuscar = this.fb.group({
      titulo: [null]
    });
  }

  public async onClearFilters(): Promise<void> {
    this.initConfigPage();
    this.initFormFiltroBuscar();
    await this.obtenerCategorias();
  }

  protected icon(name: string): string {
    return `assets/icons/${name}.svg`;
  }

  protected itemSelected(activeItem: any) {
    this.categoriaRowSelected = activeItem;
  }

  private initForm() {
    this.objForm = Object.create(null);
    this.setDataForm(this.objForm);
  }

  private setDataForm(objForm: AyudaDetalleObj) {
    this.formGroup = this.fb.group({
      nivel: new FormControl(objForm.idCategoriaPadre > 0 ? 2 : 1, []),
      noCategoria: new FormControl(objForm.noCategoria, []),
      contenido: new FormControl(objForm.contenido, []),
      idCategoriaPadre: new FormControl(objForm.idCategoriaPadre, []),
      idTipoCategoria: new FormControl(objForm.idTipoCategoria, []),
      tags: new FormControl(objForm.tags, []),
    });
    this.tags = objForm.tags;
    this.contenido = objForm.contenido;
  }

  protected async guardarCategoria() {
    if (this.formGroup.valid) {
      this.confirmarAgregarRegistro('question');
      this.refModal.onClose
        .pipe(finalize(() => {
          this.spinner.hide();
        }))
        .subscribe({
          next: (resp) => {
            if (resp === 'confirm') {
              this._addForm();
            }
          },
          error: () => {
            throw new Error('Error al agregar registro');
          },
        });
    } else {
      this.messageService.add({severity: 'warn', summary: '', detail: 'Campos sin completar o inválidos'});
    }
  }

  private async _addForm() {
    await this.spinner.show();
    const request: AyudaDetalleObj = {
      ...this.formGroup.value,
      idCategoria: this.categoriaRowSelected.idCategoria,
      contenido: this.contenido,
      tags: this.tags
    };
    await this.service.guardarCategoria(request);
    this.onOpenModalNotificationSuccess2('success', 'Categoria registrada',
      `El registro se realizó de forma exitosa`
    );

    this.refModal.onClose
      .pipe(finalize(() => {
        this.spinner.hide();
      }))
      .subscribe({
        next: (resp) => {
          if (resp === 'confirm') {
            this.obtenerCategorias();
            this.onCloseModalForm();
          }
        },
        error: () => {
          throw new Error('Error al agregar registro');
        },
      });
    await this.spinner.hide();
  }

  private initConfigPage() {
    this.configPage = {
      pages: 1,
      perPage: 10,
    };
  }

  /** GESTION DE TAGS **/

  protected agregarTag(): void {
    if (this.nuevoTag && this.nuevoTag.trim() !== '') {
      const existe = this.totalTags.some(
        tag => tag.noTag === this.nuevoTag
      );
      if (existe) {
        return;
      }
      this.service.guardarTag(
        {
          idTag: null,
          noTag: this.nuevoTag
        }).then(tag => {
        this.totalTags.push(tag)
      });
      this.nuevoTag = null;
    }
  }

  protected async removerTag(tag: TagsObj) {
    const index = this.totalTags.findIndex(t => t.noTag === tag.noTag);
    if (index !== -1) {
      await this.service.eliminarTag({
        idTag: tag.idTag,
        noTag: tag.noTag
      });
      this.totalTags.splice(index, 1);
      return true;
    } else {
      return false;
    }
  };

  getTagNames(tags: any[]): string {
    return tags.map(function (tag) {
      return tag.noTag;
    }).join(', ');
  }

  /** GESTION DE MODALS **/

  protected async openModalNewForm() {
    await this.obtenerTags();
    await this.obtenerCategoriasPadre();
    this.categoriaRowSelected = {
      idCategoria: null,
      noCategoria: null,
      idCategoriaPadre: null,
      noCategoriaPadre: null,
      tags: null,
      fechaCreacion: null,
      fechaUpdate: null
    }
    this.formGroup.reset();
    this.isVisibleModalNewForm = true;
  }

  protected async openModalUpdateForm() {
    await this.obtenerTags();
    await this.obtenerCategoriasPadre();

    this.initForm();
    this.setDataForm(await this.service.obtenerCategoriaDetalle(this.categoriaRowSelected.idCategoria));
    this.isVisibleModalNewForm = true;
  }

  protected async openModalTags() {
    await this.obtenerTags();
    this.isVisibleModalTags = true;
  }

  private openModalDeleteForm() {
    this.confirmarEliminacionRegistro('question');
    this.refModal.onClose.subscribe({
      next: (resp) => {
        if (resp === 'confirm') {
          this.service.eliminarCategoria(this.categoriaRowSelected.idCategoria)
            .then(() => this.obtenerCategorias());
        }
      },
    });
  }

  protected openModalDeleteTag(tag: TagsObj) {
    this.confirmarEliminacionRegistro('question');
    this.refModal.onClose.subscribe({
      next: (resp) => {
        if (resp === 'confirm') {
          this.removerTag(tag)
            .then(() => this.obtenerCategorias())
        }
      },
    });
  }


  protected async onCloseModalForm() {
    this.isVisibleModalNewForm = false;
  }

  protected onCloseModalTags() {
    this.nuevoTag = null;
    this.isVisibleModalTags = false;
  }

  /** MENSAJES DE CONFIRMACION **/

  private confirmarAgregarRegistro(icon: string): void {
    this.refModal = this.dialogService.open(AlertModalComponent, {
      width: '750px',
      showHeader: false,
      data: {
        icon: icon,
        title: 'Registrar nueva Categoria',
        confirm: true,
        description:
          `A continuación, se procederá a registrar los datos
           ¿Esta seguro de realizar esta acción?`,
        confirmButtonText: 'Aceptar',
      },
    });
  }

  private confirmarEliminacionRegistro(icon: string): void {
    this.refModal = this.dialogService.open(AlertModalComponent, {
      width: '750px',
      showHeader: false,
      data: {
        icon: icon,
        title: 'Eliminar',
        confirm: true,
        description:
          `A continuación, se procederá a eliminar ¿Esta seguro de realizar esta acción?`,
        confirmButtonText: 'Aceptar',
      },
    });
  }

  private onOpenModalNotificationSuccess2(icon: string, title: string, description: string) {
    this.refModal = this.dialogService.open(AlertModalComponent, {
      width: '600px',
      showHeader: false,
      data: {
        icon: icon,
        title: title,
        description: description,
        confirmButtonText: 'Listo',
      },
    });
  }

  /** LLAMADA A DATOS **/

  private async obtenerTags() {
    try {
      await this.spinner.show();
      this.totalTags = await this.service.obtenerTags("");
    } catch (err) {
      this.messageService.add({severity: 'error', summary: 'Rejected', detail: 'Error en el proceso.'});
    } finally {
      await this.spinner.hide();
    }
  }

  protected async lazyLoad(event: LazyLoadEvent) {
    this.configPage.pages = event.first / 10 + 1;
    await this.obtenerCategorias();
  }

  protected async obtenerCategorias() {
    try {
      await this.spinner.show();
      const request = {
        pages: this.configPage.pages,
        perPage: this.configPage.perPage,
        busqueda: this.formFiltroBuscar.get('titulo').value
      };
      const data = await this.service.obtenerCategorias(request);
      this.categoriaRowLst = data.registros;
      this.categoriaRowLstTotal = data.totalElementos;
    } catch (err) {
      this.messageService.add({severity: 'error', summary: 'Rejected', detail: 'Error en el proceso.'});
    } finally {
      await this.spinner.hide();
    }
  }

  protected async obtenerCategoriasPadre() {
    try {
      await this.spinner.show();
      this.categoriasPadre = await this.service.obtenerCategoriasPadre();
    } catch (err) {
      this.messageService.add({severity: 'error', summary: 'Rejected', detail: 'Error en el proceso.'});
    } finally {
      await this.spinner.hide();
    }
  }

  /** ckEditor **/

  public onReady(editor) {
    editor.plugins.get('FileRepository').createUploadAdapter = (loader) => {
      return this.createUploadAdapter(loader);
    };
  }

  createUploadAdapter(loader) {
    return {
      upload: () => {
        return new Promise((resolve, reject) => {
          loader.file.then(async (file: File) => {
            try {
              const response = await this.service.cargarArchivo(file);
              resolve({
                default: `${BACKEND.MS_REPOSITORIO_PRIVADO}visualizar?archivoId=${response.idDocumento}&nombreArchivo=${file.name}`
              });
            } catch (error) {
              console.error('Error al cargar archivo a Alfresco:', error);
            }
          });
        });
      }
    };
  }
}
