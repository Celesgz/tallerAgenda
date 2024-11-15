// // Importamos Express
// const express = require('express');
// const app = express();

// // Configuramos el puerto
// const PORT = process.env.PORT || 3000;

// // Datos de ejemplo (array de tareas)
// const tareas = [
//     { id: 1, titulo: "Comprar víveres", descripcion: "Comprar frutas, verduras y pan." },
//     { id: 2, titulo: "Estudiar Express", descripcion: "Repasar la documentación de Express." },
//     { id: 3, titulo: "Hacer ejercicio", descripcion: "Salir a correr por 30 minutos." },
// ];

// // 1. Traer tareas
// app.get('/api/tareas', (req, res) => {
//     res.json(tareas);
// });

// // 2.  Agregar tarea
// app.post('/api/tareas', (req, res) => {
//     const { titulo, descripcion } = req.body;  // Extraemos los datos del cuerpo de la solicitud

//     if (!titulo || !descripcion) {
//         return res.status(400).json({ mensaje: "El título y la descripción son obligatorios." });
//     } // con el res manejamos errores


//     // Creamos una nueva tarea con los datos que vienen del request
//     const nuevaTarea = {
//         id: tareas.length + 1,  // Asignamos un ID secuencial, ver si se puede cambiar al conectar con bd
//         titulo,
//         descripcion,
//     };

//     // Agregamos la nueva tarea al array (cambiar con la conexion a la bd)
//     tareas.push(nuevaTarea);

//     // Respondemos con la tarea recién creada con exito :)
//     res.status(201).json(nuevaTarea);
// });


// // 3. Eliminar tarea
// app.delete('/api/tareas/:id', (req, res) => {
//     const { id } = req.params; // Obtenemos el id de la URL
//     const tareaIndex = tareas.findIndex(tarea => tarea.id === parseInt(id));

//     if (tareaIndex === -1) {
//         return res.status(404).json({ mensaje: "Tarea no encontrada." });
//     }

//     // Eliminar la tarea del array
//     tareas.splice(tareaIndex, 1);

//     res.status(200).json({ mensaje: `Tarea con id ${id} eliminada correctamente.` });
// });

// // 4. Editar
// app.put('/api/tareas/:id', (req, res) => {
//     const { id } = req.params;
//     const { titulo, descripcion } = req.body;

//     // Buscar la tarea por su id (reemplazar por la bd)
//     const tarea = tareas.find(t => t.id === parseInt(id));

//     if (!tarea) {
//         return res.status(404).json({ mensaje: "Tarea no encontrada." });
//     }

//     // Si no se proporcionan título o descripción, no se actualiza ese campo
//     if (titulo) tarea.titulo = titulo;
//     if (descripcion) tarea.descripcion = descripcion;

//     // Respondemos con la tarea actualizada
//     res.status(200).json(tarea);
// });


// // Iniciamos el servidor
// app.listen(PORT, () => {
//     console.log(`Servidor corriendo en http://localhost:${PORT}`);
// });

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
mongoose.connect('mongodb://localhost:27017/mi_lista_tareas', {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
    .then(() => console.log('Conectado a MongoDB'))
    .catch((error) => console.error('Error al conectar a MongoDB:', error));

// Definir el esquema y el modelo de tarea
const tareaSchema = new Schema({
    titulo: { type: String, required: true },
    descripcion: { type: String, required: true }
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
    const { titulo, descripcion } = req.body;

    if (!titulo || !descripcion) {
        return res.status(400).json({ mensaje: "El título y la descripción son obligatorios." });
    }

    try {
        const nuevaTarea = new Tarea({ titulo, descripcion });
        const tareaGuardada = await nuevaTarea.save();
        res.status(201).json(tareaGuardada);
    } catch (error) {
        res.status(500).json({ mensaje: "Error al crear la tarea", error });
    }
});

// 3. Eliminar una tarea por ID desde la base de datos
app.delete('/api/tareas/:id', async (req, res) => {
    const { id } = req.params;

    // Comprobar si el id es válido como ObjectId
    if (!ObjectId.isValid(id)) {
        return res.status(400).json({ mensaje: "El ID proporcionado no es válido." });
    }

    try {
        const tareaEliminada = await Tarea.findByIdAndDelete(id);

        if (!tareaEliminada) {
            return res.status(404).json({ mensaje: "Tarea no encontrada." });
        }

        res.status(200).json({ mensaje: `Tarea con id ${id} eliminada correctamente.` });
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

// Iniciar el servidor
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
