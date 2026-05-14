import { CommonModule } from '@angular/common';
import { Component, effect, inject, input } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { UsuariosServiceService } from '../../auth/data-access/usuarios-service.service';
import { TicketsService } from '../data-access/tickets.service';
import { FormsModule, NgModel } from '@angular/forms';

@Component({
    selector: 'app-solicitados',
    standalone:true,
    imports: [RouterLink, CommonModule, FormsModule],
    templateUrl: './solicitados.component.html',
    styleUrl: './solicitados.component.css'
})
export class SolicitadosComponent {
  idUsuario = input.required<string>();
  tickets:any[]=[];
  ticketsFinal:any[]=[];
  id:string|undefined;
  usuarios:any[]=[];
  nombre:string="";
  apellido:string="";
  rol:string="";
  userId:string="";
  filtro = {
    titulo: '',
    estado: '',
    solicitante: '',
    fechaDesde: '',
    fechaHasta: '',
    misAsignados:false
  };
  estadosDisponibles = ['Enviado', 'Recibido', 'Pendiente', 'EsperandoRespuesta', 'Finalizado'];


private _usuarioService = inject(UsuariosServiceService);
private _ticketService = inject(TicketsService);

  constructor(public router:Router){
    effect(()=> {
      const id = this.idUsuario();
      this.id=id;
      this.getDataByUser(id);


      
    });

  }

  async getDataByUser(id:string){ 
    const usuario = await this._usuarioService.getDataByUser(id).then(value => {
      this.usuarios = value;
      this.nombre=this.usuarios[0].nombre;
      this.apellido=this.usuarios[0].apellido;
      this.rol=this.usuarios[0].rol;
      this.userId=this.usuarios[0].userId;
      this._ticketService.getDataTicketsByRol(this.rol).then(value => {
      this.tickets = value;
      this.ticketsFinal = this.tickets.filter(t => t.userId !== this.userId);

      // ordenar inmediatamente
      this.sortColumn = 'fechaActualizacion';
      this.sortDirection = 'asc';
      this.sortTicketsBy('fechaActualizacion');
    });
    
      
  });}

  sortColumn: string = '';
sortDirection: 'asc' | 'desc' = 'asc';

sortTicketsBy(column: string) {
  if (this.sortColumn === column) {
    this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
  } else {
    this.sortColumn = column;
    this.sortDirection = 'asc';
  }

  this.ticketsFinal.sort((a, b) => {
    const valA = a[column];
    const valB = b[column];

    if (valA == null) return 1;
    if (valB == null) return -1;

    // Comparación de strings
    if (typeof valA === 'string' && typeof valB === 'string') {
      // Intentar parsear como fecha
      const dateA = Date.parse(valA);
      const dateB = Date.parse(valB);

      if (!isNaN(dateA) && !isNaN(dateB)) {
        return this.sortDirection === 'asc'
          ? dateA - dateB
          : dateB - dateA;
      }

      return this.sortDirection === 'asc'
        ? valA.localeCompare(valB)
        : valB.localeCompare(valA);
    }

    // Comparación numérica
    return this.sortDirection === 'asc'
      ? valA - valB
      : valB - valA;
  });
}


get ticketsFiltrados() {
  return this.ticketsFinal.filter(ticket => {
    const fecha = new Date(ticket.fechaSolicitud).toISOString().split('T')[0];

    return (
      (!this.filtro.titulo || ticket.tipoTicket?.toLowerCase().includes(this.filtro.titulo.toLowerCase())) &&
      (!this.filtro.estado || ticket.estado === this.filtro.estado) &&
      (!this.filtro.fechaDesde || fecha >= this.filtro.fechaDesde) &&
      (!this.filtro.fechaHasta || fecha <= this.filtro.fechaHasta) &&
      (!this.filtro.solicitante || 
        (`${ticket.nombreSolicitante} ${ticket.apellidoSolicitante}`.toLowerCase().includes(this.filtro.solicitante.toLowerCase()))) &&
        (!this.filtro.misAsignados || ticket.nombreResponsable === this.nombre)
    );
  });
}


resetFiltros() {
  this.filtro = {
    titulo: '',
    estado: '',
    solicitante: '',
    fechaDesde: '',
    fechaHasta: '',
    misAsignados : false
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
