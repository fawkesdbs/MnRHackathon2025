const router = require('express').Router();
const { list, create, update, delete: del } = require('../controllers/diagnosticTestController');

router.get('/', list);
router.post('/', create);
router.put('/:id', update);
router.delete('/:id', del);

module.exports = router;
