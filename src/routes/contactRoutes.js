// En backend/src/routes/contactRoutes.js
const express = require('express');
const router = express.Router();
const contactController = require('../controllers/contactController');

router.post('/contact', contactController.sendMessage);

module.exports = router;