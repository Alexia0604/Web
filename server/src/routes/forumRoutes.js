const express = require('express');
const router = express.Router();
const Topic = require('../models/Topic');
const Comment = require('../models/Comment');
const Notification = require('../models/Notification');
const { authenticate } = require('../middleware/authMiddleware');
const { uploadAny } = require('../middleware/fileUploadMiddleware');
const { uploadImage, uploadAudio } = require('../middleware/cloudinaryConfig');
const multer = require('multer');
const os = require('os');
const User = require('../models/User');

// Configurare multer pentru upload temporar
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, os.tmpdir()),
  filename: (req, file, cb) => cb(null, file.originalname)
});

const upload = multer({ storage });

// Middleware pentru a verifica dacă utilizatorul este autorul
const isAuthor = async (req, res, next) => {
  try {
    const { resourceType, resourceId } = req.params;
    let resource;

    if (resourceType === 'topic') {
      resource = await Topic.findById(resourceId);
    } else if (resourceType === 'comment') {
      resource = await Comment.findById(resourceId);
    }

    if (!resource) {
      return res.status(404).json({ message: 'Resursa nu a fost găsită' });
    }

    if (resource.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Nu aveți permisiunea de a modifica această resursă' });
    }

    req.resource = resource;
    next();
  } catch (error) {
    res.status(500).json({ message: 'Eroare server', error: error.message });
  }
};

// ========== Rute pentru topicuri ==========

// GET toate topicurile cu paginare și filtrare
router.get('/topics', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const sortBy = req.query.sortBy || 'lastActivity';
    const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;
    const tag = req.query.tag;
    const search = req.query.search;

    let query = {};
    if (tag) query.tags = tag;
    if (search) query.$text = { $search: search };

    const [topics, total] = await Promise.all([
      Topic.find(query)
        .sort({ [sortBy]: sortOrder, _id: -1 })
        .skip(skip)
        .limit(limit)
        .populate('author', 'username profileImage')
        .lean(),
      Topic.countDocuments(query)
    ]);

    // Adăugăm numărul de comentarii pentru fiecare topic
    const topicsWithComments = await Promise.all(topics.map(async (topic) => {
      const commentCount = await Comment.countDocuments({ topic: topic._id });
      return { ...topic, commentCount };
    }));

    res.json({
      topics: topicsWithComments,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalTopics: total
    });
  } catch (error) {
    res.status(500).json({ message: 'Eroare server', error: error.message });
  }
});

// GET un singur topic cu comentarii
router.get('/topics/:id', async (req, res) => {
  try {
    const topic = await Topic.findById(req.params.id)
      .populate('author', 'username profileImage');
    
    if (!topic) {
      return res.status(404).json({ message: 'Topicul nu a fost găsit' });
    }

    // Incrementăm numărul de vizualizări
    topic.views += 1;
    await topic.save();

    // Obținem comentariile pentru topic
    const comments = await Comment.find({ topic: topic._id, parentComment: null })
      .sort({ createdAt: 1 })
      .populate('author', 'username profileImage')
      .populate({
        path: 'likes',
        select: 'username'
      });

    // Pentru fiecare comentariu principal, obținem răspunsurile
    const commentsWithReplies = await Promise.all(comments.map(async (comment) => {
      const replies = await Comment.find({ parentComment: comment._id })
        .sort({ createdAt: 1 })
        .populate('author', 'username profileImage')
        .populate({
          path: 'likes',
          select: 'username'
        });
      return {
        ...comment.toObject(),
        replies
      };
    }));

    res.json({
      topic,
      comments: commentsWithReplies
    });
  } catch (error) {
    res.status(500).json({ message: 'Eroare server', error: error.message });
  }
});

// POST creare topic nou
router.post('/topics', authenticate, upload.array('files'), async (req, res) => {
  try {
    const { title, content, tags } = req.body;
    const files = req.files || [];

    // Procesăm fișierele încărcate
    const attachments = await Promise.all(files.map(async (file) => {
      const isAudio = file.mimetype.startsWith('audio');
      const uploadResult = isAudio 
        ? await uploadAudio(file.path)
        : await uploadImage(file.path);
      
      return {
        url: uploadResult.url,
        public_id: uploadResult.public_id,
        filename: uploadResult.original_filename || file.originalname,
        type: isAudio ? 'audio' : 'image'
      };
    }));

    const topic = new Topic({
      title,
      content,
      author: req.user._id,
      attachments,
      tags: tags ? JSON.parse(tags) : []
    });

    await topic.save();

    // Creăm notificări pentru toți utilizatorii (exceptând autorul)
    const users = await User.find({ _id: { $ne: req.user._id } });
    const notifications = users.map(user => ({
      recipient: user._id,
      type: 'new_topic',
      topic: topic._id,
      actor: req.user._id,
      message: `${req.user.username} a creat un nou topic: "${title}"`
    }));

    await Notification.insertMany(notifications);
    
    const populatedTopic = await Topic.findById(topic._id)
      .populate('author', 'username profileImage');

    res.status(201).json(populatedTopic);
  } catch (error) {
    res.status(500).json({ message: 'Eroare server', error: error.message });
  }
});

// PUT actualizare topic
router.put('/topics/:id', authenticate, isAuthor, upload.array('files'), async (req, res) => {
  try {
    const { title, content, tags } = req.body;
    const files = req.files || [];
    const topic = req.resource;

    // Procesăm noile fișiere încărcate
    const newAttachments = await Promise.all(files.map(async (file) => {
      const isAudio = file.mimetype.startsWith('audio');
      const uploadResult = isAudio 
        ? await uploadAudio(file.path)
        : await uploadImage(file.path);
      
      return {
        url: uploadResult.url,
        public_id: uploadResult.public_id,
        filename: uploadResult.filename,
        type: isAudio ? 'audio' : 'image'
      };
    }));

    // Combinăm atașamentele existente cu cele noi
    const existingAttachments = JSON.parse(req.body.existingAttachments || '[]');
    const attachments = [...existingAttachments, ...newAttachments];

    topic.title = title;
    topic.content = content;
    topic.attachments = attachments;
    topic.tags = tags ? JSON.parse(tags) : topic.tags;
    topic.isEdited = true;

    await topic.save();
    
    const updatedTopic = await Topic.findById(topic._id)
      .populate('author', 'username profileImage');

    res.json(updatedTopic);
  } catch (error) {
    res.status(500).json({ message: 'Eroare server', error: error.message });
  }
});

// DELETE ștergere topic
router.delete('/topics/:id', authenticate, isAuthor, async (req, res) => {
  try {
    const topic = req.resource;

    // Ștergem toate comentariile asociate
    await Comment.deleteMany({ topic: topic._id });
    
    // Ștergem toate notificările asociate
    await Notification.deleteMany({ topic: topic._id });

    // Ștergem topicul
    await topic.delete();

    res.json({ message: 'Topic șters cu succes' });
  } catch (error) {
    res.status(500).json({ message: 'Eroare server', error: error.message });
  }
});

// ========== Rute pentru comentarii ==========

// POST adăugare comentariu nou
router.post('/topics/:topicId/comments', authenticate, upload.array('files'), async (req, res) => {
  try {
    const { content, parentCommentId } = req.body;
    const files = req.files || [];

    // Verificăm dacă topicul există
    const topic = await Topic.findById(req.params.topicId);
    if (!topic) {
      return res.status(404).json({ message: 'Topicul nu a fost găsit' });
    }

    // Procesăm fișierele încărcate
    const attachments = await Promise.all(files.map(async (file) => {
      const isAudio = file.mimetype.startsWith('audio');
      const uploadResult = isAudio 
        ? await uploadAudio(file.path)
        : await uploadImage(file.path);
      
      return {
        url: uploadResult.url,
        public_id: uploadResult.public_id,
        filename: uploadResult.original_filename || file.originalname,
        type: isAudio ? 'audio' : 'image'
      };
    }));

    const comment = new Comment({
      topic: topic._id,
      author: req.user._id,
      content,
      attachments,
      parentComment: parentCommentId || null
    });

    await comment.save();

    // Actualizăm lastActivity pentru topic
    topic.lastActivity = new Date();
    await topic.save();

    // Creăm notificări în funcție de tipul comentariului
    if (parentCommentId) {
      // Este un răspuns la un comentariu
      const parentComment = await Comment.findById(parentCommentId);
      if (parentComment && parentComment.author.toString() !== req.user._id.toString()) {
        await Notification.create({
          recipient: parentComment.author,
          type: 'comment_reply',
          topic: topic._id,
          comment: comment._id,
          actor: req.user._id,
          message: `${req.user.username} a răspuns la comentariul tău în "${topic.title}"`
        });
      }
    } else {
      // Este un comentariu principal
      if (topic.author.toString() !== req.user._id.toString()) {
        await Notification.create({
          recipient: topic.author,
          type: 'new_comment',
          topic: topic._id,
          comment: comment._id,
          actor: req.user._id,
          message: `${req.user.username} a comentat la topicul tău "${topic.title}"`
        });
      }
    }

    const populatedComment = await Comment.findById(comment._id)
      .populate('author', 'username profileImage')
      .populate({
        path: 'likes',
        select: 'username'
      });

    res.status(201).json(populatedComment);
  } catch (error) {
    res.status(500).json({ message: 'Eroare server', error: error.message });
  }
});

// PUT actualizare comentariu
router.put('/comments/:id', authenticate, isAuthor, upload.array('files'), async (req, res) => {
  try {
    const { content } = req.body;
    const files = req.files || [];
    const comment = req.resource;

    // Procesăm noile fișiere încărcate
    const newAttachments = await Promise.all(files.map(async (file) => {
      const isAudio = file.mimetype.startsWith('audio');
      const uploadResult = isAudio 
        ? await uploadAudio(file.path)
        : await uploadImage(file.path);
      
      return {
        url: uploadResult.url,
        public_id: uploadResult.public_id,
        filename: uploadResult.filename,
        type: isAudio ? 'audio' : 'image'
      };
    }));

    // Combinăm atașamentele existente cu cele noi
    const existingAttachments = JSON.parse(req.body.existingAttachments || '[]');
    const attachments = [...existingAttachments, ...newAttachments];

    comment.content = content;
    comment.attachments = attachments;
    comment.isEdited = true;

    await comment.save();

    const updatedComment = await Comment.findById(comment._id)
      .populate('author', 'username profileImage')
      .populate({
        path: 'likes',
        select: 'username'
      });

    res.json(updatedComment);
  } catch (error) {
    res.status(500).json({ message: 'Eroare server', error: error.message });
  }
});

// DELETE ștergere comentariu
router.delete('/comments/:id', authenticate, isAuthor, async (req, res) => {
  try {
    const comment = req.resource;

    // Ștergem toate răspunsurile la acest comentariu
    await Comment.deleteMany({ parentComment: comment._id });
    
    // Ștergem notificările asociate
    await Notification.deleteMany({ comment: comment._id });

    // Ștergem comentariul
    await comment.delete();

    // Notificăm toți utilizatorii care vizualizează topicul despre ștergerea comentariului
    req.notificationHandler.sendCommentUpdate(comment.topic, comment, 'delete');

    res.json({ message: 'Comentariu șters cu succes' });
  } catch (error) {
    res.status(500).json({ message: 'Eroare server', error: error.message });
  }
});

// POST like/unlike comentariu
router.post('/comments/:id/like', authenticate, async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) {
      return res.status(404).json({ message: 'Comentariul nu a fost găsit' });
    }

    const userId = req.user._id;
    const hasLiked = comment.likes.includes(userId);

    if (hasLiked) {
      // Unlike
      comment.likes = comment.likes.filter(id => id.toString() !== userId.toString());
    } else {
      // Like
      comment.likes.push(userId);

      // Notificare pentru autorul comentariului
      if (comment.author.toString() !== userId.toString()) {
        const topic = await Topic.findById(comment.topic);
        const notification = new Notification({
          recipient: comment.author,
          type: 'like',
          topic: comment.topic,
          comment: comment._id,
          actor: userId,
          message: `${req.user.username} a apreciat comentariul tău la "${topic.title}"`
        });
        await notification.save();
        
        // Trimitem notificarea în timp real
        req.notificationHandler.sendNotification(comment.author, notification);
      }
    }

    await comment.save();

    const updatedComment = await Comment.findById(comment._id)
      .populate('author', 'username profileImage')
      .populate({
        path: 'likes',
        select: 'username'
      });

    res.json(updatedComment);
  } catch (error) {
    res.status(500).json({ message: 'Eroare server', error: error.message });
  }
});

// GET notificări pentru utilizatorul curent
router.get('/notifications', authenticate, async (req, res) => {
  try {
    const notifications = await Notification.find({ recipient: req.user._id })
      .sort({ createdAt: -1 })
      .populate('actor', 'username profileImage')
      .populate('topic', 'title')
      .limit(50);

    res.json(notifications);
  } catch (error) {
    res.status(500).json({ message: 'Eroare server', error: error.message });
  }
});

// PUT marchează notificarea ca citită
router.put('/notifications/:id/read', authenticate, async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, recipient: req.user._id },
      { read: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ message: 'Notificarea nu a fost găsită' });
    }

    res.json(notification);
  } catch (error) {
    res.status(500).json({ message: 'Eroare server', error: error.message });
  }
});

// PUT marchează toate notificările ca citite
router.put('/notifications/read-all', authenticate, async (req, res) => {
  try {
    await Notification.updateMany(
      { recipient: req.user._id, read: false },
      { read: true }
    );

    res.json({ message: 'Toate notificările au fost marcate ca citite' });
  } catch (error) {
    res.status(500).json({ message: 'Eroare server', error: error.message });
  }
});

module.exports = router; 