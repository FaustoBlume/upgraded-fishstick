import { Component } from '@angular/core';
import { MatDialogClose, MatDialogTitle } from '@angular/material/dialog';

@Component({
  selector: 'app-dialog-inicio-sesion',
  standalone:true,
  imports: [MatDialogTitle, MatDialogClose],
  templateUrl: './dialog-inicio-sesion.component.html',
  styleUrl: './dialog-inicio-sesion.component.css'
})
export class DialogInicioSesionComponent {

}
