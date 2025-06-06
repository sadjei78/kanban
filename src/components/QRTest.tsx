import React, { useState } from 'react';
import { Box, Button, TextField, Typography, Tooltip, List, ListItem } from '@mui/material';
import QRScanner from './QRScanner';
import QRGenerator from './QRGenerator';
import { applyBoardDiff } from './KanbanBoard';
import type { Lane, LaneType, Card } from '../types';

const sampleBoard: Lane[] = [
  {
    id: 'Backlog' as LaneType,
    title: 'Backlog',
    cards: [
      {
        id: '1',
        title: 'Sample Card 1',
        description: 'Desc 1',
        category: 'Personal',
        status: 'Backlog',
        priority: 1,
        tags: [],
        comments: [],
        dueDate: new Date(),
        createdDate: new Date(),
        updatedDate: new Date(),
        isMinimized: false,
      },
    ],
  },
  {
    id: 'In Progress' as LaneType,
    title: 'In Progress',
    cards: [],
  },
  {
    id: 'On Hold' as LaneType,
    title: 'On Hold',
    cards: [],
  },
  {
    id: 'Complete' as LaneType,
    title: 'Complete',
    cards: [],
  },
  {
    id: 'Archived' as LaneType,
    title: 'Archived',
    cards: [],
  },
];

function flattenCards(lanes: Lane[]): Card[] {
  return lanes.flatMap(lane => lane.cards);
}

const QRTest: React.FC = () => {
  const [scannerOpen, setScannerOpen] = useState(false);
  const [generatorOpen, setGeneratorOpen] = useState(false);
  const [qrData, setQrData] = useState('Test QR Code Data');
  const [scannedData, setScannedData] = useState('');
  const [mergedResult, setMergedResult] = useState<any>(null);

  const handleScanSuccess = (decodedText: string) => {
    setScannedData(decodedText);
    try {
      const diff = JSON.parse(decodedText);
      const merged = applyBoardDiff(sampleBoard, diff);
      setMergedResult(merged);
    } catch (e) {
      setMergedResult({ error: 'Invalid JSON or diff format' });
    }
  };

  return (
    <Box sx={{ p: 3, maxWidth: 600, mx: 'auto' }}>
      <Typography variant="h4" gutterBottom>
        QR Code Test
      </Typography>

      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          Generate QR Code
        </Typography>
        <TextField
          fullWidth
          label="QR Code Data"
          value={qrData}
          onChange={(e) => setQrData(e.target.value)}
          sx={{ mb: 2 }}
        />
        <Button 
          variant="contained" 
          onClick={() => setGeneratorOpen(true)}
        >
          Show QR Code
        </Button>
      </Box>

      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          Scan QR Code
        </Typography>
        <Button 
          variant="contained" 
          onClick={() => setScannerOpen(true)}
          sx={{ mb: 2 }}
        >
          Open Scanner
        </Button>
        {scannedData && (
          <Typography>
            Scanned Data: {scannedData}
          </Typography>
        )}
        {mergedResult && Array.isArray(mergedResult) && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle2">Cards in Resulting Board:</Typography>
            <List dense>
              {flattenCards(mergedResult).map(card => (
                <Tooltip key={card.id} title={`Card ID: ${card.id}`} arrow>
                  <ListItem>
                    {card.title || '(No Title)'}
                  </ListItem>
                </Tooltip>
              ))}
            </List>
          </Box>
        )}
        {mergedResult && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle2">Resulting Board JSON:</Typography>
            <TextField
              value={JSON.stringify(mergedResult, null, 2)}
              multiline
              fullWidth
              minRows={8}
              InputProps={{ readOnly: true }}
            />
          </Box>
        )}
      </Box>

      <QRScanner
        open={scannerOpen}
        onClose={() => setScannerOpen(false)}
        onScanSuccess={handleScanSuccess}
      />

      <QRGenerator
        open={generatorOpen}
        onClose={() => setGeneratorOpen(false)}
        data={qrData}
      />
    </Box>
  );
};

export default QRTest; 