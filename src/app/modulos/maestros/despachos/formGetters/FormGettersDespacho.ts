import { FormGroup } from '@angular/forms';

export class FormGettersDespacho {
  constructor(private formGroup: FormGroup) {}

  get nombre() {
    return this.formGroup.get('nombre');
  }

  get coDistritoFiscal() {
    return this.formGroup.get('coDistritoFiscal');
  }

  get coSede() {
    return this.formGroup.get('coSede');
  }

  get coDependencia() {
    return this.formGroup.get('coDependencia');
  }

  get nuDespacho() {
    return this.formGroup.get('nuDespacho');
  }

  get coTopologia() {
    return this.formGroup.get('coTopologia');
  }

  get nombreDistritoFiscal() {
    return this.formGroup.get('nombreDistritoFiscal');
  }

  get nombreDependencia() {
    return this.formGroup.get('nombreDependencia');
  }

  get nombreSede() {
    return this.formGroup.get('nombreSede');
  }

  get coUsuario() {
    return this.formGroup.get('coUsuario');
  }
}
