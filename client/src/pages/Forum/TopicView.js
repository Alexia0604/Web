import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Paper,
  Avatar,
  Button,
  TextField,
  Chip,
  Divider,
  IconButton,
  Menu,
  MenuItem,
  Alert,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import {
  MoreVert as MoreVertIcon,
  ThumbUp as ThumbUpIcon,
  Reply as ReplyIcon,
  AttachFile as AttachFileIcon,
  Image as ImageIcon,
  AudioTrack as AudioTrackIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import { formatDistanceToNow } from 'date-fns';
import { ro } from 'date-fns/locale';
import io from 'socket.io-client';
import axios from 'axios';

const TopicView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [topic, setTopic] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [replyTo, setReplyTo] = useState(null);
  const [files, setFiles] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);
  const [selectedComment, setSelectedComment] = useState(null);
  const socketRef = useRef();
  const fileInputRef = useRef();

  // Inițializare Socket.IO
  useEffect(() => {
    socketRef.current = io(process.env.REACT_APP_API_URL);

    // Autentificare socket
    if (user) {
      socketRef.current.emit('authenticate', user._id);
    }

    // Abonare la actualizări pentru topic
    socketRef.current.emit('subscribeTopic', id);

    // Handler pentru actualizări de comentarii
    socketRef.current.on('commentUpdate', ({ action, comment }) => {
      if (action === 'add') {
        setComments(prevComments => [...prevComments, comment]);
      } else if (action === 'delete') {
        setComments(prevComments => 
          prevComments.filter(c => c._id !== comment._id)
        );
      }
    });

    return () => {
      socketRef.current.emit('unsubscribeTopic', id);
      socketRef.current.disconnect();
    };
  }, [id, user]);

  // Încărcare topic și comentarii
  useEffect(() => {
    const fetchTopic = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`/api/forum/topics/${id}`);
        setTopic(response.data.topic);
        setComments(response.data.comments);
      } catch (err) {
        setError('Eroare la încărcarea topicului');
        console.error('Eroare:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchTopic();
  }, [id]);

  // Handlers pentru meniu
  const handleMenuOpen = (event, comment) => {
    setMenuAnchorEl(event.currentTarget);
    setSelectedComment(comment);
  };

  const handleMenuClose = () => {
    setMenuAnchorEl(null);
    setSelectedComment(null);
  };

  // Handler pentru ștergere comentariu
  const handleDeleteComment = async () => {
    try {
      await axios.delete(`/api/forum/comments/${selectedComment._id}`);
      setComments(comments.filter(c => c._id !== selectedComment._id));
      handleMenuClose();
    } catch (err) {
      setError('Eroare la ștergerea comentariului');
      console.error('Eroare:', err);
    }
  };

  // Handler pentru like/unlike
  const handleLike = async (commentId) => {
    if (!user) {
      setError('Trebuie să fiți autentificat pentru a aprecia comentarii');
      return;
    }

    try {
      const response = await axios.post(`/api/forum/comments/${commentId}/like`);
      setComments(comments.map(c => 
        c._id === commentId ? response.data : c
      ));
    } catch (err) {
      setError('Eroare la actualizarea aprecierii');
      console.error('Eroare:', err);
    }
  };

  // Handler pentru selectare fișiere
  const handleFileSelect = (event) => {
    const selectedFiles = Array.from(event.target.files);
    setFiles([...files, ...selectedFiles]);
  };

  // Handler pentru ștergere fișier
  const handleRemoveFile = (index) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  // Handler pentru adăugare comentariu
  const handleAddComment = async (e) => {
    e.preventDefault();

    if (!user) {
      setError('Trebuie să fiți autentificat pentru a adăuga comentarii');
      return;
    }

    if (!newComment.trim()) {
      setError('Comentariul nu poate fi gol');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('content', newComment);
      if (replyTo) {
        formData.append('parentCommentId', replyTo._id);
      }
      
      files.forEach(file => {
        formData.append('files', file);
      });

      const response = await axios.post(
        `/api/forum/topics/${id}/comments`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      setComments([...comments, response.data]);
      setNewComment('');
      setFiles([]);
      setReplyTo(null);
    } catch (err) {
      setError('Eroare la adăugarea comentariului');
      console.error('Eroare:', err);
    }
  };

  if (loading) return <Typography>Se încarcă...</Typography>;
  if (error) return <Alert severity="error">{error}</Alert>;
  if (!topic) return <Alert severity="error">Topicul nu a fost găsit</Alert>;

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Buton înapoi */}
      <Button
        variant="outlined"
        onClick={() => navigate('/forum')}
        sx={{ mb: 2 }}
      >
        Înapoi la Topics
      </Button>

      {/* Topic header */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          {topic.title}
        </Typography>

        <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
          {topic.tags.map((tag) => (
            <Chip key={tag} label={tag} size="small" />
          ))}
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Avatar src={topic.author.profileImage} sx={{ mr: 1 }} />
          <Typography variant="body2" color="text.secondary">
            de {topic.author.username} •{' '}
            {formatDistanceToNow(new Date(topic.createdAt), {
              addSuffix: true,
              locale: ro
            })}
          </Typography>
        </Box>

        <Typography variant="body1" sx={{ mb: 2 }}>
          {topic.content}
        </Typography>

        {/* Atașamente topic */}
        {topic.attachments?.length > 0 && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              Atașamente:
            </Typography>
            <Grid container spacing={2}>
              {topic.attachments.map((attachment, index) => (
                <Grid item key={index}>
                  {attachment.type === 'image' ? (
                    <Box
                      component="img"
                      src={attachment.url}
                      alt={attachment.filename}
                      sx={{
                        maxWidth: '100%',
                        height: 'auto',
                        maxHeight: 200,
                        borderRadius: 1
                      }}
                    />
                  ) : (
                    <Box>
                      <audio controls>
                        <source src={attachment.url} type="audio/mpeg" />
                        Browserul dvs. nu suportă elementul audio.
                      </audio>
                    </Box>
                  )}
                </Grid>
              ))}
            </Grid>
          </Box>
        )}
      </Paper>

      {/* Secțiune comentarii */}
      <Typography variant="h6" gutterBottom>
        Comentarii ({comments.length})
      </Typography>

      {comments.map((comment) => (
        <Paper key={comment._id} sx={{ p: 2, mb: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Avatar src={comment.author.profileImage} sx={{ mr: 1 }} />
              <Typography variant="body2" color="text.secondary">
                {comment.author.username} •{' '}
                {formatDistanceToNow(new Date(comment.createdAt), {
                  addSuffix: true,
                  locale: ro
                })}
                {comment.isEdited && ' • editat'}
              </Typography>
            </Box>

            {user && (user._id === comment.author._id || user._id === topic.author._id) && (
              <>
                <IconButton
                  size="small"
                  onClick={(e) => handleMenuOpen(e, comment)}
                >
                  <MoreVertIcon />
                </IconButton>
                <Menu
                  anchorEl={menuAnchorEl}
                  open={Boolean(menuAnchorEl)}
                  onClose={handleMenuClose}
                >
                  <MenuItem onClick={handleDeleteComment}>
                    Șterge comentariul
                  </MenuItem>
                </Menu>
              </>
            )}
          </Box>

          <Typography variant="body1" sx={{ mb: 1 }}>
            {comment.content}
          </Typography>

          {/* Atașamente comentariu */}
          {comment.attachments?.length > 0 && (
            <Box sx={{ mt: 1 }}>
              <Grid container spacing={1}>
                {comment.attachments.map((attachment, index) => (
                  <Grid item key={index}>
                    {attachment.type === 'image' ? (
                      <Box
                        component="img"
                        src={attachment.url}
                        alt={attachment.filename}
                        sx={{
                          maxWidth: '100%',
                          height: 'auto',
                          maxHeight: 150,
                          borderRadius: 1
                        }}
                      />
                    ) : (
                      <Box>
                        <audio controls>
                          <source src={attachment.url} type="audio/mpeg" />
                          Browserul dvs. nu suportă elementul audio.
                        </audio>
                      </Box>
                    )}
                  </Grid>
                ))}
              </Grid>
            </Box>
          )}

          <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
            <Button
              size="small"
              startIcon={<ThumbUpIcon />}
              onClick={() => handleLike(comment._id)}
              color={comment.likes.includes(user?._id) ? 'primary' : 'inherit'}
            >
              {comment.likes.length}
            </Button>
            <Button
              size="small"
              startIcon={<ReplyIcon />}
              onClick={() => setReplyTo(comment)}
            >
              Răspunde
            </Button>
          </Box>

          {/* Răspunsuri la comentariu */}
          {comment.replies?.length > 0 && (
            <Box sx={{ ml: 4, mt: 2 }}>
              {comment.replies.map((reply) => (
                <Paper key={reply._id} sx={{ p: 2, mb: 1, bgcolor: 'grey.50' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Avatar src={reply.author.profileImage} sx={{ mr: 1, width: 24, height: 24 }} />
                    <Typography variant="body2" color="text.secondary">
                      {reply.author.username} •{' '}
                      {formatDistanceToNow(new Date(reply.createdAt), {
                        addSuffix: true,
                        locale: ro
                      })}
                    </Typography>
                  </Box>
                  <Typography variant="body2">{reply.content}</Typography>
                </Paper>
              ))}
            </Box>
          )}
        </Paper>
      ))}

      {/* Formular adăugare comentariu */}
      {user ? (
        <Paper sx={{ p: 2 }}>
          {replyTo && (
            <Box sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                Răspuns la comentariul lui {replyTo.author.username}
              </Typography>
              <IconButton size="small" onClick={() => setReplyTo(null)}>
                <CloseIcon />
              </IconButton>
            </Box>
          )}

          <form onSubmit={handleAddComment}>
            <TextField
              fullWidth
              multiline
              rows={3}
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Adaugă un comentariu..."
              sx={{ mb: 2 }}
            />

            <Box sx={{ mb: 2 }}>
              <input
                type="file"
                ref={fileInputRef}
                multiple
                onChange={handleFileSelect}
                style={{ display: 'none' }}
                accept="image/*,audio/*"
              />
              <Button
                variant="outlined"
                startIcon={<AttachFileIcon />}
                onClick={() => fileInputRef.current.click()}
                sx={{ mr: 1 }}
              >
                Atașează Fișiere
              </Button>

              <Box sx={{ mt: 1 }}>
                {files.map((file, index) => (
                  <Chip
                    key={index}
                    label={file.name}
                    onDelete={() => handleRemoveFile(index)}
                    sx={{ m: 0.5 }}
                  />
                ))}
              </Box>
            </Box>

            <Button
              type="submit"
              variant="contained"
              color="primary"
            >
              Adaugă Comentariu
            </Button>
          </form>
        </Paper>
      ) : (
        <Alert severity="info">
          Trebuie să fiți autentificat pentru a adăuga comentarii.
        </Alert>
      )}
    </Container>
  );
};

export default TopicView; 