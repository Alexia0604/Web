import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Container, Typography, Button, TextField, Grid, Card, CardContent, Chip, IconButton, Menu, MenuItem } from '@mui/material';
import { Add as AddIcon, Search as SearchIcon, Sort as SortIcon, MoreVert as MoreVertIcon } from '@mui/icons-material';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { formatDistanceToNow } from 'date-fns';
import { ro } from 'date-fns/locale';

// Configurare axios
axios.defaults.baseURL = 'http://localhost:5000';

const Forum = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState('');
  const [sortBy, setSortBy] = useState('lastActivity');
  const [sortOrder, setSortOrder] = useState('desc');
  const [anchorEl, setAnchorEl] = useState(null);

  // Încărcare topicuri
  const fetchTopics = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page,
        limit: 10,
        sortBy,
        sortOrder,
        ...(searchQuery && { search: searchQuery }),
        ...(selectedTag && { tag: selectedTag })
      });

      const response = await axios.get(`/api/forum/topics?${params}`);
      setTopics(response.data.topics);
      setTotalPages(response.data.totalPages);
    } catch (err) {
      setError('Eroare la încărcarea topicurilor');
      console.error('Eroare:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTopics();
  }, [page, searchQuery, selectedTag, sortBy, sortOrder]);

  // Handlers
  const handleSearch = (event) => {
    setSearchQuery(event.target.value);
    setPage(1);
  };

  const handleTagClick = (tag) => {
    setSelectedTag(tag === selectedTag ? '' : tag);
    setPage(1);
  };

  const handleSortClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleSortClose = () => {
    setAnchorEl(null);
  };

  const handleSortSelect = (sortOption) => {
    setSortBy(sortOption);
    handleSortClose();
    setPage(1);
  };

  const handleCreateTopic = () => {
    navigate('/forum/new-topic');
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header și controale */}
      <Box sx={{ mb: 4 }}>
        <Grid container spacing={2} alignItems="center" justifyContent="space-between">
          <Grid size={6}>
            <Typography variant="h4" component="h1" gutterBottom>
              Forum Discuții
            </Typography>
          </Grid>
          <Grid size={6} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            {user && (
              <Button
                variant="contained"
                color="primary"
                startIcon={<AddIcon />}
                onClick={handleCreateTopic}
              >
                Topic Nou
              </Button>
            )}
          </Grid>
        </Grid>

        {/* Bara de căutare și filtre */}
        <Grid container spacing={2} sx={{ mt: 2 }}>
          <Grid size={6}>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Caută topicuri..."
              value={searchQuery}
              onChange={handleSearch}
              InputProps={{
                startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />
              }}
            />
          </Grid>
          <Grid size={6} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Button
              startIcon={<SortIcon />}
              onClick={handleSortClick}
              variant="outlined"
            >
              Sortează
            </Button>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleSortClose}
            >
              <MenuItem onClick={() => handleSortSelect('lastActivity')}>
                Activitate Recentă
              </MenuItem>
              <MenuItem onClick={() => handleSortSelect('createdAt')}>
                Data Creării
              </MenuItem>
              <MenuItem onClick={() => handleSortSelect('views')}>
                Vizualizări
              </MenuItem>
            </Menu>
          </Grid>
        </Grid>
      </Box>

      {/* Lista de topicuri */}
      {loading ? (
        <Typography>Se încarcă...</Typography>
      ) : error ? (
        <Typography color="error">{error}</Typography>
      ) : (
        <Grid container spacing={2}>
          {topics.map((topic) => (
            <Grid size={12} key={topic._id}>
              <Card 
                sx={{ 
                  cursor: 'pointer',
                  '&:hover': { bgcolor: 'action.hover' }
                }}
                onClick={() => navigate(`/forum/topic/${topic._id}`)}
              >
                <CardContent>
                  <Grid container spacing={2}>
                    <Grid size={8}>
                      <Typography variant="h6" gutterBottom>
                        {topic.title}
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                        {topic.tags.map((tag) => (
                          <Chip
                            key={tag}
                            label={tag}
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleTagClick(tag);
                            }}
                            sx={{ cursor: 'pointer' }}
                          />
                        ))}
                      </Box>
                      <Typography variant="body2" color="text.secondary">
                        de {topic.author.username} •{' '}
                        {formatDistanceToNow(new Date(topic.createdAt), { 
                          addSuffix: true,
                          locale: ro 
                        })}
                      </Typography>
                    </Grid>
                    <Grid size={4} sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
                      <Box sx={{ textAlign: 'right' }}>
                        <Typography variant="body2" color="text.secondary">
                          {topic.views} vizualizări • {topic.commentCount} comentarii
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Ultima activitate:{' '}
                          {formatDistanceToNow(new Date(topic.lastActivity), {
                            addSuffix: true,
                            locale: ro
                          })}
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Paginare */}
      <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center', gap: 2 }}>
        <Button
          disabled={page === 1}
          onClick={() => setPage(p => p - 1)}
        >
          Anterior
        </Button>
        <Typography sx={{ alignSelf: 'center' }}>
          Pagina {page} din {totalPages}
        </Typography>
        <Button
          disabled={page === totalPages}
          onClick={() => setPage(p => p + 1)}
        >
          Următor
        </Button>
      </Box>
    </Container>
  );
};

export default Forum; 