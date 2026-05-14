import { inject, Injectable } from '@angular/core';
import { Firestore, addDoc, collection, doc, getDoc, getDocs, query } from '@angular/fire/firestore';
import { AuthStateService } from '../../shared/data-access/auth-state.service';
import { FormControl, FormGroup } from '@angular/forms';
export interface Template {
  id?: string; // <- opcional para que no rompa en el create
  titulo: string;
  motivo: string;
  areaResponsable: string;
  campos: {
    tipo: 'input' | 'desplegable' | 'radio';
    valor?: string;
    nombre?: string;
    seleccion?: string;
    opciones?: string[];
  }[];
}
  export type TemplateCreate = Omit<Template,'id'>;

  const PATH = 'template';
@Injectable({
  providedIn: 'root'
})
export class TemplateService {

   private _firestore = inject(Firestore);
  
    private _collection = collection(this._firestore,PATH);
  
    private _authState = inject(AuthStateService);

    createTemplate(template:TemplateCreate){
      return addDoc(this._collection,{...template});
    }

    async getDataTemplates() {
      try {
        const snapshot = await getDocs(query(collection(this._firestore, 'template')));
        if (snapshot.empty) {
          console.log('No templates found');
          return [];
          }
          return snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          } as unknown as Template));
      } catch (error) {
        console.error('Error getting documents: ', error);
        return []; 
      }
    }
   async getDataTemplateById(templateId: string) {
    const ticketDocRef = doc(this._firestore, 'template', templateId);
    const ticketDoc = await getDoc(ticketDocRef);
  
    if (ticketDoc.exists()) {
     // console.log('Document data:', ticketDoc.data());
     return ticketDoc.data() as Template; // Devuelve los datos del documento
    } else {
      // Manejo de caso en que el documento no existe
      throw new Error('No existe el documento con ese ID');
    }
  }  

}
