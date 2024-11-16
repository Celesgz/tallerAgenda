import { Component, OnInit } from '@angular/core';
import { TareaService } from '../../services/tarea.service'; // Asegúrate de que el servicio esté importado
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
  nuevaTarea: Tarea = { 
    titulo: '', 
    descripcion: '', 
    completada: false, 
    prioridad: '', 
    _id: ''  
  }; 
  mostrarPopup: boolean = false;

  // Declaración de las propiedades de fecha y hora
  currentDate: string = '';  
  currentTime: string = '';  

  constructor(private tareaService: TareaService) {}

  ngOnInit(): void {
    this.obtenerTareas();
    this.actualizarFechaYHora(); 
  }

  obtenerTareas(): void {
    this.tareaService.obtenerTareas().subscribe((tareas) => (this.tareas = tareas));
  }

  agregarTarea(): void {
    this.tareaService.crearTarea(this.nuevaTarea).subscribe(() => {
      this.obtenerTareas();
      this.nuevaTarea = { titulo: '', descripcion: '', completada: false, prioridad: '', _id: '' }; // Resetear el campo _id
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
    if (tarea._id) {  
      this.tareaService.marcarCompletada(tarea._id).subscribe(() => {
        this.obtenerTareas(); 
      });
    }
  }
}
