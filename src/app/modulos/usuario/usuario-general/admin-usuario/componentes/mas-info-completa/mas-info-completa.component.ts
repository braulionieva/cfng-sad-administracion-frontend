import { CommonModule, DatePipe } from "@angular/common";
import { Component, Input, Output, EventEmitter } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { UsuarioService } from "@services/usuario/usuario.service";
import { cutDateString } from "@utils/date";
import { obtenerIcono } from "@utils/icon";
import { CmpLibModule } from "ngx-mpfn-dev-cmp-lib";
import { ButtonModule } from "primeng/button";
import { CalendarModule } from "primeng/calendar";
import { CardModule } from "primeng/card";
import { CheckboxModule } from "primeng/checkbox";
import { DialogModule } from "primeng/dialog";
import { DropdownModule } from "primeng/dropdown";
import { DynamicDialogRef, DynamicDialogConfig } from "primeng/dynamicdialog";
import { InputMaskModule } from "primeng/inputmask";
import { InputTextModule } from "primeng/inputtext";
import { InputTextareaModule } from "primeng/inputtextarea";
import { MessagesModule } from "primeng/messages";
import { RadioButtonModule } from "primeng/radiobutton";
import { RippleModule } from "primeng/ripple";
import { SelectButtonModule } from "primeng/selectbutton";
import { TableModule } from "primeng/table";
import { Subscription } from "rxjs";

@Component({
  selector: 'app-mas-info-completa',
  standalone: true,
  imports: [CommonModule,
    ButtonModule,
    CalendarModule,
    CardModule,
    CheckboxModule,
    DropdownModule,
    InputMaskModule,
    InputTextModule,
    SelectButtonModule,
    RippleModule,
    InputTextareaModule,
    TableModule,
    FormsModule,
    RadioButtonModule,
    ReactiveFormsModule,
    DialogModule,
    MessagesModule,
    CmpLibModule,
    DatePipe
  ],
  templateUrl: './mas-info-completa.component.html',
  styleUrls: ['./mas-info-completa.component.scss']
})

export class MasInfoCompletaComponent {
  @Input() usuario;
  @Output() filter = new EventEmitter();
  @Output() goBack = new EventEmitter<void>();

  usuarioSelect: any;

  error: string;
  editar: boolean = false;

  public refModal: DynamicDialogRef;
  public subscriptions: Subscription[] = [];

  public obtenerIcono = obtenerIcono;
  imgDefault: string = null;

  constructor(
    public config: DynamicDialogConfig,
    public usuarioService: UsuarioService,
    public ref: DynamicDialogRef) {

    this.usuarioSelect = this.config?.data.usuarioSelected;
  }

  ngOnInit(): void {
    this.imgDefault = 'data:image/png;base64,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';
  }

  public close(): void {
    this.ref.close()
  }

  public onRegresar(): void {
    this.goBack.emit();
  }

  public icon(name: string): string {
    return `assets/icons/${name}.svg`;
  }
  cutDateString(cuteDate: string) {
    return cutDateString(cuteDate)
  }
}

