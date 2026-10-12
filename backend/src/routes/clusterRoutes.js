const express = require('express');
const { getClusters, getClusterById } = require('../controllers/clusterController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.get('/', protect, getClusters);
router.get('/:id', protect, getClusterById);

module.exports = router;
