import { FormGroup } from '@angular/forms';

export class FormGettersAplicacion {
  constructor(private formGroup: FormGroup) {}

  get coVAplicacion() {
    return this.formGroup.get('coVAplicacion');
  }

  get noVAplicacion() {
    return this.formGroup.get('noVAplicacion');
  }

  get deVSiglas() {
    return this.formGroup.get('deVSiglas');
  }

  get idNAplicacionPadre() {
    return this.formGroup.get('idNAplicacionPadre');
  }

  get deVRuta() {
    return this.formGroup.get('deVRuta');
  }

  get deVClaseColor() {
    return this.formGroup.get('deVClaseColor');
  }

  get feDLanzto() {
    return this.formGroup.get('feDLanzto');
  }

  get deVVersion() {
    return this.formGroup.get('deVVersion');
  }

  get feDVersion() {
    return this.formGroup.get('feDVersion');
  }

  get idNDisponibilidad() {
    return this.formGroup.get('idNDisponibilidad');
  }

  get flCVer() {
    return this.formGroup.get('flCVer');
  }

  get idNCategoria() {
    return this.formGroup.get('idNCategoria');
  }
}
