import { ChangeDetectorRef, Component, effect, inject, input } from '@angular/core';
import { Router } from '@angular/router';
import {
  AbstractControl,
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import {
  OtroTicket,
  OtroTicketCreate,
  TicketsService,
} from '../data-access/tickets.service';
import { AuthStateService } from '../../shared/data-access/auth-state.service';
import { ServicioPruebaService } from '../../../servicios/servicio-prueba.service';
import { UsuariosServiceService } from '../../auth/data-access/usuarios-service.service';
import { TemplateService } from '../data-access/template.service';
type Campo = NonNullable<OtroTicket['campos']>[number];

@Component({
    selector: 'app-solicitud',
    standalone:true,
    imports: [FormsModule, CommonModule, ReactiveFormsModule],
    templateUrl: './solicitud.component.html',
    styleUrl: './solicitud.component.css'
})
export class SolicitudComponent {
  // ────────────────────────────────
  private _formBuilder = inject(FormBuilder);
  private _ticketService = inject(TicketsService);
  private _authstate = inject(AuthStateService);
  private _usuarioService = inject(UsuariosServiceService);
  private _templateService = inject(TemplateService);
  private servicioPrueba = inject(ServicioPruebaService);
  private router = inject(Router);

  // Estado del componente
  otroTicket = false;
  titulo = '';
  tipoTicket = '';
  areaResponsable = '';
  idTemplate = '';
  inputLabels: string[] = [];
  formIncompleto: boolean = false;


  // Datos de usuario
  id: string = '';
  nombre: string = '';
  apellido: string = '';

  // Datos externos
  templates: any[] = [];
  usuarios: any[] = [];
  searchTerm: string = '';

  idUsuario = input.required<string>();

  constructor(private cdr: ChangeDetectorRef) {
    effect(() => {
      const id = this.idUsuario();
      this.id = id;
      this.getDataByUser(id);
    });
  }

  ngOnInit() {
    this.getDataTemplates();
  }

  trackByIndex(index: number): number {
    return index;
  }

  // Formulario reactivo de "Otro Ticket"
  formOtroTicket = this._formBuilder.group({
    tipoTicket: [''],
    areaResponsable: [''],
    nombreResponsable: [''],
    apellidoResponsable: [''],
    estado: 'Enviado',
    asunto: ['', Validators.required],
    prioridad: ['', Validators.required],
    detalle: ['', Validators.required],
    puntuacion: [''],

    campos: this._formBuilder.array([]) // ← Unificado
  });


  get campos(): FormArray {
    return this.formOtroTicket.get('campos') as FormArray;
  }

  getCampoOpciones(index: number): FormArray<FormControl<string>> {
    return this.campos.at(index).get('opciones') as FormArray<FormControl<string>>;
  }

  get filteredTemplates() {
    const term = this.searchTerm.trim().toLowerCase();
  
    return this.templates
      .filter(template =>
        template.titulo.toLowerCase().includes(term) ||
        template.areaResponsable.toLowerCase().includes(term)
      )
      .sort((a, b) => a.titulo.localeCompare(b.titulo));
  }
  
  onSeleccionarRadio(index: number, valor: string) {
    const grupo = this.campos.at(index) as FormGroup;
    grupo.get('seleccion')?.setValue(valor);
  }
  

  // Cargar usuario
  async getDataByUser(id: string) {
    const usuario = await this._usuarioService.getDataByUser(id);
    this.usuarios = usuario;
    const u = this.usuarios[0];
    this.nombre = u.nombre;
    this.apellido = u.apellido;
    //this.ultimoIngreso = u.ultimoIngreso;
  }

  // Cargar templates
  async getDataTemplates() {
    const raw = await this._templateService.getDataTemplates();
    this.templates = raw.sort((a: any, b: any) =>
      a.titulo.localeCompare(b.titulo)
    );
  }

  // Volver
  volverHome() {
    this.titulo = '';
    this.otroTicket = false;
    this.router.navigate(['']);
  }

  // Activar formulario con datos del template
  irOtroTemplate(template: any) {
    // Podés guardar el objeto directamente si querés usarlo en otros lugares
    // this.templateSeleccionado = template;
  
    this.titulo = template.titulo;
    this.tipoTicket = template.titulo;
    this.areaResponsable = template.areaResponsable;
    this.idTemplate = template.id;
    this.otroTicket = true;
  
    // Reset del formulario general
    this.formOtroTicket.reset({
      tipoTicket: this.tipoTicket,
      areaResponsable: this.areaResponsable,
      nombreResponsable: '',
      apellidoResponsable: '',
      estado: 'Enviado',
      asunto: '',
      prioridad: '',
      detalle: '',
      puntuacion: ''
    });
  
    const camposArray = this.campos;
    camposArray.clear();
  
    const templateCampos = template.campos || [];
  
    templateCampos.forEach((campo: any) => {
      switch (campo.tipo) {
        case 'input':
          camposArray.push(
            this._formBuilder.group({
              tipo: 'input',
              nombre: [campo.nombre || ''],
              valor: [campo.valor || '']
            })
          );
          break;
  
        case 'desplegable':
          camposArray.push(
            this._formBuilder.group({
              tipo: 'desplegable',
              nombre: [campo.nombre || ''],
              seleccion: [''],
              opciones: this._formBuilder.array(
                (campo.opciones || []).map((op: string) => this._formBuilder.control(op))
              )
            })
          );
          break;
  
        case 'radio':
          camposArray.push(
            this._formBuilder.group({
              tipo: 'radio',
              nombre: [campo.nombre || ''],
              seleccion: [''],
              opciones: this._formBuilder.array(
                (campo.opciones || []).map((op: string) => this._formBuilder.control(op))
              )
            })
          );
          break;
      }
    });
  
    this.cdr.detectChanges();
    this.otroTicket = true;
  }
  
  
  
  

  async guardarOtroTicket() {
    this.formIncompleto = false;

    if (this.formOtroTicket.invalid) {
      this.formIncompleto = true;
      return;
    }
  
    const formValue = this.formOtroTicket.value;
  
    // Serializar campos desde el FormArray
    const campos: Campo[] = this.campos.controls.map((grupo: AbstractControl) => {
      const g = grupo as FormGroup;
      const tipo = g.get('tipo')?.value;
  
      switch (tipo) {
        case 'input':
          return {
            tipo: 'input',
            nombre: g.get('nombre')?.value || '',
            valor: g.get('valor')?.value || ''
          };
  
        case 'desplegable':
          return {
            tipo: 'desplegable',
            nombre: g.get('nombre')?.value || '',
            seleccion: g.get('seleccion')?.value || '',
            opciones: (g.get('opciones') as FormArray).controls.map(ctrl => ctrl.value || '')
          };
  
        case 'radio':
          return {
            tipo: 'radio',
            nombre: g.get('nombre')?.value || '',
            seleccion: g.get('seleccion')?.value || '',
            opciones: (g.get('opciones') as FormArray).controls.map(ctrl => ctrl.value || '')
          };
  
        default:
          throw new Error('Tipo de campo desconocido');
      }
    });
  
    const ticket: OtroTicketCreate = {
      nombreSolicitante: this.nombre,
      apellidoSolicitante: this.apellido,
      fechaSolicitud: new Date().toISOString(),
      fechaActualizacion: new Date().toISOString(),
      fechaFinalizacion: '',
      estado: formValue.estado || '',
      tipoTicket: formValue.tipoTicket || '',
      areaResponsable: formValue.areaResponsable || '',
      asunto: formValue.asunto || '',
      prioridad: formValue.prioridad || '',
      detalle: formValue.detalle || '',
      nombreResponsable: formValue.nombreResponsable || '',
      apellidoResponsable: formValue.apellidoResponsable || '',
      puntuacion: formValue.puntuacion || '',
      idTemplate: this.idTemplate || '',
      campos,
      tipoSolicitud: '' // ← actualizalo si corresponde
    };
  
    try {
      await this._ticketService.createTicket(ticket);
      this.otroTicket = false;
      this.router.navigate(['']);
    } catch (error) {
      alert('Error al crear ticket');
      console.error(error);
    }
  }

paginaActual = 1;
itemsPorPagina = 10;

get totalPaginas(): number {
  return Math.ceil(this.filteredTemplates.length / this.itemsPorPagina);
}

get templatesPaginados() {
  const inicio = (this.paginaActual - 1) * this.itemsPorPagina;
  const fin = inicio + this.itemsPorPagina;
  return this.filteredTemplates.slice(inicio, fin);
}

cambiarPagina(direccion: 'anterior' | 'siguiente') {
  if (direccion === 'anterior' && this.paginaActual > 1) {
    this.paginaActual--;
  } else if (direccion === 'siguiente' && this.paginaActual < this.totalPaginas) {
    this.paginaActual++;
  }
}



}