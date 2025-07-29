const express = require('express');
const router = express.Router();
const monitoredDestinationController = require('../controllers/monitoredDestinationController');

router.get('/', monitoredDestinationController.listDestinations);
router.post('/', monitoredDestinationController.createDestination);
router.put('/:id', monitoredDestinationController.updateDestination);
router.delete('/:id', monitoredDestinationController.deleteDestination);

module.exports = router;
