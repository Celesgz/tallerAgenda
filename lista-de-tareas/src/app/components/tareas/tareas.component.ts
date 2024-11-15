import { Component, OnInit } from '@angular/core';
import { TareaService } from '../../services/tarea.service';
import { Tarea } from '../../models/tarea.model';
import { FormsModule } from '@angular/forms'; // Importa FormsModule
import { NgFor } from '@angular/common';
import { AppComponent } from '../../app.component';
@Component({
  selector: 'app-tareas',
  templateUrl: './tareas.component.html',
  standalone: true,  // Asegúrate de marcarlo como standalone
  imports: [FormsModule, NgFor]
})
export class TareasComponent implements OnInit {
  tareas: Tarea[] = [];
  nuevaTarea: Tarea = { titulo: '', descripcion: '' };
  tareaAEditar: Tarea | null = null;

  constructor(private tareaService: TareaService) {}

  ngOnInit(): void {
    this.obtenerTareas();
  }

  obtenerTareas(): void {
    this.tareaService.obtenerTareas().subscribe((tareas) => (this.tareas = tareas));
  }

  agregarTarea(): void {
    if (this.tareaAEditar && this.tareaAEditar.id) {  
      this.tareaService.actualizarTarea(this.tareaAEditar.id, this.tareaAEditar).subscribe(() => {
        this.obtenerTareas();
        this.tareaAEditar = null;
      });
    } else {
      this.tareaService.crearTarea(this.nuevaTarea).subscribe(() => {
        this.obtenerTareas();
        this.nuevaTarea = { titulo: '', descripcion: '' };
      });
    }
  }

  editarTarea(tarea: Tarea): void {
    this.tareaAEditar = { ...tarea };
  }

  cancelarEdicion(): void {
    this.tareaAEditar = null;
  }

  eliminarTarea(id: number | undefined): void {
    if (id === undefined) {
      console.warn("ID no válido para eliminar la tarea");
      return;
    }
    this.tareaService.eliminarTarea(id).subscribe(() => {
      this.obtenerTareas();
    });
  }
}
