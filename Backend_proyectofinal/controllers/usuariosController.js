const mysql = require('mysql');

exports.crearUsuario = (req, res) => {
  // Configurar la conexión a la base de datos
  const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'newpassword',
    database: 'dbproyectofinal'
  });

  const { nombre, email } = req.body;

  if (!nombre || !email ) {
    return res.status(400).send('Todos los campos son obligatorios');
  }

  const nuevoUsuario = {
    nombre,
    email
  };

  const sql = 'INSERT INTO usuarios SET ?';

  connection.connect(error => {
    if (error) {
      console.error('Error al conectar a la base de datos:', error);
      return res.status(500).send('Error interno del servidor');
    }

    connection.query(sql, nuevoUsuario, (error, resultado) => {
      // Cerrar la conexión después de ejecutar la consulta
      connection.end();

      if (error) {
        console.error('Error al crear el usuario:', error);
        return res.status(500).send('Error interno del servidor');
      }

      console.log('Usuario creado con éxito');
      res.status(201).send('Usuario creado con éxito');
    });
  });
};
