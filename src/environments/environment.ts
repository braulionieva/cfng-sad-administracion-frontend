export const SYSTEM_CODE = '0008';
export const IP_RENIEC = '201.240.68.38';
export const IP_MOD = '1.0.0.1';

export const VERSION = '1.0.0';

export const environment = {
  production: false,
  DOMAIN_HOME: 'http://default-url.com',
};

export const BACKEND = {
  CFETURNO: `http://localhost:8080/cfe/mesadeturno/v1`,
  CFETOKEN: `http://172.16.111.112:8081/cfetoken/resources/v2/loginToken`,
  MS_PERSONA: `http://cfms-generales-persona-cliente-api-development.apps.dev.ocp4.cfe.mpfn.gob.pe/cfe/generales/persona/v1/e`,
  CFEMAESTROS: `http://cfms-generales-maestros-gestion-api-development.apps.dev.ocp4.cfe.mpfn.gob.pe/cfe/generales/maestro/`,
  CFEEXPEDIENTE:
    'http://cfms-expedientefiscal-electronico-gestion-api-development.apps.dev.ocp4.cfe.mpfn.gob.pe/cfe/expedientefiscalelectronico/',
  PATH_SAD_DEV:
    'http://cfms-sad-administracion-gestion-api-development.apps.dev.ocp4.cfe.mpfn.gob.pe/cfe/sad/administracion/',
  //PATH_SAD_DEV: 'http://localhost:8080/cfe/sad/administracion/',
  MS_DOCUMENTO: `http://cfms-mesadepartes-documentos-gestion-api-development.apps.dev.ocp4.cfe.mpfn.gob.pe/cfe/mesadepartes/documentos/`,
  MS_GENERALES_DOCUMENTO: `http://cfms-generales-documentos-gestion-api-development.apps.dev.ocp4.cfe.mpfn.gob.pe/cfe/generales/documento/`,
  MS_REPOSITORIO: `http://cfms-generales-almacenamiento-objetos-api-development.apps.dev.ocp4.cfe.mpfn.gob.pe/cfe/generales/objetos/v1/t/almacenamiento/publico/`,
  MS_REPOSITORIO_PRIVADO: `http://cfms-generales-almacenamiento-objetos-api-development.apps.dev.ocp4.cfe.mpfn.gob.pe/cfe/generales/objetos/v2/t/almacenamiento/privado/`,
};

export const TOKEN =
  'Bearer eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJERVlTU1kgTlXDkUVaIE1BUklOIiwiaXNzIjoiaHR0cDovLzE3Mi4xNi4xMTEuMTEyOjgwODEvY2ZldG9rZW4vcmVzb3VyY2VzL3YyL2xvZ2luVG9rZW4iLCJpcCI6IjE3Mi4xNi4xMTEuMTEyIiwidXN1YXJpbyI6eyJlc3RhZG8iOiIwMSIsImlwIjoiMTcyLjE2LjExMS4xMTIiLCJ1c3VhcmlvIjoiMTA2Mjg3MDIiLCJpbmZvIjp7ImFwZWxsaWRvUGF0ZXJubyI6Ik5Vw5FFWiIsImVzUHJpbWVyTG9naW4iOmZhbHNlLCJkbmkiOiIxMDYyODcwMiIsIm5vbWJyZXMiOiJERVlTU1kiLCJhcGVsbGlkb01hdGVybm8iOiJNQVJJTiJ9LCJjb2REZXBlbmRlbmNpYSI6IjQwMDYwMTQ1MDEiLCJkZXBlbmRlbmNpYSI6IjHCsCBGSVNDQUxJQSBQUk9WSU5DSUFMIFBFTkFMIENPUlBPUkFUSVZBIERFIFZFTlRBTklMTEEiLCJjb2REZXNwYWNobyI6IjQwMDYwMTQ1MDEtMiIsInNlZGUiOiJDT1JQT1JBVElWQSIsImRlc3BhY2hvIjoiMsKwIERFU1BBQ0hPIiwiY29kQ2FyZ28iOiJGUCIsImNvZFNlZGUiOiIwMDEwMCIsImNhcmdvIjoiRklTQ0FMIFBST1ZJTkNJQUwiLCJjb2REaXN0cml0b0Zpc2NhbCI6IjAwNDciLCJkaXN0cml0b0Zpc2NhbCI6IkRJU1RSSVRPIEZJU0NBTCBERSBMSU1BIE5PUk9FU1RFIiwiZG5pRmlzY2FsIjoiMTExMTAwMDEiLCJkaXJlY2Npb24iOiJVLlUiLCJmaXNjYWwiOiJDQVJNRU4gUEVSRVogTFVJUyIsImNvcnJlb0Zpc2NhbCI6ImhAZ21haS5jb20iLCJjb2RKZXJhcnF1aWEiOiIwMSIsImNvZENhdGVnb3JpYSI6IjAxIiwiY29kRXNwZWNpYWxpZGFkIjoiMDEiLCJ1YmlnZW8iOiIiLCJkaXN0cml0byI6IkxJTUEgTk9SIE9FU1RFIiwiY29ycmVvIjoiZGV5c3N5bnVtYUB5YWhvby5jb20iLCJ0ZWxlZm9ubyI6IiIsInNpc3RlbWFzIjpbeyJjb2RpZ28iOiIxNDciLCJvcGNpb25lcyI6W10sInBlcmZpbGVzIjpbIjExIl19LHsiY29kaWdvIjoiMTU1Iiwib3BjaW9uZXMiOlsiMDIiLCIwNCIsIjA1IiwiMDYiLCIwNyIsIjA4IiwiMDkiXSwicGVyZmlsZXMiOlsiMjEiXX0seyJjb2RpZ28iOiIyMDAiLCJvcGNpb25lcyI6WyIyMDAtMDEiLCIyMDAtMDMiLCIyMDAtMDQiLCIyMDAtMDYiLCIyMDAtMDkiXSwicGVyZmlsZXMiOlsiMjUiLCIyOSIsIjMxIl19LHsiY29kaWdvIjoiMjAzIiwib3BjaW9uZXMiOlsiMjAzLTAxIiwiMjAzLTAyIl0sInBlcmZpbGVzIjpbIjYzIl19LHsiY29kaWdvIjoiMTQ1Iiwib3BjaW9uZXMiOlsiMjEiLCIyMiIsIjIzIiwiMjQiLCIyNSIsIjI2IiwiMjgiLCIzMSIsIjUwIiwiNTIiXSwicGVyZmlsZXMiOlsiMDMiXX1dfSwiaWF0IjoxNjkzNDc5OTY4LCJleHAiOjE2OTM1NTE2MDB9.dYoFOE8z3R15PQS-1ush_chQq4NFZyTAzxGMXuCoG_6AlMRrUSLrUAuzRbRzc_4luRNjqMrMt7ZP6h_ePOAB_Q';
