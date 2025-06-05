import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  Box,
  Chip,
  Stack
} from '@mui/material';
import { CategoryType, Card as CardType } from '../types';
import { Card as CardComponent } from './Card';

const categories: CategoryType[] = [
  'Personal',
  'Work: CHS',
  'Work: Cargill',
  'Work: RBA',
  'Work: Other',
  'Church',
  'Other: Aglow',
  'Other',
  'Politics',
  'Urgent',
  'CHAT',
];

const categoryColors: Record<string, string> = {
  'Personal': '#81C784',
  'Work: CHS': '#2196F3',
  'Work: Cargill': '#FF9800',
  'Work: RBA': '#9C27B0',
  'Work: Other': '#607D8B',
  'Church': 'forestgreen',
  'AGLOW': '#00BCD4',
  'Other': '#795548',
  'Politics': '#000080',
  'Urgent': '#FF0000',
  'CHAT': '#F5F5DC',
};

interface AddCardDialogProps {
  open: boolean;
  onClose: () => void;
  onAdd: (card: {
    title: string;
    description: string;
    category: CategoryType;
    priority: number;
    tags: string[];
    dueDate: string;
  }) => void;
  initialData?: CardType;
  defaultCategory?: CategoryType;
}

export const AddCardDialog: React.FC<AddCardDialogProps> = ({ open, onClose, onAdd, initialData, defaultCategory }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<CategoryType>(defaultCategory || 'Personal');
  const [priority, setPriority] = useState(3);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [dueDate, setDueDate] = useState('');

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title);
      setDescription(initialData.description);
      setCategory(initialData.category);
      setPriority(initialData.priority);
      setTags(initialData.tags);
      setDueDate(initialData.dueDate ? new Date(initialData.dueDate).toISOString().slice(0, 10) : '');
    } else {
      setTitle('');
      setDescription('');
      setCategory(defaultCategory || 'Personal');
      setPriority(3);
      setTags([]);
      setDueDate('');
    }
  }, [initialData, open, defaultCategory]);

  const handleAddTag = () => {
    if (tagInput && !tags.includes(tagInput)) {
      setTags([...tags, tagInput]);
      setTagInput('');
    }
  };

  const handleDeleteTag = (tagToDelete: string) => {
    setTags(tags.filter(tag => tag !== tagToDelete));
  };

  const handleSubmit = () => {
    if (!title.trim()) return;
    onAdd({ title, description, category, priority, tags, dueDate });
    if (!initialData) {
      setTitle('');
      setDescription('');
      setCategory('Personal');
      setPriority(3);
      setTags([]);
      setTagInput('');
      setDueDate('');
    }
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <Box sx={{ borderTop: `20px solid ${categoryColors[category]}` }}>
        <DialogTitle>{initialData ? 'Edit Card' : 'Add New Card - ' + category}</DialogTitle>
      </Box>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <TextField
            label="Title"
            value={title}
            onChange={e => setTitle(e.target.value)}
            required
            fullWidth
          />
          <TextField
            label="Description"
            value={description}
            onChange={e => setDescription(e.target.value)}
            multiline
            minRows={2}
            fullWidth
          />
          <TextField
            select
            label="Category"
            value={category}
            onChange={e => setCategory(e.target.value as CategoryType)}
            fullWidth
          >
            {categories.map(cat => (
              <MenuItem key={cat} value={cat}>{cat}</MenuItem>
            ))}
          </TextField>
          <TextField
            label="Priority"
            type="number"
            inputProps={{ min: 1, max: 5 }}
            value={priority}
            onChange={e => setPriority(Number(e.target.value))}
            onKeyDown={e => {
              if (e.key === 'ArrowUp') {
                e.preventDefault();
                setPriority(prev => Math.max(1, prev - 1));
              } else if (e.key === 'ArrowDown') {
                e.preventDefault();
                setPriority(prev => Math.min(5, prev + 1));
              }
            }}
            fullWidth
          />
          <Box>
            <TextField
              label="Add Tag"
              value={tagInput}
              onChange={e => setTagInput(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddTag();
                }
              }}
              sx={{ width: '60%' }}
            />
            <Button onClick={handleAddTag} sx={{ ml: 1 }}>Add</Button>
            <Box sx={{ mt: 1 }}>
              {tags.map(tag => (
                <Chip
                  key={tag}
                  label={tag}
                  onDelete={() => handleDeleteTag(tag)}
                  sx={{ mr: 1, mb: 1 }}
                />
              ))}
            </Box>
          </Box>
          <TextField
            label="Due Date"
            type="date"
            value={dueDate}
            onChange={e => setDueDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
            fullWidth
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSubmit} variant="contained">{initialData ? 'Update' : 'Add'}</Button>
      </DialogActions>
    </Dialog>
  );
}; 