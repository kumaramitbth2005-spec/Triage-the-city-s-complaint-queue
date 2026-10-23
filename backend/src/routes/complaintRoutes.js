const express = require('express');
const { createComplaint, getComplaints, getComplaintById, triageComplaint, escalateComplaint, getTriageQueue, deleteComplaint } = require('../controllers/complaintController');
const { transcribeAudio } = require('../controllers/voiceController');
const { protect, optionalProtect } = require('../middleware/auth');

const router = express.Router();

// Read routes: protect for full queue, optionalProtect for single complaint tracking
router.get('/', protect, getComplaints);
router.get('/:id', optionalProtect, getComplaintById);

// Write routes: protect / optionalProtect
router.post('/', optionalProtect, createComplaint);
router.post('/transcribe', optionalProtect, transcribeAudio);
router.patch('/:id/triage', protect, triageComplaint);
router.post('/:id/escalate', protect, escalateComplaint);
router.delete('/:id', protect, deleteComplaint);

module.exports = router;
