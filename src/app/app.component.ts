import { Component, inject } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthStateService } from './shared/data-access/auth-state.service';
import { MenuComponent } from "./menu/menu.component";
import { UsuariosServiceService } from './auth/data-access/usuarios-service.service';

@Component({
    selector: 'app-root',
    standalone: true,
    imports: [CommonModule, RouterOutlet, MenuComponent],
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css']
})

export class AppComponent {
  title = 'MySoli';

  private _authstate =inject(AuthStateService);
  private _usuarioService = inject(UsuariosServiceService);

  estaLogueado = false;

  constructor() {

    this._authstate.authState.subscribe( user =>
      this.estaLogueado = user ? true : false
    )

  }

}
