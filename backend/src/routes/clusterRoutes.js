const express = require('express');
const { getClusters, getClusterById } = require('../controllers/clusterController');
const { optionalProtect } = require('../middleware/auth');

const router = express.Router();

router.get('/', optionalProtect, getClusters);
router.get('/:id', optionalProtect, getClusterById);

module.exports = router;
