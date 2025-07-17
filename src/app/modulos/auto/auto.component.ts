import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Constants } from '@constants/constantes';
import { SYSTEM_CODE } from '@environments/environment';
import { TokenService } from '@services/shared/token.service';
// import { SYSTEM_CODE } from "@environments/environment";
// import { Constants } from "@shared/constants/constants";
import { obtenerIcono } from '@utils/icon';
import { CmpLibModule } from 'ngx-mpfn-dev-cmp-lib';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { ToastModule } from 'primeng/toast';

@Component({
  selector: 'app-auto',
  standalone: true,
  imports: [
    CommonModule,
    CmpLibModule,
    ButtonModule,
    InputTextModule,
    ReactiveFormsModule,
    ToastModule,
    CmpLibModule,
  ],
  templateUrl: './auto.component.html',
  styleUrls: ['./auto.component.scss'],
  providers: [MessageService],
})
export class AutoComponent implements OnInit {
  public sinAcceso: boolean = false;
  public obtenerIcono = obtenerIcono;

  private tokenTest: string =
    'eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiIzMjkyMDU4OSIsImlzcyI6Imh0dHA6Ly9jZm1zLXNhZC1hZG1pbmlzdHJhY2lvbi1nZXN0aW9uLWFwaS1kZXZlbG9wbWVudC5hcHBzLmRldi5vY3A0LmNmZS5tcGZuLmdvYi5wZS9jZmUvc2FkL2FkbWluaXN0cmFjaW9uL3YxL2Uvc2VzaW9uL3Rva2VuU2VzaW9uLW5ldyIsImlwIjoiMTkyLjE2OC4xMzAuMSIsInVzdWFyaW8iOnsiZXN0YWRvIjoiMSIsImlwIjoiMTkyLjE2OC4xMzAuMSIsInVzdWFyaW8iOiIzMjkyMDU4OSIsImluZm8iOnsiYXBlbGxpZG9QYXRlcm5vIjoiUElOSUxMT1MiLCJlc1ByaW1lckxvZ2luIjp0cnVlLCJjb2RpZ29UaXBvRG9jdW1lbnRvIjoiMDAxIiwidGlwb0RvY3VtZW50byI6IkROSSIsImRuaSI6IjMyOTIwNTg5Iiwibm9tYnJlcyI6IkdJTEJFUlRPIE9TQ0FSIiwiYXBlbGxpZG9NYXRlcm5vIjoiQ0FESUxMTyJ9LCJjb2REZXBlbmRlbmNpYSI6IjQwMDYwMTQ1MDEiLCJkZXBlbmRlbmNpYSI6IjHCsCBGSVNDQUxJQSBQUk9WSU5DSUFMIFBFTkFMIENPUlBPUkFUSVZBIERFIFZFTlRBTklMTEEiLCJjb2REZXNwYWNobyI6IjQwMDYwMTQ1MDEtNCIsInNlZGUiOiIxwrAgRmlzY2FsaWEgUHJvdmluY2lhbCBNaXh0YSBkZSBWZW50YW5pbGxhIiwiZGVzcGFjaG8iOiI0ICBERVNQQUNITyIsImNvZENhcmdvIjoiMDAwMDAwMDgiLCJjb2RTZWRlIjoiMTYwIiwiY2FyZ28iOiJGSVNDQUwgUFJPVklOQ0lBTCIsImNvZERpc3RyaXRvRmlzY2FsIjoiNDciLCJkaXN0cml0b0Zpc2NhbCI6IkxJTUEgTk9ST0VTVEUiLCJkbmlGaXNjYWwiOiIzMjkyMDU4OSIsImRpcmVjY2lvbiI6IiAiLCJmaXNjYWwiOiJHSUxCRVJUTyBPU0NBUiBQSU5JTExPUyBDQURJTExPIiwiY29ycmVvRmlzY2FsIjpudWxsLCJjb2RKZXJhcnF1aWEiOiIwMSIsImNvZENhdGVnb3JpYSI6IjAxIiwiY29kRXNwZWNpYWxpZGFkIjoiMDAxIiwidWJpZ2VvIjoiICIsImRpc3RyaXRvIjoiTElNQSBOT1JPRVNURSIsImNvcnJlbyI6Imd1aWRvbWdtQGdtYWlsLmNvbXxnbWd1dGllcnJlekBtcGZuLmdvYi5wZSIsInRlbGVmb25vIjoiICIsInNpc3RlbWFzIjpbeyJjb2RpZ28iOiIwMDE3Iiwib3BjaW9uZXMiOlsiTUVOVTAxIiwiTUVOVTAyIl0sInBlcmZpbGVzIjpbbnVsbF19LHsiY29kaWdvIjoiMTU1Iiwib3BjaW9uZXMiOlsiMDIiLCIwNCIsIjA1IiwiMDYiLCIwNyIsIjA4IiwiMDkiLCIwMSIsIjk5OTkiXSwicGVyZmlsZXMiOlsiMjEiLG51bGxdfSx7ImNvZGlnbyI6IjE0NSIsIm9wY2lvbmVzIjpbIjI1IiwiMjYiLCIyOCIsIjMxIiwiNTAiLCIyMiIsIjIzIiwiMjQiLCI1MiIsIjQwIiwiMTIzIiwiMiIsIjQ4Mzk4MzQ5ODQzIiwiNDYiLCIzOTgzODc5NDg3IiwiMDAxIiwiMjkiLCIzMCIsIjI5MDIwMSIsIjAwMTExIiwiMDAxMTExIiwiMTIzNDUiLCIyNTQiLCIwMTAxMDEiLCIxMjM0NTYiLCI2NjY2IiwiMDk5ODg5NyJdLCJwZXJmaWxlcyI6W251bGwsIjA0IiwiMDMiXX0seyJjb2RpZ28iOiIyMDAiLCJvcGNpb25lcyI6WyIyMDAtMDEiLCIyMDAtMDMiLCIyMDAtMDQiLCIyMDAtMDYiLCIyMDAtMDkiLCIwMDEiLCIwMDIiXSwicGVyZmlsZXMiOlsiMjkiXX0seyJjb2RpZ28iOiIxNDciLCJvcGNpb25lcyI6WyIwMDEiLCJBUFAtU0dEMDMiLCIwMDIiXSwicGVyZmlsZXMiOlsiMTEiXX0seyJjb2RpZ28iOiIyMDMiLCJvcGNpb25lcyI6WyIyMDMtMDEiLCIyMDMtMDIiLCIwMDEiLCIwMDIiXSwicGVyZmlsZXMiOlsiNjMiLG51bGxdfSx7ImNvZGlnbyI6IjAwMDgiLCJvcGNpb25lcyI6WyJhcDAxIiwiYXAwMTEiLCJERU1PMSIsIkRFTU8yIiwiREVNTzQiLCIwMDMiLCIwMTMiLCI0MjI0IiwiMDAxIiwiODg1NTU0NzUiLCIzNDU1IiwiMDAyIiwiMDA0IiwiMDA1IiwiMDA2IiwiMDA3IiwiMDA4IiwiQ09EMjMiLCJDT0RFMSIsIlBST0QxIiwiMDAxMiIsIjAwMDQiLCIwMDA5IiwiNTU1NTU1IiwiUkVQMDAxIiwiQUIwMDEiLCIxMjMzMjEiLCI1NjciLCIwMDAxMSIsIjEyMzQ1IiwiTk9ETzAwMSIsIjU2NTciXSwicGVyZmlsZXMiOlsiMDAyIiwiMDAzIiwiMDA1IiwiMDA2IixudWxsXX1dfSwiaWF0IjoxNzM2OTA0NzIxLCJleHAiOjE3MzY5MjQ0MDB9.Cc7YlgANoX1PQLu48X_47CPhIZF2Qvu-7tEKjiGLNX5airU6yEahb2nu0oMbyC4EQXjhkxoiuAkY3SqB6URsAw';

  public logoInstitucional: string =
    'assets/images/logo_institucional_blanco.svg';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private tokenService: TokenService,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe((params: any) => {
      console.log('PARAMS: ', params);
      if (!params) return;

      const idAplication = params['idAplication'];
      console.log('ID APLICATION: ', idAplication);

      if (params.token) {
        setTimeout(() => {
          let response: any = {
            token: `Bearer ${params.token}`,
          };
          let token = JSON.stringify(response);
          sessionStorage.setItem(Constants.TOKEN_NAME, token);
          const datos = this.tokenService.getDecoded();
          //Validar si tiene acceso al sistema
          console.log('DATOS TOKEN: ', datos);
          const sistema = datos?.usuario?.sistemas?.find(
            (sistema) => sistema.codigo === SYSTEM_CODE
          );
          console.log('SISTEMA: ', sistema);
          if (sistema === undefined) {
            this.messageService.add({
              severity: 'warn',
              summary: 'Error',
              detail: `No cuenta con acceso al sistema. Por favor, comuníquese con su administrador.`,
            });
            this.sinAcceso = true;
            return;
          }
          sessionStorage.setItem(Constants.ID_APPLICATION, idAplication);
          this.router.navigate(['app']);
        }, 3000);
      } else this.regresarALogin();
    });

    // const response: any = {
    //   token: `Bearer ${this.tokenTest}`,
    // };
    // const token = JSON.stringify(response);
    // sessionStorage.setItem(Constants.TOKEN_NAME, token);
    // const datos = this.tokenService.getDecoded();
    // // Validar si tiene acceso al sistema
    // console.log('datos token: ', datos);
    // console.log('system_code: ', SYSTEM_CODE);
    // const sistema = datos?.usuario?.sistemas?.find(
    //   (sistema) => sistema.codigo === SYSTEM_CODE
    // );
    // console.log('sistema: ', sistema);
    // if (sistema === undefined) {
    //   this.messageService.add({
    //     severity: 'warn',
    //     summary: 'Error',
    //     detail: `No cuenta con acceso al sistema. Por favor, comuníquese con su administrador.`,
    //   });
    //   this.sinAcceso = true;
    //   return;
    // }
    // sessionStorage.setItem(Constants.ID_APPLICATION, '7');
    // this.router.navigate(['app']);
  }

  private regresarALogin(): void {
    console.log('return login');
    this.router.navigate(['auth/login']);
  }
}
