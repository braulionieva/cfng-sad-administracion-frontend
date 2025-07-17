import { FormControl } from '@angular/forms';

export const noSpacesValidator = (
  control: FormControl
): { [key: string]: any } | null => {
  const value = control.value;
  if (!value) {
    return null;
  }

  // Verifica si hay espacios al inicio | al final o si hay espacios entre palabras
  if (value.trim() !== value || value.includes(' ')) {
    return { spacesError: 'No se permiten espacios.' };
  }
  return null;
};
