import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

interface Tarea {
  id?: number;
  _id: string;
  titulo: string;
  descripcion: string;
  completada: boolean;
  prioridad: string;  
}

@Injectable({
  providedIn: 'root'
})
export class TareaService {
  private apiUrl = 'http://localhost:3000/api/tareas';

  constructor(private http: HttpClient) {}

  obtenerTareas(): Observable<Tarea[]> {
    return this.http.get<Tarea[]>(this.apiUrl);
  }

  crearTarea(tarea: Tarea): Observable<Tarea> {
    return this.http.post<Tarea>(this.apiUrl, tarea);
  }

  actualizarTarea(id: number, tarea: Tarea): Observable<Tarea> {
    return this.http.put<Tarea>(`${this.apiUrl}/${id}`, tarea);
  }

 
   // Eliminar una tarea por su _id
   eliminarTarea(_id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${_id}`);
  }

  // Marcar tarea como completada
  marcarCompletada(_id: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/completar/${_id}`, {}); 
  }
  
  

  
}
