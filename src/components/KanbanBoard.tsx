import React, { useState, useEffect, useRef } from 'react';
import { Box, Container, Paper, Button, Chip, Stack, Dialog, DialogTitle, DialogContent, DialogActions, TextField } from '@mui/material';
import { DragDropContext, DropResult } from 'react-beautiful-dnd';
import { Lane as LaneType, Card as CardType, SortOption, CategoryType } from '../types';
import { Lane } from './Lane';
import { AddCardDialog } from './AddCardDialog';
import { BulkUploadDialog } from './BulkUploadDialog';
import { Card as CardComponent } from './Card';
import CryptoJS from 'crypto-js';
// @ts-ignore
import QRCode from 'qrcode.react';
// @ts-ignore
import QrReaderImport from 'react-qr-reader';
const QrReader: React.FC<any> = QrReaderImport as any;

const initialLanes: LaneType[] = [
  { id: 'Backlog', title: 'Backlog', cards: [] },
  { id: 'In Progress', title: 'In Progress', cards: [] },
  { id: 'On Hold', title: 'On Hold', cards: [] },
  { id: 'Complete', title: 'Complete', cards: [] },
  { id: 'Archived', title: 'Archived', cards: [] },
];

function generateId() {
  return Math.random().toString(36).substr(2, 9);
}

const LOCAL_STORAGE_KEY = 'kanban-board-lanes';

const categoryColors: Record<string, string> = {
  'Personal': '#81C784',
  'Work: CHS': '#2196F3',
  'Work: Cargill': '#FF9800',
  'Work: RBA': '#9C27B0',
  'Work: Other': '#607D8B',
  'Church': 'forestgreen',
  'Other: Aglow': '#00BCD4',
  'Other': '#795548',
  'Politics': '#000080',
  'Urgent': '#FF0000',
  'CHAT': '#F5F5DC',
};

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

const categorySortOrder: Record<CategoryType, number> = {
  'Personal': 0,
  'Church': 1,
  'Urgent': 2,
  'Work: CHS': 10,
  'Work: Cargill': 11,
  'Work: RBA': 12,
  'Work: Other': 13,
  'Politics': 14,
  'CHAT': 15,
  'Other: Aglow': 98,
  'Other': 99,
};

function isTeslaBrowser() {
  const ua = navigator.userAgent;
  return (
    ua.includes("Tesla") ||
    ua.includes("QtCarBrowser") ||
    ua.includes("QtWebEngine") ||
    (ua.includes("X11;") && ua.includes("Linux") && ua.includes("Chrome"))
  );
}

function getBrowserInfo() {
  const ua = navigator.userAgent;
  if (isTeslaBrowser()) {
    return "Tesla Browser";
  } else if (ua.indexOf("Chrome") > -1 && ua.indexOf("Edg") === -1 && ua.indexOf("OPR") === -1) {
    return "Chrome";
  } else if (ua.indexOf("Safari") > -1 && ua.indexOf("Chrome") === -1) {
    return "Safari";
  } else if (ua.indexOf("Firefox") > -1) {
    return "Firefox";
  } else if (ua.indexOf("Edg") > -1) {
    return "Edge";
  } else if (ua.indexOf("OPR") > -1) {
    return "Opera";
  } else {
    return "Other";
  }
}

export const KanbanBoard: React.FC = () => {
  const [lanes, setLanes] = useState<LaneType[]>(initialLanes);
  const [sortOption, setSortOption] = useState<SortOption>({
    field: 'priority',
    direction: 'asc',
  });
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editingCard, setEditingCard] = useState<CardType | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [bulkDialogOpen, setBulkDialogOpen] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState<CategoryType | null>(null);
  const [restoreUrlDialogOpen, setRestoreUrlDialogOpen] = useState(false);
  const [restoreUrl, setRestoreUrl] = useState('');
  const [restoreUrlError, setRestoreUrlError] = useState('');
  const [backupPasswordDialogOpen, setBackupPasswordDialogOpen] = useState(false);
  const [backupPassword, setBackupPassword] = useState('');
  const [restorePasswordDialogOpen, setRestorePasswordDialogOpen] = useState(false);
  const [restorePassword, setRestorePassword] = useState('');
  const [pendingRestoreData, setPendingRestoreData] = useState<string | null>(null);
  const [restorePasswordError, setRestorePasswordError] = useState('');
  const [qrDialogOpen, setQrDialogOpen] = useState(false);
  const [qrValue, setQrValue] = useState('');
  const [qrImportDialogOpen, setQrImportDialogOpen] = useState(false);
  const [qrImportError, setQrImportError] = useState('');

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      // Convert date strings back to Date objects, always assign Date
      parsed.forEach((lane: LaneType) => {
        lane.cards.forEach((card: CardType) => {
          card.dueDate = card.dueDate ? new Date(card.dueDate) : new Date();
          card.createdDate = card.createdDate ? new Date(card.createdDate) : new Date();
          card.updatedDate = card.updatedDate ? new Date(card.updatedDate) : new Date();
        });
      });
      setLanes(parsed);
    }
  }, []);

  // Save to localStorage whenever lanes change
  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(lanes));
  }, [lanes]);

  const handleDragEnd = (result: DropResult) => {
    const { source, destination } = result;

    if (!destination) return;

    const sourceLane = lanes.find(lane => lane.id === source.droppableId);
    const destLane = lanes.find(lane => lane.id === destination.droppableId);

    if (!sourceLane || !destLane) return;

    const newLanes = [...lanes];
    const [movedCard] = sourceLane.cards.splice(source.index, 1);
    movedCard.status = destLane.id;
    // Minimize if moved to Complete or Archived
    if (destLane.id === 'Complete' || destLane.id === 'Archived') {
      movedCard.isMinimized = true;
    } else if (destLane.id === 'In Progress') {
      movedCard.isMinimized = false;
    }
    destLane.cards.splice(destination.index, 0, movedCard);

    setLanes(newLanes);
  };

  const handleMinimizeCard = (cardId: string) => {
    setLanes(prevLanes => 
      prevLanes.map(lane => ({
        ...lane,
        cards: lane.cards.map(card =>
          card.id === cardId
            ? { ...card, isMinimized: !card.isMinimized }
            : card
        ),
      }))
    );
  };

  const handleAddCard = (card: {
    title: string;
    description: string;
    category: CategoryType;
    priority: number;
    tags: string[];
    dueDate: string;
  }) => {
    const newCard: CardType = {
      id: generateId(),
      title: card.title,
      description: card.description,
      category: categoryFilter || card.category,
      status: 'Backlog',
      priority: card.priority,
      tags: card.tags,
      comments: [],
      dueDate: card.dueDate ? new Date(card.dueDate) : new Date(),
      createdDate: new Date(),
      updatedDate: new Date(),
      isMinimized: false,
    };
    setLanes(prevLanes =>
      prevLanes.map(lane =>
        lane.id === 'Backlog'
          ? { ...lane, cards: [newCard, ...lane.cards] }
          : lane
      )
    );
  };

  // Edit card: open dialog with card data
  const handleEditCard = (card: CardType) => {
    setEditingCard(card);
  };

  // Update card in the correct lane
  const handleUpdateCard = (updated: {
    title: string;
    description: string;
    category: CategoryType;
    priority: number;
    tags: string[];
    dueDate: string;
  }) => {
    setLanes(prevLanes =>
      prevLanes.map(lane => ({
        ...lane,
        cards: lane.cards.map(card =>
          card.id === editingCard?.id
            ? {
                ...card,
                ...updated,
                dueDate: updated.dueDate ? new Date(updated.dueDate) : new Date(),
                updatedDate: new Date(),
              }
            : card
        ),
      }))
    );
    setEditingCard(null);
  };

  // Minimize all cards in a lane
  const handleMinimizeAllInLane = (laneId: string) => {
    setLanes(prevLanes =>
      prevLanes.map(lane =>
        lane.id === laneId
          ? { ...lane, cards: lane.cards.map(card => ({ ...card, isMinimized: true })) }
          : lane
      )
    );
  };

  // Maximize all cards in a lane
  const handleMaximizeAllInLane = (laneId: string) => {
    setLanes(prevLanes =>
      prevLanes.map(lane =>
        lane.id === laneId
          ? { ...lane, cards: lane.cards.map(card => ({ ...card, isMinimized: false })) }
          : lane
      )
    );
  };

  // Delete a card by id
  const handleDeleteCard = (cardId: string) => {
    setLanes(prevLanes =>
      prevLanes.map(lane => ({
        ...lane,
        cards: lane.cards.filter(card => card.id !== cardId),
      }))
    );
  };

  // Backup: Download encrypted JSON or show QR for Tesla
  const handleBackup = () => {
    if (isTeslaBrowser()) {
      // For now, use the full board state as the QR content (stringified, encrypted)
      const dataStr = JSON.stringify(lanes, null, 2);
      setQrValue(dataStr);
      setQrDialogOpen(true);
    } else {
      setBackupPasswordDialogOpen(true);
    }
  };

  const doBackup = () => {
    const dataStr = JSON.stringify(lanes, null, 2);
    const encrypted = CryptoJS.AES.encrypt(dataStr, backupPassword).toString();
    const blob = new Blob([encrypted], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `kanban-backup-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setBackupPassword('');
    setBackupPasswordDialogOpen(false);
  };

  // Restore: Upload JSON (file)
  const handleRestore = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      setPendingRestoreData(event.target?.result as string);
      setRestorePasswordDialogOpen(true);
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // Restore: from URL
  const handleRestoreFromUrl = async () => {
    setRestoreUrlError('');
    let url = restoreUrl;
    if (url.startsWith('~')) {
      url = 'https://sadjei78.github.io/kanban/backups/' + url.slice(1);
    }
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error('Network response was not ok');
      const text = await response.text();
      setPendingRestoreData(text);
      setRestorePasswordDialogOpen(true);
    } catch (err) {
      setRestoreUrlError('Failed to fetch or parse JSON.');
    }
  };

  // Decrypt and restore
  const doRestore = () => {
    setRestorePasswordError('');
    try {
      const decrypted = CryptoJS.AES.decrypt(pendingRestoreData || '', restorePassword).toString(CryptoJS.enc.Utf8);
      if (!decrypted) throw new Error('Wrong password or corrupt file');
      const parsed = JSON.parse(decrypted);
      // Convert date strings back to Date objects
      parsed.forEach((lane: LaneType) => {
        lane.cards.forEach((card: CardType) => {
          card.dueDate = card.dueDate ? new Date(card.dueDate) : new Date();
          card.createdDate = card.createdDate ? new Date(card.createdDate) : new Date();
          card.updatedDate = card.updatedDate ? new Date(card.updatedDate) : new Date();
        });
      });
      setLanes(parsed);
      setRestorePassword('');
      setPendingRestoreData(null);
      setRestorePasswordDialogOpen(false);
      setRestoreUrlDialogOpen(false);
      setRestoreUrl('');
    } catch (err) {
      setRestorePasswordError('Failed to decrypt or parse JSON.');
    }
  };

  // Bulk upload handler
  const handleBulkUpload = (tasks: {
    title: string;
    description: string;
    category: CategoryType;
    priority: number;
    tags: string[];
    dueDate: string;
  }[]) => {
    setLanes(prevLanes =>
      prevLanes.map(lane =>
        lane.id === 'Backlog'
          ? {
              ...lane,
              cards: [
                ...((tasks.map(task => ({
                  id: generateId(),
                  title: task.title,
                  description: task.description,
                  category: task.category,
                  status: 'Backlog',
                  priority: task.priority,
                  tags: task.tags,
                  comments: [],
                  dueDate: task.dueDate ? new Date(task.dueDate) : new Date(),
                  createdDate: new Date(),
                  updatedDate: new Date(),
                  isMinimized: false,
                })) as unknown) as CardType[]),
                ...lane.cards,
              ],
            }
          : lane
      )
    );
  };

  // Filtered lanes/cards by category
  const filteredLanes = lanes.map(lane => ({
    ...lane,
    cards: categoryFilter ? lane.cards.filter(card => card.category === categoryFilter) : lane.cards,
  }));

  // QR Import handler
  const handleQrScan = (data: string | null) => {
    if (data) {
      try {
        const parsed = JSON.parse(data);
        // For now, replace the board state with the imported data
        parsed.forEach((lane: LaneType) => {
          lane.cards.forEach((card: CardType) => {
            card.dueDate = card.dueDate ? new Date(card.dueDate) : new Date();
            card.createdDate = card.createdDate ? new Date(card.createdDate) : new Date();
            card.updatedDate = card.updatedDate ? new Date(card.updatedDate) : new Date();
          });
        });
        setLanes(parsed);
        setQrImportDialogOpen(false);
        setQrImportError('');
      } catch (err) {
        setQrImportError('Invalid QR code data.');
      }
    }
  };
  const handleQrError = (err: any) => {
    setQrImportError('QR scan error.');
  };

  return (
    <Container maxWidth="xl" sx={{ py: 1 }}>
      <Stack direction="row" spacing={1} sx={{ mb: 1 }}>
        <Chip
          label="All"
          color={categoryFilter === null ? 'primary' : 'default'}
          onClick={() => setCategoryFilter(null)}
          variant={categoryFilter === null ? 'filled' : 'outlined'}
        />
        {categories
          .slice()
          .sort((a, b) => {
            const orderA = categorySortOrder[a] ?? 50;
            const orderB = categorySortOrder[b] ?? 50;
            if (orderA !== orderB) return orderA - orderB;
            return a.localeCompare(b);
          })
          .map(cat => (
            <Chip
              key={cat}
              label={cat}
              onClick={() => setCategoryFilter(cat)}
              sx={{ backgroundColor: categoryColors[cat], color: cat === 'CHAT' ? '#333' : 'white' }}
              variant={categoryFilter === cat ? 'filled' : 'outlined'}
            />
          ))}
      </Stack>
      <Box sx={{ mb: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Button variant="contained" color="primary" onClick={() => setAddDialogOpen(true)}>
          Add Card
        </Button>
        <Box>
          <Button variant="outlined" sx={{ mr: 1 }} onClick={handleBackup}>
            Backup
          </Button>
          <Button variant="outlined" component="label" sx={{ mr: 1 }}>
            Restore
            <input
              type="file"
              accept="application/json"
              hidden
              ref={fileInputRef}
              onChange={handleRestore}
            />
          </Button>
          <Button
            variant="outlined"
            sx={{ mr: 1 }}
            onClick={() => setRestoreUrlDialogOpen(true)}
          >
            Restore from URL
          </Button>
          <Button variant="outlined" onClick={() => setBulkDialogOpen(true)}>
            Bulk Upload
          </Button>
          {!isTeslaBrowser() && (
            <Button variant="outlined" sx={{ ml: 1 }} onClick={() => setQrImportDialogOpen(true)}>
              Scan QR to Import
            </Button>
          )}
        </Box>
      </Box>
      <Paper sx={{ p: 1, backgroundColor: '#f8f9fa' }}>
        <DragDropContext onDragEnd={handleDragEnd}>
          <Box
            sx={{
              display: 'flex',
              gap: 2,
              overflowX: 'auto',
              pb: 2,
              '&::-webkit-scrollbar': {
                height: '8px',
              },
              '&::-webkit-scrollbar-track': {
                backgroundColor: '#f1f1f1',
                borderRadius: '4px',
              },
              '&::-webkit-scrollbar-thumb': {
                backgroundColor: '#888',
                borderRadius: '4px',
                '&:hover': {
                  backgroundColor: '#555',
                },
              },
            }}
          >
            {filteredLanes.map(lane => (
              <Lane
                key={lane.id}
                lane={lane}
                onMinimizeCard={handleMinimizeCard}
                onEditCard={handleEditCard}
                onMinimizeAll={handleMinimizeAllInLane}
                onMaximizeAll={handleMaximizeAllInLane}
                onDeleteCard={handleDeleteCard}
                onAddCard={lane.id === 'Backlog' ? () => setAddDialogOpen(true) : undefined}
              />
            ))}
          </Box>
        </DragDropContext>
      </Paper>
      <AddCardDialog
        open={addDialogOpen}
        onClose={() => setAddDialogOpen(false)}
        onAdd={handleAddCard}
        defaultCategory={categoryFilter || undefined}
      />
      {editingCard && (
        <AddCardDialog
          open={!!editingCard}
          onClose={() => setEditingCard(null)}
          onAdd={handleUpdateCard}
          initialData={editingCard}
        />
      )}
      <BulkUploadDialog
        open={bulkDialogOpen}
        onClose={() => setBulkDialogOpen(false)}
        onUpload={handleBulkUpload}
      />
      {/* Backup password dialog */}
      <Dialog open={backupPasswordDialogOpen} onClose={() => setBackupPasswordDialogOpen(false)}>
        <DialogTitle>Enter Password to Encrypt Backup</DialogTitle>
        <DialogContent>
          <TextField
            label="Password"
            type="password"
            value={backupPassword}
            onChange={e => setBackupPassword(e.target.value)}
            fullWidth
            autoFocus
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setBackupPasswordDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={doBackup} disabled={!backupPassword}>Backup</Button>
        </DialogActions>
      </Dialog>
      {/* Restore password dialog */}
      <Dialog open={restorePasswordDialogOpen} onClose={() => setRestorePasswordDialogOpen(false)}>
        <DialogTitle>Enter Password to Decrypt Backup</DialogTitle>
        <DialogContent>
          <TextField
            label="Password"
            type="password"
            value={restorePassword}
            onChange={e => setRestorePassword(e.target.value)}
            fullWidth
            autoFocus
            error={!!restorePasswordError}
            helperText={restorePasswordError}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRestorePasswordDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={doRestore} disabled={!restorePassword}>Restore</Button>
        </DialogActions>
      </Dialog>
      <Dialog open={restoreUrlDialogOpen} onClose={() => setRestoreUrlDialogOpen(false)}>
        <DialogTitle>Restore from URL</DialogTitle>
        <DialogContent>
          <TextField
            label="Paste JSON URL"
            value={restoreUrl}
            onChange={e => setRestoreUrl(e.target.value)}
            fullWidth
            autoFocus
            error={!!restoreUrlError}
            helperText={restoreUrlError}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRestoreUrlDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleRestoreFromUrl} disabled={!restoreUrl}>Restore</Button>
        </DialogActions>
      </Dialog>
      {/* QR Code backup dialog for Tesla */}
      <Dialog open={qrDialogOpen} onClose={() => setQrDialogOpen(false)}>
        <DialogTitle>Scan to Backup (Tesla)</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', p: 2 }}>
            {/* @ts-ignore */}
            <QRCode value={qrValue} size={256} />
            <TextField
              label="QR Data (for copy/paste if needed)"
              value={qrValue}
              multiline
              fullWidth
              sx={{ mt: 2 }}
              InputProps={{ readOnly: true }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setQrDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
      {/* QR Import dialog for mobile/desktop */}
      <Dialog open={qrImportDialogOpen} onClose={() => setQrImportDialogOpen(false)}>
        <DialogTitle>Scan QR to Import Board</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', p: 2 }}>
            <QrReader
              delay={300}
              onError={handleQrError}
              onScan={handleQrScan}
              style={{ width: '100%' }}
            />
            {qrImportError && (
              <Box sx={{ color: 'red', mt: 2 }}>{qrImportError}</Box>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setQrImportDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}; 