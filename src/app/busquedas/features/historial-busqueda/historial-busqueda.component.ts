import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { ChartData, ChartOptions } from 'chart.js';
import { BaseChartDirective} from 'ng2-charts'
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { BusquedaService } from '../../data-access/busqueda.service';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { DialogGenerandoPdfComponent } from '../../../dialogs/dialog-generando-pdf/dialog-generando-pdf.component';
import { Router } from '@angular/router';

@Component({
    selector: 'app-historial-busqueda',
    standalone:true,
    imports: [CommonModule, FormsModule, ReactiveFormsModule, BaseChartDirective],
    templateUrl: './historial-busqueda.component.html',
    styleUrl: './historial-busqueda.component.css'
})
export class HistorialBusquedaComponent {
  constructor(private matDialog: MatDialog,
              public _router: Router
  ){}

  private _busquedasService = inject(BusquedaService);
  busquedasActivas:any[]=[];
  busquedasFinalizadas:any[]=[];
  puestos:any[]=[];
  candidatos:any[]=[];
  entrevistas:any[]=[];
  examenes:any[]=[];
  activas:boolean=false;
  finalizadas:boolean=true;
  irBusqueda:boolean=false;
  examen:boolean=false;
  entrevista:boolean=false;
  verCandidato:boolean=false;
  idBusqueda:string='';
  busquedaAMostrar: any;
  loadingModal = false;

  //Piechart
  pieChartDataActivas: ChartData<'pie', number[], string | string[]> = {
    labels: [],
    datasets: [
      {
        data: [],
        backgroundColor: [],
      },
    ],
  };
  public pieChartOptionsActivas: ChartOptions<'pie'> = {
    responsive: true,
    plugins: {
      legend: {
        position: 'right',
      },
      title: {
        display: true,
        text: 'Búsquedas activas distribuídas por áreas',
        font: {
          size: 15,
          weight: 'bold',
        }
      }
    }
  };
  pieChartDataFinalizadas: ChartData<'pie', number[], string | string[]> = {
    labels: [],
    datasets: [
      {
        data: [],
        backgroundColor: [],
      },
    ],
  };
  public pieChartOptionsFinalizadas: ChartOptions<'pie'> = {
    responsive: true,
    plugins: {
      legend: {
        position: 'right',
      },
      title: {
        display: true,
        text: 'Búsquedas finalizadas distribuídas por áreas',
        font: {
          size: 15,
          weight: 'bold',
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
    plugins: {
      legend: {
        position: 'right',
      },
      title: {
        display: true,
        text: 'Total de búsquedas distribuídas por áreas',
        font: {
          size: 15,
          weight: 'bold',
        }
      }
    }
  };

  mostrarPCActivas = false;
  mostrarPCFinalizadas = false;
  mostrarPCTotales = false;

  filtroBusquedas = {
    nombre: '',
    estado: '',
    idPuesto: '',
    fechaDesde: '',
    fechaHasta: ''
  };
  
  //Var Candidato
  idCandidato:string='';
  nombreCandidato:string='';
  apellidoCandidato:string='';
  tomaDeContacto:string='';
  estadoCandidato:string='';
  estudios:string='';
  experiencia:string='';
  descripcion:string='';
  motivoRechazo:string='';

  //Var Examen
  idExamen:string='';
  nombreExamen:string='';
  fechaExamen:string='';
  resultadoExamen:string='';
  nombreResponsable:string='';
  apellidoResponsable:string='';

  ngOnInit() {
      Promise.all([
        this._busquedasService.getDataBusqueda(),
        this._busquedasService.getDataBusquedaCerradas()
      ]).then(([dActivas, dFinalizadas]) => {
        this.busquedasActivas = dActivas;
        this.busquedasFinalizadas = dFinalizadas;
        this.organizePieChartData(); // Una vez que los datos estén listos, organizamos el gráfico
        this.sortColumn = 'fechaHasta';
        this.sortDirection = 'asc';
        this.sortTicketsBy('fechaHasta', 'realizados'); // como primero se muestran las búsquedas cerradas, el orden por default se setea acá
      });
    }

    async organizePieChartData() {
      this.puestos = await this._busquedasService.getDataPuestos();
    
      const colores = ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#34495E'];
      
      // Sacamos un array de áreas únicas
      const areasUnicas = Array.from(new Set(this.puestos.map(p => p.area || 'Área desconocida')));
    
      const procesarDatos = (busquedas: any[]) => {
        const labels: string[] = [];
        const data: number[] = [];
        const backgroundColors: string[] = [];
    
        areasUnicas.forEach((area, index) => {
          const idsDePuestosDelArea = this.puestos
            .filter(p => (p.area || 'Área desconocida') === area)
            .map(p => p.id);
    
          const cantidad = busquedas.filter(b => idsDePuestosDelArea.includes(b.idPuesto)).length;
    
          labels.push(area);
          data.push(cantidad);
          backgroundColors.push(colores[index % colores.length]);
        });
    
        return {
          labels,
          datasets: [{
            data,
            backgroundColor: backgroundColors
          }]
        };
      };
    
      this.pieChartDataActivas = procesarDatos(this.busquedasActivas);
      this.mostrarPCActivas = this.pieChartDataActivas.datasets[0].data.some(d => d > 0);
    
      this.pieChartDataFinalizadas = procesarDatos(this.busquedasFinalizadas);
      this.mostrarPCFinalizadas = this.pieChartDataFinalizadas.datasets[0].data.some(d => d > 0);
    
      this.pieChartDataTotal = procesarDatos(this.busquedasActivas.concat(this.busquedasFinalizadas));
      this.mostrarPCTotales = this.pieChartDataTotal.datasets[0].data.some(d => d > 0);
    }


  irFinalizadas(){
    this.finalizadas=true;
    this.activas=false;
    this.sortColumn = 'fechaHasta';
    this.sortDirection = 'asc';
    this.sortTicketsBy('fechaHasta', 'realizados')
    this.irBusqueda=false;
    this.verCandidato=false;
    this.examen=false;
    this.entrevista=false;
    this.paginaActual=1;
  }
  irActivas(){
    this.finalizadas=false;
    this.activas=true;
    this.sortColumn = 'fechaHasta';
    this.sortDirection = 'asc';
    this.sortTicketsBy('fechaHasta', 'creados')
    this.irBusqueda=false;
    this.verCandidato=false;
    this.examen=false;
    this.entrevista=false;
    this.paginaActual=1;
  }

mostrarBusqueda(i:number){
  this.irBusqueda=true;
  this.busquedaAMostrar=this.busquedasFinalizadas[i].nombre;
  this.idBusqueda=this.busquedasFinalizadas[i].id;
  this._busquedasService.getDataCandidatosByBusqueda(this.busquedasFinalizadas[i].id).then(value => {this.candidatos = value;}); 
}
  
mostrarBusquedaActiva(i:number){
  this.irBusqueda=true;
  this.busquedaAMostrar=this.busquedasActivas[i].nombre;
  this.idBusqueda=this.busquedasActivas[i].id;
  this._busquedasService.getDataCandidatosByBusqueda(this.busquedasActivas[i].id).then(value => {this.candidatos = value;});
}

async modificarCandidato(i:number){
  this.verCandidato=true;
  document.body.classList.add('overflow-hidden');
  this.examen=false;
  this.entrevista=false;
  this.idCandidato=this.candidatos[i].id;
  const candidato=  await this._busquedasService.getDataCandidatoById(this.candidatos[i].id);
  this.nombreCandidato=candidato['nombre'];
  this.apellidoCandidato=candidato['apellido'];
  this.tomaDeContacto=candidato['tomaDeContacto'];
  this.estadoCandidato=candidato['estado'];
  this.estudios=candidato['estudios'];
  this.experiencia=candidato['experiencia'];
  this.descripcion=candidato['descripcion'];
  this.motivoRechazo=candidato['motivoRechazo'];

}

  async verExamenes(i:number){
    this.entrevista=false;//a modo de double check por si se abrió el otro modal
    this.examen=true;
    this.loadingModal=true;
    document.body.classList.add('overflow-hidden');
    this.verCandidato=false;
    this.nombreCandidato=this.candidatos[i].nombre;
    this.apellidoCandidato=this.candidatos[i].apellido;
    this.idCandidato=this.candidatos[i].id;
    
    try{
      const examenes = await this._busquedasService.getDataExamenesByUser(this.candidatos[i].id,this.idBusqueda);
      this.examenes = examenes;
    
    }finally {
      this.loadingModal = false;
    }

  }

  async verEntrevistas(i:number){
   
    this.entrevista=true;
    this.examen=false; //a modo de double check por si se abrió el otro modal
    this.loadingModal=true;
    document.body.classList.add('overflow-hidden');
    this.verCandidato=false;
    this.nombreCandidato=this.candidatos[i].nombre;
    this.apellidoCandidato=this.candidatos[i].apellido;
    this.idCandidato=this.candidatos[i].id;

    try{
      const entrevistas = await this._busquedasService.getDataEntrevistasByUser(this.candidatos[i].id,this.idBusqueda);
      this.entrevistas = entrevistas;
    } finally {
      this.loadingModal = false;
    };
  }

  cierreModal(){
    this.examen=false;
    this.entrevista=false;
    this.verCandidato=false;
    this.examenes = [];
    this.entrevistas = [];
    this.loadingModal = false;
    document.body.classList.remove('overflow-hidden');
  }

  busquedasCaducadas():number {
      const hoy = new Date();
      hoy.setHours(0, 0, 0, 0);
    
      const hace30Dias = new Date(hoy);
      hace30Dias.setDate(hoy.getDate() - 30);
    
      return this.busquedasFinalizadas.filter(b => {
        const fechaHasta = new Date(b.fechaHasta);
        fechaHasta.setHours(0, 0, 0, 0);
        return fechaHasta < hoy && fechaHasta >= hace30Dias;
      }).length;
  }

sortColumn: string = '';
sortDirection: 'asc' | 'desc' = 'asc';

sortTicketsBy(column: string, list: 'creados' | 'realizados') {
  if (this.sortColumn === column) {
    this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
  } else {
    this.sortColumn = column;
    this.sortDirection = 'asc';
  }

  const targetList = list === 'creados' ? this.busquedasActivas : this.busquedasFinalizadas;

  targetList.sort((a, b) => {
    const valA = a[column];
    const valB = b[column];

    if (valA == null) return 1;
    if (valB == null) return -1;

    // Parsear como fechas si es posible
    const dateA = Date.parse(valA);
    const dateB = Date.parse(valB);

    if (!isNaN(dateA) && !isNaN(dateB)) {
      return this.sortDirection === 'asc'
        ? dateA - dateB
        : dateB - dateA;
    }

    // Comparación como strings
    const strA = valA.toString().toLowerCase();
    const strB = valB.toString().toLowerCase();

    if (strA < strB) return this.sortDirection === 'asc' ? -1 : 1;
    if (strA > strB) return this.sortDirection === 'asc' ? 1 : -1;
    return 0;
  });
}

get busquedasFiltradas() {
  if(this.activas){
    return this.busquedasActivas.filter(b => {
      return (
        (!this.filtroBusquedas.nombre || (b.nombre ?? '').toLowerCase().includes(this.filtroBusquedas.nombre.toLowerCase())) &&
        (!this.filtroBusquedas.estado || b.estado === this.filtroBusquedas.estado) &&
        (!this.filtroBusquedas.idPuesto || b.idPuesto === this.filtroBusquedas.idPuesto) &&
        (!this.filtroBusquedas.fechaDesde || new Date(b.fechaDesde) >= new Date(this.filtroBusquedas.fechaDesde)) &&
        (!this.filtroBusquedas.fechaHasta || new Date(b.fechaHasta) <= new Date(new Date(this.filtroBusquedas.fechaHasta).setHours(23, 59, 59, 999)))
      );
    });
  }else{
    return this.busquedasFinalizadas.filter(b => {
      return (
        (!this.filtroBusquedas.nombre || (b.nombre ?? '').toLowerCase().includes(this.filtroBusquedas.nombre.toLowerCase())) &&
        (!this.filtroBusquedas.estado || b.estado === this.filtroBusquedas.estado) &&
        (!this.filtroBusquedas.idPuesto || b.idPuesto === this.filtroBusquedas.idPuesto) &&
        (!this.filtroBusquedas.fechaDesde || new Date(b.fechaDesde) >= new Date(this.filtroBusquedas.fechaDesde)) &&
        (!this.filtroBusquedas.fechaHasta || new Date(b.fechaHasta) <= new Date(new Date(this.filtroBusquedas.fechaHasta).setHours(23, 59, 59, 999)))
      );
    });
  }
}

  
resetFiltrosBusquedas() {
  this.filtroBusquedas = {
    nombre: '',
    estado: '',
    idPuesto: '',
    fechaDesde: '',
    fechaHasta: ''
  };
}

paginaActual = 1;
itemsPorPagina = 10;

get totalPaginas(): number {
  return Math.ceil(this.busquedasFiltradas.length / this.itemsPorPagina);
}

get ticketsPaginadosRealizados(): any[] {
  const inicio = (this.paginaActual - 1) * this.itemsPorPagina;
  const fin = inicio + this.itemsPorPagina;
  return this.busquedasFiltradas.slice(inicio, fin);
}

cambiarPagina(direccion: 'anterior' | 'siguiente') {
  if (direccion === 'anterior' && this.paginaActual > 1) {
    this.paginaActual--;
  } else if (direccion === 'siguiente' && this.paginaActual < this.totalPaginas) {
    this.paginaActual++;
  }
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

  const data = document.getElementById('busquedas')!;
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
   
    pdf.save('reporteBusquedas.pdf'); // Generated PDF

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
}
