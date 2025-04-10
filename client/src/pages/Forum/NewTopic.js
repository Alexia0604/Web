import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  Paper,
  Chip,
  IconButton,
  Grid,
  Alert
} from '@mui/material';
import {
  Add as AddIcon,
  Close as CloseIcon,
  AttachFile as AttachFileIcon
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';

const NewTopic = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tag, setTag] = useState('');
  const [tags, setTags] = useState([]);
  const [files, setFiles] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Handler pentru adăugare tag
  const handleAddTag = () => {
    if (tag && !tags.includes(tag)) {
      setTags([...tags, tag]);
      setTag('');
    }
  };

  // Handler pentru ștergere tag
  const handleDeleteTag = (tagToDelete) => {
    setTags(tags.filter((t) => t !== tagToDelete));
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

  // Handler pentru submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!title.trim() || !content.trim()) {
      setError('Titlul și conținutul sunt obligatorii');
      return;
    }

    try {
      setLoading(true);
      setError('');

      const formData = new FormData();
      formData.append('title', title);
      formData.append('content', content);
      formData.append('tags', JSON.stringify(tags));
      
      files.forEach(file => {
        formData.append('files', file);
      });

      const response = await axios.post('/api/forum/topics', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      navigate(`/forum/topic/${response.data._id}`);
    } catch (err) {
      setError(err.response?.data?.message || 'A apărut o eroare la crearea topicului');
      console.error('Eroare:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="warning">
          Trebuie să fiți autentificat pentru a crea un topic nou.
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>
          Topic Nou
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Titlu"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            sx={{ mb: 2 }}
          />

          <TextField
            fullWidth
            label="Conținut"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
            multiline
            rows={6}
            sx={{ mb: 2 }}
          />

          {/* Secțiune pentru tag-uri */}
          <Box sx={{ mb: 2 }}>
            <Grid container spacing={1} alignItems="center">
              <Grid item xs>
                <TextField
                  fullWidth
                  label="Adaugă tag"
                  value={tag}
                  onChange={(e) => setTag(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddTag();
                    }
                  }}
                />
              </Grid>
              <Grid item>
                <Button
                  variant="outlined"
                  onClick={handleAddTag}
                  startIcon={<AddIcon />}
                >
                  Adaugă
                </Button>
              </Grid>
            </Grid>

            <Box sx={{ mt: 1, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {tags.map((tag) => (
                <Chip
                  key={tag}
                  label={tag}
                  onDelete={() => handleDeleteTag(tag)}
                />
              ))}
            </Box>
          </Box>

          {/* Secțiune pentru fișiere atașate */}
          <Box sx={{ mb: 2 }}>
            <input
              type="file"
              id="file-input"
              multiple
              onChange={handleFileSelect}
              style={{ display: 'none' }}
              accept="image/*,audio/*"
            />
            <label htmlFor="file-input">
              <Button
                variant="outlined"
                component="span"
                startIcon={<AttachFileIcon />}
              >
                Atașează Fișiere
              </Button>
            </label>

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

          {/* Butoane acțiuni */}
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
            <Button
              variant="outlined"
              onClick={() => navigate('/forum')}
              disabled={loading}
            >
              Anulează
            </Button>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={loading}
            >
              {loading ? 'Se creează...' : 'Creează Topic'}
            </Button>
          </Box>
        </form>
      </Paper>
    </Container>
  );
};

export default NewTopic; 