import { Component } from '@angular/core';
import { DialogService, DynamicDialogConfig, DynamicDialogRef } from "primeng/dynamicdialog";
import { PaginatorModule } from "primeng/paginator";
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from "@angular/forms";
import { FormGettersDespacho } from "@modulos/maestros/despachos/formGetters/FormGettersDespacho";
import { Despacho, DistritoFiscal, Sede } from "@interfaces/admin-despacho/admin-despacho";
import { patron } from "@constants/constantes";
import { Auth2Service } from "@services/auth/auth2.service";
import { AdminDespachoService } from "@services/admin-despacho/admin-despacho.service";
import { AlertModalComponent } from "@components/alert-modal/alert-modal.component";
import { isEqual } from 'lodash';
import { ButtonModule } from "primeng/button";
import { NgIf } from "@angular/common";
import { validOnlyNumbers } from "@utils/utils";

@Component({
  selector: 'app-editar-despacho-modal',
  templateUrl: './editar-despacho-modal.component.html',
  standalone: true,
  imports: [
    PaginatorModule,
    ReactiveFormsModule,
    ButtonModule,
    NgIf,
  ],
  styleUrls: ['./editar-despacho-modal.component.scss']
})
export class EditarDespachoModalComponent {

  formGroupDespacho: FormGroup;
  isEdit: boolean = false;
  //para validar cambios en los datos del formulario
  formGroupInicial: FormGroup;

  formGetters: FormGettersDespacho;
  distritosFiscales: any[];
  sedes: any[];
  dependencias: any[];
  topologias: any[];
  cmbSedeDisabled: FormControl;
  cmbDependenciaDisabled: FormControl;
  cmbDistritoDisabled: FormControl;

  error: any;
  despachoForm: Despacho;
  despachoSelected: Despacho;
  public refModal: DynamicDialogRef;

  errorMessages = {
    nombre: {
      required: 'El nombre es requerido.',
      maxlength: 'El nombre no puede exceder 100 caracteres.',
      pattern: 'El nombre no debe tener espacios consecutivos.'
    },
    coDistritoFiscal: {
      required: 'El distrito fiscal es requerido.'
    },
    coSede: {
      required: 'La sede es requerida.',
    },
    coDependencia: {
      required: 'La dependencia es requerida.',
      maxlength: 'El código de dependencia no puede exceder 10 caracteres.',
    },
    nuDespacho: {
      required: 'El número de despacho es requerido.',
      maxlength: 'El número de despacho no puede exceder 11 caracteres.',
      pattern: 'El número de despacho solo puede contener números.'
    },
    coTopologia: {
      required: 'La topología es requerida.'
    }
  };

  //usuario session
  public usuarioSesion;

  //adicional


  constructor(
    public readonly ref: DynamicDialogRef,
    public readonly config: DynamicDialogConfig,
    private readonly dialogService: DialogService,
    private readonly formBuilder: FormBuilder,
    private readonly despachosService: AdminDespachoService,
    private readonly userService: Auth2Service,
  ) {
  }

  ngOnInit() {

    if (this.config.data?.codigo) {
      this.isEdit = true;
    } else {
      this.isEdit = false;
    }

    this.despachoForm = this.config.data;
    this.despachoSelected = this.config.data;
    this.setDataForm(this.despachoForm);
    this.initDataEdit();
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.usuarioSesion = this.userService.getUserInfo();
    }, 100);
  }

  public icon(name: string): string {
    return `assets/icons/${name}.svg`;
  }

  public confirmAction(): void {
    this.ref.close('confirm');
  }

  public cancelAction(): void {
    this.ref.close('cancel');
  }

  public closeAction(): void {
    this.ref.close('closed');
  }

  getLengthDisabled(controlName: string): number {
    const rawValue = this.formGroupDespacho.getRawValue();
    return rawValue[controlName]?.length || 0;
  }

  initDataEdit() {
    this.formGroupDespacho.get('coDistritoFiscal').disable();
    this.formGroupDespacho.get('coSede').disable();
    this.formGroupDespacho.get('coDependencia').disable();
    this.formGroupDespacho.get('codigoDependencia').disable();
    this.formGroupDespacho.get('nuDespacho').disable();

    this.listarComboTopologia();
    this.listarComboDistritoFiscal();
    const distritoFiscal: DistritoFiscal = { codigo: this.despachoForm.coDistritoFiscal, nombre: null }
    this.listarComboSede(distritoFiscal);
    let sede: Sede = { codigo: this.despachoForm.coSede, nombre: null };
    this.listarComboDependencia(sede)

    this.formGroupInicial = this.formGroupDespacho.getRawValue();

  }

  setDataForm(despacho: Despacho) {
    this.formGroupDespacho = this.formBuilder.group({
      nombre: new FormControl(despacho.nombre, [
        Validators.required,
        Validators.maxLength(100),
        Validators.pattern(patron.PATRON_TEXTO_SIN_DOBLE_ESPACIO),
      ]),
      coDistritoFiscal: new FormControl(despacho.coDistritoFiscal, [
        Validators.required
      ]),
      coSede: new FormControl(despacho.coSede, [
        Validators.required
      ]),
      coDependencia: new FormControl(despacho.coDependencia, [
        Validators.required
      ]),
      codigoDependencia: new FormControl(despacho.coDependencia, [
        Validators.required,
        Validators.maxLength(10)
      ]),
      nuDespacho: new FormControl(despacho.nuDespacho, [
        Validators.required,
        Validators.maxLength(11),
        Validators.pattern(patron.PATRON_NUMERO)
      ]),
      coTopologia: new FormControl(despacho.coTopologia, [
        Validators.required
      ]),

    });

    this.formGetters = new FormGettersDespacho(this.formGroupDespacho);
  }

  // Getters para acceder a los controles del formulario
  get nombre() { return this.formGetters.nombre; }
  get coDistritoFiscal() { return this.formGetters.coDistritoFiscal; }
  get coSede() { return this.formGetters.coSede; }
  get coDependencia() { return this.formGetters.coDependencia; }
  get nuDespacho() { return this.formGetters.nuDespacho; }
  get coTopologia() { return this.formGetters.coTopologia; }

  listarComboTopologia() {
    this.despachosService.listarComboTopologia().subscribe({
      next: (response) => {
        this.topologias = response
          .map((topo) => ({
            label: topo.nombre,
            value: topo.codigo,
          }))
          .sort((a, b) => a.label.localeCompare(b.label)); 
  
      },
      error: (err) => {
        this.error = err;
        console.error('Error al obtener combo topologias:', err);
      },
    });
  }

  cierraUpdAppModal() {
    this.closeAction()
  }

  editarDespacho() {
    if (isEqual(this.formGroupInicial, this.formGroupDespacho.getRawValue())) {
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

    if (this.formGroupDespacho.valid) {

      this.despachoForm = {
        ...this.despachoForm,
        nombre: this.formGroupDespacho.value.nombre,
        coTopologia: this.formGroupDespacho.value.coTopologia,
        coUsuario: this.usuarioSesion?.usuario.usuario,
      };

      this.confirmarEditarRegistro('question');
      this.refModal.onClose.subscribe({
        next: (resp) => {
          if (resp === 'confirm') {
            this._editarDespacho();
          }
        },
        error: (err) => {
          console.error('Error al agregar registro.', err);
          throw new Error('Error al agregar registro');
        },
      });


    } else {
      this.marcarCamposComoTocados(this.formGroupDespacho);
    }

  }

  marcarCamposComoTocados(formGroup: FormGroup) {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();

      if (control instanceof FormGroup) {
        this.marcarCamposComoTocados(control);
      }
    });
  }

  _editarDespacho() {
    let despacho: Despacho = {
      ...this.formGroupDespacho.value,
      codigo: this.despachoForm.codigo,
      coUsuario: this.usuarioSesion?.usuario.usuario,
    }
    this.despachosService.editarDespacho(despacho).subscribe(
      {
        next: (response) => {
          this.cierraUpdAppModal();

          this.refModal = this.dialogService.open(AlertModalComponent, {
            width: '600px',
            showHeader: false,
            data: {
              icon: 'success',
              title: 'Despacho editado',
              description: `La actualización de los datos del despacho <b>${this.despachoForm.nombre}</b> de la <b>${this.despachoForm.nombreDependencia}</b> se realizó de forma exitosa.`,
              confirmButtonText: 'Listo'
            },
          });

          this.refModal.onClose.subscribe({
            next: resp => {
              if (resp === 'confirm') {
                this.confirmAction();
              }
            }
          });
        },
        error: (err) => {
          this.error = err;
          console.error('Error al actualizar despacho', err);
        }

      });
  }

  getErrorMessage(controlName: string, errorType: string): string {
    return this.errorMessages[controlName][errorType] ? this.errorMessages[controlName][errorType] : 'Error en el campo';
  }

  // Método para obtener la longitud del valor de un control
  getLength(controlName: string): number {
    const control = this.formGroupDespacho.get(controlName);
    return control.value ? control.value.length : 0;
  }

  private confirmarEditarRegistro(icon: string): void {

    this.refModal = this.dialogService.open(AlertModalComponent, {
      width: '50%',
      showHeader: false,
      data: {
        icon: icon,
        title: 'Editar datos del despacho',
        confirm: true,
        description:
          `A continuación, se procederá a modificar los datos del despacho ` +
          `<b>${this.despachoForm.nombre}</b> de la <b>${this.despachoForm.nombreDependencia}</b>. ` +
          `¿Esta seguro de realizar esta acción?`,
        confirmButtonText: 'Aceptar'
      },
    });
  }

  listarComboDistritoFiscal() {
    this.despachosService.listarComboDistritoFiscal().subscribe({
      next: (response) => {

        this.distritosFiscales = response.map(df => ({
          label: df.nombre,
          value: df.codigo
        }));

      },
      error: (err) => {
        this.error = err;
        console.error('Error al obtener combo distritos fiscales:', err);
      }
    });
  }

  listarComboSede(distritoFiscal: DistritoFiscal) {
    this.despachosService.listarComboSede(distritoFiscal).subscribe({
      next: (response) => {

        this.sedes = response;

      },
      error: (err) => {
        this.error = err;
        console.error('Error al obtener combo sedes:', err);
      }
    });
  }

  listarComboDependencia(sede: Sede) {
    this.despachosService.listarComboDependenciaBySede(sede).subscribe({
      next: (response) => {

        this.dependencias = response;
      },
      error: (err) => {
        this.error = err;
        console.error('Error al obtener combo dependencias:', err);
      }
    });
  }

  public validOnlyNumbers(event: any): boolean {
    return validOnlyNumbers(event);
  }
}
