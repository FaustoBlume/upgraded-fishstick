import { Component, inject } from '@angular/core';
import { BusquedaService, CandidatoCreate, ExamenCreate } from '../../data-access/busqueda.service';
import { FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
    selector: 'app-seguimiento-busqueda',
    standalone:true,
    imports: [FormsModule, CommonModule, ReactiveFormsModule],
    templateUrl: './seguimiento-busqueda.component.html',
    styleUrl: './seguimiento-busqueda.component.css'
})
export class SeguimientoBusquedaComponent {

  private _busquedaService = inject(BusquedaService);
  private _formBuilder = inject(FormBuilder);
  private _router= inject(Router);

  valoresViejos:string[]=[];
  valoresNuevos:string[]=[];
  atributosViejos:string[]=[];
  atributosNuevos:string[]=[];
  modificaciones:any[]=[];
  candidatos:any[]=[];
  puestos:any[]=[];
  busquedas:any[]=[];
  examenes:any[]=[];
  entrevistas:any[]=[];
  busqueda:boolean=false;
  examen:boolean=false;
  entrevista:boolean=false;
  nuevo:boolean=false;
  nuevoCandidato:boolean=false;
  listado:boolean=true;
  editar:boolean=false;
  editarCandidato:boolean=false;
  nuevaBusqueda:boolean=false;
  nuevoPuesto:boolean=false;
  historial:boolean=false;
  idBusqueda:string="";
  tipo:string="";
  idCandidato:string="";
  nombreCandidato:string="";
  apellidoCandidato:string="";
  cargandoBusquedas: boolean = true;
  mostrarSidebar = false;


  //Variables de la Busqueda
  titulo:string="";
  puesto:string="";
  nombre:string="";
  fechaDesde:string="";
  fechaHasta:string="";
  fechaCierre:string="";
  idPuesto:string="";
  estado:string="";

  //Variables de Examen/Entrevista
  nombreExamen:string="";
  fechaExamen:string="";
  resultadoExamen:string="";
  nombreResponsable:string="";
  apellidoResponsable:string="";
  idExamen:string="";

  //Variables de Candidato
estadoCandidato:string="";
tomaDeContacto:string="";
estudios:string="";
experiencia:string="";
descripcion:string="";
motivoRechazo:string="";
fechaInscripcion:string="";


  form = this._formBuilder.group({
    nombre:this._formBuilder.control(''),
    resultado:this._formBuilder.control(''),
    fecha:this._formBuilder.control(''),
    nombreResponsable:this._formBuilder.control(''),
    apellidoResponsable:this._formBuilder.control(''),
  });

  formCandidato = this._formBuilder.group({
    nombre:this._formBuilder.control(''),
    tomaDeContacto:this._formBuilder.control(''),
    estado:"Preseleccion",
    apellido:this._formBuilder.control(''),
    experiencia:this._formBuilder.control(''),
    estudios:this._formBuilder.control(''),
    descripcion:this._formBuilder.control(''),
    motivoRechazo:"",
    fechaInscripcion:Date(),
  });

  formBusqueda = this._formBuilder.group({
    nombreBusqueda:this._formBuilder.control(''),
    fechaDesde:this._formBuilder.control(''),
    fechaHasta:this._formBuilder.control(''),
    fechaCierre:this._formBuilder.control(''),
    idPuesto:this._formBuilder.control(''),
  });
  
  formPuesto = this._formBuilder.group({
    nombre:this._formBuilder.control(''),
    area:this._formBuilder.control(''),
    descripcion:this._formBuilder.control(''),
  });

  ngOnInit(){
    this.getDataBusqueda();
    }

  async irBusqueda(id:number){
    this.listado=false;
    this.titulo=this.busquedas[id].nombre&&' - '&&this.busquedas[id].fechaDesde&&' - '&&this.busquedas[id].fechaHasta;
    this.busqueda=true;
    const puesto =  await this._busquedaService.getDataPuestoById(this.busquedas[id].idPuesto);
    this.puesto=puesto['nombre'];
    this.idBusqueda = this.busquedas[id].id;
    console.log(this.idBusqueda);
    const candidatos = await this._busquedaService.getDataCandidatosByBusqueda(this.busquedas[id].id).then(value => {
      this.candidatos = value;
    });
    const modificaciones = await this._busquedaService.getDataModificacionByBusqueda(this.busquedas[id].id).then(value => {
      this.modificaciones = value;
    });
  }

  irPuesto(){
    this.nuevoPuesto=true;
    document.body.classList.add('overflow-hidden');
  }
  irnuevaBusqueda(){
    this.nuevaBusqueda=true;
    document.body.classList.add('overflow-hidden');
    this.getDataPuestos();
  }

  async verExamenes(i:number){
    this.nuevoCandidato=false;
    this.editar=false;
    this.entrevista=false;
    this.examen=true;
    this.nuevo=false;
    this.nuevoCandidato=false;
    this.nombreCandidato=this.candidatos[i].nombre;
    this.apellidoCandidato=this.candidatos[i].apellido;
    this.idCandidato=this.candidatos[i].id;
    const examenes = await this._busquedaService.getDataExamenesByUser(this.candidatos[i].id,this.idBusqueda).then(value => {
      this.examenes = value;
    });

  }

  async verEntrevistas(i:number){
    this.nuevoCandidato=false;
    this.editar=false;
    this.entrevista=true;
    this.examen=false;
    this.nuevo=false;
    this.nuevoCandidato=false;
    this.nombreCandidato=this.candidatos[i].nombre;
    this.apellidoCandidato=this.candidatos[i].apellido;
    this.idCandidato=this.candidatos[i].id;
    const entrevistas = await this._busquedaService.getDataEntrevistasByUser(this.candidatos[i].id,this.idBusqueda).then(value => {
      this.entrevistas = value;
    });
  }

cerrarBusqueda(i:number){
  this.nombre=this.busquedas[i].nombre;
  this.fechaDesde=this.busquedas[i].fechaDesde;
  this.fechaHasta=this.busquedas[i].fechaHasta;
  this.idPuesto=this.busquedas[i].idPuesto;
  this.estado="Cerrada";
  this.fechaCierre= new Date().toISOString().split('T')[0];
  this._busquedaService.updateBusqueda({nombre:this.nombre,fechaDesde:this.fechaDesde,fechaHasta:this.fechaHasta,fechaCierre:this.fechaCierre,idPuesto:this.idPuesto,estado:this.estado},this.busquedas[i].id);
  this.recargarPagina();
}

  agregarExamen(){
    this.nuevoCandidato=false;
    this.editar=false;
  this.nuevo=true;
  this.tipo="examen";
  
  }

  agregarEntrevista(){
    this.nuevoCandidato=false;
    this.editar=false;
    this.nuevo=true;
    this.tipo="entrevista";
   
  }
  
  async modificarCandidato(i:number){
  this.idCandidato=this.candidatos[i].id;
  this.editarCandidato=true;
  document.body.classList.add('overflow-hidden');
  this.editar=false;
  this.listado=false;
  this.nuevoCandidato=false;
  this.nuevo=false;
  this.entrevista=false;
  this.examen=false;
  const candidato=  await this._busquedaService.getDataCandidatoById(this.candidatos[i].id);
  this.nombreCandidato=candidato['nombre'];
  this.apellidoCandidato=candidato['apellido'];
  this.tomaDeContacto=candidato['tomaDeContacto'];
  this.estadoCandidato=candidato['estado'];
  this.estudios=candidato['estudios'];
  this.experiencia=candidato['experiencia'];
  this.descripcion=candidato['descripcion'];
  this.motivoRechazo=candidato['motivoRechazo'];
  this.atributosViejos=["Nombre Candidato: "+this.nombreCandidato,"Apellido Candidato: "+this.apellidoCandidato,"Toma de Contacto: "+this.tomaDeContacto,"Estado de Candidato: "+this.estadoCandidato,"Estudios: "+this.estudios,"Experiencia: "+this.experiencia,"Motivo de rechazo"+this.motivoRechazo];

}

finalizarEdicionCandidato(){
  const Candidato: CandidatoCreate = {
        apellido: this.apellidoCandidato || '',
        nombre: this.nombreCandidato || '' ,
        tomaDeContacto:this.tomaDeContacto || '',
        estudios: this.estudios || '',
        experiencia: this.experiencia || '',
        motivoRechazo: this.motivoRechazo || '',
        estado:this.estadoCandidato || '',
        descripcion:this.descripcion || '',
        idBusqueda:this.idBusqueda ||'',
        fechaInscripcion:this.fechaInscripcion ||'',
        };
  this._busquedaService.updateCandidato(Candidato,this.idCandidato);
  this.atributosNuevos=["Nombre Candidato: "+this.nombreCandidato,"Apellido Candidato: "+this.apellidoCandidato,"Toma de Contacto: "+this.tomaDeContacto,"Estado de Candidato: "+this.estadoCandidato,"Estudios: "+this.estudios,"Experiencia: "+this.experiencia,"Motivo de rechazo"+this.motivoRechazo];
  this.agregarmodificacion("candidato");
  this.recargarPagina();
}

  editarEntrevista(i:number){
this.editarCandidato=false;
document.body.classList.remove('overflow-hidden');
this.nuevoCandidato=false;
this.nuevo=false;
this.editar=true;
this.tipo="entrevista";
this.nombreExamen=this.entrevistas[i].nombre;
this.fechaExamen=this.entrevistas[i].fecha;
this.resultadoExamen=this.entrevistas[i].resultado;
this.nombreResponsable=this.entrevistas[i].nombreResponsable;
this.apellidoResponsable=this.entrevistas[i].apellidoResponsable;
this.idExamen=this.entrevistas[i].id;
this.atributosViejos=[this.nombreExamen,this.fechaExamen,this.resultadoExamen,this.nombreResponsable,this.apellidoResponsable];
  }

  editarExamen(i:number){
    this.editarCandidato=false;
    document.body.classList.remove('overflow-hidden');
    this.nuevoCandidato=false;
    this.nuevo=false;
    this.editar=true;
    this.tipo="examen";
    this.nombreExamen=this.examenes[i].nombre;
    this.fechaExamen=this.examenes[i].fecha;
    this.resultadoExamen=this.examenes[i].resultado;
    this.nombreResponsable=this.examenes[i].nombreResponsable;
    this.apellidoResponsable=this.examenes[i].apellidoResponsable;
    this.idExamen=this.examenes[i].id;
    this.atributosViejos=["Nombre Examen: "+this.nombreExamen,"Fecha Examen: "+this.fechaExamen,"Resultado Examen: "+this.resultadoExamen,"Nombre Responsable: "+this.nombreResponsable,"Apellido Responsable: "+this.apellidoResponsable];
      }

  async guardar(){
    if(this.tipo=="examen"){if(this.form.invalid) return;
      
      try {
        const {nombre,apellidoResponsable,nombreResponsable,resultado,fecha} = this.form.value;
    const examen: ExamenCreate = {
          nombre: nombre || '' ,
          fecha:fecha || '',
          nombreResponsable:nombreResponsable || '',
          apellidoResponsable:apellidoResponsable || '',
          resultado:resultado||'',
          tipo:this.tipo||'',
          idCandidato:this.idCandidato||'',
          idBusqueda:this.idBusqueda||'',
          };
          await this._busquedaService.createExamen(examen);
          await this._busquedaService.createModificacion({fecha:Date(),atributosAnterior:[],atributosNuevo:[],asignacion:"Se ha guardado el nuevo examen '"+nombre+"' para: " +this.nombreCandidato+" "+this.apellidoCandidato,idBusqueda:this.idBusqueda,tipo:"NuevoExamen"});
          this.recargarPagina();
        } catch (error) {
          alert('Error al crear examen');
        }
    }
    else{if(this.form.invalid) return;
      
      try {
        const {nombre,apellidoResponsable,nombreResponsable,resultado,fecha} = this.form.value;
    const entrevista: ExamenCreate = {
          nombre: nombre || '' ,
          fecha:fecha || '',
          nombreResponsable:nombreResponsable || '',
          apellidoResponsable:apellidoResponsable || '',
          resultado:resultado||'',
          tipo:this.tipo||'',
          idCandidato:this.idCandidato||'',
          idBusqueda:this.idBusqueda||'',
          };
          await this._busquedaService.createEntrevista(entrevista);
          await this._busquedaService.createModificacion({fecha:Date(),atributosAnterior:[],atributosNuevo:[],asignacion:"Se ha guardado la nueva entrevista '"+nombre+"' para: " +this.nombreCandidato+" "+this.apellidoCandidato,idBusqueda:this.idBusqueda,tipo:"NuevaEntrevista"});
          this.recargarPagina();
        } catch (error) {
          alert('Error al crear entrevista');
        }

    }
  }
  guardarEdicion(){
this.editar=false;
this._busquedaService.updateEntrevista({nombre:this.nombreExamen,fecha:this.fechaExamen,resultado:this.resultadoExamen,nombreResponsable:this.nombreResponsable,apellidoResponsable:this.apellidoResponsable,tipo:this.tipo,idCandidato:this.idCandidato,idBusqueda:this.idBusqueda},this.idExamen);
this.atributosNuevos=["Nombre Examen: "+this.nombreExamen,"Fecha Examen: "+this.fechaExamen,"Resultado Examen: "+this.resultadoExamen,"Nombre Responsable: "+this.nombreResponsable,"Apellido Responsable: "+this.apellidoResponsable];
this.agregarmodificacion("examen");
this.recargarPagina();
} 

 async getDataBusqueda(){ 
  this.cargandoBusquedas = true;
  await this._busquedaService.getDataBusqueda().then(value => {
    this.busquedas = value;
    this.cargandoBusquedas = false; // ahora sí, datos listos
    });
  } 

  irAtras(){
    this.editarCandidato=false;
    document.body.classList.remove('overflow-hidden');
    this.editar=false;
    this.listado=true;
    this.nuevoCandidato=false;
    this.busqueda=false;
    this.nuevo=false;
    this.candidatos = [];
    if(this.entrevista==true){this.entrevista=false};
    if(this.examen==true){this.examen=false};
  }

  agregarCandidato(){
    this.editarCandidato=false;
    document.body.classList.remove('overflow-hidden');
    this.editar=false;
    this.nuevoCandidato=true;
    this.nuevo=false;
    if(this.entrevista==true){this.entrevista=false};
    if(this.examen==true){this.examen=false};

  }

  async guardarCandidato(){
    if(this.formCandidato.invalid) {return;}else{
    
      try {
        const {nombre,apellido,tomaDeContacto,estado,experiencia,estudios,descripcion,motivoRechazo,fechaInscripcion} = this.formCandidato.value;
    const candidato: CandidatoCreate = {
          nombre: nombre || '' ,
          apellido:apellido || '',
          tomaDeContacto:tomaDeContacto || '',
          estado:estado || '',
          idBusqueda:this.idBusqueda||'',
          experiencia:experiencia ||'',
          estudios:estudios ||'',
          descripcion:descripcion ||'',
          motivoRechazo:motivoRechazo ||'',
          fechaInscripcion:fechaInscripcion ||'',
          };
          await this._busquedaService.createCandidato(candidato);
          await this._busquedaService.createModificacion({fecha:Date(),atributosAnterior:[],atributosNuevo:[],asignacion:"Se ha creado un nuevo candidato: " +nombre+" "+apellido,idBusqueda:this.idBusqueda,tipo:"NuevoCandidato"})
          this.recargarPagina();
        } catch (error) {
          alert('Error al crear candidato');
        }
      }
  }

  cancelarOperacion(){
    this.formBusqueda.reset();
    this.formPuesto.reset();
    this.editar=false;
    this.nuevo=false;
    this.nuevoCandidato=false;
    this.editarCandidato=false;
    this.nuevaBusqueda=false;
    this.nuevoPuesto=false;
    document.body.classList.remove('overflow-hidden');
  }


  guardarBusqueda(){
    if(this.formBusqueda.invalid){
      return;}
      else{
      try {
        const {nombreBusqueda,fechaDesde,fechaHasta,idPuesto} = this.formBusqueda.value;
        if(!nombreBusqueda||!fechaDesde||!fechaHasta||!idPuesto){return;}
      this._busquedaService.createBusqueda({nombre:nombreBusqueda,fechaDesde:fechaDesde,fechaHasta:fechaHasta,fechaCierre:'-',idPuesto:idPuesto,estado:"Activa"});
      this.recargarPagina();
      } catch (error) {
     alert('Error al crear Puesto');
      }

    }
  }

  async guardarPuesto(){
    if(this.formPuesto.invalid){return;}else{

      try {
        const {nombre,area,descripcion} = this.formPuesto.value;
      if(!nombre || !area||!descripcion){return;}
      this._busquedaService.createPuesto({nombre:nombre,area:area,fechaCreacion:Date(),descripcion:descripcion});
      this.recargarPagina();
      } catch (error) {
     alert('Error al crear Puesto');
      }

    }
    }
    async getDataPuestos(){ 
      await this._busquedaService.getDataPuestos().then(value => {
      this.puestos = value;
      });}

      recargarPagina(): void {
        const currentUrl = this._router.url;
        this._router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
          this._router.navigate([currentUrl]);
        });
      }

    eliminarCandidato(){
      this._busquedaService.deleteCandidato(this.idCandidato);
      this.recargarPagina();
    }

    eliminarExamen(){
      if(this.tipo=="examen"){
        this._busquedaService.deleteExamen(this.idExamen);}
      else{
        this._busquedaService.deleteEntrevista(this.idExamen);}
        this.recargarPagina();
      }


      modalVisible = false; // Variable que controla la visibilidad del modal
      private closeTimeout: any; // Variable para guardar el tiempo de espera
    
      // Función para abrir el modal cuando el ratón pasa por encima
      openModal(): void {
        // Abrimos el modal solo si no está ya visible
        if (!this.modalVisible) {
          this.modalVisible = true;
        }
      }
    
      // Función para cerrar el modal con un retraso cuando el ratón sale del div
      closeModalWithDelay(): void {
        // Si ya hay un tiempo de espera pendiente, lo limpiamos
        if (this.closeTimeout) {
          clearTimeout(this.closeTimeout);
        }
    
        // Establecemos un retraso antes de cerrar el modal
        this.closeTimeout = setTimeout(() => {
          if (this.modalVisible) {
            this.modalVisible = false;
          }
        }, 200); // Ajusta este valor para cambiar el retraso
      }
    
      // Función para cerrar el modal cuando se hace clic en el fondo
      closeModal(): void {
        this.modalVisible = false;
      }

      agregarmodificacion(Tipo:string){
        for (let i=0;i<this.atributosViejos.length;i++){
          if(this.atributosViejos[i]!=this.atributosNuevos[i]){
            this.valoresViejos.push(this.atributosViejos[i]);
            this.valoresNuevos.push(this.atributosNuevos[i]);
          }}
          if(this.valoresNuevos.length==0){return;}
          if(Tipo=="examen"){this._busquedaService.createModificacion({fecha:Date(),atributosAnterior:this.valoresViejos,atributosNuevo:this.valoresNuevos,asignacion:"Se ha modificado el examen o entrevista de "+this.nombreCandidato+" "+this.apellidoCandidato,idBusqueda:this.idBusqueda,tipo:"ModificacionExamen"});}
          else{this._busquedaService.createModificacion({fecha:Date(),atributosAnterior:this.valoresViejos,atributosNuevo:this.valoresNuevos,asignacion:"Se ha modificado el candidato "+this.nombreCandidato+" "+this.apellidoCandidato,idBusqueda:this.idBusqueda,tipo:"ModificacionCandidato"});}
          
        }
        
    }
