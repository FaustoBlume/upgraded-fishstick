import { inject, Injectable } from "@angular/core";
import { Auth, authState,  getAuth,  signOut } from "@angular/fire/auth";
import { Router } from "@angular/router";
import { map, Observable } from "rxjs";

@Injectable({
    providedIn:'root',
})
export class AuthStateService{
private _auth = inject(Auth);
private _router = inject(Router);

get authState():Observable<any>{
    return authState(this._auth);
}

get currentUser(){
    return getAuth().currentUser;
}

logOut(){
    this._router.navigate(['/SignIn']);
    return signOut(this._auth);
}


}