const express = require('express');
const router = express.Router({ mergeParams: true });
const commentController = require('../controllers/commentController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/', commentController.getComments);
router.post('/', commentController.createComment);
router.delete('/:id', commentController.deleteComment);

module.exports = router;