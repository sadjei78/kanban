import React, { useState } from 'react';
import { Card as MuiCard, CardContent, Typography, Chip, IconButton, Box, Stack, Dialog, DialogTitle, DialogActions, Button, Tooltip } from '@mui/material';
import { format } from 'date-fns';
import { Card as CardType } from '../types';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import CloseIcon from '@mui/icons-material/Close';

interface CardProps {
  card: CardType;
  onMinimize: (id: string) => void;
  onTitleClick?: () => void;
  onDoubleClick?: () => void;
  onDelete?: (id: string) => void;
}

const categoryColors: Record<string, string> = {
  'Personal': '#81C784', // lighter green
  'Work: CHS': '#2196F3',
  'Work: Cargill': '#FF9800',
  'Work: RBA': '#9C27B0',
  'Work: Other': '#607D8B',
  'Church': 'forestgreen',
  'AGLOW': '#00BCD4',
  'Other': '#795548',
  'Politics': '#000080', // navy blue
  'Urgent': '#FF0000', // red
  'CHAT': '#F5F5DC', // beige
};

export const Card: React.FC<CardProps> = ({ card, onMinimize, onTitleClick, onDoubleClick, onDelete }) => {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const isExtraCompact = card.isMinimized && (card.status === 'Complete' || card.status === 'Archived');

  // Tooltip for minimized cards in Complete/Archived
  const showTooltip = isExtraCompact;
  const closedDate = card.updatedDate ? format(new Date(card.updatedDate), 'MMM dd, yyyy') : '';
  const tooltipTitle = (
    <Box>
      <Typography variant="subtitle2" fontWeight={700}>{card.title}</Typography>
      <Typography variant="body2" sx={{ whiteSpace: 'pre-line' }}>{card.description}</Typography>
      <Typography variant="caption" color="text.secondary">
        {card.status === 'Complete' ? 'Completed' : 'Archived'}: {closedDate}
      </Typography>
    </Box>
  );

  const cardContent = (
    <MuiCard 
      sx={{ 
        mb: 2,
        backgroundColor: '#fff',
        position: 'relative',
        '&:hover': {
          boxShadow: 3,
        },
        ...(card.isMinimized && {
          minHeight: 48,
          maxHeight: 56,
          p: 0.5,
          display: 'flex',
          alignItems: 'flex-start',
        }),
        ...(isExtraCompact && {
          width: '44%',
          minWidth: 60,
          maxWidth: 90,
          m: '3px',
        }),
        borderLeft: `6px solid ${categoryColors[card.category]}`,
      }}
      onDoubleClick={onDoubleClick}
    >
      {/* Top right controls */}
      {card.isMinimized ? (
        <Box sx={{ position: 'absolute', top: 2, right: 2, zIndex: 2, display: 'flex', gap: 0.25 }}>
          <IconButton size="small" sx={{ p: 0.25 }} onClick={() => onMinimize(card.id)}>
            {card.isMinimized ? <AddIcon fontSize="inherit" /> : <RemoveIcon fontSize="inherit" />}
          </IconButton>
          <IconButton size="small" sx={{ p: 0.25 }} color="error" onClick={() => setConfirmOpen(true)}>
            <CloseIcon fontSize="inherit" />
          </IconButton>
        </Box>
      ) : (
        <Box sx={{ position: 'absolute', top: 2, right: 2, zIndex: 2, display: 'flex', gap: 0.25 }}>
          <IconButton size="small" sx={{ p: 0.25 }} onClick={() => onMinimize(card.id)}>
            <RemoveIcon fontSize="inherit" />
          </IconButton>
          <IconButton size="small" sx={{ p: 0.25 }} color="error" onClick={() => setConfirmOpen(true)}>
            <CloseIcon fontSize="inherit" />
          </IconButton>
        </Box>
      )}
      <CardContent
        sx={{
          p: card.isMinimized ? 0.5 : 2,
          display: 'flex',
          flexDirection: card.isMinimized ? 'column' : 'column',
          alignItems: card.isMinimized ? 'flex-start' : 'flex-start',
          justifyContent: 'flex-start',
          minHeight: card.isMinimized ? 0 : undefined,
        }}
      >
        {card.isMinimized ? (
          <>
            <Box sx={{ width: '100%', mt: 3, mb: isExtraCompact ? 0 : 0.5 }}>
              <Typography
                variant={isExtraCompact ? 'caption' : 'subtitle2'}
                component="div"
                sx={{
                  cursor: onTitleClick ? 'pointer' : 'default',
                  fontWeight: 500,
                  fontSize: isExtraCompact ? '0.6rem' : '0.95rem',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  maxWidth: isExtraCompact ? 40 : 120,
                }}
                onClick={onTitleClick}
                title={card.title}
              >
                {card.title}
              </Typography>
            </Box>
            {card.isMinimized && isExtraCompact ? null : (
              <Stack direction="row" spacing={0.5} sx={{ ml: 0 }}>
                <Chip
                  label={card.category}
                  size="small"
                  sx={{
                    backgroundColor: categoryColors[card.category],
                    color: 'white',
                    fontSize: isExtraCompact ? '0.6rem' : '0.7rem',
                    height: isExtraCompact ? 18 : 22,
                    minWidth: isExtraCompact ? 36 : undefined,
                  }}
                />
                <Chip
                  label={`P${card.priority}`}
                  size="small"
                  color="primary"
                  sx={{ fontSize: isExtraCompact ? '0.6rem' : '0.7rem', height: isExtraCompact ? 18 : 22, minWidth: isExtraCompact ? 28 : undefined }}
                />
                {card.tags.map((tag, index) => (
                  <Chip key={index} label={tag} size="small" variant="outlined" sx={{ fontSize: isExtraCompact ? '0.6rem' : '0.7rem', height: isExtraCompact ? 18 : 22, minWidth: isExtraCompact ? 28 : undefined }} />
                ))}
              </Stack>
            )}
          </>
        ) : (
          <>
            <Box display="flex" alignItems="center" flexGrow={1} sx={{ minWidth: 0 }}>
              <Typography
                variant="h6"
                component="div"
                sx={{
                  cursor: onTitleClick ? 'pointer' : 'default',
                  fontWeight: 700,
                  whiteSpace: 'normal', // allow wrapping
                  overflow: 'visible',
                  textOverflow: 'unset',
                  maxWidth: '100%',
                  wordBreak: 'break-word',
                }}
                onClick={onTitleClick}
                title={card.title}
              >
                {card.title}
              </Typography>
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              {card.description}
            </Typography>
            <Box sx={{ mt: 1, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              <Chip
                label={card.category}
                size="small"
                sx={{
                  backgroundColor: categoryColors[card.category],
                  color: 'white',
                }}
              />
              <Chip
                label={`Priority: ${card.priority}`}
                size="small"
                color="primary"
              />
              {card.tags.map((tag, index) => (
                <Chip key={index} label={tag} size="small" variant="outlined" />
              ))}
            </Box>
            <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
              Due: {format(new Date(card.dueDate), 'MMM dd, yyyy')}
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
              Created: {format(new Date(card.createdDate), 'MMM dd, yyyy')}
            </Typography>
          </>
        )}
      </CardContent>
      {/* Delete confirmation dialog */}
      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
        <DialogTitle>Delete this card?</DialogTitle>
        <DialogActions>
          <Button onClick={() => setConfirmOpen(false)}>Cancel</Button>
          <Button color="error" onClick={() => { setConfirmOpen(false); onDelete && onDelete(card.id); }}>Delete</Button>
        </DialogActions>
      </Dialog>
    </MuiCard>
  );

  return showTooltip ? (
    <Tooltip title={tooltipTitle} arrow placement="top" enterDelay={300} leaveDelay={100}>
      <span>{cardContent}</span>
    </Tooltip>
  ) : cardContent;
}; 