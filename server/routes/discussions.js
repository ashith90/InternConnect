const express = require('express');
const router = express.Router();
const {
  getDiscussions, getDiscussion, createDiscussion, addComment, toggleLike, deleteDiscussion
} = require('../controllers/discussionController');
const { protect } = require('../middleware/auth');

router.get('/', getDiscussions);
router.get('/:id', getDiscussion);
router.post('/', protect, createDiscussion);
router.post('/:id/comments', protect, addComment);
router.put('/:id/like', protect, toggleLike);
router.delete('/:id', protect, deleteDiscussion);

module.exports = router;
