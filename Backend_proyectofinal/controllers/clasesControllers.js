const mysql = require('mysql');
const nodemailer = require('nodemailer');

// Configurar la conexión a la base de datos
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'newpassword',
  database: 'dbproyectofinal'
});
// Configuracion para  usar nodemailer
const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
      user: 'masterbackend17@gmail.com',
      pass: 'zmzb scoi eqji avdk'
    }
});

// Enviar correo de los cambios
const enviarCorreoCambios = (email, clase) => {
    const mailOptions = {
      from: 'masterbackend17@gmail.com',
      to: email,
      subject: 'Modificaciones en una clase reservada',
      text: `Tu clase reservada ha sufrido modificaciones.`
    };
  
    transporter.sendMail(mailOptions, function(error, info){
      if (error) {
        console.log('Error al enviar el correo: ' + error);
      } else {
        console.log('Correo enviado: ' + info.response);
      }
    });
};



// Crear  una clase 
exports.crearClase = (req, res) => {
  const { nombre, idioma, fecha, hora, cupo_maximo } = req.body;
  if (!nombre || !idioma || !fecha || !hora || !cupo_maximo) {
    return res.status(400).send('Todos los campos son obligatorios');
  }
  const nuevaClase = {
    nombre,
    idioma,
    fecha,
    hora,
    cupo_maximo
  };

  const sql = 'INSERT INTO clases SET ?';

  connection.query(sql, nuevaClase, (error, resultado) => {
    if (error) {
      console.error('Error al crear la clase: ' + error);
      return res.status(500).send('Error interno del servidor');
    }

    console.log('Clase creada con éxito');
    res.status(201).send('Clase creada con éxito');
  });
};

// Obtener todas las clases
exports.obtenerClases = (req, res) => {
  const sql = 'SELECT * FROM clases';

  connection.query(sql, (error, resultados) => {
    if (error) {
      console.error('Error al obtener las clases: ' + error);
      return res.status(500).send('Error interno del servidor');
    }

    res.json(resultados);
  });
};


// Actualizar una clase
exports.actualizarClase = (req, res) => {
    const idClase = req.params.id;
    const { nombre, idioma, fecha, hora, cupo_maximo } = req.body;
  
    const claseActualizada = {
      nombre,
      idioma,
      fecha,
      hora,
      cupo_maximo
    };
  
    const sql = 'UPDATE clases SET ? WHERE id = ?';
  
    connection.query(sql, [claseActualizada, idClase], (error, resultado) => {
      if (error) {
        console.error('Error al actualizar la clase: ' + error);
        return res.status(500).send('Error interno del servidor');
      }
  
      console.log('Clase actualizada con éxito');
      res.send('Clase actualizada con éxito');
  
      // Obtener los correos electrónicos de los usuarios afectados
      obtenerCorreosUsuariosAfectados(idClase, (error, correos) => {
        if (error) {
          console.error('Error al obtener los correos electrónicos de los usuarios afectados: ' + error);
          return;
        }
  
        // Enviar correo electrónico a los usuarios afectados
        const mensaje = 'La clase que has reservado ha sido actualizada. Por favor, revisa los detalles.';
        enviarCorreos(correos, mensaje);
      });
    });
    // Función para obtener los correos electrónicos de los usuarios afectados
  const obtenerCorreosUsuariosAfectados = (idClase, callback) => {
    const sql = 'SELECT u.email FROM reservas r JOIN usuarios u ON r.id_usuario = u.id WHERE r.id_clase = ?';
    connection.query(sql, [idClase], (error, resultados) => {
      if (error) {
        return callback(error);
      }
  
      const correos = resultados.map(resultado => resultado.email);
      callback(null, correos);
    });
  };
  // Función para enviar correos electrónicos
    const enviarCorreos = (correos, mensaje) => {
        correos.forEach(email => {
        enviarCorreoCambios(email, mensaje);
        });
    };
};
  


// Eliminar una clase
exports.eliminarClase = (req, res) => {
  const idClase = req.params.id;

  const sql = 'DELETE FROM clases WHERE id = ?';

  connection.query(sql, idClase, (error, resultado) => {
    if (error) {
      console.error('Error al eliminar la clase: ' + error);
      return res.status(500).send('Error interno del servidor');
    }

    console.log('Clase eliminada con éxito');
    res.send('Clase eliminada con éxito');

    
  });
};





