import React from 'react';
import { Paper, Typography, Box, IconButton, Stack, Tooltip } from '@mui/material';
import { Droppable, Draggable } from 'react-beautiful-dnd';
import { Lane as LaneType, Card as CardType } from '../types';
import { Card } from './Card';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

interface LaneProps {
  lane: LaneType;
  onMinimizeCard: (cardId: string) => void;
  onEditCard: (card: CardType) => void;
  onMinimizeAll: (laneId: string) => void;
  onMaximizeAll: (laneId: string) => void;
  onDeleteCard: (cardId: string) => void;
  onAddCard?: () => void;
}

export const Lane: React.FC<LaneProps> = ({ lane, onMinimizeCard, onEditCard, onMinimizeAll, onMaximizeAll, onDeleteCard, onAddCard }) => {
  // Use row wrap for Complete and Archived lanes, column for others
  const isWrapLane = lane.id === 'Complete' || lane.id === 'Archived';
  const isBacklog = lane.id === 'Backlog';

  return (
    <Paper
      sx={{
        p: 2,
        minHeight: 'calc(100vh - 110px)',
        width: 300,
        backgroundColor: '#f5f5f5',
      }}
    >
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
        <Typography variant="h5" sx={{ fontWeight: 'bold', fontSize: '1.35rem', letterSpacing: 0.5 }}>
          {lane.title}
        </Typography>
        {lane.cards.length > 0 && (
          <Box display="flex" alignItems="center" justifyContent="flex-end">
            <Tooltip title="Minimize All">
              <IconButton size="small" onClick={() => onMinimizeAll(lane.id)}>
                <ExpandMoreIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Maximize All">
              <IconButton size="small" onClick={() => onMaximizeAll(lane.id)}>
                <ExpandLessIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        )}
      </Stack>
      <Droppable droppableId={lane.id}>
        {(provided) => (
          <Box
            ref={provided.innerRef}
            {...provided.droppableProps}
            sx={{
              minHeight: 'calc(100vh - 160px)',
              display: 'flex',
              flexDirection: isWrapLane ? 'row' : 'column',
              flexWrap: isWrapLane ? 'wrap' : 'nowrap',
              alignItems: isWrapLane ? 'flex-start' : 'stretch',
              gap: isWrapLane ? 0.5 : 0,
              cursor: isBacklog ? 'pointer' : 'default',
              position: 'relative',
            }}
            onDoubleClick={isBacklog && onAddCard ? onAddCard : undefined}
          >
            {lane.cards.map((card, index) => (
              <Draggable key={card.id} draggableId={card.id} index={index}>
                {(dragProvided) => (
                  <div
                    ref={dragProvided.innerRef}
                    {...dragProvided.draggableProps}
                    {...dragProvided.dragHandleProps}
                  >
                    <Card
                      card={card}
                      onMinimize={onMinimizeCard}
                      onTitleClick={() => onEditCard(card)}
                      onDoubleClick={() => onEditCard(card)}
                      onDelete={onDeleteCard}
                    />
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
            {isBacklog && onAddCard && (
              <Box
                sx={{
                  position: 'absolute',
                  left: 0,
                  right: 0,
                  bottom: 12,
                  textAlign: 'center',
                  color: '#888',
                  fontSize: '0.95rem',
                  opacity: 0.5,
                  pointerEvents: 'none',
                  userSelect: 'none',
                }}
              >
                Double-click to add card
              </Box>
            )}
          </Box>
        )}
      </Droppable>
    </Paper>
  );
}; 