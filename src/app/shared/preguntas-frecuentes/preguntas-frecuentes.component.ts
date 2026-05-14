import { CommonModule } from '@angular/common';
import { Component, effect, inject, input } from '@angular/core';
import { Router } from '@angular/router';
import { UsuariosServiceService } from '../../auth/data-access/usuarios-service.service';


@Component({
    selector: 'app-preguntas-frecuentes',
    standalone:true,

    imports: [CommonModule],
    templateUrl: './preguntas-frecuentes.component.html',
    styleUrl: './preguntas-frecuentes.component.css'
})
  export class PreguntasFrecuentesComponent {

    idUsuario = input.required<string>();
    usuarios:any[]=[];
    id:string|undefined;
    rol:string="";
    ticket:boolean = true;
    template:boolean = false;
    reporte:boolean = false;
    busqueda:boolean = false;
    abierta:boolean = false;
    respuesta:string = "";
    tipo:string = "solicitud";

    private _usuarioService = inject(UsuariosServiceService);
    constructor(private router:Router){
        effect(()=> {
          const id = this.idUsuario();
          this.id=id;
          this.getDataByUser(id);
          
        });
    
      }

      async getDataByUser(id:string){ 
        const usuario = await this._usuarioService.getDataByUser(id).then(value => {
          this.usuarios = value;
          this.rol=this.usuarios[0].rol;
      });}

      preguntasTickets:string[] = ["¿Cómo creo una solicitud?","¿Cómo hago el seguimiento de una solicitud?","¿Dónde puedo ver si mi solicitud fue respondida o asignada?","¿Cómo puedo cerrar una solicitud?","¿Cómo puedo eliminar un solicitud?","¿Cómo puedo ver las solicitudes abiertas por otros usuarios hacia mi área?","¿Cómo puedo ver las solicitudes cerradas?","¿Qué pasa si ningún modelo de solicitud se ajusta a mis necesidades?","¿A quién va dirigida cada solicitud?","¿Cómo puedo comunicarme con la persona responsable de la solicitud?"];

      respuestasTickets:string[]=["Se crea yendo a la pestaña de 'Nueva solicitud', se selecciona el template de solicitud y se llenan todos los campos requeridos.",
        "El seguimiento se realiza en la pestaña 'Inicio', luego se selecciona la solicitud que se desea seguir y se puede ver el estado del mismo, Además se pueden agregar comentarios.",
        "Para cerrar la solicitud primero, se debe encontrar en estado 'Esperando respuesta del sector'. Al puntuar la atención de la soliciud, el estado pasa a 'Finalizado.",
        "Para eliminar un solicitud se debe abrir la solicitud en la pestaña 'Inicio'. Luego nos dirigimos al boton de 'Eliminar'.",
        "Para ver el historial de un solicitud se debe abrir la solicitud en la pestaña 'Inicio'. Luego nos dirigimos a la parte de 'Historial de Cambios'",
        "En el caso de que tengas solicitudes solicitadas, es decir, que algún usuario crea un solicitud hacia el área donde estás asignado, podrás ver la solicitud en el menu en la parte de 'Solicitados'.",
        "Para ver las solicitudes cerradas se debe ir a la pestaña de 'Historial' y luego seleccionar la opción de 'Creados', en los cuales son las creadas por tu usuario y 'Realizados' que son las solicitudes resueltas por tu usuario.",
        "En el caso de que ningún modelo de solicitud se ajuste a tus necesidades, puedes pedir a un usuario de Recursos Humanos que cree un nuevo template de solicitud.",
        "Cada solicitud que se crea tiene predefinido un área de destino la cual se va a encargar de resolver el mismo.",
        "Para comunicarse con la persona responsable de la solicitud se puede crear un comentario. Para eso nos dirigmos haciendo click en la solicitud y escribiendo en la sección de comentarios."];
    

    abiertaTicket:boolean[]= [false,false,false,false,false,false,false,false,false,false];

    preguntasTemplate: string[] = [
        "¿Cómo creo un template?",
        "¿Para qué sirven los templates de solicitudes?",
        "¿Cómo puedo ver los templates de solicitudes?",
        "¿Cómo se crean los grupos de desplegables o 'radio buttons'?",
        "¿Cuántos inputs se le pueden agregar al template?"
      ];
      
      respuestasTemplate: string[] = [
        "Para crear un template, dirígete a la pestaña 'Crear Template de Solicitud'. Allí seleccionas los inputs que deseas agregar, le das un nombre al template y eliges un tipo de campo, ya sea un desplegable o 'radio buttons'.",
        "Los templates de solicitudes sirven para crear un modelo predefinido que se usará al generar nuevas solicitudes. Cada vez que se crea una solicitud, se selecciona un template y se completan los inputs requeridos.",
        "Los templates de solicitudes creados se pueden ver en la pestaña 'Nueva Solicitud'.",
        "Los grupos de desplegables o 'radio buttons' se crean asignando primero un nombre general y escribiendo al menos un input. Luego, se pueden agregar tantos inputs como se desee.",
        "Se pueden agregar tantos inputs al template como se desee."
      ];
      
    abiertaTemplate:boolean[]= [false,false,false,false,false];

    preguntasReporte: string[] = [
        "¿Cómo creo un reporte?",
        "¿Para qué sirven los reportes?",
        "¿Cómo puedo ver los reportes?",
        "¿Qué páginas se pueden reportar?",
        "¿Cuál es el objetivo del reporte de búsquedas?",
        "¿Cuál es el objetivo del reporte de solicitudes?"
      ];
      
      respuestasReporte: string[] = [
        "Para crear un reporte, solo debes ir a la pestaña 'Historial' o 'Historial de Búsqueda' y presionar 'Imprimir Reporte'.",
        "Los reportes sirven para ver el historial de las solicitudes creadas por el usuario. Es decir, permiten tener un registro de los pedidos realizados, en caso de que se necesite documentación. Además, se usan en la sección de búsquedas para documentar los candidatos que se han postulado anteriormente a una vacante.",
        "Los reportes se descargan automáticamente y se guardan en la carpeta de 'Descargas' en Windows. Se pueden visualizar con un visor de PDF.",
        "Se pueden reportar las páginas de 'Historial' y 'Historial de Búsqueda'.",
        "El objetivo del reporte de búsquedas es filtrar una tabla y generar un PDF como entregable para otras áreas de la empresa que necesiten conocer toda la información relacionada con una búsqueda específica.",
        "El objetivo del reporte de solicitudes es visualizar cuáles tickets han sido resueltos por el propio usuario, y contar con evidencia de que fueron completados y aprobados por la otra parte."
      ];
      

    abiertaReporte:boolean[]= [false,false,false,false,false,false];

    preguntasBusqueda: string[] = [
        "¿Cómo creo una búsqueda?",
        "¿Para qué sirven las búsquedas?",
        "¿Cómo puedo ver las búsquedas?",
        "¿Sobre qué puestos puedo crear la búsqueda?",
        "¿Qué significa Fecha de Inicio y Fecha de Fin de una búsqueda?",
        "¿Cómo funciona el seguimiento de la búsqueda?",
        "¿Cómo añado un candidato nuevo a la búsqueda?",
        "¿Cómo añado una entrevista o examen a un candidato?",
        "¿Cómo edito a un candidato?",
        "¿Cómo edito una entrevista o examen?",
        "¿Cómo cierro una búsqueda?"
      ];
      
      respuestasBusqueda: string[] = [
        "Para crear una búsqueda, debes ir a la pestaña 'Seguimiento de Búsqueda' y completar el formulario con el nombre, la fecha de inicio, la fecha de fin y el puesto que se desea buscar.",
        "Las búsquedas sirven para encontrar candidatos para un puesto específico. Se pueden filtrar por nombre, apellido y hacer seguimiento a cada uno con entrevistas o exámenes.",
        "Las búsquedas se pueden ver en la pestaña 'Seguimiento de Búsqueda'. Luego, se selecciona la búsqueda que se desea visualizar.",
        "Los puestos disponibles para crear búsquedas son los que están guardados en la base de datos, pero se pueden crear nuevos desde la opción 'Crear Puesto', dentro de la pestaña 'Seguimiento de Búsqueda'.",
        "La Fecha de Inicio y la Fecha de Fin indican el período durante el cual se realizará la búsqueda. Esto permite conocer los candidatos que se postularon en un lapso de tiempo determinado.",
        "El seguimiento de la búsqueda funciona así: primero se crea una búsqueda, luego se agregan candidatos, después se pueden asignar entrevistas o exámenes a cada candidato, y finalmente se cierra la búsqueda cuando uno de ellos pasa al estado 'Ingreso'.",
        "Para añadir un candidato nuevo, ve a la pestaña 'Seguimiento de Búsqueda', selecciona la búsqueda correspondiente y presiona el botón 'Agregar Candidato'.",
        "Para añadir una entrevista o examen, entra a la pestaña 'Seguimiento de Búsqueda', selecciona la búsqueda y el candidato deseado. Luego, presiona 'Agregar Entrevista' y completa el formulario.",
        "Para editar un candidato, una vez que esté agregado y estés dentro de la búsqueda correspondiente, presiona el ícono de editar junto a su información.",
        "Para editar una entrevista o examen, presiona el ícono de editar que aparece a la derecha de la entrevista o examen.",
        "Para cerrar una búsqueda, ve a la pestaña 'Seguimiento de Búsqueda', selecciona la búsqueda correspondiente y presiona el ícono del tilde naranja a la derecha. Es necesario que haya al menos un candidato en estado 'Ingreso'."
      ];
      
    abiertaBusqueda:boolean[]= [false,false,false,false,false,false,false,false,false,false,false];

    avanzarPreguntas(){
        if(this.ticket == true){
            this.ticket = false;
            this.template = true;
        this.tipo = "template";}
        else if(this.template == true){
            this.template = false;
            this.reporte = true;
        this.tipo = "reporte";}
        else if(this.reporte == true){
            this.reporte = false;
            this.busqueda = true;
        this.tipo = "busqueda";}
    }

    retrocederPreguntas(){
        if(this.busqueda == true){
            this.busqueda = false;
            this.reporte = true;
        this.tipo = "reporte";}
        else if(this.reporte == true){
            this.reporte = false;
            this.template = true;
        this.tipo = "template";}
        else if(this.template == true){
            this.template = false;
            this.ticket = true;
        this.tipo = "solicitud";}
    }

    abrirRespuestaTicket(i: number): void {
        
        this.abiertaTicket[i] = true;
      }

      cerrarRespuestasolicitud(i: number): void {
        this.abiertaTicket[i] = false; 
      }

      abrirRespuestaTemplate(i: number): void {
        this.abiertaTemplate[i] = true;
      }

      cerrarRespuestaTemplate(i: number): void {
        this.abiertaTemplate[i] = false; 
      }
        abrirRespuestaReporte(i: number): void {
            this.abiertaReporte[i] = true;
        }
        cerrarRespuestaReporte(i: number): void {
            this.abiertaReporte[i] = false; 
        }
        abrirRespuestaBusqueda(i: number): void {
            this.abiertaBusqueda[i] = true;
        }
        cerrarRespuestaBusqueda(i: number): void {
            this.abiertaBusqueda[i] = false; 
        }

    toggleRespuestaTicket(i: number): void {
        this.abiertaTicket[i] = !this.abiertaTicket[i];
    }
          
    toggleRespuestaTemplate(i: number): void {
        this.abiertaTemplate[i] = !this.abiertaTemplate[i];
    }
          
    toggleRespuestaReporte(i: number): void {
        this.abiertaReporte[i] = !this.abiertaReporte[i];
    }
          
    toggleRespuestaBusqueda(i: number): void {
        this.abiertaBusqueda[i] = !this.abiertaBusqueda[i];
    }

    cambiarSeccion(seccion: 'ticket' | 'template' | 'reporte' | 'busqueda') {
        this.ticket = false;
        this.template = false;
        this.reporte = false;
        this.busqueda = false;
      
        switch (seccion) {
          case 'ticket':
            this.ticket = true;
            break;
          case 'template':
            this.template = true;
            break;
          case 'reporte':
            this.reporte = true;
            break;
          case 'busqueda':
            this.busqueda = true;
            break;
        }
      
        this.tipo = seccion;
    }
      
          
        
}
