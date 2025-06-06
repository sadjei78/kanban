import React, { useState } from 'react';
import { Box, Button, TextField, Typography } from '@mui/material';
import QRScanner from './QRScanner';
import QRGenerator from './QRGenerator';

const QRTest: React.FC = () => {
  const [scannerOpen, setScannerOpen] = useState(false);
  const [generatorOpen, setGeneratorOpen] = useState(false);
  const [qrData, setQrData] = useState('Test QR Code Data');
  const [scannedData, setScannedData] = useState('');

  const handleScanSuccess = (decodedText: string) => {
    setScannedData(decodedText);
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