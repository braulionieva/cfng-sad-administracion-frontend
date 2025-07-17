export const Constants = {
  LOADING: 'loading',
  MSG_LOADING: 'msg_loading',
  TOKEN_NAME: 'access_token',
  TOKEN_PROFILE: 'access_token_profile',
  DECODE_TOKEN: 'decode_token',
  CALL_FAILED: 'call_failed',
  CODE_TIMER: 'code_timer',
  RESENT_TIMER: 'resent_timer',
  INFO: 'info',
  MAX_DOCUMENTS_PER_DEPENDENT: 5,
  ID_APPLICATION: 'id_application',
};

export const TIPOS_DENUNCIA = {
  detenido: { titulo: 'Detenido', id: 359 },
  defuncion: { titulo: 'Defunción', id: 360 },
  'actos-urgentes': { titulo: 'Actos Urgentes', id: 361 },
  'investigacion-de-oficio': { titulo: 'Investigación de Oficio', id: 363 },
  'denuncia-verbal': { titulo: 'Denuncia Verbal', id: 362 },
} as const;

export const amPm = {
  AM: 'AM',
  PM: 'PM',
} as const;

export const CODIGOS_TIPO_DENUNCIA = {
  DETENIDO: 359,
  DEFUNCION: 360,
  ACTOS_URGENTES: 361,
  INVESTIGACION_DE_OFICIO: 362,
  DENUNCIA_VERBAL: 363,
};

export const ESTADO_REGISTRO = {
  COMPLETO: 'Completo',
  PENDIENTE: 'Pendiente',
};

export const ORIGEN = {
  PERUANO: 'P',
  EXTRANJERO: 'E',
};
export const PAIS_ORIGEN = {
  PERUANO: 139,//'561',
  EXTRANJERO: null,//'562',
};
/***export const TIPO_DOCUMENTO = {
  DNI: '1',
  CARNE_EXTRANJERIA: '5',
  SIN_DOCUMENTO: '3',
};***/

export const TIPO_DOCUMENTO = {
  DNI: 1,
  RUC: 2,
  SIN_DOC: 3,
  PASAPORTE: 4,
  CARNET_EXTRANJERIA: 5,
  CPP: 6,
  LIBRETA_ELECTORAL: 7,
  PARTIDA_NACIMIENTO: 8,
  CARNET_IDENTIDAD: 9,
  OTRO_DOCUMENTO: 10,
  LIBRETA_MILITAR: 11,
  CARNET_REFUGIO: 13,
  PTP: 14,
  SIN_DOCUMENTO: 15
} as const;
export const LABEL_DOCUMENTO = {
  DNI: 'Número de DNI',
  EXTRANJERO: 'Número de documento',
};

export const CONSTANTES_MAX = {
  DIFERENCIA_DAD: 5,
  MAX_LENGHT: 1,
};

export const CODIGO_TIPO_DISTRIBUCION = {
  POR_DESPACHO: 1,
  POR_FISCAL: 2,
};

export const DESCRIPCION_CORTA_TIPO_DISTRIBUCION = {
  POR_DESPACHO: 'DESPACHO',
  POR_FISCAL: 'FISCAL',
};

export const DESCRIPCION_LARGA_TIPO_DISTRIBUCION = {
  POR_DESPACHO: 'Distribución aleatoria por despacho',
  POR_FISCAL: 'Distribución aleatoria por fiscal',
};

export const patron = {
  PATRON_ALFANUMERICO: '^[a-zA-Z0-9]*$',
  PATRON_ALFANUMERICO_CON_ESPACIO: '^(?!.*\\s{2,})[a-zA-Z0-9\\s]*$', //sin doble espacio
  PATRON_ALFANUMERICO_CON_GUIONES: '^[a-zA-Z0-9_-]*$',
  PATRON_ALFANUMERICO_CON_GUIONES_Y_GRADO: '^[a-zA-Z0-9_-°º]*$',
  PATRON_ALFANUMERICO_CON_TILDES: '^(?!.*\\s{2,})[a-zA-ZáéíóúÁÉÍÓÚñÑ0-9\\s]*$', //sin doble espacio
  PATRON_ALFANUMERICO_CON_TILDES_GUIONES:
    '^(?!.*\\s{2,})[a-zA-ZáéíóúÁÉÍÓÚñÑ0-9\\s-_]*$', //sin doble espacio
  PATRON_ALFANUMERICO_CON_TILDES_Y_GRADO:
    '^(?!.*\\s{2,})[a-zA-ZáéíóúÁÉÍÓÚñÑ0-9°º\\s]*$', //sin doble espacio
  PATRON_ALFANUMERICO_CON_TILDES_GRADO_GUIONES:
    '^(?!.*\\s{2,})[a-zA-ZáéíóúÁÉÍÓÚñÑ0-9°º\\s-_]*$', //sin doble espacio
  PATRON_ALFANUMERICO_CON_TILDES_GRADO_GUIONES_PUNTO_SLASH:
    '^(?!.*\\s{2,})[a-zA-ZáéíóúÁÉÍÓÚñÑ0-9°º\\s\\._\\-/()]*$',
  PATRON_TEXTO_SIN_DOBLE_ESPACIO: '^(?!\\s)(?!.*\\s{2})(?!.*\\s$)[\\s\\S]*$',
  PATRON_NUMERO: '^[0-9]*$',
};

export const TIPOS_DEPENDENCIA = {
  FISCALIAS: 1,
};

export const ESTADOS_USUARIO = {
  ACTIVO: 1,
  BLOQUEADO: 3,
  DESBLOQUEADO: 4,
  EXONERADO: 5,
  INCLUIDO: 6,
  ELIMINADO: 7,
  REVIVIDO: 8,
  CANCELADO: 9,
  NO_CANCELADO: 10,
  DADO_DE_BAJA: 11,
  INACTIVO: 2,
};

