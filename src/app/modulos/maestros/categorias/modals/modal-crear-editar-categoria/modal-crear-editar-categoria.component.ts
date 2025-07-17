import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy } from '@angular/core';
import {
  FormsModule,
  ReactiveFormsModule,
  FormGroup,
  FormControl,
  Validators,
  ValidatorFn,
  AbstractControl,
  ValidationErrors,
} from '@angular/forms';
import { CategoriaService } from '@services/categoria/categoria.service';
import { AutoComplete } from 'primeng/autocomplete';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { DropdownModule } from 'primeng/dropdown';
import {
  DialogService,
  DynamicDialogRef,
  DynamicDialogConfig,
} from 'primeng/dynamicdialog';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputSwitchModule } from 'primeng/inputswitch';
import { InputTextModule } from 'primeng/inputtext';
import { Subscription } from 'rxjs';
import { AplicacionesCategoriasService } from '../../aplicaciones-categorias.service';
import { AlertModalComponent } from '@components/alert-modal/alert-modal.component';
import { isEqual } from 'lodash';

@Component({
  standalone: true,
  selector: 'app-modal-crear-editar-categoria',
  templateUrl: './modal-crear-editar-categoria.component.html',
  styleUrls: [
    './modal-crear-editar-categoria.component.scss',
    '../modal-mensaje/modal-mensaje.component.scss',
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    DialogModule,
    InputTextModule,
    AutoComplete,
    InputSwitchModule,
    ButtonModule,
    InputNumberModule,
    DropdownModule,
  ],
  providers: [DialogService],
})
export class ModalCrearEditarCategoriaComponent implements OnInit, OnDestroy {
  protected refModal: DynamicDialogRef;
  private actionSubscription: Subscription;
  protected formGroup: FormGroup;
  private isEditing: boolean;
  private categoria: any;
  protected codigo: string;
  protected categoriasPadreDropdown: Array<any> = [];
  protected categoriaTabla: any[] = [];
  protected subscriptions: Subscription[] = [];
  protected initialFormValues: any;

  formObject = {
    idCategoria: new FormControl(''),
    nombre: new FormControl('', [
      Validators.required,
      Validators.maxLength(60),
      this.noSoloEspacios(),
    ]),
    nombrePlural: new FormControl('', [
      Validators.required,
      Validators.maxLength(90),
      this.noSoloEspacios(),
    ]),
    idCategoriaPadre: new FormControl<number | null>(null),
    palabrasClave: new FormControl(
      [],
      [this.palabrasClaveMaxLengthValidator(100)]
    ),
  };

  constructor(
    private readonly ref: DynamicDialogRef,
    private readonly config: DynamicDialogConfig,
    private readonly aplicacionesCategoriasService: AplicacionesCategoriasService,
    private readonly dialogService: DialogService,
    private readonly categoriaService: CategoriaService
  ) {
    this.formGroup = new FormGroup(this.formObject);
  }

  ngOnInit(): void {
    this.setData();
    this.obtenerCategoriasPadre();

    this.actionSubscription =
      this.aplicacionesCategoriasService.action$.subscribe((action) => {
        if (action === 'create') {
          this.createCategory();
        } else if (action === 'save') {
          this.saveCategory();
        }
      });
  }

  ngOnDestroy(): void {
    if (this.actionSubscription) this.actionSubscription.unsubscribe();
  }

  protected icon(name: string): string {
    return `assets/icons/${name}.svg`;
  }

  // Validador personalizado para limitar el total de caracteres en palabrasClave
  private palabrasClaveMaxLengthValidator(maxLength: number): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const values = control.value as string[];
      if (!values) return null;

      const totalLength = values.reduce((acc, curr) => acc + curr.length, 0);
      return totalLength <= maxLength ? null : { maxTotalLength: true };
    };
  }

  // Validador personalizado para evitar solo espacios en blanco
  private noSoloEspacios(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) {
        return null; // Si no hay valor, no se valida
      }

      const trimmedValue = (control.value || '').trim();
      const isWhitespace = trimmedValue.length === 0;
      const isValid = !isWhitespace && control.value === trimmedValue;

      return isValid ? null : { noSoloEspacios: true };
    };
  }

  private obtenerCategoriasPadre() {
    // servicio para obtener categorias padre
    this.subscriptions.push(
      this.categoriaService.obtenerListaCategoriasPadre().subscribe({
        next: (resp: any) => {
          this.categoriasPadreDropdown = resp;
        },
        error: (err: string) => {
          console.error('Error en la solicitud [obtenerListaCategoriasPadre]');
        },
      })
    );
  }

  //refactorizado
  private setData() {
    this.categoriaTabla = this.config.data.categoryDataAll || [];

    if (!this.config.data?.categoryDetail) return;

    this.isEditing = true;
    this.categoria = this.config.data.categoryDetail;
    this.categoriasPadreDropdown = this.config.data.categoriasPadre;

    if (typeof this.categoria.palabrasClave === 'string') {
      this.categoria.palabrasClave = this.categoria.palabrasClave.split(',');
    }

    if (this.categoria.codigo !== undefined) {
      this.codigo = this.categoria.codigo;
    }

    if (this.categoria.padre !== undefined) {
      this.formGroup.patchValue({
        idCategoriaPadre: this.categoria.padre,
      });
    }

    this.formGroup.patchValue(this.categoria);
    this.initialFormValues = this.formGroup.getRawValue();
  }

  protected closeModal() {
    this.ref.close();
  }

  protected sendCategorySave() {
    if (this.formGroup.valid) {
      if (this.isEditing) {
        const currentFormValues = this.formGroup.getRawValue();

        if (isEqual(this.initialFormValues, currentFormValues)) {
          this.dialogService.open(AlertModalComponent, {
            width: '600px',
            showHeader: false,
            data: {
              icon: 'info',
              title: 'Sin cambios',
              description: 'No se ha realizado ningún cambio en los datos.',
              confirmButtonText: 'Aceptar',
            },
          });

          return; // Salir sin enviar la solicitud de edición
        }
      }

      this.isEditing
        ? this.aplicacionesCategoriasService.notifyShowConfirmModal(
            'save',
            this.nombreField.value
          )
        : this.aplicacionesCategoriasService.notifyShowConfirmModal(
            'create',
            this.nombreField.value
          );
    } else {
      this.formGroup.markAllAsTouched();
    }
  }

  private createCategory() {
    this.formGroup.patchValue(this.formGroup);

    this.aplicacionesCategoriasService.notifySuccessModal('create');
    this.aplicacionesCategoriasService.notifyCompleteActionCategoria(
      this.formGroup.value
    );
  }

  private saveCategory() {
    this.formGroup.patchValue(this.formGroup);

    this.aplicacionesCategoriasService.notifySuccessModal('save');
    this.aplicacionesCategoriasService.notificarActualizacionCategorias(
      this.formGroup.value,
      this.codigo
    );
  }

  get totalPalabrasClaveLength(): number {
    const values = this.palabrasClaveField.value as string[];

    if (!values) return 0;

    return values.reduce((acc, curr) => acc + curr.length, 0);
  }

  get nombreField(): AbstractControl {
    return this.formGroup.get('nombre');
  }

  get nombrePluralField(): AbstractControl {
    return this.formGroup.get('nombrePlural');
  }

  get padreField(): AbstractControl {
    return this.formGroup.get('idCategoriaPadre');
  }

  get palabrasClaveField(): AbstractControl {
    return this.formGroup.get('palabrasClave');
  }
}
