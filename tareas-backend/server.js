// Importamos Express
const express = require('express');
const app = express();

// Configuramos el puerto
const PORT = process.env.PORT || 3000;

// Datos de ejemplo (array de tareas)
const tareas = [
    { id: 1, titulo: "Comprar víveres", descripcion: "Comprar frutas, verduras y pan." },
    { id: 2, titulo: "Estudiar Express", descripcion: "Repasar la documentación de Express." },
    { id: 3, titulo: "Hacer ejercicio", descripcion: "Salir a correr por 30 minutos." },
];

// 1. Traer tareas
app.get('/api/tareas', (req, res) => {
    res.json(tareas);
});

// 2.  Agregar tarea
app.post('/api/tareas', (req, res) => {
    const { titulo, descripcion } = req.body;  // Extraemos los datos del cuerpo de la solicitud

    if (!titulo || !descripcion) {
        return res.status(400).json({ mensaje: "El título y la descripción son obligatorios." });
    } // con el res manejamos errores


    // Creamos una nueva tarea con los datos que vienen del request
    const nuevaTarea = {
        id: tareas.length + 1,  // Asignamos un ID secuencial, ver si se puede cambiar al conectar con bd
        titulo,
        descripcion,
    };

    // Agregamos la nueva tarea al array (cambiar con la conexion a la bd)
    tareas.push(nuevaTarea);

    // Respondemos con la tarea recién creada con exito :)
    res.status(201).json(nuevaTarea);
});


// 3. Eliminar tarea
app.delete('/api/tareas/:id', (req, res) => {
    const { id } = req.params; // Obtenemos el id de la URL
    const tareaIndex = tareas.findIndex(tarea => tarea.id === parseInt(id));

    if (tareaIndex === -1) {
        return res.status(404).json({ mensaje: "Tarea no encontrada." });
    }

    // Eliminar la tarea del array
    tareas.splice(tareaIndex, 1);

    res.status(200).json({ mensaje: `Tarea con id ${id} eliminada correctamente.` });
});

// 4. Editar
app.put('/api/tareas/:id', (req, res) => {
    const { id } = req.params;
    const { titulo, descripcion } = req.body;

    // Buscar la tarea por su id (reemplazar por la bd)
    const tarea = tareas.find(t => t.id === parseInt(id));

    if (!tarea) {
        return res.status(404).json({ mensaje: "Tarea no encontrada." });
    }

    // Si no se proporcionan título o descripción, no se actualiza ese campo
    if (titulo) tarea.titulo = titulo;
    if (descripcion) tarea.descripcion = descripcion;

    // Respondemos con la tarea actualizada
    res.status(200).json(tarea);
});


// Iniciamos el servidor
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
