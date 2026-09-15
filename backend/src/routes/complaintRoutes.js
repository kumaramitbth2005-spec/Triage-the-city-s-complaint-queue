const express = require('express');
const { createComplaint, getComplaints, getComplaintById, triageComplaint, getTriageQueue } = require('../controllers/complaintController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.get('/', protect, getComplaints);
router.post('/', protect, createComplaint);
router.get('/:id', protect, getComplaintById);
router.patch('/:id/triage', protect, triageComplaint);

module.exports = router;
