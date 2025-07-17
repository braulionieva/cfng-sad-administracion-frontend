import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { DropdownModule } from 'primeng/dropdown';
import { DialogModule } from 'primeng/dialog';
import { ToastModule } from 'primeng/toast';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AdminDespachoService } from '@services/admin-despacho/admin-despacho.service';
import { Despacho, DistritoFiscal, Sede } from '@interfaces/admin-despacho/admin-despacho';
import { AlertModalComponent } from '@components/alert-modal/alert-modal.component';
import { MessageService } from 'primeng/api';
import { FormGettersDespacho } from "@modulos/maestros/despachos/formGetters/FormGettersDespacho";
import { ModalNotificationService } from "@services/modal-notification/modal-notification.service";
import { validOnlyNumbers, getValueByCodeInDropdown } from "@utils/utils";
import { patron } from "@constants/constantes";
import { Auth2Service } from "@services/auth/auth2.service";

@Component({
  selector: 'app-agregar-despacho',
  standalone: true,
  templateUrl: './agregar-despacho.component.html',
  styleUrls: ['./agregar-despacho.component.scss'],
  imports: [
    DropdownModule,
    ButtonModule,
    ToastModule,
    DialogModule,
    ReactiveFormsModule,
    CommonModule
  ],
  providers: [DialogService, ModalNotificationService]
})
export class AgregarDespachoComponent implements OnInit {

  @Output() close = new EventEmitter<boolean>();
  @Output() clicked = new EventEmitter();
  @Input() data: any;
  formGroupDespacho: FormGroup;
  formGetters: FormGettersDespacho;
  distritosFiscales: any[];
  sedes: any[];
  dependencias: any[];
  topologias: any[];
  error: any;
  cmbSedeDisabled: FormControl;
  cmbDependenciaDisabled: FormControl;
  coDependenciaFormValue: string = null;
  nombreDependenciaFormValue: string = null;//en la medida posible evitar su uso, para removerlo definitivamente
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

  constructor(private readonly formBuilder: FormBuilder,
    private readonly messageService: MessageService,
    private readonly dialogService: DialogService,
    private readonly despachosService: AdminDespachoService,
    private readonly modalNotificationService: ModalNotificationService,
    private readonly userService: Auth2Service,
  ) {

  }

  ngOnInit() {
    let despacho: Despacho = Object.create(null);
    this.setDataForm(despacho);

    this.formGroupDespacho.reset();
    this.sedes = [];
    this.dependencias = [];

    this.initData();
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.usuarioSesion = this.userService.getUserInfo();
    }, 100);
  }

  initData() {

    this.cmbDependenciaDisabled = this.formGroupDespacho.get('coDependencia') as FormControl;
    this.cmbDependenciaDisabled.disable(); // Deshabilitar por defecto*/
    this.cmbSedeDisabled = this.formGroupDespacho.get('coSede') as FormControl;
    this.cmbSedeDisabled.disable(); // Deshabilitar por defecto*/
    this.formGroupDespacho.get('codigoDependencia').disable();

    this.listarComboDistritoFiscal();
    this.listarComboTopologia();
  }

  setDataForm(despacho: Despacho) {
    this.formGroupDespacho = this.formBuilder.group({
      nombre: new FormControl(despacho.nombre, [
        Validators.required,
        Validators.maxLength(100),
        //Validators.pattern('^(?!.*\\s{2,})[a-zA-Z0-9\\s]*$') // Solo letras y números, no permite espacios consecutivos
        //Validators.pattern('^(?!.*\\s{2,})[\\s\\S]*$') // Permite cualquier carácter pero sin espacios consecutivos
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
      codigoDependencia: new FormControl({ value: '', disabled: true }, [
        Validators.required,
        Validators.maxLength(10)
      ]),
      nuDespacho: new FormControl(despacho.nuDespacho, [
        Validators.required,
        Validators.maxLength(11),
        //Validators.pattern('^[0-9]*$')
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

  onClicked() {
    this.clicked.emit();
  }

  listarComboDistritoFiscal() {
    this.despachosService.listarComboDistritoFiscal().subscribe({
      next: (response) => {
        this.distritosFiscales = response.map(df => ({
          label: df.nombre,
          value: df.codigo
        }))
        .sort((a, b) => a.label.localeCompare(b.label));
      },
      error: (err) => {
        console.error('Error al obtener combo distritos fiscales:', err);
      }
    });
  }

  listarComboSede(distritoFiscal: DistritoFiscal) {
    this.despachosService.listarComboSede(distritoFiscal).subscribe({
      next: (response) => {
        this.sedes = response.map(sede => ({
          label: sede.nombre,
          value: sede.codigo
        }))
        .sort((a, b) => a.label.localeCompare(b.label));
  
        this.cmbSedeDisabled.enable();
      },
      error: (err) => {
        console.error('Error al obtener combo sedes:', err);
      }
    });
  }

  listarComboDependencia(sede: Sede) {
    this.despachosService.listarComboDependenciaBySede(sede).subscribe({
      next: (response) => {
        this.dependencias = response
          .map((dep) => ({
            label: dep.nombre,
            value: dep.codigo,
          }))
          .sort((a, b) => a.label.localeCompare(b.label));
  
        this.cmbDependenciaDisabled.enable();
      },
      error: (err) => {
        this.error = err;
        console.error('Error al obtener combo dependencias:', err);
      },
    });
  }

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

  public icon(name: string): string {
    return `assets/icons/${name}.svg`;
  }

  public validOnlyNumbers(event: any): boolean {
    return validOnlyNumbers(event);
  }

  cierraAddAppModal() {
    this.formGroupDespacho.reset();
    this.sedes = [];
    this.dependencias = [];

    this.close.emit();
  }

  onchangeDfGetSedes(event: any) {
    this.formGroupDespacho.get('coDependencia').reset();
    this.cmbDependenciaDisabled.disable();
    this.formGroupDespacho.get('codigoDependencia').reset();
    let distritoFiscal: DistritoFiscal = { codigo: event.value, nombre: null };
    this.listarComboSede(distritoFiscal);
  }

  onchangeSedeGetDependencias(event: any) {
    this.formGroupDespacho.get('coDependencia').reset();
    let sede: Sede = { codigo: event.value, nombre: null };
    this.listarComboDependencia(sede);
  }

  agregarDespacho() {
    if (this.formGroupDespacho.valid) {

      const noFiscalia = getValueByCodeInDropdown(this.dependencias, this.formGroupDespacho.value.coDependencia, "value", "label");
      const nombreDistritoFiscal = getValueByCodeInDropdown(this.distritosFiscales, this.formGroupDespacho.value.coDistritoFiscal, "value", "label");
      this.despachoForm = {
        ...this.formGroupDespacho.value,
        codigo: this.formGroupDespacho.value.coDependencia + "-" + this.formGroupDespacho.value.nuDespacho,
        nombreDependencia: noFiscalia,
        nombreDistritoFiscal: nombreDistritoFiscal,
        coUsuario: this.usuarioSesion?.usuario.usuario,
      };

      this.confirmarAgregarRegistro('question');
      this.refModal.onClose.subscribe({
        next: (resp) => {
          if (resp === 'confirm') {
            this._agregarDespacho();
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

  _agregarDespacho() {
    let despacho: Despacho = this.despachoForm;

    this.despachosService.crearDespacho(despacho).subscribe(
      {
        next: (response) => {
          this.cierraAddAppModal();
          this.formGroupDespacho.reset();

          this.refModal = this.dialogService.open(AlertModalComponent, {
            width: '600px',
            showHeader: false,
            data: {
              icon: 'success',
              title: 'Despacho registrado',
              description: `El registro de los datos del nuevo despacho <b>${this.despachoForm.nombre}</b> ` +
                `de la <b>${this.despachoForm.nombreDependencia}</b> se realizó de forma exitosa.`,
              confirmButtonText: 'Listo'
            },
          });


          this.refModal.onClose.subscribe({
            next: resp => {
              if (resp === 'confirm') {
                this.onClicked();
              }
            }
          });
        },
        error: (err) => {
          if (err.error.code === '42206007') {
            this.modalNotificationService.dialogError('Código Duplicado', "El código de despacho ya se encuentra registrado, por favor validar los datos.");

          } else {
            this.modalNotificationService.dialogError("Error", "Error agregando despacho")
            this.error = err;
            console.error('Error al crear despacho', err);
          }
        }
      });
  }

  onChangeDependencia(event: any) {
    this.formGroupDespacho.get('codigoDependencia').setValue(event.value);
    const dependenciaSeleccionada = this.dependencias.find(dep => dep.value === event.value);
    this.nombreDependenciaFormValue = dependenciaSeleccionada ? dependenciaSeleccionada.label : '';
  }

  getErrorMessage(controlName: string, errorType: string): string {
    return this.errorMessages[controlName]?.[errorType] ?? 'Error en el campo';
  }

  // Método para obtener la longitud del valor de un control
  getLength(controlName: string): number {
    const control = this.formGroupDespacho.get(controlName);
    return control.value ? control.value.length : 0;
  }

  private confirmarAgregarRegistro(icon: string): void {
    this.refModal = this.dialogService.open(AlertModalComponent, {
      width: '50%',
      showHeader: false,
      data: {
        icon: icon,
        title: 'Registrar nuevo despacho',
        confirm: true,
        description:
          `A continuación, se procederá a registrar los datos del nuevo despacho ` +
          `<b>${this.despachoForm.nombre}</b> de la <b>${this.despachoForm.nombreDependencia}</b>. ` +
          `¿Esta seguro de realizar esta acción?`,
        confirmButtonText: 'Aceptar'
      },
    });
  }

}
