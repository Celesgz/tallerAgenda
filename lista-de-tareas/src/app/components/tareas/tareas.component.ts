import { Component, OnInit } from '@angular/core';
import { TareaService } from '../../services/tarea.service';
import { Tarea } from '../../models/tarea.model';
import { FormsModule } from '@angular/forms'; // Importa FormsModule
import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-tareas',
  templateUrl: './tareas.component.html',
  styleUrls: ['./tareas.component.css'],
  standalone: true,  // Asegúrate de marcarlo como standalone
  imports: [FormsModule, CommonModule]  // Agregar FormsModule en la propiedad 'imports'
})
export class TareasComponent implements OnInit {
  tareas: Tarea[] = [];
  nuevaTarea: Tarea = { titulo: '', descripcion: '', completada: false };
  tareaAEditar: Tarea | null = null;

  constructor(private tareaService: TareaService) { }

  ngOnInit(): void {
    this.obtenerTareas();
  }

  obtenerTareas(): void {
    this.tareaService.obtenerTareas().subscribe((tareas) => (this.tareas = tareas));
  }

  agregarTarea(): void {
    // if (this.tareaAEditar && this.tareaAEditar.id) {
    //   this.tareaService.actualizarTarea(this.tareaAEditar.id, this.tareaAEditar).subscribe(() => {
    //     this.obtenerTareas();
    //     this.tareaAEditar = null;
    //   });
    // } else {
    this.tareaService.crearTarea(this.nuevaTarea).subscribe(() => {
      this.obtenerTareas();
      this.nuevaTarea = { titulo: '', descripcion: '' ,completada: false };
    });
    // }
  }

  editarTarea(tarea: Tarea): void {
    if (this.tareaAEditar && this.tareaAEditar.id) {
      this.tareaService.actualizarTarea(this.tareaAEditar.id, this.tareaAEditar).subscribe(() => {
        this.obtenerTareas();
        this.tareaAEditar = null;
      });
    }
  }

  cancelarEdicion(): void {
    this.tareaAEditar = null;
  }

  eliminarTarea(id: number): void {
    if (!id === undefined) {
      this.tareaService.eliminarTarea(id).subscribe(() => {
        this.obtenerTareas();
      });
    }
  }

  marcarComoCompletada(tarea: Tarea): void {
    if (tarea.id !== undefined) {  // Verifica si id está definido
      tarea.completada = true;  // Marca la tarea como completada
      this.tareaService.actualizarTarea(tarea.id, tarea).subscribe(() => {
        this.obtenerTareas();  // Actualiza la lista de tareas
      });
    } else {
      console.error('ID de tarea no válido');
    }
  }
  
}
