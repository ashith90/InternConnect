const Discussion = require('../models/Discussion');


const getDiscussions = async (req, res) => {
  try {
    const { search, tag } = req.query;
    const query = {};
    if (search) query.$or = [
      { title: { $regex: search, $options: 'i' } },
      { content: { $regex: search, $options: 'i' } },
    ];
    if (tag) query.tags = { $in: [tag] };

    const discussions = await Discussion.find(query)
      .populate('authorId', 'name profileImage role college companyName')
      .populate('comments.authorId', 'name profileImage role')
      .sort({ isPinned: -1, createdAt: -1 });

    res.json({ success: true, discussions });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


const getDiscussion = async (req, res) => {
  try {
    const discussion = await Discussion.findByIdAndUpdate(
      req.params.id, { $inc: { views: 1 } }, { new: true }
    ).populate('authorId', 'name profileImage role college companyName')
     .populate('comments.authorId', 'name profileImage role');
    if (!discussion) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, discussion });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


const createDiscussion = async (req, res) => {
  try {
    const { title, content, tags } = req.body;
    const discussion = await Discussion.create({
      authorId: req.user._id, title, content,
      tags: Array.isArray(tags) ? tags : (tags ? tags.split(',').map(t => t.trim()) : []),
    });
    const populated = await Discussion.findById(discussion._id).populate('authorId', 'name profileImage role');
    res.status(201).json({ success: true, discussion: populated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


const addComment = async (req, res) => {
  try {
    const { content } = req.body;
    const discussion = await Discussion.findById(req.params.id);
    if (!discussion) return res.status(404).json({ success: false, message: 'Discussion not found' });

    discussion.comments.push({ authorId: req.user._id, content });
    await discussion.save();

    const updated = await Discussion.findById(req.params.id)
      .populate('authorId', 'name profileImage role')
      .populate('comments.authorId', 'name profileImage role');
    res.json({ success: true, discussion: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


const toggleLike = async (req, res) => {
  try {
    const discussion = await Discussion.findById(req.params.id);
    if (!discussion) return res.status(404).json({ success: false, message: 'Not found' });

    const userId = req.user._id.toString();
    const idx = discussion.likes.findIndex(l => l.toString() === userId);
    if (idx > -1) discussion.likes.splice(idx, 1);
    else discussion.likes.push(req.user._id);
    await discussion.save();

    res.json({ success: true, likes: discussion.likes.length, liked: idx === -1 });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


const deleteDiscussion = async (req, res) => {
  try {
    const discussion = await Discussion.findById(req.params.id);
    if (!discussion) return res.status(404).json({ success: false, message: 'Not found' });

    const isAuthor = discussion.authorId.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';
    if (!isAuthor && !isAdmin) return res.status(403).json({ success: false, message: 'Unauthorized' });

    await discussion.deleteOne();
    res.json({ success: true, message: 'Discussion deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getDiscussions, getDiscussion, createDiscussion, addComment, toggleLike, deleteDiscussion };
