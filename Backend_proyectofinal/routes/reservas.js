const express = require('express');
const router = express.Router();
const reservasController = require('../controllers/reservasController');

// Ruta para crear una nueva reserva
router.post('/reservas', reservasController.crearReserva);

// Ruta para editar una reserva
router.put('/reservas/:id', reservasController.editarReserva);

// Ruta para cancelar una reserva
router.delete('/reservas/:id', reservasController.cancelarReserva);

router.get('/reservas', reservasController.obtenerReservas);
module.exports = router;
