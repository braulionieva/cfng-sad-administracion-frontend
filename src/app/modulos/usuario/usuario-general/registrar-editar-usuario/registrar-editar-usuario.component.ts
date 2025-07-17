import { Component, HostListener, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RadioButtonModule } from 'primeng/radiobutton';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { InputNumberModule } from 'primeng/inputnumber';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { CalendarModule } from 'primeng/calendar';
import { ToastModule } from 'primeng/toast';
import { DialogModule } from 'primeng/dialog';
import { PaginatorModule } from 'primeng/paginator';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
  AbstractControl, ValidationErrors, ValidatorFn
} from '@angular/forms';
import { PersonaService } from '@services/shared/reniec/persona.service';
import {
  PersonaRequest,
  PersonaResponse,
} from '@interfaces/shared/reniec/persona';
import { UsuarioService } from '@services/usuario/usuario.service';
import {
  DialogService,
  DynamicDialogConfig,
  DynamicDialogRef,
} from 'primeng/dynamicdialog';
import { MaestroService } from '@services/maestro/maestro.service';
import { MaestroGenerico } from '@interfaces/maestro-generico/maestro-generico';
import { AgregarDependenciaUsService } from '@services/agregar-dependencia-us/agregar-dependencia-us.service';
import { DespachoDTOB } from '@interfaces/agregar-dependencia-us/agregar-dependencia-us';
import { InputMaskModule } from 'primeng/inputmask';
import { AlertModalComponent } from '@components/alert-modal/alert-modal.component';
import {
  LABEL_DOCUMENTO, PAIS_ORIGEN,
  TIPO_DOCUMENTO,
  TIPOS_DEPENDENCIA,
} from '@constants/constantes';
import { MessageService } from 'primeng/api';
import { formatDateSimple } from '@utils/utils';
import { AdminSedeService } from '@services/admin-sede/admin-sede.service';
import { IP_RENIEC } from '@environments/environment';
import { isEqual } from 'lodash';
import { Auth2Service } from '@services/auth/auth2.service';
import { PerfilesUsuarioService } from '@services/admin-usuario/perfiles-usuario/perfiles-usuario.service';

@Component({
  selector: 'app-registrar-editar-usuario',
  standalone: true,
  imports: [
    CommonModule,
    RadioButtonModule,
    InputTextModule,
    DropdownModule,
    InputNumberModule,
    ButtonModule,
    CheckboxModule,
    CalendarModule,
    ToastModule,
    DialogModule,
    PaginatorModule,
    ReactiveFormsModule,
    InputMaskModule,
  ],
  providers: [MessageService],
  templateUrl: './registrar-editar-usuario.component.html',
  styleUrls: ['./registrar-editar-usuario.component.scss'],
})
export class RegistrarEditarUsuarioComponent implements OnInit {
  public persona: PersonaResponse;
  public error: string;
  hasError: boolean = true;
  public editar: boolean = false;
  datosUsuario: any = null;
  public formGroup: FormGroup;
  public initialFormValues: FormGroup;

  public usuarioSesion;

  public nombreFormulario: string;
  flagTipoDocDuplicado: boolean = false;
  descriptionErrorDni: string = '';
  public duplicadoCI: boolean = false;
  public duplicadoCP: boolean = false;
  usuario: any;
  public tiposDocumento: any[];
  public tipoDocumentoGeneral: any[];
  public distritosFiscales: MaestroGenerico[];
  public sedes: any;
  public tipoEntidad: any[];
  public dependencias: any[];
  public cargos: any[];
  public pais: any[];
  public despachoFiscalia: DespachoDTOB[] = [];
  //public labelTipoDocumento: string = 'Ingrese número de DNI';
  //public placeHolderTipoDocumento: string = '';
  private idDistritoFiscalSeleccionado: number;
  private codigoSedeSeleccionada: string;
  private idTipoEntidadSeleccionado: number;

  public mostrarDespachos: boolean = false;

  public origenes: any[] = [
    { name: 'Peruano', key: 'P' },
    { name: 'Extranjero', key: 'E' },
  ];

  public sexo: any[] = [
    { name: 'Masculino', key: 'M' },
    { name: 'Femenino', key: 'F' },
  ];

  public relacionLaboral: any[] = [
    { name: 'Trabajador', key: 'T' },
    { name: 'Tercero', key: 'TER' },
    { name: 'Externo', key: 'E' },
  ];

  private readonly personaService: PersonaService = inject(PersonaService);
  private readonly formBuilder: FormBuilder = inject(FormBuilder);
  public readonly ref: DynamicDialogRef = inject(DynamicDialogRef);

  private readonly maestroService: MaestroService = inject(MaestroService);
  private readonly sedesService: AdminSedeService = inject(AdminSedeService);
  private readonly perfilesUsuarioService: PerfilesUsuarioService = inject(
    PerfilesUsuarioService
  );

  private readonly agregarDependenciaUsService: AgregarDependenciaUsService =
    inject(AgregarDependenciaUsService);

  correoPersonalBD: boolean = false;
  correoInstitucionalBD: boolean = false;

  public refModal: DynamicDialogRef;

  opcionesDocumento = [];

  constructor(
    public dialogService: DialogService,
    public usuarioService: UsuarioService,
    public config: DynamicDialogConfig,
    private userService: Auth2Service
  ) {
    this.usuario = this.config?.data.usuarioSelected;
    this.editar = Boolean(this.config?.data.usuarioSelected);
    this.nombreFormulario =
      (this.config?.data.usuarioSelected ? 'Editar' : 'Agregar') + ' Usuario';
    this.idDistritoFiscalSeleccionado = 0;
    this.codigoSedeSeleccionada = null;
    this.idTipoEntidadSeleccionado = 0;

    this.formGroup = this.formBuilder.group({
      origen: ['P', [Validators.required]], // Valor inicial 'P'
      tipoDocumento: [TIPO_DOCUMENTO.DNI, [Validators.required]],
      numeroDocumento: [
        null,
        {
          validators: [
            Validators.required,
            Validators.maxLength(8),
            Validators.pattern(/^\d{8}$/),
          ],
        },
      ],
      nombres: [null],
      primerApellido: [null],
      segundoApellido: [null],
      idDistritoFiscal: [null, [Validators.required]],
      idSede: [null, [Validators.required]],
      idTipoDependencia: [null, [Validators.required]],
      codigoDependencia: [null, [Validators.required]],
      idCargo: [null, [Validators.required]],
      idRelacionLaboral: ['T', [Validators.required]],
      correoPersonal: [
        { value: '', disabled: false },
        [Validators.email, Validators.maxLength(100)],
      ],
      correoInstitucional: [
        { value: '', disabled: false },
        [Validators.email, Validators.maxLength(100)],
      ],
      fechaNacimiento: [
        null,
        [Validators.required, this.edadMinimaValidator(18)],
      ],
      idPaisOrigen: [PAIS_ORIGEN.PERUANO],
      codigoSexo: ['M'], // Valor inicial 'M'
      checkCorreoPersonal: [false],
      checkCorreoInstitucional: [false],
      checkCambioContrasenia: [true], // Valor inicial true
      despachoFiscalia: [null],
      celular: [null, [Validators.maxLength(9)]],
      codigoSinoe: [null, [Validators.maxLength(20)]],
    });
  }

  @HostListener('focus', ['$event'])
  onFocus(event: FocusEvent) {
    const target = event.target as HTMLElement;
    if (target.classList.contains('p-radiobutton-input')) {
      target.blur();
    }
  }

  ngOnInit(): void {
    console.log("this.usuario:",this.usuario)
    this.listarCargos();
    this.listarNacionalidad();
    this.listarTipoDocumento();
    this.suscribirComboDistritoFiscal();
    this.suscribirComboSede();
    this.suscribirComboTipoEntidad();
    //this.suscribirCambioOrigen();
    this.listarDistritosFiscales();
    //this.usuarioSesion = this.userService.getUserInfo();

    if (this.editar) {
      this.loadUsuario();
    }
  }

  ngAfterContentInit (): void {
    setTimeout(() => {
      this.usuarioSesion = this.userService.getUserInfo();
      // Deshabilitamos los campos que no deben ser editables
      // if (this.editar) {
      //   this.formGroup.get('origen').disable();
      // }

    }, 100);
  }

  edadMinimaValidator(edadMinima: number): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) {
        return null;
      }

      const fechaNacimiento = new Date(control.value);
      const fechaActual = new Date();
      const edad = fechaActual.getFullYear() - fechaNacimiento.getFullYear();

      const mesActual = fechaActual.getMonth();
      const mesNacimiento = fechaNacimiento.getMonth();

      const diaActual = fechaActual.getDate();
      const diaNacimiento = fechaNacimiento.getDate();

      if (
        mesActual < mesNacimiento ||
        (mesActual === mesNacimiento && diaActual < diaNacimiento)
      ) {
        return edad - 1 >= edadMinima ? null : { menorDeEdad: true };
      }

      return edad >= edadMinima ? null : { menorDeEdad: true };
    };
  }

  /***async loadUsuarioOld() {
    this.usuarioService.obtenerUsuario(this.usuario.idUsuario).subscribe(
      //cambiar el usuario
      {
        next: (response) => {
          this.datosUsuario = response;
          this.formGroup.patchValue({
            ...this.datosUsuario,
          });

          this.formGroup
            .get('idTipoDependencia')
            .setValue(this.datosUsuario.idTipoEntidad);
          this.formGroup.get('idSede').setValue(this.datosUsuario.codigoSede);
          this.formGroup
            .get('codigoDependencia')
            .setValue(this.datosUsuario.codigoEntidad);
          this.formGroup
            .get('despachoFiscalia')
            .setValue(this.datosUsuario.codigoDespacho);
          this.formGroup
            .get('fechaNacimiento')
            .setValue(new Date(this.datosUsuario?.fechaNacimiento));

          let idRelacionLaboralValue: string;

          if (this.datosUsuario.idRelacionLaboral === 1) {
            idRelacionLaboralValue = 'T';
          } else if (this.datosUsuario.idRelacionLaboral === 2) {
            idRelacionLaboralValue = 'TER';
          } else {
            idRelacionLaboralValue = 'E';
          }

          if (this.datosUsuario.idTipoDocumento === TIPO_DOCUMENTO.DNI) {
            this.formGroup.get('origen')?.setValue('P');
          } else {
            this.formGroup.get('origen')?.setValue('E');
          }

          //this.actualizaTipoOrigen(true);
          //this.actualizarLabelNumeroDoc();

          this.formGroup
            .get('tipoDocumento')
            ?.setValue(this.datosUsuario.idTipoDocumento);

          if (this.datosUsuario.idTipoEntidad === 1) {
            console.log(
              'tipo entidad fiscalías, llamando a listado de despachos'
            );
            // (sólo si es Fiscalía → idTipoEntidad=1)
            this.mostrarDespachos = true;

            // Llamas al servicio que llena 'despachoFiscalia'
            this.agregarDependenciaUsService
              .getDespachoLst(this.datosUsuario.codigoEntidad)
              .subscribe({
                next: (responseDespachos) => {
                  // Llenas el array que alimenta el <p-dropdown>
                  this.despachoFiscalia = responseDespachos;

                  // Seteas el despacho seleccionado
                  this.formGroup
                    .get('despachoFiscalia')
                    .setValue(this.datosUsuario.codigoDespacho);
                },
                error: (err) =>
                  console.error('Error al listar despachos:', err),
              });
          } else {
            this.mostrarDespachos = false;
          }

          const [year, month, day] =
            this.datosUsuario.fechaNacimiento.split('-');
          const fixDate = new Date(+year, +month - 1, +day);

          this.formGroup.get('fechaNacimiento').setValue(fixDate);
          this.formGroup
            .get('idRelacionLaboral')
            .setValue(idRelacionLaboralValue);
          this.correoPersonalBD = Boolean(this.formGroup.value.correoPersonal);
          this.correoInstitucionalBD = Boolean(
            this.formGroup.value.correoInstitucional
          );

          this.datosUsuario.codigoSexo == '1'
            ? this.formGroup.get('codigoSexo').setValue('M')
            : this.formGroup.get('codigoSexo').setValue('F');

          this.formGroup
            .get('idCargo')
            .setValue(this.datosUsuario?.idCargo.toString());
          //this.usuarioForm.get("idPaisOrigen").setValue(null);

          this.formGroup.get('checkCambioContrasenia').setValue(false);

          // Guardar los valores iniciales
          this.initialFormValues = this.formGroup.getRawValue();
        },
        error: (err) => {
          this.error = err;
        },
      }
    );
  }***/

  loadUsuario() {
    this.usuarioService.obtenerUsuario(this.usuario.idUsuario).subscribe(
      //cambiar el usuario
      {
        next: (response) => {
          this.datosUsuario = response;

          let idRelacionLaboralValue: string;

          if (this.datosUsuario.idRelacionLaboral === 1) {
            idRelacionLaboralValue = 'T';
          } else if (this.datosUsuario.idRelacionLaboral === 2) {
            idRelacionLaboralValue = 'TER';
          } else {
            idRelacionLaboralValue = 'E';
          }

          const origenValue =
            this.datosUsuario.idTipoDocumento === TIPO_DOCUMENTO.DNI
              ? 'P'
              : 'E';
          const codigoSexoValue =
            this.datosUsuario.codigoSexo == '1' ? 'M' : 'F';
          const [year, month, day] =
            this.datosUsuario.fechaNacimiento.split('-');
          const fixDate = new Date(+year, +month - 1, +day);

          this.formGroup.patchValue({
            ...this.datosUsuario,
            idTipoDependencia: this.datosUsuario.idTipoEntidad,
            idSede: this.datosUsuario.codigoSede,
            codigoDependencia: this.datosUsuario.codigoEntidad,
            despachoFiscalia: this.datosUsuario.codigoDespacho,
            fechaNacimiento: fixDate,
            idRelacionLaboral: idRelacionLaboralValue,
            origen: origenValue,
            tipoDocumento: this.datosUsuario.idTipoDocumento,
            codigoSexo: codigoSexoValue,
            idCargo: this.datosUsuario?.idCargo.toString(),
            checkCambioContrasenia: false,
          });
          //}, { emitEvent: false });//deja de actualizar sedes y los demás eventos onchanges suscritos por eso se comenta

          // Asignar valores que no van en el patchValue
          this.correoPersonalBD = Boolean(this.formGroup.value.correoPersonal);
          this.correoInstitucionalBD = Boolean(
            this.formGroup.value.correoInstitucional
          );

          if (this.datosUsuario.idTipoEntidad === 1) {
            // (sólo si es Fiscalía → idTipoEntidad=1)
            this.mostrarDespachos = true;

            // Llamas al servicio que llena 'despachoFiscalia'
            this.agregarDependenciaUsService
              .getDespachoLst(this.datosUsuario.codigoEntidad)
              .subscribe({
                next: (responseDespachos) => {
                  // Llenas el array que alimenta el <p-dropdown>
                  this.despachoFiscalia = responseDespachos;

                  // Seteas el despacho seleccionado
                  this.formGroup.get('despachoFiscalia').setValue(this.datosUsuario.codigoDespacho);

                  // Deshabilitamos los campos que no deben ser editables
                  this.formGroup.get('origen').disable();//produce error ExpressionChangedAfterItHasBeenCheckedError
                  this.formGroup.get('tipoDocumento').disable();
                  this.formGroup.get('numeroDocumento').disable();


                },
                error: (err) =>
                  console.error('Error al listar despachos:', err),
              });
          } else {
            this.mostrarDespachos = false;
          }

          // Guardar los valores iniciales
          this.initialFormValues = this.formGroup.getRawValue();
        },
        error: (err) => {
          this.error = err;
        },
      }
    );
  }

  /*deshabilitarxyz(){
    this.formGroup.get('origen').disable();
  }*/

  get placeHolder() {
    return this.datosUsuario?.idCargo ? this.datosUsuario.cargo : 'Seleccionar';
  }

  private suscribirComboDistritoFiscal(): void {
    this.formGroup.get('idDistritoFiscal').valueChanges.subscribe((value) => {
      //asigno el id del distrito fiscal seleccionado
      this.idDistritoFiscalSeleccionado = value;
      this.listarSedes(this.idDistritoFiscalSeleccionado);
      this.formGroup.get('idSede').enable(); // Habilita el segundo dropdown cuando se elige una opción en el primero
    });
  }

  private suscribirComboSede(): void {
    this.formGroup.get('idSede').valueChanges.subscribe((value) => {
      this.codigoSedeSeleccionada = value;
      this.listarTipoEntidad();
      this.formGroup.get('idTipoDependencia').enable(); // Habilita el segundo dropdown cuando se elige una opción en el primero
    });
  }

  private suscribirComboTipoEntidad(): void {
    this.formGroup.get('idTipoDependencia').valueChanges.subscribe((value) => {
      this.idTipoEntidadSeleccionado = value;
      if (
        this.idDistritoFiscalSeleccionado !== null &&
        this.codigoSedeSeleccionada !== null &&
        this.idTipoEntidadSeleccionado !== null
      ) {
        this.listarEntidad(
          this.idDistritoFiscalSeleccionado,
          this.codigoSedeSeleccionada,
          this.idTipoEntidadSeleccionado
        );
        //-------------------------------------------
        if (this.idTipoEntidadSeleccionado === TIPOS_DEPENDENCIA.FISCALIAS) {
          this.mostrarDespachos = true;
        } else {
          this.mostrarDespachos = false;
          this.formGroup.get('despachoFiscalia')?.reset();
        }
        //-------------------------------------------
      }
      this.formGroup.get('codigoDependencia').enable(); // Habilita el segundo dropdown cuando se elige una opción en el primero
    });
  }

  onChangeDependencias(event: any) {
    this.listarDespachos(event.value);
  }

  /***suscribirCambioOrigen(): void {
    this.formGroup.get('origen').valueChanges.subscribe((value) => {
      console.log('suscribirCambioOrigen:', value);
      if (value === 'P') {
        this.formGroup.get('tipoDocumento').setValue(TIPO_DOCUMENTO.DNI);
        this.labelTipoDocumento = LABEL_DOCUMENTO.DNI;
        this.placeHolderTipoDocumento = 'Ingrese número de DNI';
        //this.formGroup.get('idPaisOrigen').setValue(PAIS_ORIGEN.PERUANO);
      } else {
        this.formGroup.get('tipoDocumento').setValue(TIPO_DOCUMENTO.CARNET_EXTRANJERIA);
        this.labelTipoDocumento = LABEL_DOCUMENTO.EXTRANJERO;
        this.placeHolderTipoDocumento = 'Ingrese número de documento';
        //this.formGroup.get('idPaisOrigen').setValue(null);
      }
    });
  }***/

  onChangeOrigen(event: any): void {
    const value = event.value;
    console.log('onChangeOrigen:', value);
    if (!this.editar) {//solo aplica para nuevos registros
      if (value === 'P') {
        this.formGroup.get('tipoDocumento').setValue(TIPO_DOCUMENTO.DNI);
        //this.labelTipoDocumento = LABEL_DOCUMENTO.DNI;
        //this.placeHolderTipoDocumento = 'Ingrese número de DNI';
        this.formGroup.get('idPaisOrigen').setValue(PAIS_ORIGEN.PERUANO);
      } else {
        this.formGroup.get('tipoDocumento').setValue(TIPO_DOCUMENTO.CARNET_EXTRANJERIA);
        //this.labelTipoDocumento = LABEL_DOCUMENTO.EXTRANJERO;
        //this.placeHolderTipoDocumento = 'Ingrese número de documento';
        this.formGroup.get('idPaisOrigen').setValue(null);
      }
    }

  }

  /***private suscribirCodigoDependenciaChanges(): void {
    this.usuarioForm
      .get('codigoDependencia')
      .valueChanges.subscribe((value) => {
        if (this.idTipoEntidadSeleccionado === TIPOS_DEPENDENCIA.FISCALIAS) {
          this.mostrarDespachos = true;
          this.listarDespachos(value); //listar cuando se selecciona dependencias en changeValue
        } else {
          this.mostrarDespachos = false;
          this.usuarioForm.get('despachoFiscalia')?.reset();
        }
      });
  }

  actualizarLabelNumeroDoc(){
    if (this.usuarioForm.value.origen === ORIGEN.PERUANO) {
      this.labelTipoDocumento = 'Ingrese número de DNI';
    }else{
      this.labelTipoDocumento = 'Ingrese número de documento';
    }
  }

  actualizaTipoOrigen(modoEdicion = false) {
    // Filtras la lista de tipos de documentos según el origen, etc.
    if (this.usuarioForm.value.origen === ORIGEN.PERUANO) {
      // lógicas varias...
      this.tiposDocumento = this.tipoDocumentoGeneral?.filter(
        (x) => x.idTipoDocumento === TIPO_DOCUMENTO.DNI
      );
      this.labelTipoDocumento = LABEL_DOCUMENTO.DNI;
      this.placeHolderTipoDocumento = 'Ingrese número de DNI';

      if (!modoEdicion) {
        this.usuarioForm.get('tipoDocumento')?.setValue(TIPO_DOCUMENTO.DNI);
      }
    } else {
      // lógicas varias...
      this.tiposDocumento = this.tipoDocumentoGeneral?.filter(
        (x) => x.origenNacionalidad === CODIGO_NACIONALIDAD.EXTRANJERO
      );
      this.labelTipoDocumento = LABEL_DOCUMENTO.EXTRANJERO;
      this.placeHolderTipoDocumento = 'Ingrese número de documento';

      if (!modoEdicion) {
        this.usuarioForm
          .get('tipoDocumento')
          ?.setValue(TIPO_DOCUMENTO.CARNE_EXTRANJERIA);
      }
    }

    // Aquí pones la lógica de habilitar/deshabilitar segun modo (crear/editar) y origen
    if (!this.editar) {
      // === Agregar nuevo usuario ===
      // Siempre habilitados (independientemente de si es peruano o extranjero)
      this.usuarioForm.get('nombres')?.enable();
      this.usuarioForm.get('primerApellido')?.enable();
      this.usuarioForm.get('segundoApellido')?.enable();
    } else {
      // === Editar usuario ===
      if (this.usuarioForm.value.origen === ORIGEN.PERUANO) {
        // Si es peruano y estás editando, deshabilitar
        this.usuarioForm.get('nombres')?.disable();
        this.usuarioForm.get('primerApellido')?.disable();
        this.usuarioForm.get('segundoApellido')?.disable();
      } else {
        // Si es extranjero y estás editando, habilitar
        this.usuarioForm.get('nombres')?.enable();
        this.usuarioForm.get('primerApellido')?.enable();
        this.usuarioForm.get('segundoApellido')?.enable();
      }
    }
  }***/

  getInputStyles() {
    return {
      'background-color': this.hasError ? 'lightcoral' : 'lightgreen',
      border: this.hasError ? '1px solid red' : '1px solid green',
      color: this.hasError ? 'darkred' : 'darkgreen',
      padding: '10px',
    };
  }

  consultarCorreoBD(tipo) {
    let correo = this.formGroup.get('correoPersonal')?.value;

    if (tipo == 'correoInstitucional')
      correo = this.formGroup.get('correoInstitucional')?.value;

    this.usuarioService.consultarCorreoBD(correo).subscribe({
      next: (res: any) => {
        if (res.PO_V_CANTIDAD == 0) {
          if (tipo == 'correoPersonal') {
            this.correoPersonalBD = true;
            this.duplicadoCP = false;
          } else {
            this.correoInstitucionalBD = true;
            this.duplicadoCI = false;
          }
        } else if (tipo == 'correoPersonal') {
          this.correoPersonalBD = false;
          this.duplicadoCP = true;
        } else {
          this.correoInstitucionalBD = false;
          this.duplicadoCI = true;
        }
      },
      error: (err: string) => {
        console.error('Error al consultar BD: ', err);
      },
    });
  }

  /***actualizaTipoDocumento(value: string) {
    this.tiposDocumento = this.tipoDocumentoGeneral.filter(
      (x) => x.origenNacionalidad == value
    );
  }***/

  onChangeTipoDocumento(event: any): void {
    //Capturar ID del tipoDocumento seleccionado
    const tipoDocSeleccionado = event.value;
    //Buscar los datos completos en el array tipoDocumentoGeneral
    const docDefinicion = this.tipoDocumentoGeneral.find(
      (doc) => doc.idTipoDocumento === tipoDocSeleccionado
    );
    console.log('Tipo de DOc Seleccionado: ', tipoDocSeleccionado);
    console.log('Tipo de DOc Seleccionado: ', docDefinicion);

    //Obtener el control de numeroDocumento
    const numeroDocumentoControl = this.formGroup.get('numeroDocumento');

    //Remover validadores anteriores, si los hubiera
    numeroDocumentoControl.clearValidators();

    if (docDefinicion) {
      if (docDefinicion.tipoLongitud === 'EXACTA') {
        const exacta = Number(docDefinicion.longitudMaxima);
        console.log('Exacta: ', exacta);
        numeroDocumentoControl.setValidators([
          Validators.required,
          Validators.minLength(exacta),
          Validators.maxLength(exacta),
          Validators.pattern('^[0-9]+$'),
        ]);
      } else if (docDefinicion.tipoLongitud === 'VARIABLE') {
        //entre 8 y 20 dígitos
        numeroDocumentoControl.setValidators([
          Validators.required,
          Validators.minLength(8),
          Validators.maxLength(20),
          Validators.pattern('^[0-9]+$'),
        ]);
      } else {
        numeroDocumentoControl.setValidators([
          Validators.required,
          Validators.maxLength(20),
          Validators.pattern('^[0-9]+$'),
        ]);
      }
    } else {
      numeroDocumentoControl.setValidators([
        Validators.required,
        Validators.maxLength(20),
        Validators.pattern('^[0-9]+$'),
      ]);
    }

    numeroDocumentoControl.updateValueAndValidity();

    //se añade cambio de label en numero de documento:
    //si el tipo de documento se  TIPO_DOCUMENTO.DNI, el label será LABEL_DOCUMENTO.DNI
    //si el tipo de documento se  TIPO_DOCUMENTO.CARNET_EXTRANJERIA, el label será LABEL_DOCUMENTO.EXTRANJERO
    // Actualizar el label según el tipo de documento
    if (tipoDocSeleccionado === TIPO_DOCUMENTO.DNI) {
      //this.labelTipoDocumento = LABEL_DOCUMENTO.DNI;
      //this.placeHolderTipoDocumento = 'Ingrese número de DNI';
      this.formGroup.get('idPaisOrigen').setValue(PAIS_ORIGEN.PERUANO);
      this.formGroup.get('origen')?.setValue('P');
    } else if (tipoDocSeleccionado === TIPO_DOCUMENTO.CARNET_EXTRANJERIA) {
      //this.labelTipoDocumento = LABEL_DOCUMENTO.EXTRANJERO;
      //this.placeHolderTipoDocumento = 'Ingrese número de documento';
      this.formGroup.get('idPaisOrigen').setValue(null);
      this.formGroup.get('origen')?.setValue('E');
    }

  }

  get maxLongitudActual(): number {
    const tipoDocSeleccionado = this.formGroup.get('tipoDocumento')?.value;
    const docDefinicion = this.tipoDocumentoGeneral?.find(
      (doc) => doc.idTipoDocumento === tipoDocSeleccionado
    );

    if (!docDefinicion) return 20; // fallback

    if (docDefinicion.tipoLongitud === 'EXACTA') {
      return +docDefinicion.longitudMaxima;
    } else if (docDefinicion.tipoLongitud === 'VARIABLE') {
      return 20;
    } else {
      return 20; // fallback
    }
  }

  listarTipoDocumento() {
    this.usuarioService.listarTipoDocumento().subscribe({
      next: (res: any) => {
        /***this.tipoDocumentoGeneral = res.tipoDocumentoList;***/
        this.tipoDocumentoGeneral = res?.tipoDocumentoList?.filter(
          (x) => x.longitudMaxima != null
        );

        this.tipoDocumentoGeneral.sort((a, b) =>
          a.tipoDocumento.localeCompare(b.tipoDocumento)
        );
      },
      error: (err: string) => {
        console.error('Error al consultar BD: ', err);
      },
    });
  }

  private listarDistritosFiscales(): void {
    this.maestroService.listarDistritosFiscalesActivos().subscribe((data) => {
      this.distritosFiscales = data;
      this.distritosFiscales.sort((a, b) => a.nombre.localeCompare(b.nombre));
    });
  }

  private listarSedes(idDistritoFiscal: number): void {
    const request: any = {
      pages: 10,
      perPage: 1,
      filtros: { nombreSede: null, idDistritoFiscal: idDistritoFiscal },
    };
    this.sedesService.obtenerSedes(request).subscribe({
      next: (response) => {
        this.sedes = response?.registros || [];
        this.sedes.sort((a, b) => a.nombreSede.localeCompare(b.nombreSede));
      },
      error: (err) => {
        this.error = err;
      },
    });
  }

  private listarTipoEntidad(): void {
    this.tipoEntidad = [
      { label: 'Fiscalía', value: 1 },
      { label: 'Mesa Única de Partes', value: 2 },
      { label: 'Central de Notificaciones', value: 3 },
      { label: 'Presidencia de la junta de fiscales superiores', value: 4 },
      { label: 'Sede Judicial', value: 5 },
    ];

    this.tipoEntidad.sort((a, b) => a.label.localeCompare(b.label));
  }

  private listarEntidad(
    idDistritoFiscal: number,
    codigoSede: string,
    idTipoEntidad: number
  ): void {
    const request: any = {
      idDistritoFiscal: idDistritoFiscal,
      codigoSede: codigoSede,
      idTipoEntidad: idTipoEntidad,
    };

    this.maestroService.listarDependencias(request).subscribe({
      next: (response) => {
        this.dependencias = response || [];
        this.dependencias.sort((a, b) => a.nombre.localeCompare(b.nombre));
      },
      error: (err) => {
        console.error('error al listar dependencias.', err);
      },
    });
  }

  private listarDespachos(coVEntidad: string) {
    this.agregarDependenciaUsService.getDespachoLst(coVEntidad).subscribe({
      next: (response) => {
        this.despachoFiscalia = response || [];
        this.despachoFiscalia.sort((a, b) =>
          a.noVDespacho.localeCompare(b.noVDespacho)
        );
      },
      error: (err) => {
        console.error('error al leer datos del servidor. ', err);
      },
    });
  }

  listarCargos(): void {
    this.maestroService.listarCargos().subscribe((response) => {
      this.cargos = response || [];
      this.cargos.sort((a, b) => a.nombre.localeCompare(b.nombre));
    });
  }

  private listarNacionalidad(): void {
    this.maestroService.listarNacionalidad().subscribe((response) => {
      this.pais = response || [];
      this.pais.sort((a, b) => a.nombre.localeCompare(b.nombre));
    });
  }

  async registrar() {
    const currentFormValues = this.formGroup.getRawValue();

    if (isEqual(this.initialFormValues, currentFormValues)) {
      // Los valores son iguales; no se han realizado cambios efectivos
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

    // Validar documento duplicado antes de proceder
    const documentoDuplicado = await this.validarDocumentoDuplicado(true); // Pasar true para mostrar mensaje
    if (documentoDuplicado) {
      return;
    }

    if (this.editar) {
      const request = this.obtenerUsuario();
      const descripcion = `A continuación, se procederá a modificar los datos del usuario <b>${request.numeroDocumento}. </b>¿Está seguro de realizar esta acción?`;
      this.refModal = this.dialogService.open(AlertModalComponent, {
        width: '700px',
        showHeader: false,
        data: {
          icon: 'question',
          title: 'Editar usuario',
          confirm: true,
          confirmButtonText: 'Aceptar',
          description: descripcion,
        },
      });
      this.refModal.onClose.subscribe({
        next: (resp) => {
          if (resp === 'confirm') {
            this.usuarioService
              .updateUsuario(this.usuario.idUsuario, request)
              .subscribe({
                next: (response) => {
                  this.updateSatisfactorio(request);
                },
                error: (err) => {
                  console.error('Error al guardar usuario:', err);
                },
              });
          }
        },
      });
      return;
    }

    if (this.formGroup.valid) {
      const request = this.obtenerUsuario();
      const descripcion = `A continuación, se procederá a registrar los datos del nuevo usuario <b>${request.numeroDocumento}. </b>¿Está seguro de realizar esta acción?`;
      this.refModal = this.dialogService.open(AlertModalComponent, {
        width: '700px',
        showHeader: false,
        data: {
          icon: 'question',
          title: 'Registrar nuevo usuario',
          confirm: true,
          confirmButtonText: 'Aceptar',
          description: descripcion,
        },
      });
      this.refModal.onClose.subscribe({
        next: (resp) => {
          if (resp === 'confirm') {
            this.usuarioService.crearUsuario(request).subscribe({
              next: (response) => {
                console.log("response:",response)
                this.guardadoSatisfactorio(request,response);

                /***
                --Creacion de perfil para el usuario creado
                const datosSolicitud = {
                  listaPerfiles: [805],
                  idAplicacion: 7,
                };

                this.perfilesUsuarioService
                  .agregarPerfil(datosSolicitud)
                  .subscribe({
                    next: (response) => {
                      console.info('Se asigno perfil al usuario creado.');
                    },
                    error: (err) => {
                      console.error('Error al asignar perfil: ', err);
                    },
                  });***/

              },
              error: (err) => {
                console.error('Error al guardar usuario:', err);
              },
            });
          }
        },
      });
    } else {
      this.marcarCamposComoTocados(this.formGroup);
    }
  }

  public guardadoSatisfactorio(objUsuario: any,response:any): void {
    let strIsChecked: string = '';

    if (this.formGroup?.value.checkCambioContrasenia) {
      strIsChecked =
        '(Tener en cuenta que usted ha seleccionado "Cambiar su contraseña" en el 1er ingreso)';
    }

    const descripcion = `El registro de los datos ingresados se realizó de forma exitosa.<br><b>Usuario:</b>
    ${response?.data}<br><b>Contraseña:</b>
    ${objUsuario?.contrasenia}<br> ${strIsChecked}<br><b>Por favor, anote su contraseña para futuros ingresos al sistema</b>`;

    this.refModal = this.dialogService.open(AlertModalComponent, {
      width: '840px',
      showHeader: false,
      data: {
        icon: 'success',
        title: 'REGISTRO EXITOSO',
        description: descripcion,
        confirmButtonText: 'Listo',
      },
    });
    let data = { id: 1, accion: 'actualizar bandeja' };
    this.ref.close(data);
  }

  public updateSatisfactorio(objUsuario: any): void {
    const descripcion = `La actualización de los datos del usuario <b>${objUsuario?.numeroDocumento}</b> se realizó de forma exitosa.`;

    this.refModal = this.dialogService.open(AlertModalComponent, {
      width: '840px',
      showHeader: false,
      data: {
        icon: 'success',
        title: 'Usuario editado',
        description: descripcion,
        confirmButtonText: 'Listo',
      },
    });
    let data = { id: 1, accion: 'actualizar bandeja' };
    this.ref.close(data);
  }

  private obtenerUsuario(): any {
    // IMPORTANTE: Usar getRawValue() para incluir campos disabled
    const formValues = this.formGroup.getRawValue();

    const requestUsuario = {
      idTipoDocumento: formValues.tipoDocumento,
      numeroDocumento: formValues.numeroDocumento,
      nombres: formValues.nombres,
      primerApellido: formValues.primerApellido,
      segundoApellido: formValues.segundoApellido,
      idDistritoFiscal: formValues.idDistritoFiscal,
      codigoSede: formValues.idSede,
      idTipoEntidad: formValues.idTipoDependencia,
      codigoEntidad: formValues.codigoDependencia,
      idCargo: formValues.idCargo,
      idRelacionLaboral: this.mapRelacionLaboral(formValues.idRelacionLaboral),
      correoPersonal: formValues.correoPersonal,
      correoInstitucional: formValues.correoInstitucional,
      codigoDespacho: formValues.despachoFiscalia,
      celular: formValues.celular,
      idPaisOrigen: formValues.idPaisOrigen,
      codigoSinoe: formValues.codigoSinoe,
      codigoSexo: formValues.codigoSexo,
      cambiarContrasenia: formValues.checkCambioContrasenia,
      fechaNacimiento: formatDateSimple(formValues.fechaNacimiento),
      contrasenia: this.generarContrasena(12),
      usuarioCreador: this.usuarioSesion?.usuario.usuario,
    };
    return requestUsuario;
  }

  //refactorizado
  generarContrasena(length: number): string {
    const characters =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    const charactersLength = characters.length;

    // Verifica si la longitud es válida
    if (length <= 0) {
      throw new Error('La longitud debe ser un número positivo.');
    }

    for (let i = 0; i < length; i++) {
      const randomValues = new Uint32Array(1);
      window.crypto.getRandomValues(randomValues);
      const index = randomValues[0] % charactersLength;
      result += characters.charAt(index);
    }

    return result;
  }

  //usado antes en  (input)="CambiaDni()"  del input numeroDocumento
  /***CambiaDni() {
    this.flagTipoDocDuplicado = false;
  }***/

  public consultarPersona(): void {
    let numeroDocumento = this.formGroup.controls['numeroDocumento'].value;

    this.usuarioService.obtenerUsuarioXDni(numeroDocumento).subscribe({
      next: (response) => {
        if (response) {
          this.flagTipoDocDuplicado = true;
        }
      },
      error: (err) => {
        this.consultarPersonaReniec(numeroDocumento);
        return false;
      },
    });
  }

  public consultarPersonaReniec(numeroDocumento: string): void {
    const ip: string = IP_RENIEC;

    //genero mi request payload
    let personaRequest: PersonaRequest = {
      ip: ip,
      numeroDocumento: numeroDocumento,
    };

    //consumo mi endpoint del service persona
    this.personaService.consultarPersona(personaRequest).subscribe({
      next: (data: PersonaResponse): void => {
        this.persona = data;
        this.llenarFormularioCOnsultaReniec(this.persona);
      },
      error: (error) => {
        this.error = error;
      },
    });
  }

  private llenarFormularioCOnsultaReniec(data: PersonaResponse): void {
    const dateObject: Date = this.convertStringToDate(data.fechaNacimiento);
    this.formGroup.controls['numeroDocumento'].setValue(data.numeroDocumento);
    this.formGroup.controls['nombres'].setValue(data.nombres);
    this.formGroup.controls['primerApellido'].setValue(data.apellidoPaterno);
    this.formGroup.controls['segundoApellido'].setValue(data.apellidoMaterno);
    this.formGroup.controls['fechaNacimiento'].setValue(dateObject);
  }

  private convertStringToDate(dateString: string): Date {
    const [day, month, year] = dateString.split('/').map(Number);
    return new Date(year, month - 1, day); // los meses en Date empiezan en 0
  }

  public close(): void {
    this.ref.close();
  }

  public icon(name: string): string {
    return `assets/icons/${name}.svg`;
  }
  public img(name: string): string {
    return `assets/images/${name}.png`;
  }
  get numeroDocumento() {
    return this.formGroup.get('numeroDocumento');
  }

  get codigoSinoe() {
    return this.formGroup.get('codigoSinoe');
  }
  get celular() {
    return this.formGroup.get('celular');
  }

  get correoPersonal() {
    return this.formGroup.get('correoPersonal');
  }
  get correoInstitucional() {
    return this.formGroup.get('correoInstitucional');
  }
  invalidaCorreoPersonal() {
    this.correoPersonalBD = false;
    this.duplicadoCP = false;
  }
  invalidaCorreoInstitucional() {
    this.correoInstitucionalBD = false;
    this.duplicadoCI = false;
  }

  marcarCheckbox() {
    this.formGroup.get('checkCorreoInstitucional')?.setValue(true);
  }

  desmarcarCheckbox() {
    this.formGroup.get('checkCorreoInstitucional')?.setValue(false);
  }
  onInputNumeroDocumento(event: Event): void {
    const input = event.target as HTMLInputElement;
    // Eliminar cualquier valor que no sea un número
    input.value = input.value.replace(/\D/g, '');
    // Restringir a un máximo de 8 dígitos
    // if (input.value.length > 8) {
    //   input.value = input.value.slice(0, 8);
    // }
    this.formGroup
      .get('numeroDocumento')
      ?.setValue(input.value, { emitEvent: false });
  }

  onInputCodigoSinoe(event: Event): void {
    const input = event.target as HTMLInputElement;
    // Eliminar cualquier valor que no sea un número
    input.value = input.value.replace(/\D/g, '');
    // Restringir a un máximo de 8 dígitos
    if (input.value.length > 20) {
      input.value = input.value.slice(0, 20);
    }
    this.formGroup
      .get('codigoSinoe')
      ?.setValue(input.value, { emitEvent: false });
  }

  get formUsuarioValido() {
    if (this.formGroup.valid && this.correoPersonalBD) {
      if (
        (this.formGroup.value.correoInstitucional &&
          this.correoInstitucionalBD) ||
        this.formGroup.value.correoInstitucional == null ||
        this.formGroup.value?.correoInstitucional?.trim() == ''
      )
        return true;
    }
    return false;
  }

  onInputCelular(event: Event): void {
    const input = event.target as HTMLInputElement;
    // Eliminar cualquier valor que no sea un número
    input.value = input.value.replace(/\D/g, '');
    // Restringir a un máximo de 8 dígitos
    if (input.value.length > 9) {
      input.value = input.value.slice(0, 9);
    }
    this.formGroup.get('celular')?.setValue(input.value, { emitEvent: false });
  }

  marcarCamposComoTocados(formGroup: FormGroup) {
    Object.values(formGroup.controls).forEach((control) => {
      control.markAsTouched();

      if (control instanceof FormGroup) {
        this.marcarCamposComoTocados(control);
      }
    });
  }

  private mapRelacionLaboral(valor: string): number {
    switch (valor) {
      case 'T':
        return 1; // Trabajador
      case 'TER':
        return 2; // Tercero
      case 'E':
        return 3; // Externo
      default:
        return 1; // Valor por defecto
    }
  }

  /***dniDuplicado() {
    const numeroDocumento = this.usuarioForm.get('numeroDocumento').value;

    if (!numeroDocumento) return;

    if (this.editar) {
      console.log("por implementar")
      // this.usuarioService.obtenerUsuarioXDniEditar(numeroDocumento, this.usuario.idUsuario).subscribe({
      //   next: (response) => {
      //     this.flagTipoDocDuplicado = true;
      //   },
      //   error: () => {
      //     this.flagTipoDocDuplicado = false;
      //   }
      // });
    } else {
      this.usuarioService.obtenerUsuarioXDni(numeroDocumento).subscribe({
        next: (response) => {
          this.flagTipoDocDuplicado = true;
        },
        error: () => {
          this.flagTipoDocDuplicado = false;
        }
      });
    }
  }***/

  /***validarDniExistente(): AsyncValidatorFn {
    console.log("validarDniExistente")
    return (control: AbstractControl): Observable<ValidationErrors | null> => {
      if (!control.value || control.value.length !== 8) {
        return of(null);
      }

      if (this.usuarioForm?.get('tipoDocumento')?.value !== TIPO_DOCUMENTO.DNI) {
        return of(null);
      }

      console.log("this.usuario:",this.usuario)
      // const request$ = this.editar
      //   ? this.usuarioService.obtenerUsuarioXDniEditar(control.value, this.usuario.idUsuario)
      //   : this.usuarioService.obtenerUsuarioXDni(control.value);
      const request$ = this.usuarioService.obtenerUsuarioXDni(control.value);

      return request$.pipe(
        debounceTime(300), // Esperar 300ms antes de hacer la petición
        distinctUntilChanged(), // Solo realizar la petición si el valor cambió
        map(response => response ? { dniDuplicado: true } : null),
        catchError(() => of(null)),
      );
    };
  }***/

  //validador dentro de validator
  /***validarDniExistente(): AsyncValidatorFn {
    return (control: AbstractControl): Observable<ValidationErrors | null> => {
      //Validar longitud antes de hacer petición
      if (!control.value || control.value.length < 8) {
        return of(null);
      }

      if (this.usuarioForm?.get('tipoDocumento')?.value !== TIPO_DOCUMENTO.DNI) {
        return of(null);
      }

      const params = {
        nuVDocumento: control.value,
        idNTipoDocIdent: this.usuarioForm.get('tipoDocumento')?.value,
        idVUsuarioActual: this.editar ? this.usuario?.idUsuario : null
      };

      return from(this.usuarioService.siDuplicadoDocumento(
        params.nuVDocumento,
        params.idNTipoDocIdent,
        params.idVUsuarioActual
      )).pipe(
        distinctUntilChanged(), // Solo si el valor cambió
        debounceTime(500),     // Espera 500ms
        map(response => response?.data ? { dniDuplicado: true } : null),
        catchError(() => of(null))
      );
    };
  }***/

  private async validarDocumentoDuplicado(
    mostrarMensajeDialog: boolean = true
  ): Promise<boolean> {
    try {
      const params = {
        nuVDocumento: this.formGroup.get('numeroDocumento').value,
        idNTipoDocIdent: this.formGroup.get('tipoDocumento').value,
        idVUsuarioActual: this.editar ? this.usuario?.idUsuario : null,
      };

      const duplicadoResponse = await this.usuarioService.siDuplicadoDocumento(
        params.nuVDocumento,
        params.idNTipoDocIdent,
        params.idVUsuarioActual
      );

      if (duplicadoResponse?.data && mostrarMensajeDialog) {
        this.dialogService.open(AlertModalComponent, {
          width: '600px',
          showHeader: false,
          data: {
            icon: 'warning',
            title: 'Documento duplicado',
            description:
              'El número y tipo de documento ya se encuentra registrado en el sistema. Por favor verificar.',
            confirmButtonText: 'Aceptar',
          },
        });
      }

      return duplicadoResponse?.data || false;
    } catch (error) {
      console.error('Error al validar documento:', error);
      if (mostrarMensajeDialog) {
        this.dialogService.open(AlertModalComponent, {
          width: '600px',
          showHeader: false,
          data: {
            icon: 'error',
            title: 'Error',
            description:
              'Ocurrió un error al validar el documento. Por favor, intente nuevamente.',
            confirmButtonText: 'Aceptar',
          },
        });
      }
      return true; // En caso de error, evitamos que continúe el registro
    }
  }

  async onBlurNumeroDocumento(): Promise<void> {
    const numeroDocumentoControl = this.formGroup.get('numeroDocumento');

    // Verificar si el campo tiene un valor válido
    if (
      numeroDocumentoControl.value &&
      numeroDocumentoControl.value.length === 8
    ) {
      // Validar si el documento está duplicado
      const documentoDuplicado = await this.validarDocumentoDuplicado(false);

      if (documentoDuplicado) {
        // Si está duplicado, marcar el control como inválido
        numeroDocumentoControl.setErrors({ dniDuplicado: true });
      } else {
        // Si no está duplicado, limpiar el error específico de dniDuplicado
        const currentErrors = { ...numeroDocumentoControl.errors };
        delete currentErrors['dniDuplicado'];

        // Si no hay más errores, establecer como null, sino mantener los otros errores
        numeroDocumentoControl.setErrors(
          Object.keys(currentErrors).length ? currentErrors : null
        );
      }
    }
  }
}
