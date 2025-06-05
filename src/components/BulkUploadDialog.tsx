import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  IconButton,
  MenuItem
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { CategoryType } from '../types';

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

interface BulkUploadDialogProps {
  open: boolean;
  onClose: () => void;
  onUpload: (tasks: {
    title: string;
    description: string;
    category: CategoryType;
    priority: number;
    tags: string[];
    dueDate: string;
  }[]) => void;
}

const emptyRow = {
  title: '',
  description: '',
  category: 'Personal' as CategoryType,
  priority: 3,
  tags: [] as string[],
  tagsInput: '',
  dueDate: '',
};

export const BulkUploadDialog: React.FC<BulkUploadDialogProps> = ({ open, onClose, onUpload }) => {
  const [rows, setRows] = useState([{ ...emptyRow }]);

  const handleChange = (idx: number, field: string, value: any) => {
    setRows(prev => prev.map((row, i) => i === idx ? { ...row, [field]: value } : row));
  };

  const handleTagsInput = (idx: number, value: string) => {
    setRows(prev => prev.map((row, i) => i === idx ? { ...row, tagsInput: value } : row));
  };

  const handleAddTag = (idx: number) => {
    setRows(prev => prev.map((row, i) => {
      if (i !== idx) return row;
      const tag = row.tagsInput.trim();
      if (!tag || row.tags.includes(tag)) return row;
      return { ...row, tags: [...row.tags, tag], tagsInput: '' };
    }));
  };

  const handleDeleteTag = (idx: number, tagToDelete: string) => {
    setRows(prev => prev.map((row, i) => i === idx ? { ...row, tags: row.tags.filter(t => t !== tagToDelete) } : row));
  };

  const handleAddRow = () => {
    setRows(prev => [...prev, { ...emptyRow }]);
  };

  const handleDeleteRow = (idx: number) => {
    setRows(prev => prev.length === 1 ? prev : prev.filter((_, i) => i !== idx));
  };

  const handleUpload = () => {
    const tasks = rows
      .filter(row => row.title.trim())
      .map(({ tagsInput, ...row }) => ({ ...row, tags: row.tags }));
    if (tasks.length) onUpload(tasks);
    setRows([{ ...emptyRow }]);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle>Bulk Upload Tasks</DialogTitle>
      <DialogContent>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Title</TableCell>
                <TableCell>Description</TableCell>
                <TableCell>Category</TableCell>
                <TableCell>Priority</TableCell>
                <TableCell>Tags</TableCell>
                <TableCell>Due Date</TableCell>
                <TableCell></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((row, idx) => (
                <TableRow key={idx}>
                  <TableCell>
                    <TextField
                      value={row.title}
                      onChange={e => handleChange(idx, 'title', e.target.value)}
                      size="small"
                      required
                    />
                  </TableCell>
                  <TableCell>
                    <TextField
                      value={row.description}
                      onChange={e => handleChange(idx, 'description', e.target.value)}
                      size="small"
                      multiline
                      minRows={1}
                    />
                  </TableCell>
                  <TableCell>
                    <TextField
                      select
                      value={row.category}
                      onChange={e => handleChange(idx, 'category', e.target.value as CategoryType)}
                      size="small"
                    >
                      {categories.map(cat => (
                        <MenuItem key={cat} value={cat}>{cat}</MenuItem>
                      ))}
                    </TextField>
                  </TableCell>
                  <TableCell>
                    <TextField
                      type="number"
                      inputProps={{ min: 1, max: 5 }}
                      value={row.priority}
                      onChange={e => handleChange(idx, 'priority', Number(e.target.value))}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <TextField
                      value={row.tagsInput || ''}
                      onChange={e => handleTagsInput(idx, e.target.value)}
                      onKeyDown={e => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddTag(idx);
                        }
                      }}
                      size="small"
                      placeholder="Add tag"
                      sx={{ width: 80 }}
                    />
                    {row.tags.map(tag => (
                      <Button
                        key={tag}
                        size="small"
                        variant="outlined"
                        sx={{ m: 0.25, fontSize: '0.7rem', minWidth: 0, px: 0.5 }}
                        onClick={() => handleDeleteTag(idx, tag)}
                      >
                        {tag} ×
                      </Button>
                    ))}
                  </TableCell>
                  <TableCell>
                    <TextField
                      type="date"
                      value={row.dueDate}
                      onChange={e => handleChange(idx, 'dueDate', e.target.value)}
                      size="small"
                      InputLabelProps={{ shrink: true }}
                    />
                  </TableCell>
                  <TableCell>
                    <IconButton onClick={() => handleDeleteRow(idx)} size="small" color="error">
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
              <TableRow>
                <TableCell colSpan={7} align="center">
                  <Button startIcon={<AddIcon />} onClick={handleAddRow} size="small">
                    Add Row
                  </Button>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleUpload} variant="contained">Upload</Button>
      </DialogActions>
    </Dialog>
  );
}; 