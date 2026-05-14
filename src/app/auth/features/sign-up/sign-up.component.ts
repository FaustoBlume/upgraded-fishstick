import { Component, inject } from '@angular/core';
import { FormBuilder, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { hasEmailError, isRequired } from '../../utils/validators';
import { AuthService } from '../../data-access/auth.service';
import { Router } from '@angular/router';
import { UsuariosServiceService } from '../../data-access/usuarios-service.service';


interface FormSignUp {
  email: FormControl<string | null>;
  password: FormControl<string | null>;
  nombreUsuario:FormControl<string | null>;
  apellidoUsuario:FormControl<string | null>;
  rolUsuario:FormControl<string | null>;
}

@Component({
    selector: 'app-sign-up',
    standalone:true,
    imports: [ReactiveFormsModule],
    templateUrl: './sign-up.component.html',
    styles: ``
})
export class SignUpComponent {
private _formBuilder = inject(FormBuilder);
private _authService = inject(AuthService);
private _router = inject(Router);
private _usuariosService = inject(UsuariosServiceService);

isRequired(field: 'email' | 'password'){
  return isRequired(field,this.form);
}

hasEmailError(){
  return hasEmailError(this.form);
}

form =this._formBuilder.group<FormSignUp>({
  email: this._formBuilder.control('',[Validators.required,Validators.email,Validators.minLength(5)]),
  password: this._formBuilder.control('',[Validators.required,Validators.minLength(8)]),
  rolUsuario: this._formBuilder.control('',),
  nombreUsuario: this._formBuilder.control('',),
  apellidoUsuario: this._formBuilder.control('',)
})


async submit() {
  if (this.form.invalid) return;
    
  const { email, password, rolUsuario, nombreUsuario, apellidoUsuario } = this.form.value;
  if (!email || !password) return;
    
  const adminUser = await this._authService.getCurrentUser(); // guardás al admin actual
  const adminEmail = adminUser?.email;
    
  try {
    // 👉 1. Crear el nuevo usuario (esto cambia la sesión)
    const userCredential = await this._authService.signUp({ email, password });
    
    // 👉 2. Guardar el nuevo usuario en Firestore
    await this._usuariosService.createUsuario({
    email,
      contraseña: password,
      rol: rolUsuario,
      apellido: apellidoUsuario,
      nombre: nombreUsuario,
      fechaIngreso: Date(),
      ultimoIngreso: Date(),
      userId: userCredential.user.uid
    });
    
    // 👉 3. Volver a loguear al admin
    if (adminEmail && adminEmail !== email) {
      const adminPassword = prompt(`Reingrese su contraseña para crear al usuario (${adminEmail}):`);
      if (adminPassword) {
        await this._authService.login({ email: adminEmail, password: adminPassword });
        this._router.navigate(['']); // volver al home o donde quieras
      } else {
        alert('No se pudo volver a la sesión de administrador.');
      }
    }
    
  } catch (error) {
    const err = error as { message?: string };
    alert('Error al crear el usuario: ' + (err.message || err));
  }
}
    






}
