const mongoose = require('mongoose');

const topicSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  content: {
    type: String,
    required: true
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  attachments: [{
    url: String,
    public_id: String,
    filename: String,
    type: {
      type: String,
      enum: ['image', 'audio']
    }
  }],
  tags: [{
    type: String,
    trim: true
  }],
  views: {
    type: Number,
    default: 0
  },
  isLocked: {
    type: Boolean,
    default: false
  },
  isPinned: {
    type: Boolean,
    default: false
  },
  lastActivity: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexuri pentru căutare și sortare eficientă
topicSchema.index({ title: 'text', content: 'text' });
topicSchema.index({ createdAt: -1 });
topicSchema.index({ lastActivity: -1 });
topicSchema.index({ views: -1 });
topicSchema.index({ tags: 1 });

const Topic = mongoose.model('Topic', topicSchema);

module.exports = Topic; 