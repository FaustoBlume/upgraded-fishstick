import { CommonModule, Location } from '@angular/common';
import { Component, effect, inject, input } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ServicioPruebaService } from '../../../servicios/servicio-prueba.service';
import { OtroTicket, OtroTicketCreate, TicketsService } from '../data-access/tickets.service';
import { Router } from '@angular/router';
import { comentarioCreate, ComentarioService } from '../data-access/comentario.service';
import { AuthStateService } from '../../shared/data-access/auth-state.service';
import { UsuariosServiceService } from '../../auth/data-access/usuarios-service.service';
import { TemplateService } from '../data-access/template.service';
import { doc, collection, addDoc, Firestore, getDocs } from '@angular/fire/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from '@angular/fire/storage';

type Campo = NonNullable<OtroTicket['campos']>[number];
@Component({
    selector: 'app-detalles-solicitud',
    standalone:true,
    imports: [CommonModule, FormsModule, ReactiveFormsModule],
    templateUrl: './detalles-solicitud.component.html',
    styleUrl: './detalles-solicitud.component.css'
})
export class DetallesSolicitudComponent {

comentarios:any[]=[]
userId:string|undefined;
// Variables del ticket 
id:string="";
nombre:string="";
estado:string="";
areaResponsable:string="";
nombreResponsable:string="";
apellidoResponsable:string="";
fechaSolicitud:string="";
fechaActualizacion:string="";
fechaFinalizacion:string="";
Tipo:string="";
Detalles:string=""
Apellido:string="";
tipoSolicitud:string="";
asunto:string="";
prioridad:string="";
//motivo:string="";
idTemplate:string="";
originalTicket: Partial<OtroTicket> = {};
historialSubcoleccion: any[] = [];
puntuacion: string = ""; // o el valor por defecto que prefieras
puntuacionConfirmada: boolean = false;



//Variables OtroTicket
tituloTicket:string="";
respuestasInputs: { nombre: string; valor: string }[] = [];
respuestasDesplegables: { nombre: string; opciones: string[]; seleccion: string }[] = [];
respuestasRadioButtons: { nombre: string; opciones: string[]; seleccion: string }[] = [];



//Variables de template
tituloTemplate:string="";
inputLabels: { nombre: string; opciones: string[] }[] = [];
desplegablesTemplate: { nombre: string; opciones: string[] }[] = [];
radioButtonsTemplate: { nombre: string; opciones: string[] }[] = [];
campos: { tipo: "input" | "desplegable" | "radio"; valor?: string | undefined; nombre?: string | undefined; seleccion?: string | undefined; opciones?: string[] | undefined; }[] | undefined;



//Variables de comentario
nombreEscritor:string="";
apellidoEscritor:string="";
nuevoComentario= true;
modificacion=false;
modEstado=true;
historialCambios: {
  campo: string;
  anterior: string;
  nuevo: string;
  fecha: string;
  usuario: string;
}[] = [];
mostrarHistorialCompleto = false;

//Variables del usuario de sesion
usuarios: any[] = [];
idUsuario:string="";
nombreUsuario:string="";
apellidoUsuario:string="";
rolUsuario:string="";
idTicket = input.required<string>();

private servicioPrueba=inject(ServicioPruebaService);
private _ticketservice = inject(TicketsService);
private _comentarioService = inject(ComentarioService);
private _formBuilder = inject(FormBuilder);
private _authstate =inject(AuthStateService);
private _usuarioService = inject(UsuariosServiceService);
private _templateService = inject(TemplateService);
private _firestore= inject(Firestore)

longComentario:number=0;
constructor(private router:Router,
            private location: Location
){
  
  effect(()=> {
    const id = this.idTicket();
    this.id=id;
    this.getTicket(id);
    this.getHistorialCambios();
   this.getComentarios(id);
  });

  
}

ngOnInit(){
  this.userId = this._authstate.currentUser?.uid;
  this._usuarioService.getDataByUser(this.userId).then(value => {
    this.usuarios = value;
    this.nombreUsuario=this.usuarios[0].nombre;
    this.apellidoUsuario=this.usuarios[0].apellido;
    this.idUsuario=this.usuarios[0].userId;
    this.rolUsuario=this.usuarios[0].rol;
    
  });
}

formComentario = this._formBuilder.group({
  comentario:this._formBuilder.control(''),
});



validarEstadoMod(){
 if(this.estado=="Esperando respuesta"||(this.rolUsuario==this.areaResponsable && this.nombre!=this.nombreUsuario)){
    this.modEstado=false;
  }
  //probar
  if(this.estado=="Finalizado"){this.modEstado=true}
}

confirmarPuntuacion() {
  this.puntuacionConfirmada = true;
  this.estado = "Finalizado";
  this.updateTicket();
}

volverAtras(){
  if (window.history.length > 1) {
    this.location.back(); //este pega para la URL que está atrás sin importar cuál es
  } else {
    this.router.navigate(['']); // por si alguien entra derechito al ticket escribiendo la URL
  }
}


async getTicket(id: string) {
  const ticket = await this.servicioPrueba.getDataTicketById(id);

  this.originalTicket = { ...ticket };

  this.nombre = ticket['nombreSolicitante'] || '';
  this.Apellido = ticket['apellidoSolicitante'] || '';
  this.fechaSolicitud = ticket['fechaSolicitud'] || '';
  this.fechaActualizacion = ticket['fechaActualizacion'] || '';
  this.fechaFinalizacion = ticket['fechaFinalizacion'] || '';
  this.Detalles = ticket['detalle'] || '';
  this.estado = ticket['estado'] || '';
  this.areaResponsable = ticket['areaResponsable'] || '';
  this.nombreResponsable = ticket['nombreResponsable'] || '';
  this.apellidoResponsable = ticket['apellidoResponsable'] || '';
  this.Tipo = ticket['tipoTicket'] || '';
  this.tipoSolicitud = ticket['tipoSolicitud'] || '';
  this.asunto = ticket['asunto'] || '';
  this.prioridad = ticket['prioridad'] || '';
  //this.motivo = ticket['motivo'] || '';
  this.puntuacion = ticket['puntuacion'] || '';
  this.idTemplate = ticket['idTemplate'] || '';
  // 🔁 No sobrescribas respuestasInputs aquí — será seteado en obtenerTemplate()
  await this.obtenerTemplate();
  const campos = ticket['campos'] || [];
    // Respuestas a inputs
    this.respuestasInputs.forEach((input, i) => {
      const c = campos.find((c: any) => c.tipo === 'input' && c.nombre === input.nombre);
      if (c) input.valor = c.valor || '';
    });

    // Respuestas a desplegables (necesitás la selección)
    this.respuestasDesplegables = campos
      .filter((c: any) => c.tipo === 'desplegable')
      .map((c: any) => ({
        nombre: c.nombre || '',
        opciones: c.opciones || [],
        seleccion: c.seleccion || ''
      }));

    this.respuestasRadioButtons = campos
      .filter((c: any) => c.tipo === 'radio')
      .map((c: any) => ({
        nombre: c.nombre || '',
        opciones: c.opciones || [],
        seleccion: c.seleccion || ''
      }));
  
    if (this.puntuacion !== "") {
      this.puntuacionConfirmada = true;
    }
  
  this.modificacion = this.validarPermisoModificacion();
  this.validarEstadoMod();
}


getComentarios(id: string) {
  this._comentarioService.getDataComentarioByTicket(this.id).then(value => {
    this.comentarios = value.sort((a, b) => new Date(b.fechaComentario).getTime() - new Date(a.fechaComentario).getTime());
  });
}




validarPermisoComentario(): boolean {
  if (!this.comentarios.length) return true;
  return this.idUsuario !== this.comentarios[0].userId;
}

validarPermisoModificacion(){
  if(this.rolUsuario== this.areaResponsable)return true;
  else return false;
}

asignarResponsable(){
  if(this.areaResponsable==this.rolUsuario){
    this.nombreResponsable=this.nombreUsuario;
    this.apellidoResponsable=this.apellidoUsuario;
    this.updateTicket();
  }
}

async guardarComentario() {
  const valor = this.formComentario.value.comentario?.trim();
  if (!valor) return;

  const Comentario: comentarioCreate = {
    comentario: valor,
    fechaComentario: new Date().toISOString(),
    idTicket: this.id,
    nombreEscritor: this.nombreUsuario,
    apellidoEscritor: this.apellidoUsuario,
    idUsuario: this.idUsuario
  };

  try {
    await this._comentarioService.create(Comentario);
    this.formComentario.reset();
    this.getComentarios(this.id); // ✅ recarga comentarios con nuevo
  } catch (error) {
    alert('Error al crear comentario');
    console.error(error);
  }
}


async obtenerTemplate() {
  const template = await this._templateService.getDataTemplateById(this.idTemplate);
  const campos = template.campos || [];

  this.tituloTemplate = template['titulo'];

  // Inputs (solo los valores)
  this.respuestasInputs = campos
  .filter(c => c.tipo === 'input')
  .map(c => ({
    nombre: c.nombre || '',
    valor: c.valor || ''
  }));

  // Desplegables
  this.desplegablesTemplate = campos
  .filter(c => c.tipo === 'desplegable')
  .map(c => ({
    nombre: c.nombre || '',
    opciones: c.opciones || [],
    seleccion: ''
  }));

  // Radio buttons
  this.radioButtonsTemplate = campos
  .filter(c => c.tipo === 'radio')
  .map(c => ({
    nombre: c.nombre || '',
    opciones: c.opciones || [],
    seleccion: c.seleccion || ''
  }));}

  async updateTicket() {
    this.fechaActualizacion = new Date().toISOString();
    this.historialCambios = [];
  
    const campos: Campo[] = [
      ...this.respuestasInputs.map(input => ({
        tipo: 'input' as const,
        nombre: input.nombre,
        valor: input.valor
      })),
      ...this.respuestasDesplegables.map(d => ({
        tipo: 'desplegable' as const,
        nombre: d.nombre,
        opciones: d.opciones,
        seleccion: d.seleccion
      })),
      ...this.respuestasRadioButtons.map(r => ({
        tipo: 'radio' as const,
        nombre: r.nombre,
        opciones: r.opciones,
        seleccion: r.seleccion
      }))
    ];
  
    // 🔁 Asegurate de mantener actualizado el estado interno
    this.campos = campos;

    // actualiza si cierra el ticket...creo...TAL VEZ
    if (this.estado == 'Finalizado'){
      this.fechaFinalizacion = new Date().toISOString();
    }
    
    const ticket: OtroTicket = {
      apellidoSolicitante: this.Apellido,
      nombreSolicitante: this.nombre,
      fechaSolicitud: this.fechaSolicitud,
      fechaActualizacion: this.fechaActualizacion,
      fechaFinalizacion: this.fechaFinalizacion,
      detalle: this.Detalles,
      tipoTicket: this.Tipo,
      tipoSolicitud: this.tipoSolicitud,
      estado: this.estado,
      areaResponsable: this.areaResponsable,
      nombreResponsable: this.nombreResponsable,
      apellidoResponsable: this.apellidoResponsable,
      asunto: this.asunto,
      prioridad: this.prioridad,
      //motivo: this.motivo,
      puntuacion: this.puntuacion.toString(),
      idTemplate: this.idTemplate,
      campos
    };
  
    const camposAnteriores = this.originalTicket.campos || [];
    this.registrarCambiosEnTicketCompleto(ticket, this.originalTicket);

  
    await this._ticketservice.updateTicket(ticket, this.id);
  
    for (const cambio of this.historialCambios) {
      await this._ticketservice.addHistorialCambio(this.id, cambio);
    }
  
    this.router.navigate(['']);
  }
  
  historialAgrupadoArray: {
    nombre?: string;
    cambios: { prop: string; anterior: string; nuevo: string }[];
    fecha: string;
    usuario: string;
  }[] = [];
  

  registrarCambiosEnCampos(actuales: Campo[], anteriores: Campo[]) {
    actuales.forEach((nuevo, i) => {
      const anterior = anteriores[i];
  
      const keys: (keyof Campo)[] = ['tipo', 'nombre', 'valor', 'seleccion', 'opciones'];
  
      if (!anterior) {
        // Campo nuevo completo
        keys.forEach(key => {
          const nuevoVal = nuevo[key];
          if (nuevoVal !== undefined && nuevoVal !== null) {
            this.historialCambios.push({
              campo: `campos[${i}].${key}`,
              anterior: '',
              nuevo: this.stringifyValue(nuevoVal),
              fecha: new Date().toISOString(),
              usuario: `${this.nombreUsuario} ${this.apellidoUsuario}`
            });
          }
        });
        return;
      }
  
      keys.forEach(key => {
        const nuevoVal = nuevo[key];
        const anteriorVal = anterior[key];
  
        let sonDistintos = false;
  
        if (Array.isArray(nuevoVal) && Array.isArray(anteriorVal)) {
          // Orden y contenido deben coincidir
          sonDistintos = JSON.stringify(nuevoVal) !== JSON.stringify(anteriorVal);
        } else {
          sonDistintos = nuevoVal !== anteriorVal;
        }
  
        if (sonDistintos) {
          this.historialCambios.push({
            campo: `campos[${i}].${key}`,
            anterior: this.stringifyValue(anteriorVal),
            nuevo: this.stringifyValue(nuevoVal),
            fecha: new Date().toISOString(),
            usuario: `${this.nombreUsuario} ${this.apellidoUsuario}`
          });
        }
      });
    });
  }
  
  registrarCambiosEnTicketCompleto(actual: OtroTicket, anterior: Partial<OtroTicket>) {
    const propiedades: (keyof OtroTicket)[] = [
      'apellidoSolicitante',
      'nombreSolicitante',
      'fechaSolicitud',
      'detalle',
      'tipoTicket',
      'tipoSolicitud',
      'estado',
      'areaResponsable',
      'nombreResponsable',
      'apellidoResponsable',
      'asunto',
      'prioridad',
      //'motivo',
      'puntuacion',
      'idTemplate'
    ];
  
    // 🔁 Comparar propiedades generales
    propiedades.forEach(prop => {
      const nuevoVal = actual[prop];
      const anteriorVal = anterior[prop];
  
      if (nuevoVal !== anteriorVal) {
        this.historialCambios.push({
          campo: `${String(prop)}`,
          anterior: this.stringifyValue(anteriorVal),
          nuevo: this.stringifyValue(nuevoVal),
          fecha: new Date().toISOString(),
          usuario: `${this.nombreUsuario} ${this.apellidoUsuario}`
        });
      }
    });
  
    // 🔁 Comparar campos dinámicos
    this.registrarCambiosEnCampos(actual.campos || [], anterior.campos || []);
  }
  
  
  stringifyValue(val: any): string {
    if (val === undefined || val === null) return '';
    if (Array.isArray(val)) return val.join(', ');
    return typeof val === 'object' ? JSON.stringify(val) : String(val);
  }
  
  


  async getHistorialCambios() {
    const ref = collection(this._firestore, `ticket/${this.id}/historialCambios`);
    const snapshot = await getDocs(ref);
  
    // Orden cronológico ascendente
    this.historialSubcoleccion = snapshot.docs
      .map(doc => doc.data())
      .sort((a, b) => new Date(a['fecha']).getTime() - new Date(b['fecha']).getTime());
  
    // Convertir cada entrada en un objeto listo para mostrar
    this.historialAgrupadoArray = this.historialSubcoleccion.map((h: any) => {
      let nombre: string | undefined;
      const match = h.campo.match(/campos\[(\d+)\]\.(.*)/);
  
      if (match) {
        const idx = +match[1];
        const prop = match[2];
  
        // 1. Si el cambio es sobre el nombre mismo, usar el nuevo valor
        if (prop === 'nombre') {
          nombre = h.nuevo;
        }
  
        // 2. Si no, buscar nombre anterior en historial
        if (!nombre) {
          const nombrePrevio = this.historialSubcoleccion.find(c =>
            c.campo === `campos[${idx}].nombre`
          );
          nombre = nombrePrevio?.nuevo;
        }
  
        // 3. Si no, usar nombre actual del ticket
        if (!nombre) {
          nombre = this.originalTicket?.campos?.[idx]?.nombre;
        }
  
        nombre ??= `Campo ${idx}`;
  
        return {
          nombre,
          cambios: [{
            prop,
            anterior: h.anterior,
            nuevo: h.nuevo
          }],
          fecha: h.fecha,
          usuario: h.usuario
        };
      } else {
        // Cambios generales (como estado, prioridad, etc)
        return {
          nombre: undefined,
          cambios: [{
            prop: h.campo,
            anterior: h.anterior,
            nuevo: h.nuevo
          }],
          fecha: h.fecha,
          usuario: h.usuario
        };
      }
    });
  }
  
  

getNombreCampoDesdeHistorialCampoKey(campoKey: string, campos: Campo[]): string | undefined {
  const match = campoKey.match(/campos\[(\d+)\]/);
  if (!match) return;
  const index = +match[1];
  return campos[index]?.nombre;
}


getInputLabelFromCampo(campo: string): string {
  const match = campo.match(/^inputs\[(\d+)\]$/);
  if (!match) return campo;
  const index = parseInt(match[1], 10);
  return this.inputLabels[index].nombre ?? campo;
}

getDesplegableLabelFromCampo(campo: string): string {
  const match = campo.match(/^desplegables\[(\d+)\]$/);
  if (!match) return campo;
  const index = parseInt(match[1], 10);
  return this.desplegablesTemplate[index]?.nombre ?? campo;
}

getRadioLabelFromCampo(campo: string): string {
  const match = campo.match(/^radioButtons\[(\d+)\]$/);
  if (!match) return campo;
  const index = parseInt(match[1], 10);
  return this.radioButtonsTemplate[index]?.nombre ?? campo;
}

getHistorialOrdenado(): any[] {
  return [...this.historialSubcoleccion].sort(
    (a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime()
  );
}

getCampoNombreDesdeHistorial(campoKey: string): string | null {
  const match = campoKey.match(/^campos\[(\d+)\]/);
  if (!match) return null;

  const index = parseInt(match[1], 10);
  const campo = this.originalTicket.campos?.[index];

  return campo?.nombre || `Campo ${index + 1}`;
}



parseCambioDeCampo(h: any): { nombre: string; prop?: string; anterior: string; nuevo: string } | null {
  const campoRegex = /^campos\[(\d+)\](?:\.(\w+))?$/; // ← acepta ambos: campos[2] y campos[2].valor
  const match = h.campo.match(campoRegex);
  if (!match) return null;

  const index = parseInt(match[1], 10);
  const prop = match[2]; // puede ser undefined

  const campo = this.originalTicket.campos?.[index];
  const nombre = campo?.nombre || `Campo ${index + 1}`;

  const anteriorStr = h.anterior ?? '';
  const nuevoStr = h.nuevo ?? '';

  const parsedOrRaw = (val: string): string => {
    try {
      const parsed = JSON.parse(val);
      return Array.isArray(parsed) ? parsed.join(', ') : String(parsed);
    } catch {
      return val;
    }
  };

  return {
    nombre,
    prop,
    anterior: parsedOrRaw(anteriorStr),
    nuevo: parsedOrRaw(nuevoStr)
  };
}

deleteTicket(){
this._ticketservice.deleteTicket(this.id);
this.router.navigate(['']);
}


}
