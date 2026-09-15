const express = require('express');
const { importData } = require('../controllers/importController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.post('/', protect, importData);

module.exports = router;
