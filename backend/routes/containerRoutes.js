const express = require('express');
const router = express.Router();
const containerController = require('../controllers/containerController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

// Only Admins can manage servers according to the RBAC
router.get('/', authMiddleware, roleMiddleware('Admin'), containerController.listContainers);
router.post('/create', authMiddleware, roleMiddleware('Admin'), containerController.createContainer);
router.post('/:id/stop', authMiddleware, roleMiddleware('Admin'), containerController.stopContainer);
router.delete('/:id', authMiddleware, roleMiddleware('Admin'), containerController.deleteContainer);

module.exports = router;
