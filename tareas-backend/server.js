// Importamos Express
const express = require('express');
const cors = require('cors');
const app = express();
const mongoose = require('mongoose');
const { Schema } = mongoose;
const AutoIncrement = require('mongoose-sequence')(mongoose);
const { ObjectId } = mongoose.Types;

// Middleware para parsear el cuerpo de las solicitudes en JSON
app.use(express.json());

app.use(cors({
    origin: 'http://localhost:4200', // Permite solo este origen
    methods: ['GET', 'POST', 'PUT', 'DELETE'], // Métodos permitidos
    allowedHeaders: ['Content-Type', 'Authorization'] // Encabezados permitidos
}))

// Configuramos el puerto
const PORT = process.env.PORT || 3000;

// Conectar a MongoDB
mongoose.connect('mongodb://localhost:27017/mi_lista_tareas')
    .then(() => console.log('Conectado a MongoDB'))
    .catch((error) => console.error('Error al conectar a MongoDB:', error));

// Definir el esquema y el modelo de tarea
const tareaSchema = new Schema({
    titulo: { type: String, required: true },
    descripcion: { type: String, required: true },
    completada: { type: Boolean, default: false },  
    prioridad: { type: String, required: true },
    categoria: { type: String, required: true },
  });

// Agregar el plugin de autoincremento al esquema
tareaSchema.plugin(AutoIncrement, { inc_field: 'id' });

const Tarea = mongoose.model('Tarea', tareaSchema);

// 1. Obtener todas las tareas desde la base de datos
app.get('/api/tareas', async (req, res) => {
    try {
        const tareas = await Tarea.find();
        res.json(tareas);
    } catch (error) {
        res.status(500).json({ mensaje: "Error al obtener las tareas", error });
    }
});

// 2. Agregar una nueva tarea a la base de datos
app.post('/api/tareas', async (req, res) => {
    const { titulo, descripcion, completada, prioridad, categoria } = req.body; // Añadido `categoria`

    // Validamos que los campos requeridos estén presentes
    if (!titulo || !descripcion || !prioridad || !categoria) {
        return res.status(400).json({ mensaje: "Los datos son obligatorios." });
    }

    try {
        const nuevaTarea = new Tarea({
            titulo,
            descripcion,
            completada: completada !== undefined ? completada : false, 
            prioridad,
            categoria 
        });
        
        const tareaGuardada = await nuevaTarea.save();
        res.status(201).json(tareaGuardada);
    } catch (error) {
        res.status(500).json({ mensaje: "Error al crear la tarea", error });
    }
});

// 3. Eliminar una tarea por el campo `id` numérico desde la base de datos
// Eliminar una tarea por _id
app.delete('/api/tareas/:id', async (req, res) => {
    const { id } = req.params;
  
    // Comprobar si el id es válido como ObjectId
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ mensaje: "El ID proporcionado no es válido." });
    }
  
    try {
      // Eliminar la tarea usando _id
      const tareaEliminada = await Tarea.findByIdAndDelete(id);
  
      if (!tareaEliminada) {
        return res.status(404).json({ mensaje: "Tarea no encontrada." });
      }
  
      res.status(200).json({ mensaje: `Tarea con _id ${id} eliminada correctamente.` });
    } catch (error) {
      res.status(500).json({ mensaje: "Error al eliminar la tarea", error });
    }
  });

// 4. Editar una tarea por ID en la base de datos
app.put('/api/tareas/:id', async (req, res) => {
    const { id } = req.params;
    const { titulo, descripcion } = req.body;

    // Comprobar si el id es válido como ObjectId
    if (!ObjectId.isValid(id)) {
        return res.status(400).json({ mensaje: "El ID proporcionado no es válido." });
    }

    try {
        // Usamos findByIdAndUpdate para buscar y actualizar la tarea por _id
        const tareaActualizada = await Tarea.findByIdAndUpdate(
            id,  // Aquí usamos el id directamente
            { titulo, descripcion },  // Campos a actualizar
            { new: true, runValidators: true }  // Retornar el documento actualizado y ejecutar validaciones
        );

        if (!tareaActualizada) {
            return res.status(404).json({ mensaje: "Tarea no encontrada." });
        }

        res.status(200).json(tareaActualizada);
    } catch (error) {
        res.status(500).json({ mensaje: "Error al actualizar la tarea", error });
    }
});

// 5. Obtener una tarea específica por ID desde la base de datos
app.get('/api/tareas/:id', async (req, res) => {
    const { id } = req.params;
    // Comprobar si el id es válido como ObjectId
    if (!ObjectId.isValid(id)) {
        return res.status(400).json({ mensaje: "El ID proporcionado no es válido." });
    }
    try {
        const tarea = await Tarea.findById(id);

        if (!tarea) {
            return res.status(404).json({ mensaje: "Tarea no encontrada." });
        }

        res.json(tarea);
    } catch (error) {
        res.status(500).json({ mensaje: "Error al obtener la tarea", error });
    }
});

// 6- actualizar el estado de completada de una tarea
app.put('/api/tareas/completar/:id', async (req, res) => {
    const { id } = req.params; // Este es el _id de la tarea que se va a actualizar
    
    // Verificar si el id es válido como ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ mensaje: "El ID proporcionado no es válido." });
    }
  
    try {
      // Buscar la tarea por _id y actualizar el campo completada
      const tarea = await Tarea.findByIdAndUpdate(
        id, 
        { completada: true },  // Cambiar la tarea a completada
        { new: true }  // Devolver la tarea actualizada
      );
  
      if (!tarea) {
        return res.status(404).json({ mensaje: "Tarea no encontrada." });
      }
  
      res.status(200).json(tarea); // Devuelve la tarea actualizada
    } catch (error) {
      res.status(500).json({ mensaje: "Error al actualizar la tarea", error });
    }
  });
  
// 7. desmarcar la tarea como no completada
app.put('/api/tareas/no-completada/:id', async (req, res) => {
    const { id } = req.params;

    // Comprobar si el id es válido como ObjectId
    if (!ObjectId.isValid(id)) {
        return res.status(400).json({ mensaje: "El ID proporcionado no es válido." });
    }

    try {
        // Buscar la tarea por id y actualizar el campo 'completada'
        const tareaActualizada = await Tarea.findByIdAndUpdate(
            id,
            { completada: false },  // Marcamos la tarea como no completada
            { new: true }  // Retornamos el documento actualizado
        );

        // Si no se encuentra la tarea
        if (!tareaActualizada) {
            return res.status(404).json({ mensaje: "Tarea no encontrada." });
        }

        res.status(200).json(tareaActualizada);
    } catch (error) {
        res.status(500).json({ mensaje: "Error al actualizar la tarea", error });
    }
});

// Iniciar el servidor
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
