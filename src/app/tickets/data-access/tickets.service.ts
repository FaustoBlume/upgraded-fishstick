import { inject, Injectable } from '@angular/core';
import { Firestore,collection,addDoc, deleteDoc, doc,updateDoc, getDoc, getDocs, query, where, orderBy, setDoc, collectionData } from '@angular/fire/firestore';
import { AuthStateService } from '../../shared/data-access/auth-state.service';
import { Observable } from 'rxjs';

export interface OtroTicket {
  apellidoSolicitante: string;
  nombreSolicitante: string;
  fechaSolicitud: string;
  fechaActualizacion: string;
  fechaFinalizacion: string;

  // Nuevo esquema unificado para campos dinámicos
  campos?: {
    tipo: 'input' | 'desplegable' | 'radio';
    valor?: string;               // Para input
    nombre?: string;              // Para desplegable / radio
    seleccion?: string;           // Para desplegable / radio
    opciones?: string[];          // Para desplegable / radio
  }[];

  estado: string;
  areaResponsable: string;
  tipoTicket: string;
  tipoSolicitud: string;
  asunto: string;
  prioridad: string;
  detalle: string;
  nombreResponsable: string;
  apellidoResponsable: string;
  puntuacion: string;
  idTemplate: string;
  //motivo?: string;

  historial?: {
    campo: string;
    anterior: string;
    nuevo: string;
    fecha: string;
    usuario: string;
  }[];
}


export type OtroTicketCreate = Omit<OtroTicket,'id'>;





const PATH = 'ticket'

@Injectable({
  providedIn: 'root'
})
export class TicketsService {

  private _firestore = inject(Firestore);

  private _collection = collection(this._firestore,PATH);

  private _authState = inject(AuthStateService);

 

  createTicket(ticket:OtroTicketCreate){
    return addDoc(this._collection,{...ticket,userId:this._authState.currentUser?.uid});
  }

  async updateTicket(data: OtroTicketCreate, id: string): Promise<void> {
    const docRef = doc(this._firestore, `ticket/${id}`);
    function cleanUndefined(obj: any) {
      return JSON.parse(JSON.stringify(obj));
    }
    
    await setDoc(docRef, cleanUndefined(data), { merge: true }); // siempre actualiza/crea
  }

  updateTicket2(ticket: OtroTicketCreate,id:string){ // Este actualiza el id
    const ticketDocRef = doc(this._firestore, 'ticket', id);
    return updateDoc(ticketDocRef,{...ticket,userId:this._authState.currentUser?.uid});
  }

  addHistorialCambio(ticketId: string, cambio: {
    campo: string;
    anterior: string;
    nuevo: string;
    fecha: string;
    usuario: string;
  }) {
    const historialRef = collection(this._firestore, `ticket/${ticketId}/historialCambios`);
    return addDoc(historialRef, cambio);
  }

  deleteTicket(id:string){
  const ticketDocRef = doc(this._firestore, 'ticket', id);
  return deleteDoc(ticketDocRef);
}
async getDataTicketsCreados(nombre:string|undefined,apellido:string|undefined) { // Este trae toda la info de la coleccion sin importar el usuario que lo creo
  try {
    const snapshot = await getDocs(query(collection(this._firestore, 'ticket'), where('apellidoSolicitante', '==', apellido),where('nombreSolicitante','==',nombre)));
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


  async getDataTicketsByRol(rol:string|undefined) { // Este trae toda la info de la coleccion sin importar el usuario que lo creo
    try {
      const snapshot = await getDocs(query(collection(this._firestore, 'ticket'), where('areaResponsable', '==', rol),where('estado','!=','Finalizado')));
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

  // ESTO iría de reemplazo arriba, pero hay que adaptar app, será próxima versión
  getDataTicketsByRol$(rol: string | undefined): Observable<any[]> {
    const q = query(
      collection(this._firestore, 'ticket'),
      where('areaResponsable', '==', rol),
      where('estado', '!=', 'Finalizado')
    );
  
    return collectionData(q, { idField: 'id' }) as Observable<any[]>;
  }

  async getDataTicketsByRolFinalizados(rol:string|undefined) { // Este trae toda la info de la coleccion sin importar el usuario que lo creo
    try {
      const snapshot = await getDocs(query(collection(this._firestore, 'ticket'), where('areaResponsable', '==', rol),where('estado','==','Finalizado')));
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

  async getDataTicketsFinalizadosByUser(userId:string|undefined) { 
      try {
        // Filtramos los documentos por el campo 'userId' (ajusta el nombre del campo según sea necesario)
        const snapshot = await getDocs(query(collection(this._firestore, 'ticket'), where('userId', '==', userId),where('estado', '==', 'Finalizado'),orderBy('fechaSolicitud', 'desc')));
        
        if (snapshot.empty) {
          console.log('No tickets found for this user');
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
