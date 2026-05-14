import { inject, Injectable } from '@angular/core';
import { PasswordPolicy } from '@angular/fire/auth';
import { getDocs, query, collection, where, Firestore, doc, getDoc, updateDoc, addDoc } from '@angular/fire/firestore';

export interface Usuario{
  userId:string;
  apellido:string|undefined|null;
  nombre:string|undefined|null;
  contraseña:string;
  email:string;
  fechaIngreso:string;
  ultimoIngreso:string;
  rol:string|undefined|null;
}

export type UsuarioCreate =Omit<Usuario,'id'>;
const PATH = 'usuario';

@Injectable({
  providedIn: 'root'
})
export class UsuariosServiceService {

  constructor() { }

private _firestore = inject(Firestore);
private _collection = collection(this._firestore,PATH);


async getDataByUser(userId:string|undefined) { 
  try {
    // Filtramos los documentos por el campo 'userId' (ajusta el nombre del campo según sea necesario)
    const snapshot = await getDocs(query(collection(this._firestore, 'usuario'), where('userId', '==', userId)));
    
    if (snapshot.empty) {
      //console.log('No tickets found for this user');
      return [];
    }

    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    //console.error('Error getting documents: ', error);
    return []; // Retorna un arreglo vacío en caso de error
  }
}

async getDataByEmail(email:string|undefined|null) { 
  try {
    // Filtramos los documentos por el campo 'userId' (ajusta el nombre del campo según sea necesario)
    const snapshot = await getDocs(query(collection(this._firestore, 'usuario'), where('email', '==', email)));
    
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


 createUsuario(usuario:UsuarioCreate){
    return addDoc(this._collection,{...usuario});
  }

updateUsuario(usuario: UsuarioCreate,id:string){
    const ticketDocRef = doc(this._firestore, 'usuario', id);
    return updateDoc(ticketDocRef,{...usuario});
  }

  updateUltimoLogIn(id: string, valor: any) {
    const usuarioRef = doc(this._firestore, 'usuario', id);
    return updateDoc(usuarioRef, { ['ultimoIngreso']: valor });
  }
}
