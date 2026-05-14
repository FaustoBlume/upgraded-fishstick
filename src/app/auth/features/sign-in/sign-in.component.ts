import { Component, inject } from '@angular/core';
import { FormBuilder, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../data-access/auth.service';
import { Router } from '@angular/router';
import { hasEmailError, isRequired } from '../../utils/validators';
import { CommonModule } from '@angular/common';
import {MatDialog} from '@angular/material/dialog'
import { DialogInicioSesionComponent } from '../../../dialogs/dialog-inicio-sesion/dialog-inicio-sesion.component';

interface FormSignIn {
  email: FormControl<string | null>;
  password: FormControl<string | null>;
}

@Component({
    selector: 'app-sign-in',
    standalone:true,
    imports: [CommonModule, ReactiveFormsModule],
    templateUrl: './sign-in.component.html',
    styleUrls: ['./sign-in.component.scss']
})
export class SignInComponent {
private _formBuilder = inject(FormBuilder);
private _authService = inject(AuthService);
private _router = inject(Router);

constructor
(private matDialog: MatDialog){}

isRequired(field: 'email' | 'password'){
  return isRequired(field,this.form);
}

hasEmailError(){
  return hasEmailError(this.form);
}

  form =this._formBuilder.group<FormSignIn>({
      email: this._formBuilder.control('',[Validators.required,Validators.email,Validators.minLength(5)]),
      password: this._formBuilder.control('',[Validators.required,Validators.minLength(8)]),
    })


    async submit(){
      if(this.form.invalid){return;}else{

        try {
          const {email,password} = this.form.value;
        if(!email || !password){return;}
        await this._authService.signIn({email,password});
        this._router.navigate(['']);
        } catch (error) {
        this.matDialog.open(DialogInicioSesionComponent);
        }


      }
}
}
