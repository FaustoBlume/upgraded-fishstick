import { Component, inject } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { AuthStateService } from '../shared/data-access/auth-state.service';
import { UsuariosServiceService } from '../auth/data-access/usuarios-service.service';
import { TicketsService } from '../tickets/data-access/tickets.service';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-menu',
    standalone: true,
    imports: [RouterModule, CommonModule],
    templateUrl: './menu.component.html',
    styleUrl: './menu.component.css'
})
export class MenuComponent {

constructor(
  private router: Router,
  private _usuarioService: UsuariosServiceService
  ){}
    
  private _authstate = inject(AuthStateService);
  private _ticketService = inject(TicketsService);
  userId:string|undefined;
  nombreCompleto: string = '';
  rol: string = '';
  tickets:any[]=[];
  ticketsFinal:any[]=[];
  cantidadTickets:number=0;

  ngOnInit() {
    this.userId = this._authstate.currentUser?.uid;
    this._usuarioService.getDataByUser(this.userId).then((value: any) => {
      this.nombreCompleto = value[0].nombre + ' ' + value[0].apellido;
      this.rol = value[0].rol;
  
      this._ticketService.getDataTicketsByRol$(this.rol).subscribe(tickets => {
        this.ticketsFinal = tickets.filter(t => t.userId !== this.userId);
        this.cantidadTickets = this.ticketsFinal.length;
      });
    });
  }

  async logOut(){
    await this._authstate.logOut();
    this.router.navigate(['SignIn']);
  };

}
