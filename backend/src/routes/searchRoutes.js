const express = require('express');
const { globalSearch } = require('../controllers/searchController');
const { optionalProtect } = require('../middleware/auth');

const router = express.Router();

router.get('/', optionalProtect, globalSearch);

module.exports = router;
