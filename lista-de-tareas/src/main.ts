import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router'; // Necesitas proveer el enrutador

import { routes } from './app/app.routes'; // Asegúrate de importar las rutas
import { appConfig } from './app/app.config'; 
bootstrapApplication(AppComponent, {
  providers: [
    provideHttpClient(),
    provideRouter(routes) // Provee las rutas al enrutador
  ]
})
.catch(err => console.error(err));
