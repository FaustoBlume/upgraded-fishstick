import { inject, Injectable } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Firestore, collection, doc, getDoc, getDocs, orderBy, query, where } from '@angular/fire/firestore';
import { collectionData } from '@angular/fire/firestore/lite';
import { AuthStateService } from '../app/shared/data-access/auth-state.service';


@Injectable({
  providedIn: 'root'
})


export class ServicioPruebaService {

  //constructor(public firestore: Firestore) {}

  
   private firestore = inject(Firestore);
   

   async getDataTickets() {//Este no se usa mas porque no trae el ID
    return (
     await getDocs(query(collection(this.firestore, 'ticket')))
    ).docs.map((coso) => coso.data());
   }


   async getDataTickets2() { // Este trae toda la info de la coleccion sin importar el usuario que lo creo
    try {
      const snapshot = await getDocs(query(collection(this.firestore, 'ticket')));
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

  async getDataTicketsByUser(userId:string|undefined) { //Este trae los tickets solo del usuario que lo creo
    try {
      // Filtramos los documentos por el campo 'userId' (ajusta el nombre del campo según sea necesario)
      const snapshot = await getDocs(query(collection(this.firestore, 'ticket'), where('userId', '==', userId),where('estado', '!=', 'Finalizado'),orderBy('fechaSolicitud', 'desc')));
      
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
  


   async getDataTicketById(ticketId: string) {
    const ticketDocRef = doc(this.firestore, 'ticket', ticketId);
    const ticketDoc = await getDoc(ticketDocRef);
  
    if (ticketDoc.exists()) {
     // console.log('Document data:', ticketDoc.data());
      return ticketDoc.data(); // Devuelve los datos del documento
    } else {
      // Manejo de caso en que el documento no existe
      throw new Error('No existe el documento con ese ID');
    }
  }

  

}
