const express = require('express');
const { createComplaint, getComplaints, getComplaintById, triageComplaint, getTriageQueue, deleteComplaint } = require('../controllers/complaintController');
const { protect, optionalProtect } = require('../middleware/auth');

const router = express.Router();

// Read routes: optionalProtect — works with or without token
router.get('/', optionalProtect, getComplaints);
router.get('/:id', optionalProtect, getComplaintById);

// Write routes: protect / optionalProtect
router.post('/', optionalProtect, createComplaint);
router.patch('/:id/triage', optionalProtect, triageComplaint);
router.delete('/:id', optionalProtect, deleteComplaint);

module.exports = router;
