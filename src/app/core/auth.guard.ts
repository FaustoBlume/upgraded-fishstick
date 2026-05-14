import { inject } from "@angular/core";
import {  CanActivateFn, Router } from "@angular/router";
import { AuthStateService } from "../shared/data-access/auth-state.service";
import { map } from "rxjs";

export const privateGuard= (): CanActivateFn  =>{

    return ()=>{
        const router = inject(Router);
        const auth = inject(AuthStateService);
        return auth.authState.pipe(map((state)=>{
            if(!state){
                router.navigate(['/SignIn']);
            return false;
                
            }
            return true;
        })
    );
};
};

export const publicGuard= (): CanActivateFn  =>{

    return ()=>{
        const router = inject(Router);
        const auth = inject(AuthStateService);
        return auth.authState.pipe(map((state)=>{
            if(state){
                router.navigate(['']);
            return false;
                
            }
            return true;
        })
    );
};
};