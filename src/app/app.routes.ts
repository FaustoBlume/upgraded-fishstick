import { Routes } from '@angular/router';
import { HomeComponent } from '../home/home.component';
import { SolicitudComponent } from './tickets/solicitud/solicitud.component';
import { DetallesSolicitudComponent } from './tickets/detalles-solicitud/detalles-solicitud.component';
import { SignInComponent } from './auth/features/sign-in/sign-in.component';
import { SignUpComponent } from './auth/features/sign-up/sign-up.component';
import { privateGuard, publicGuard } from './core/auth.guard';
import { TemplateTicketComponent } from './tickets/template-ticket/template-ticket.component';
import { SolicitadosComponent } from './tickets/solicitados/solicitados.component';
import { SeguimientoBusquedaComponent } from './busquedas/features/seguimiento-busqueda/seguimiento-busqueda.component';
import { HistorialComponent } from './tickets/historial/historial.component';
import { HistorialBusquedaComponent } from './busquedas/features/historial-busqueda/historial-busqueda.component';
import { PreguntasFrecuentesComponent } from './shared/preguntas-frecuentes/preguntas-frecuentes.component';

export const routes: Routes = [
    {canActivate:[privateGuard()],
        path: '',component:HomeComponent},
    {canActivate:[privateGuard()],
        path: 'Solicitud/:idUsuario',component:SolicitudComponent},//Acordarse que en el input se debe llamar de la misma manera que aca
    {canActivate:[privateGuard()],
        path: 'DetallesSolicitud/:idTicket',component:DetallesSolicitudComponent},
    {canActivate:[privateGuard()],
            path: 'TemplateTicket',component:TemplateTicketComponent},
    {canActivate:[privateGuard()],
        path: 'Solicitados/:idUsuario',component:SolicitadosComponent},
    {canActivate:[privateGuard()],
        path:'Historial/:idUsuario',component:HistorialComponent},
    {canActivate:[privateGuard()],
        path:'SignUp',component:SignUpComponent},
    {canActivate:[privateGuard()],
        path:'HistorialBusqueda',component:HistorialBusquedaComponent},
    {canActivate:[privateGuard()],
        path:'SeguimientoBusqueda',component:SeguimientoBusquedaComponent},
    {canActivate:[privateGuard()],
        path:'PreguntasFrecuentes/:idUsuario',component:PreguntasFrecuentesComponent},
        
    {path: '**',redirectTo:'SignIn'},
    
        
    {canActivate:[publicGuard()],
        path:'SignIn',component:SignInComponent},
    

];
