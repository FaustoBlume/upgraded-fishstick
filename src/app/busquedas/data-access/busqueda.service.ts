import { inject, Injectable } from '@angular/core';
import { addDoc, collection, deleteDoc, doc, Firestore, getDoc, getDocs, orderBy, query, updateDoc, where } from '@angular/fire/firestore';

const PATH = 'puesto';
const PATH2 = 'busqueda';
const PATH3 = 'examen';
const PATH4 = 'entrevista';
const PATH5 = 'candidato';
const PATH6 = 'modificacion';

export interface Modificacion {
  id:string;
  fecha:string;
  atributosAnterior:string[];
  atributosNuevo:string[];
  asignacion:string;
  idBusqueda:string;
  tipo:string;
}

export type ModificacionCreate = Omit<Modificacion,'id'>;

export interface Puesto {
  id:string;
  nombre:string;
  descripcion:string;
  area:string;
  fechaCreacion:string;
} 

export type PuestoCreate = Omit<Puesto,'id'>;

export interface Busqueda {
  id:string;
  nombre:string;
  fechaDesde:string;
  fechaHasta:string;
  fechaCierre:string;
  idPuesto:string;
  estado:string;
} 

export type BusquedaCreate = Omit<Busqueda,'id'>;

export interface Examen {
  id:string;
  nombre:string;
  fecha:string;
  resultado:string;
  idCandidato:string;
  nombreResponsable:string;
  apellidoResponsable:string;
  tipo:string;
  idBusqueda:string;
} 

export type ExamenCreate = Omit<Examen,'id'>;

export interface Candidato {
  id:string;
  nombre:string;
  estado:string;
  tomaDeContacto:string;
  estudios:string;
  experiencia:string;
  descripcion:string;
  idBusqueda:string;
  apellido:string;
  motivoRechazo:string;
  fechaInscripcion:string;
  
} 

export type CandidatoCreate = Omit<Candidato,'id'>;

@Injectable({
  providedIn: 'root'
})
export class BusquedaService {
  private _firestore = inject(Firestore);
  private _collection = collection(this._firestore,PATH);
  private _collection2 = collection(this._firestore,PATH2);
  private _collection3 = collection(this._firestore,PATH3);
  private _collection4 = collection(this._firestore,PATH4);
  private _collection5 = collection(this._firestore,PATH5);
  private _collection6 = collection(this._firestore,PATH6);
  

  //Seccion de Puestos
 createPuesto(puesto:PuestoCreate){
    return addDoc(this._collection,{...puesto});
  }
  updatePuesto(puesto:PuestoCreate,id:string){
  const ticketDocRef = doc(this._firestore, PATH, id);
  return updateDoc(ticketDocRef,{...puesto});
  }
  deletePuesto(id:string){
    const ticketDocRef = doc(this._firestore,PATH, id);
    return deleteDoc(ticketDocRef);
  }

  async getDataPuestos(): Promise<Puesto[]> { 
      try {
        const snapshot = await getDocs(query(collection(this._firestore, 'puesto')));
        if (snapshot.empty) {
          console.log('No tickets found');
          return [];
        }
        return snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Puesto[];
      } catch (error) {
        console.error('Error getting documents: ', error);
        return []; 
      }
  }

  async getDataPuestoById(puestoId: string) {
      const ticketDocRef = doc(this._firestore, 'puesto', puestoId);
      const ticketDoc = await getDoc(ticketDocRef);
    
      if (ticketDoc.exists()) {
       
        return ticketDoc.data(); 
      } else {
        
        throw new Error('No existe el documento con ese ID');
      }
    }
// Seccion de Busqueda
  createBusqueda(busqueda:BusquedaCreate){
      return addDoc(this._collection2,{...busqueda});
  }

  updateBusqueda(busqueda:BusquedaCreate,id:string){
      const ticketDocRef = doc(this._firestore, PATH2, id);
      return updateDoc(ticketDocRef,{...busqueda});
  }

  deleteBusqueda(id:string){
    const ticketDocRef = doc(this._firestore,PATH2, id);
    return deleteDoc(ticketDocRef);
  }
    
  async getDataBusqueda() { 
    try {
          const snapshot = await getDocs(query(collection(this._firestore, 'busqueda'),where('estado', '==', 'Activa')));
          if (snapshot.empty) {
            console.log('No tickets found');
            return [];
          }
          return snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
        } catch (error) {
        console.error('Error getting documents: ', error);
        return []; 
        }
        
  }

  async getDataBusquedaCerradas() { 
    try {
          const snapshot = await getDocs(query(collection(this._firestore, 'busqueda'),where('estado', '==', 'Cerrada')));
          if (snapshot.empty) {
            console.log('No tickets found');
            return [];
          }
          return snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
        } catch (error) {
        console.error('Error getting documents: ', error);
        return []; 
        }}

        async getDataBusquedaById(busquedaId: string) {
          const ticketDocRef = doc(this._firestore, 'busqueda', busquedaId);
          const ticketDoc = await getDoc(ticketDocRef);
        
          if (ticketDoc.exists()) {
           
            return ticketDoc.data(); 
          } else {
            
            throw new Error('No existe el documento con ese ID');
          }
        }
  //Seccion de Examenes
  createExamen(examen:ExamenCreate){
      return addDoc(this._collection3,{...examen});
  }
  updateExamen(examen:ExamenCreate,id:string){
      const ticketDocRef = doc(this._firestore, PATH3, id);
      return updateDoc(ticketDocRef,{...examen});
  }
  deleteExamen(id:string){
    const ticketDocRef = doc(this._firestore,PATH3, id);
    return deleteDoc(ticketDocRef);
  }

   async getDataExamenesByUser(userId:string|undefined,busquedaId:string|undefined) { 
    try {
      const snapshot = await getDocs(query(collection(this._firestore, 'examen'),where('idCandidato', '==', userId),where('idBusqueda', '==', busquedaId),orderBy('fecha', 'desc')));
      if (snapshot.empty) {
        console.log('No tickets found');
        return [];
      }
      return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
    } catch (error) {
      console.error('Error getting documents: ', error);
      return []; // Retorna un arreglo vacío en caso de error
    }
    }

    //Seccion de Entrevistas
    createEntrevista(examen:ExamenCreate){
      return addDoc(this._collection4,{...examen});
    }
    updateEntrevista(examen:ExamenCreate,id:string){
      const ticketDocRef = doc(this._firestore, PATH4, id);
      return updateDoc(ticketDocRef,{...examen});
    }
    deleteEntrevista(id:string){
      const ticketDocRef = doc(this._firestore,PATH4, id);
      return deleteDoc(ticketDocRef);
    }

    async getDataEntrevistasByUser(userId:string|undefined,busquedaId:string|undefined) { 
      
        try {
          const snapshot = await getDocs(query(collection(this._firestore, 'entrevista'),where('idCandidato', '==', userId),where('idBusqueda', '==', busquedaId),orderBy('fecha', 'desc')));
          if (snapshot.empty) {
            console.log('No tickets found');
            return [];
          }
          return snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
        } catch (error) {
          console.error('Error getting documents: ', error);
          return []; // Retorna un arreglo vacío en caso de error
        }
      }
      //Seccion candidatos
      async getDataCandidatosByBusqueda(busquedaId:string|undefined) { 
      
        try {
          const snapshot = await getDocs(query(collection(this._firestore, 'candidato'),where('idBusqueda', '==', busquedaId)))//,orderBy('fecha', 'desc')));
          if (snapshot.empty) {
            console.log('No hay candidatos para esta busqueda');
            return [];
          }
          return snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
        } catch (error) {
          console.error('Error getting documents: ', error);
          return []; // Retorna un arreglo vacío en caso de error
        }
      }

      async getDataCandidatoById(candidatoId: string) {
        const ticketDocRef = doc(this._firestore, 'candidato', candidatoId);
        const ticketDoc = await getDoc(ticketDocRef);
      
        if (ticketDoc.exists()) {
         // console.log('Document data:', ticketDoc.data());
          return ticketDoc.data(); // Devuelve los datos del documento
        } else {
          // Manejo de caso en que el documento no existe
          throw new Error('No existe el documento con ese ID');
        }
      }

    createCandidato(candidato:CandidatoCreate){
        return addDoc(this._collection5,{...candidato});
    }
    updateCandidato(candidato:CandidatoCreate,id:string){
        const ticketDocRef = doc(this._firestore, PATH5, id);
        return updateDoc(ticketDocRef,{...candidato});
    }
    deleteCandidato(id:string){
      const ticketDocRef = doc(this._firestore,PATH5, id);
      return deleteDoc(ticketDocRef);
    }
    //Seccion Modificacion
    createModificacion(modificacion:ModificacionCreate){
      return addDoc(this._collection6,{...modificacion});
  }
  async getDataModificacionByBusqueda(busquedaId:string|undefined) { 
      
    try {
      const snapshot = await getDocs(query(collection(this._firestore, 'modificacion'),where('idBusqueda', '==', busquedaId),orderBy('fecha', 'desc')));
      if (snapshot.empty) {
        console.log('No hay candidatos para esta busqueda');
        return [];
      }
      return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
    } catch (error) {
      console.error('Error getting documents: ', error);
      return []; // Retorna un arreglo vacío en caso de error
    }
  }
}
