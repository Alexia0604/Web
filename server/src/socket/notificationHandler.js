const Notification = require('../models/Notification');

class NotificationHandler {
  constructor(io) {
    this.io = io;
    this.userSockets = new Map(); // userId -> Set of socket ids
  }

  // Inițializare conexiune socket
  initialize() {
    this.io.on('connection', (socket) => {
      console.log('Client conectat:', socket.id);

      // Autentificare socket
      socket.on('authenticate', (userId) => {
        this.addUserSocket(userId, socket.id);
        socket.userId = userId;
        console.log(`Utilizator ${userId} autentificat pe socket ${socket.id}`);
      });

      // Deconectare
      socket.on('disconnect', () => {
        if (socket.userId) {
          this.removeUserSocket(socket.userId, socket.id);
        }
        console.log('Client deconectat:', socket.id);
      });
    });
  }

  // Adaugă socket pentru utilizator
  addUserSocket(userId, socketId) {
    if (!this.userSockets.has(userId)) {
      this.userSockets.set(userId, new Set());
    }
    this.userSockets.get(userId).add(socketId);
  }

  // Elimină socket pentru utilizator
  removeUserSocket(userId, socketId) {
    const userSocketSet = this.userSockets.get(userId);
    if (userSocketSet) {
      userSocketSet.delete(socketId);
      if (userSocketSet.size === 0) {
        this.userSockets.delete(userId);
      }
    }
  }

  // Trimite notificare către un utilizator
  async sendNotification(userId, notification) {
    const userSocketSet = this.userSockets.get(userId.toString());
    if (userSocketSet) {
      // Populăm notificarea cu informații despre actor
      const populatedNotification = await Notification.findById(notification._id)
        .populate('actor', 'username profileImage')
        .populate('topic', 'title');

      userSocketSet.forEach(socketId => {
        this.io.to(socketId).emit('notification', populatedNotification);
      });
    }
  }

  // Trimite actualizare pentru comentarii în timp real
  sendCommentUpdate(topicId, comment, action = 'add') {
    this.io.to(`topic_${topicId}`).emit('commentUpdate', {
      action,
      comment
    });
  }

  // Abonare la actualizări pentru un topic
  subscribeToTopic(socket, topicId) {
    socket.join(`topic_${topicId}`);
  }

  // Dezabonare de la actualizări pentru un topic
  unsubscribeFromTopic(socket, topicId) {
    socket.leave(`topic_${topicId}`);
  }
}

module.exports = NotificationHandler; 