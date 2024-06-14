const mysql = require('mysql');
const nodemailer = require('nodemailer');


// Configurar la conexión a la base de datos
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'newpassword',
  database: 'dbproyectofinal'
});

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
    user: 'masterbackend17@gmail.com', //correo de prueba
    pass: 'zmzb scoi eqji avdk' //app password
  }
});

// Enviar correo de confirmación
const enviarCorreoConfirmacion = (email, clase) => {
  const mailOptions = {
    from: 'masterbackend17@gmail.com',
    to: email,
    subject: 'Confirmación de reserva de clase',
    text: `Has reservado una plaza en la clase de ${clase.nombre} de idioma ${clase.idioma} el ${clase.fecha} a las ${clase.hora}.`
  };

  transporter.sendMail(mailOptions, function(error, info){
    if (error) {
      console.log('Error al enviar el correo: ' + error);
    } else {
      console.log('Correo enviado: ' + info.response);
    }
  });
};
const enviarCorreoCancelacion = (email, clase) => {
  const mailOptions = {
    from: 'masterbackend17@gmail.com',
    to: email,
    subject: 'Cancelación de reserva de clase',
    text: `Tu reserva para la clase de ${clase.nombre} de idioma ${clase.idioma} el ${clase.fecha} a las ${clase.hora} ha sido cancelada.`
  };

  transporter.sendMail(mailOptions, function(error, info){
    if (error) {
      console.log('Error al enviar el correo: ' + error);
    } else {
      console.log('Correo enviado: ' + info.response);
    }
  });
};
const enviarCorreoModicifacion = (email, clase) => {
  const mailOptions = {
    from: 'masterbackend17@gmail.com',
    to: email,
    subject: 'Modificación de reserva de clase',
    text: `Tu reserva ha sido modificada.`
  };

  transporter.sendMail(mailOptions, function(error, info){
    if (error) {
      console.log('Error al enviar el correo: ' + error);
    } else {
      console.log('Correo enviado: ' + info.response);
    }
  });
};

// Crear una nueva reserva
exports.crearReserva = (req, res) => {
  const { id_usuario, id_clase } = req.body;
  if (!id_usuario || !id_clase) {
    return res.status(400).send('Todos los campos son obligatorios');
  }
  
  // Comprobar disponibilidad
  const sqlDisponibilidad = 'SELECT alumnos_reservados, cupo_maximo FROM clases WHERE id = ?';
  connection.query(sqlDisponibilidad, [id_clase], (error, resultado) => {
    if (error) {
      console.error('Error al comprobar disponibilidad: ' + error);
      return res.status(500).send('Error interno del servidor');
    }
    let { alumnos_reservados, cupo_maximo } = resultado[0];

    if (alumnos_reservados >= cupo_maximo) {
      return res.status(400).send('La clase está completa.');
    }

      // Verificar que el usuario no tenga la misma reserva
    const sqlVerificarReserva = 'SELECT * FROM reservas WHERE id_clase = ? AND id_usuario = ?';
    connection.query(sqlVerificarReserva, [id_clase, id_usuario], (error, resultados) => {
      if (error) {
        console.error('Error al verificar la reserva: ' + error);
        return res.status(500).send('Error interno del servidor');
      }

      if (resultados.length > 0) {
        // Si ya existe una reserva
        return res.status(400).send('Ya has reservado esta clase');
      }
    })

      // Crear reserva
      const nuevaReserva = {
        id_usuario,
        id_clase
      };

      const sqlReserva = 'INSERT INTO reservas SET ?';
      connection.query(sqlReserva, nuevaReserva, (error, resultado) => {
        if (error) {
          console.error('Error al crear la reserva: ' + error);
          return res.status(500).send('Error interno del servidor');
        }
        alumnos_reservados += 1;

        console.log('Reserva creada con éxito');
        res.status(201).send('Reserva creada con éxito');

         // Incrementar el contador de alumnos reservados
         const sqlActualizarAlumnos = 'UPDATE clases SET alumnos_reservados = alumnos_reservados + 1 WHERE id = ?';
         connection.query(sqlActualizarAlumnos, [id_clase], (error, resultado) => {
           if (error) {
             console.error('Error al actualizar el contador de alumnos reservados: ' + error);
           }
         });

        // Obtener detalles de la clase para el correo de confirmación
        const sqlClase = 'SELECT * FROM clases WHERE id = ?';
        connection.query(sqlClase, [id_clase], (error, resultado) => {
          if (error) {
            console.error('Error al obtener los detalles de la clase: ' + error);
            return;
          }

          const clase = resultado[0];
          const sqlUsuario = 'SELECT email FROM usuarios WHERE id = ?';
          connection.query(sqlUsuario, [id_usuario], (error, resultado) => {
            if (error) {
              console.error('Error al obtener el correo del usuario: ' + error);
              return;
            }

            const email = resultado[0].email;
            enviarCorreoConfirmacion(email, clase);
          });
        });
      });
    });
};

// Editar una reserva
exports.editarReserva = (req, res) => {
  const idReserva = req.params.id;
  const { id_clase, id_usuario } = req.body;

  // Obtener la clase actual de la reserva antes de la actualización
  const sqlObtenerReserva = 'SELECT r.id_clase, u.email, c.nombre, c.idioma, c.fecha, c.hora FROM reservas r JOIN usuarios u ON r.id_usuario = u.id JOIN clases c ON r.id_clase = c.id WHERE r.id = ?';
  connection.query(sqlObtenerReserva, [idReserva], (error, resultados) => {
    if (error) {
      console.error('Error al obtener la reserva: ' + error);
      return res.status(500).send('Error interno del servidor');
    }

    if (resultados.length === 0) {
      return res.status(404).send('Reserva no encontrada');
    }

    const claseAnterior = resultados[0];

    // Obtener detalles de la nueva clase
    const sqlObtenerClaseNueva = 'SELECT nombre, idioma, fecha, hora FROM clases WHERE id = ?';
    connection.query(sqlObtenerClaseNueva, [id_clase], (error, resultadosClaseNueva) => {
      if (error) {
        console.error('Error al obtener los detalles de la nueva clase: ' + error);
        return res.status(500).send('Error interno del servidor');
      }

      if (resultadosClaseNueva.length === 0) {
        return res.status(404).send('Clase no encontrada');
      }

      const claseNueva = resultadosClaseNueva[0];

      // Actualizar reserva
      const sqlActualizarReserva = 'UPDATE reservas SET id_clase = ?, id_usuario = ? WHERE id = ?';
      connection.query(sqlActualizarReserva, [id_clase, id_usuario, idReserva], (error, resultado) => {
        if (error) {
          console.error('Error al actualizar la reserva: ' + error);
          return res.status(500).send('Error interno del servidor');
        }

        // Decrementar el contador de alumnos reservados en la clase anterior
        const sqlDecrementarContadorAnterior = 'UPDATE clases SET alumnos_reservados = alumnos_reservados - 1 WHERE id = ?';
        connection.query(sqlDecrementarContadorAnterior, [claseAnterior.id_clase], (error, resultadoDecrementoAnterior) => {
          if (error) {
            console.error('Error al decrementar el contador de alumnos reservados en la clase anterior: ' + error);
            return res.status(500).send('Error interno del servidor');
          }

          // Incrementar el contador de alumnos reservados en la nueva clase
          const sqlIncrementarContadorNuevo = 'UPDATE clases SET alumnos_reservados = alumnos_reservados + 1 WHERE id = ?';
          connection.query(sqlIncrementarContadorNuevo, [id_clase], (error, resultadoIncrementoNuevo) => {
            if (error) {
              console.error('Error al incrementar el contador de alumnos reservados en la nueva clase: ' + error);
              return res.status(500).send('Error interno del servidor');
            }

            // Enviar correo de cambios
            enviarCorreoModicifacion(claseAnterior.email);

            console.log('Reserva actualizada con éxito');
            res.send('Reserva actualizada con éxito');
          });
        });
      });
    });
  });
};

  

// Cancelar una reserva
exports.cancelarReserva = (req, res) => {
  const idReserva = req.params.id;

  // Obtener el id de la clase y el ID del usuario para actualizar el contador de alumnos reservados y enviar el email
  const sqlClase = 'SELECT r.id_clase, r.id_usuario, u.email, c.nombre, c.idioma, c.fecha, c.hora FROM reservas r JOIN usuarios u ON r.id_usuario = u.id JOIN clases c ON r.id_clase = c.id WHERE r.id = ?';
  connection.query(sqlClase, [idReserva], (error, resultados) => {
    if (error) {
      console.error('Error al obtener los detalles para cancelar la reserva: ' + error);
      return res.status(500).send('Error interno del servidor');
    }
    if (resultados.length === 0) {
      return res.status(404).send('Reserva no encontrada');
    }
    const { id_clase, email, nombre, idioma, fecha, hora } = resultados[0];

    // Eliminar reserva
    const sqlEliminarReserva = 'DELETE FROM reservas WHERE id = ?';
    connection.query(sqlEliminarReserva, [idReserva], (error, resultadoEliminar) => {
      if (error) {
        console.error('Error al cancelar la reserva: ' + error);
        return res.status(500).send('Error interno del servidor');
      }

      // Decrementar el contador de alumnos reservados
      const sqlDecrementarContador = 'UPDATE clases SET alumnos_reservados = alumnos_reservados - 1 WHERE id = ?';
      connection.query(sqlDecrementarContador, [id_clase], (error, resultadoDecrementar) => {
        if (error) {
          console.error('Error al decrementar el contador de alumnos reservados: ' + error);
          return res.status(500).send('Error interno del servidor');
        }

        // Enviar correo de cancelación
        enviarCorreoCancelacion(email, { nombre, idioma, fecha, hora });

        console.log('Reserva cancelada con éxito');
        res.send('Reserva cancelada con éxito');
      });
    });
  });
};

// Obtener todas las clases
exports.obtenerReservas = (req, res) => {
  const sql = 'SELECT * FROM reservas';

  connection.query(sql, (error, resultados) => {
    if (error) {
      console.error('Error al obtener las reservas: ' + error);
      return res.status(500).send('Error interno del servidor');
    }

    res.json(resultados);
  });
};