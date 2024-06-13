const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const clasesRoutes = require('./routes/clases');
const reservasRoutes = require('./routes/reservas');
const usuariosRoutes = require('./routes/usuarios')

const app = express();


app.use(bodyParser.json());


// Definir las rutas
app.use('/api', clasesRoutes);
app.use('/api', reservasRoutes);
app.use('/api', usuariosRoutes);


//rutas no definidas
app.use((req, res, next) => {
  res.status(404).send('Página no encontrada');
});

// Iniciar el servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor escuchando en el puerto ${PORT}`);
});
