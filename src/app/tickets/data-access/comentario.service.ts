import { inject, Injectable } from '@angular/core';
import { addDoc, collection, Firestore, getDocs, orderBy, query, where } from '@angular/fire/firestore';
import { AuthStateService } from '../../shared/data-access/auth-state.service';

export interface comentario{
  idTicket:string;
  fechaComentario:string;
  nombreEscritor:string;
  apellidoEscritor:string;
  comentario:string;
  idUsuario:string;
}

export type comentarioCreate = Omit<comentario,'id'>;

const PATH = 'comentario';



@Injectable({
  providedIn: 'root'
})
export class ComentarioService {

   private _firestore = inject(Firestore);
  
    private _collection = collection(this._firestore,PATH);
  
    private _authState = inject(AuthStateService);


 create(comentario:comentarioCreate){
    return addDoc(this._collection,{...comentario,userId:this._authState.currentUser?.uid});
  }

  async getDataComentarioByTicket(ticketId: string | undefined): Promise<comentario[]> {
    try {
      const snapshot = await getDocs(
        query(
          collection(this._firestore, PATH),
          where('idTicket', '==', ticketId),
          orderBy('fechaComentario', 'desc')
        )
      );
  
      if (snapshot.empty) {
        console.log('No se encontraron comentarios para este ticket');
        return [];
      }
  
      return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as comentario)
      }));
    } catch (error) {
      console.error('Error al obtener información: ', error);
      return [];
    }
  }
  

 
}
