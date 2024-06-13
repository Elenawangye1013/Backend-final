const express = require('express');
const router = express.Router();
const clasesController = require('../controllers/clasesControllers');

router.post('/clases', clasesController.crearClase);
router.get('/clases', clasesController.obtenerClases);
router.put('/clases/:id', clasesController.actualizarClase);
router.delete('/clases/:id', clasesController.eliminarClase);

module.exports = router;
