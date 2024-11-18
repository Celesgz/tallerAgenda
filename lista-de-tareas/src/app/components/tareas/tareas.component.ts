import { Component, OnInit } from '@angular/core';
import { TareaService } from '../../services/tarea.service'; 
import { Tarea } from '../../models/tarea.model';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-tareas',
  templateUrl: './tareas.component.html',
  styleUrls: ['./tareas.component.css'],
  standalone: true,
  imports: [FormsModule, CommonModule],
})

export class TareasComponent implements OnInit {
  tareas: Tarea[] = [];
  tareasTrabajo: Tarea[] = [];
  tareasEstudio: Tarea[] = [];
  tareasDiario: Tarea[] = [];
  nuevaTarea: Tarea = { 
    titulo: '', 
    descripcion: '', 
    completada: false, 
    prioridad: '', 
    categoria: '',
    _id: '' 
  }; 
  mostrarPopup: boolean = false;

  currentDate: string = '';  
  currentTime: string = '';  

  constructor(private tareaService: TareaService) {}

  ngOnInit(): void {
    this.obtenerTareas();
    this.actualizarFechaYHora(); 
  }

  obtenerTareas(): void {
    this.tareaService.obtenerTareas().subscribe((tareas) => {
      console.log('Tareas obtenidas del servicio:', tareas);
      this.tareas = tareas;
  
      // Filtrar por categorías
      this.tareasTrabajo = tareas.filter(t => t.categoria === 'Trabajo');
      this.tareasEstudio = tareas.filter(t => t.categoria === 'Estudio');
      this.tareasDiario = tareas.filter(t => t.categoria === 'Diario');
    });
  }
  agregarTarea(): void {
    console.log('Nueva tarea antes de enviar:', this.nuevaTarea);
    this.tareaService.crearTarea(this.nuevaTarea).subscribe(() => {
      this.obtenerTareas();
      this.nuevaTarea = { titulo: '', descripcion: '', completada: false, prioridad: '', categoria: '', _id: '' }; // Resetea los datos
      this.cerrarPopup();
    });
  }

  abrirPopup(): void {
    this.mostrarPopup = true;
  }

  cerrarPopup(): void {
    this.mostrarPopup = false;
  }

  actualizarFechaYHora(): void {
    const ahora = new Date();
    this.currentDate = ahora.toLocaleDateString('es-ES'); 
    this.currentTime = ahora.toLocaleTimeString('es-ES'); 
  }

  eliminarTarea(_id: string): void {  
    if (_id) { 
      this.tareaService.eliminarTarea(_id).subscribe(() => {
        this.obtenerTareas(); 
      }, error => {
        console.error('Error al eliminar la tarea:', error);
      });
    } else {
      console.error('El _id de la tarea es nulo o indefinido');
    }
  }

  marcarCompletada(tarea: Tarea): void {
    if (tarea._id) { // Usamos _id 
      this.tareaService.marcarCompletada(tarea._id).subscribe({
        next: (tareaActualizada) => {
          //  actualizamos la lista de tareas localmente
          const tareaIndex = this.tareas.findIndex(t => t._id === tarea._id);
          if (tareaIndex !== -1) {
            this.tareas[tareaIndex].completada = true; // Marca la tarea como completada
          }
        },
        error: (error) => {
          console.error('Error al marcar la tarea como completada:', error);
        }
      });
    }
  }

  marcarPendiente(tarea: Tarea): void {
    if (tarea._id) {
      this.tareaService.marcarPendiente(tarea._id).subscribe({
        next: (tareaActualizada) => {
          const tareaIndex = this.tareas.findIndex(t => t._id === tarea._id);
          if (tareaIndex !== -1) {
            this.tareas[tareaIndex].completada = false; // Marca la tarea como pendiente
          }
        },
        error: (error) => {
          console.error('Error al marcar la tarea como pendiente:', error);
        }
      });
    }
  }

  tareaSeleccionada: Tarea | null = null;

abrirEditor(tarea: Tarea): void {
    this.tareaSeleccionada = { ...tarea }; // Clona los datos de la tarea
}

guardarEdicion(): void {
    if (this.tareaSeleccionada && this.tareaSeleccionada._id) {
        this.tareaService.editarTarea(this.tareaSeleccionada).subscribe({
            next: (tareaActualizada) => {
                const index = this.tareas.findIndex(t => t._id === tareaActualizada._id);
                if (index !== -1) {
                    this.tareas[index] = tareaActualizada;
                }
                this.tareaSeleccionada = null; // Cierra el editor
            },
            error: (error) => {
                console.error('Error al editar la tarea:', error);
            }
        });
    }
}

cerrarEditor(): void {
    this.tareaSeleccionada = null; // Cierra el editor sin guardar cambios
}

}
