import { Component, effect, inject, input, ViewChild } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { UsuariosServiceService } from '../../auth/data-access/usuarios-service.service';
import { TicketsService } from '../data-access/tickets.service';
import { CommonModule } from '@angular/common';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { MatDialog } from '@angular/material/dialog';
import { DialogGenerandoPdfComponent } from '../../dialogs/dialog-generando-pdf/dialog-generando-pdf.component';
import { ChartData, ChartOptions } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';
import { BusquedaService } from '../../busquedas/data-access/busqueda.service';
import { FormsModule } from '@angular/forms';



@Component({
  selector: 'app-historial',
  standalone: true,
  imports: [CommonModule, RouterModule, BaseChartDirective, FormsModule],
  templateUrl: './historial.component.html',
  styleUrl: './historial.component.css'
})
export class HistorialComponent {
 idUsuario = input.required<string>();
  ticketsCreados:any[]=[];
  ticketsRealizados:any[]=[];
  ticketsRealizadosFinal:any[]=[];
  id:string|undefined;
  usuarios:any[]=[];
  nombre:string="";
  apellido:string="";
  rol:string="";
  userId:string="";
  realizados:boolean=false;
  creados:boolean=true;
  puntuacion:string="";
  prioridadesDisponibles = ['Baja', 'Media', 'Alta'];
  estadosDisponibles = ['Enviado', 'Recibido', 'Pendiente', 'EsperandoRespuesta', 'Finalizado'];
  areasDisponibles = ['Sistemas', 'Recursos Humanos', 'Operaciones', 'Contabilidad', 'Tesoreria', 'Administración'];




  //Piechart
  puestos:any[]=[];
  pieChartDataRealizados: ChartData<'pie', number[], string | string[]> = {
    labels: [],
    datasets: [
      {
        data: [],
        backgroundColor: [],
      },
    ],
  };
  public pieChartOptionsRealizados: ChartOptions<'pie'> = {
    responsive: true,
    maintainAspectRatio: false,
    layout: {
      padding: 0
    },    
    plugins: {
      legend: {
        position: 'right',
      },
      title: {
        display: true,
        text: [
          'Solicitudes realizadas en los ',
          'últimos 30 días por prioridad'
        ],
        font: {
          size: 15,
          weight: 'bold',
        },
        padding: {
          bottom: 10
        }
      }
    }
  };
  pieChartDataCreados: ChartData<'pie', number[], string | string[]> = {
    labels: [],
    datasets: [
      {
        data: [],
        backgroundColor: [],
      },
    ],
  };
  public pieChartOptionsCreados: ChartOptions<'pie'> = {
    responsive: true,
    maintainAspectRatio: false,
    layout: {
      padding: 0
    },    
    plugins: {
      legend: {
        position: 'right',
      },
      title: {
        display: true,
        text: [
          'Solicitudes creadas finalizadas en ',
          'los últimos 30 días por áreas'
        ],
        font: {
          size: 15,
          weight: 'bold',
        },
        padding: {
          bottom: 10
        }
      }
    }
  };
  pieChartDataTotal: ChartData<'pie', number[], string | string[]> = {
    labels: [],
    datasets: [
      {
        data: [],
        backgroundColor: [],
      },
    ],
  };
  public pieChartOptionsTotal: ChartOptions<'pie'> = {
    responsive: true,
    maintainAspectRatio: false,
    layout: {
      padding: 0
    },    
    plugins: {
      legend: {
        position: 'right',
      },
      title: {
        display: true,
        text: [
          'Total de solicitudes creadas y realizadas ',
          'en los últimos 30 días por áreas'
        ],
        font: {
          size: 15,
          weight: 'bold',
        },
        padding: {
          bottom: 10
        }
      }
    }
  };

  
  mostrarPieRealizados = false;
  mostrarPieCreados = false;
  mostrarPieTotal = false;

private _usuarioService = inject(UsuariosServiceService);
private _ticketService = inject(TicketsService);

  constructor(private matDialog: MatDialog,
    private _busquedasService: BusquedaService,
    public _router: Router
  ){
    effect(()=> {
      const id = this.idUsuario();
      this.id=id;
      this.getDataByUser(id);
      
    });

  }

  irRealizados(){
    this.realizados=true;
    this.creados=false;
  }
  irCreados(){
    this.realizados=false;
    this.creados=true;
  }

  async getDataByUser(id:string){ 
    const usuario = await this._usuarioService.getDataByUser(id).then(value => {
      this.usuarios = value;
      this.nombre=this.usuarios[0].nombre;
      this.apellido=this.usuarios[0].apellido;
      this.rol=this.usuarios[0].rol;
      this.userId=this.usuarios[0].userId;
      
      this._ticketService.getDataTicketsByRolFinalizados(this.rol).then(value => {
      this.ticketsRealizados = value;
      // console.log("tickets realizados"+this.ticketsRealizados.values)
      for(let i=0;i<this.ticketsRealizados.length;i++){
        if(this.ticketsRealizados[i].nombreResponsable==this.nombre && this.ticketsRealizados[i].apellidoResponsable==this.apellido){
          this.ticketsRealizadosFinal.push(this.ticketsRealizados[i]);
        }}
        this.sortColumn = 'fechaFinalizacion';
        this.sortDirection = 'asc';
        this.sortTicketsBy('fechaFinalizacion', 'realizados');
    });
    this._ticketService.getDataTicketsFinalizadosByUser(this.userId).then(value => {
      this.ticketsCreados = value;
      this.organizePieChartData();
    // console.log("tickets creados"+this.ticketsCreados);
    this.sortColumn = 'fechaFinalizacion';
    this.sortDirection = 'asc';
    this.sortTicketsBy('fechaFinalizacion', 'creados');}
  ); 
  });
}

sortColumn: string = '';
sortDirection: 'asc' | 'desc' = 'asc';

sortTicketsBy(column: string, list: 'creados' | 'realizados') {
  if (this.sortColumn === column) {
    this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
  } else {
    this.sortColumn = column;
    this.sortDirection = 'asc'; // podés usar 'desc' si preferís invertir
  }

  const targetList = list === 'creados' ? this.ticketsCreados : this.ticketsRealizadosFinal;

  targetList.sort((a, b) => {
    const valA = a[column];
    const valB = b[column];

    if (valA == null) return 1;
    if (valB == null) return -1;

    // Intenta ordenar por fecha si son strings de fechas
    const dateA = Date.parse(valA);
    const dateB = Date.parse(valB);

    if (!isNaN(dateA) && !isNaN(dateB)) {
      return this.sortDirection === 'asc' ? dateA - dateB : dateB - dateA;
    }

    const strA = valA.toString().toLowerCase();
    const strB = valB.toString().toLowerCase();

    if (strA < strB) return this.sortDirection === 'asc' ? -1 : 1;
    if (strA > strB) return this.sortDirection === 'asc' ? 1 : -1;
    return 0;
  });
}


getSolicitudesUltimos30Dias(): number {
  const todosLosTickets = [...this.ticketsRealizadosFinal, ...this.ticketsCreados];
  const hoy = new Date();
  const hace30Dias = new Date();
  hace30Dias.setDate(hoy.getDate() - 29);

  const solicitudesUltimos30Dias = todosLosTickets.filter(ticket => {
    const fechaSolicitud = new Date(ticket.solicitud?.fechaSolicitud);
    return fechaSolicitud >= hace30Dias && fechaSolicitud <= hoy;
  });

  return solicitudesUltimos30Dias.length;
}


async organizePieChartData() {
  this.puestos = await this._busquedasService.getDataPuestos();

  const colores = ['#5DADE2', '#48C9B0', '#F06292', '#7f7f7f', '#FF5733', '#C70039', '#900C3F', '#581845'];
  const todasLasAreas = Array.from(
    new Set(this.puestos.map(p => p.area || 'Área desconocida'))
  );

  const hace30Dias = new Date();
  hace30Dias.setDate(hace30Dias.getDate() - 30);

  const procesarDatos = (tickets: any[], usarFecha: 'fechaSolicitud' | 'fechaFinalizacion') => {
    const labels: string[] = [];
    const data: number[] = [];
    const backgroundColors: string[] = [];

    todasLasAreas.forEach((area, index) => {
      const cantidad = tickets.filter(ticket =>
        ticket.areaResponsable === area &&
        new Date(ticket[usarFecha]) >= hace30Dias
      ).length;

      labels.push(area);
      data.push(cantidad);
      backgroundColors.push(colores[index % colores.length]);
    });

    return {
      labels,
      datasets: [{
        data,
        backgroundColor: backgroundColors,
      }],
    };
  };

  // Pie de "creados" → igual que antes
  this.pieChartDataCreados = procesarDatos(this.ticketsCreados, 'fechaSolicitud');
  this.mostrarPieCreados = this.pieChartDataCreados.datasets[0].data.some(d => d > 0);

// Paso 1: Filtrar solo los tickets realizados en los últimos 30 días
const ticketsRecientes = this.ticketsRealizadosFinal.filter(ticket =>
  new Date(ticket.fechaFinalizacion) >= hace30Dias
);

// Paso 2: Contar por prioridad
const conteoPrioridades: Record<string, number> = {};

ticketsRecientes.forEach(ticket => {
  const prioridad = ticket.prioridad || 'Sin prioridad';
  conteoPrioridades[prioridad] = (conteoPrioridades[prioridad] || 0) + 1;
});

// Paso 3: Definir orden y colores
const prioridades = ['Alta', 'Media', 'Baja'];
const prioridadColors = ['#E74C3C', '#F39C12', '#F4D03F'];
const prioridadData: number[] = prioridades.map(p => conteoPrioridades[p] || 0);


// Paso 4: Asignar al gráfico
this.pieChartDataRealizados = {
  labels: prioridades,
  datasets: [{
    data: prioridadData,
    backgroundColor: prioridadColors,
  }],
};

this.mostrarPieRealizados = this.pieChartDataRealizados.datasets[0].data.some(d => d > 0);

  // Pie de "total" → igual que antes
  this.pieChartDataTotal = procesarDatos(
    this.ticketsCreados.concat(this.ticketsRealizadosFinal),
    'fechaSolicitud'
  );
  this.mostrarPieTotal = this.pieChartDataTotal.datasets[0].data.some(d => d > 0);
}

generatePDF(){
  this.matDialog.open(DialogGenerandoPdfComponent, {
    disableClose: true
  });

    // le saca el hidden al div oculto para mostrarse en el reporte
    const aMostrar = document.getElementById('soloParaPDF')
    if(aMostrar){
      aMostrar.classList.remove('hidden')
    }
    const aMostrar2 = document.getElementById('soloParaPDF2')
    if(aMostrar2){
      aMostrar2.classList.remove('hidden')
    }
    // ahora con los filtros
    const aEsconder = document.getElementById('filtros')
    if(aEsconder){
      aEsconder.classList.add('hidden')
    }
    const aEsconder2 = document.getElementById('filtros2')
    if(aEsconder2){
      aEsconder2.classList.add('hidden')
    }
    //y finalmente con los h2 (a no desesperar que es temporal)
    document.querySelectorAll('h2').forEach(h2 => {
      (h2 as HTMLElement).classList.add('hidden');
    });

  const data = document.getElementById('tickets')!;
  html2canvas(data,{scale: 2, useCORS: true, //scale es para la definición y CORS para cargar imagenes de otros dominios
  }).then(canvas => {
    const imgWidth = 208;
    const pageHeight = 295;
    const imgHeight = canvas.height * imgWidth / canvas.width;
    const heightLeft = imgHeight;

    const contentDataURL = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4'); // A4 size page of PDF

    let position = 0;
    pdf.addImage(contentDataURL, 'PNG', 0, position, imgWidth, imgHeight);
    
    if (heightLeft >= pageHeight) {
      position = heightLeft - pageHeight; // Calcula la posición para la siguiente página
      pdf.addPage(); // Agrega una nueva página
      pdf.addImage(contentDataURL, 'PNG', 0, position, imgWidth, imgHeight); // Agrega la imagen a la nueva página
  }
   
    pdf.save('reporteTickets.pdf'); // Generated PDF

  // re-oculta el div oculto
  const aMostrar = document.getElementById('soloParaPDF')
  if(aMostrar){
    aMostrar.classList.add('hidden')
  }
  const aMostrar2 = document.getElementById('soloParaPDF2')
  if(aMostrar2){
    aMostrar2.classList.add('hidden')
  }
  //análogo con los filtros
  const aEsconder = document.getElementById('filtros')
  if(aEsconder){
    aEsconder.classList.remove('hidden')
  }
  const aEsconder2 = document.getElementById('filtros2')
  if(aEsconder2){
    aEsconder2.classList.remove('hidden')
  }
  //análogo con los h2, y ahora back to normal
  document.querySelectorAll('h2').forEach(h2 => {
    (h2 as HTMLElement).classList.remove('hidden');
  });

  this.matDialog.closeAll();

  });

}

filtroRealizados = {
  tipoTicket: '',
  estado: '',
  prioridad: '',
  nombreSolicitante: '',
  fechaDesde: '',
  fechaHasta: ''
};

filtroCreados = {
  tipoTicket: '',
  estado: '',
  area: '',
  responsable: '',
  prioridad: '',
  fechaDesde: '',
  fechaHasta: ''
};



resetFiltrosRealizados() {
  this.filtroRealizados = {
    tipoTicket: '',
    estado: '',
    prioridad: '',
    nombreSolicitante: '',
    fechaDesde: '',
    fechaHasta: ''
    };
}

resetFiltrosCreados() {
  this.filtroCreados = {
    tipoTicket: '',
    estado: '',
    area: '',
    responsable: '',
    prioridad: '',
    fechaDesde: '',
    fechaHasta: ''
  };
}


get ticketsFiltradosRealizados() {
  return this.ticketsRealizadosFinal.filter(ticket => {
    const nombreCompleto = `${ticket.nombreSolicitante} ${ticket.apellidoSolicitante}`.toLowerCase();
    return (
      (!this.filtroRealizados.tipoTicket || ticket.tipoTicket.toLowerCase().includes(this.filtroRealizados.tipoTicket.toLowerCase())) &&
      (!this.filtroRealizados.prioridad || ticket.prioridad === this.filtroRealizados.prioridad) &&
      (!this.filtroRealizados.nombreSolicitante || nombreCompleto.includes(this.filtroRealizados.nombreSolicitante.toLowerCase())) &&
      (!this.filtroRealizados.fechaDesde || new Date(ticket.fechaSolicitud) >= new Date(this.filtroRealizados.fechaDesde)) &&
      (!this.filtroRealizados.fechaHasta || new Date(ticket.fechaSolicitud) <= new Date(this.filtroRealizados.fechaHasta)) 
    );
  });
}

get ticketsFiltradosCreados() {
  return this.ticketsCreados.filter(ticket => {
    const responsableNombre = `${ticket.nombreResponsable} ${ticket.apellidoResponsable}`.toLowerCase();

    return (
      (!this.filtroCreados.tipoTicket || ticket.tipoTicket?.toLowerCase().includes(this.filtroCreados.tipoTicket.toLowerCase())) &&
      (!this.filtroCreados.estado || ticket.estado === this.filtroCreados.estado) &&
      (!this.filtroCreados.area || ticket.areaResponsable === this.filtroCreados.area) &&
      (!this.filtroCreados.responsable || responsableNombre.includes(this.filtroCreados.responsable.toLowerCase())) &&
      (!this.filtroCreados.prioridad || ticket.prioridad === this.filtroCreados.prioridad) &&
      (!this.filtroCreados.fechaDesde || new Date(ticket.fechaSolicitud) >= new Date(this.filtroCreados.fechaDesde)) &&
      (!this.filtroCreados.fechaHasta || new Date(ticket.fechaSolicitud) <= new Date(this.filtroCreados.fechaHasta))
    );
  });
}


paginaActualTicketsCreados = 1;
itemsPorPaginaTicketsCreados = 10;

get totalPaginasTicketsCreados(): number {
  return Math.ceil(this.ticketsFiltradosCreados.length / this.itemsPorPaginaTicketsCreados);
}

get ticketsPaginadosCreados(): any[] {
  const inicio = (this.paginaActualTicketsCreados - 1) * this.itemsPorPaginaTicketsCreados;
  const fin = inicio + this.itemsPorPaginaTicketsCreados;
  return this.ticketsFiltradosCreados.slice(inicio, fin);
}

cambiarPaginaTicketsCreados(direccion: 'anterior' | 'siguiente') {
  if (direccion === 'anterior' && this.paginaActualTicketsCreados > 1) {
    this.paginaActualTicketsCreados--;
  } else if (direccion === 'siguiente' && this.paginaActualTicketsCreados < this.totalPaginasTicketsCreados) {
    this.paginaActualTicketsCreados++;
  }
}

paginaActualTicketsRealizados = 1;
itemsPorPaginaTicketsRealizados = 10;

get totalPaginasTicketsRealizados(): number {
  return Math.ceil(this.ticketsFiltradosRealizados.length / this.itemsPorPaginaTicketsRealizados);
}

get ticketsPaginadosRealizados(): any[] {
  const inicio = (this.paginaActualTicketsRealizados - 1) * this.itemsPorPaginaTicketsRealizados;
  const fin = inicio + this.itemsPorPaginaTicketsRealizados;
  return this.ticketsFiltradosRealizados.slice(inicio, fin);
}

cambiarPaginaTicketsRealizados(direccion: 'anterior' | 'siguiente') {
  if (direccion === 'anterior' && this.paginaActualTicketsRealizados > 1) {
    this.paginaActualTicketsRealizados--;
  } else if (direccion === 'siguiente' && this.paginaActualTicketsRealizados < this.totalPaginasTicketsRealizados) {
    this.paginaActualTicketsRealizados++;
  }
}


}
