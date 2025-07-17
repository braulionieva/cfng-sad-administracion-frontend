import { IconType } from '@core/types/IconType';

export interface AlertData {
  icon: IconType;
  title: string;
  description?: string;
  confirmButtonText?: string;
  cancelButtonText?: string;
  irHechoCasoButtonText?: string;
  confirm?: boolean;
  confirmHechosCasos?: boolean;
  ocultarBotones?: boolean;
  noRegistrados?: any;
  subtitle?: string;
  turno?: boolean;
  confirmButtonColor?: string;
}
