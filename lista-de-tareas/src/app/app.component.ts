import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.component.html', // Usa solo templateUrl, no template
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'lista-de-tareas';
}
