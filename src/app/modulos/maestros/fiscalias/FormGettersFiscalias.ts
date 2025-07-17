import { FormGroup } from "@angular/forms";

export class FormGettersFiscalias {
  constructor(private formGroup: FormGroup) {}

  get coVEntidad() {
    return this.formGroup.get('coVEntidad');
  }

  get noVEntidad() {
    return this.formGroup.get('noVEntidad');
  }

  get flCCorporativa() {
    return this.formGroup.get('flCCorporativa');
  }

  get idNDistritoFiscal() {
    return this.formGroup.get('idNDistritoFiscal');
  }

  get coVSede() {
    return this.formGroup.get('coVSede');
  }

  get idNJerarquia() {
    return this.formGroup.get('idNJerarquia');
  }

  get idVEspecialidad() {
    return this.formGroup.get('idVEspecialidad');
  }

  get idNTipoEspecialidad() {
    return this.formGroup.get('idNTipoEspecialidad');
  }

  get coVEntidadPadre() {
    return this.formGroup.get('coVEntidadPadre');
  }

  get deVAcronimo() {
    return this.formGroup.get('deVAcronimo');
  }
}
