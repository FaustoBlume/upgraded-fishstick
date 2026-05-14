import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import{Router, RouterLink, RouterOutlet} from '@angular/router';
import { ServicioPruebaService } from '../servicios/servicio-prueba.service';
import { AuthStateService } from '../app/shared/data-access/auth-state.service';
import { UsuarioCreate, UsuariosServiceService } from '../app/auth/data-access/usuarios-service.service';
import { TicketsService } from '../app/tickets/data-access/tickets.service';
import { FormsModule } from '@angular/forms';

@Component({
    selector: 'app-home',
    standalone:true,
    imports: [CommonModule, RouterLink,FormsModule],
    templateUrl: './home.component.html',
    styleUrl: './home.component.css'
})
export class HomeComponent {
constructor(private router:Router,){}
private _authstate =inject(AuthStateService);
private servicioPrueba=inject(ServicioPruebaService);
private _usuarioService = inject(UsuariosServiceService);
private _ticketService = inject(TicketsService);

userEmail:string|undefined|null;
id:string|undefined;
userId:string|undefined;
nombre:string|undefined|null;
apellido:string|undefined;
ultimoIngreso:string|undefined;
horaUltimoIngreso:string|undefined;
contraseña:string|undefined;
email:string|undefined;
fechaIngreso:string|undefined;
rol:string|undefined;
usuarios: any[] = [];
tickets:any[]=[];

filtro = {
  titulo: '',
  estado: '',
  area: '',
  prioridad: '',
  fechaDesde: '',
  fechaHasta: ''
};


estadosDisponibles = ['Enviado', 'Recibido', 'Pendiente', 'EsperandoRespuesta', 'Finalizado'];
areasDisponibles = ['Sistemas', 'Recursos Humanos', 'Operaciones', 'Contabilidad', 'Tesoreria', 'Administración'];
prioridadesDisponibles = ['Baja', 'Media', 'Alta'];


  ngOnInit(){
      this.userId = this._authstate.currentUser?.uid;
      this.userEmail = this._authstate.currentUser?.email;
      this.getDataByUser();
      this.sortColumn = 'fechaActualizacion';
      this.sortDirection = 'asc';
      this.sortTicketsBy('fechaActualizacion');

  }

  async getDataByUser(){ // Trae la info del usuario que inicio sesión
      const usuario = await this._usuarioService.getDataByUser(this.userId).then(value => {
        this.usuarios = value;
        if(this.usuarios.length==0){this.getDataByEmail();}
        else{
        this.nombre=this.usuarios[0].nombre;
        this.apellido=this.usuarios[0].apellido;
        this.ultimoIngreso=this.usuarios[0].ultimoIngreso;
        this.contraseña=this.usuarios[0].contraseña;
        this.email=this.usuarios[0].email;
        this.fechaIngreso=this.usuarios[0].fechaIngreso;
        this.rol=this.usuarios[0].rol;
        this.id=this.usuarios[0].id;}
    });
    // Actualización último ingreso
    const fechaActual = new Date().toString();
    this._usuarioService.updateUltimoLogIn(this.usuarios[0].id, fechaActual);
    //
    this.servicioPrueba.getDataTicketsByUser(this.userId).then(value => {
      this.tickets = value;
  });
    };

    async getDataByEmail(){ 
      const usuario = await this._usuarioService.getDataByEmail(this.userEmail).then(value => {
        this.usuarios = value;
        this.nombre=this.usuarios[0].nombre;
        this.apellido=this.usuarios[0].apellido;
        this.ultimoIngreso=this.usuarios[0].ultimoIngreso;
        this.contraseña=this.usuarios[0].contraseña;
        this.email=this.usuarios[0].email;
        this.fechaIngreso=this.usuarios[0].fechaIngreso;
        this.rol=this.usuarios[0].rol;
        this.id=this.usuarios[0].id;
    });
    this.updateUsuario();
  };

  updateUsuario(){
    const Usuario: UsuarioCreate = {
          userId: this.userId || '',
          apellido: this.apellido || '' ,
          nombre:this.nombre || '',
          contraseña: this.contraseña || '',
          email: this.email || '',
          fechaIngreso: this.fechaIngreso || '',
          ultimoIngreso:Date() || '',
          rol:this.rol || '',
          };
    this._usuarioService.updateUsuario(Usuario,this.id || '');
    this.router.navigate(['']);
  }

  sortColumn: string = '';
sortDirection: 'asc' | 'desc' = 'asc';

sortTicketsBy(column: string) {
  if (this.sortColumn === column) {
    // Alternar dirección si se hace click de nuevo
    this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
  } else {
    this.sortColumn = column;
    this.sortDirection = 'asc'; // o 'desc' si querés que empiece descendente
  }

  this.tickets = this.tickets.sort((a, b) => {
    const aVal = a[column];
    const bVal = b[column];

    if (aVal instanceof Date && bVal instanceof Date) {
      return this.sortDirection === 'asc'
        ? aVal.getTime() - bVal.getTime()
        : bVal.getTime() - aVal.getTime();
    }

    return this.sortDirection === 'asc'
      ? aVal > bVal ? 1 : -1
      : aVal < bVal ? 1 : -1;
  });

}


get ticketsFiltrados() {
  return this.tickets.filter(ticket => {
    const fecha = new Date(ticket.fechaSolicitud).toISOString().split('T')[0];

    return (
      (!this.filtro.titulo || ticket.tipoTicket.toLowerCase().includes(this.filtro.titulo.toLowerCase())) &&
      (!this.filtro.estado || ticket.estado === this.filtro.estado) &&
      (!this.filtro.area || ticket.areaResponsable === this.filtro.area) &&
      (!this.filtro.prioridad || ticket.prioridad === this.filtro.prioridad) &&
      (!this.filtro.fechaDesde || fecha >= this.filtro.fechaDesde) &&
      (!this.filtro.fechaHasta || fecha <= this.filtro.fechaHasta)
    );
  });
}

resetFiltros() {
  this.filtro = {
    titulo: '',
    estado: '',
    area: '',
    prioridad: '',
    fechaDesde: '',
    fechaHasta: ''
  };
  window.scrollTo({ top: 0, behavior: 'smooth' });

}

paginaActualTickets = 1;
itemsPorPaginaTickets = 10;

get totalPaginasTickets(): number {
  return Math.ceil(this.ticketsFiltrados.length / this.itemsPorPaginaTickets);
}

get ticketsPaginados(): any[] {
  const inicio = (this.paginaActualTickets - 1) * this.itemsPorPaginaTickets;
  const fin = inicio + this.itemsPorPaginaTickets;
  return this.ticketsFiltrados.slice(inicio, fin);
}

cambiarPaginaTickets(direccion: 'anterior' | 'siguiente') {
  if (direccion === 'anterior' && this.paginaActualTickets > 1) {
    this.paginaActualTickets--;
  } else if (direccion === 'siguiente' && this.paginaActualTickets < this.totalPaginasTickets) {
    this.paginaActualTickets++;
  }
}



}


