import React, { useEffect, useRef } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { Box, Button, Dialog, DialogContent, DialogTitle, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

interface QRScannerProps {
  open: boolean;
  onClose: () => void;
  onScanSuccess: (decodedText: string) => void;
}

const QRScanner: React.FC<QRScannerProps> = ({ open, onClose, onScanSuccess }) => {
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);

  useEffect(() => {
    if (open) {
      // Add a small delay to ensure the DOM element is mounted
      const timer = setTimeout(() => {
        const element = document.getElementById('qr-reader');
        if (element) {
          // Initialize scanner when dialog opens and element exists
          scannerRef.current = new Html5QrcodeScanner(
            'qr-reader',
            {
              fps: 10,
              qrbox: { width: 250, height: 250 },
              aspectRatio: 1.0,
            },
            false
          );

          scannerRef.current.render(
            (decodedText) => {
              // Stop scanning after successful scan
              scannerRef.current?.clear();
              onScanSuccess(decodedText);
              onClose();
            },
            (error) => {
              // Handle scan errors silently
              console.warn(`QR Code scan error: ${error}`);
            }
          );
        }
      }, 100); // 100ms delay

      return () => {
        clearTimeout(timer);
        if (scannerRef.current) {
          scannerRef.current.clear();
          scannerRef.current = null;
        }
      };
    }
  }, [open, onClose, onScanSuccess]);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>
        Scan QR Code
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        <Box sx={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center',
          gap: 2,
          p: 2
        }}>
          <div id="qr-reader" style={{ width: '100%', minHeight: '300px' }} />
          <Button 
            variant="contained" 
            onClick={onClose}
            sx={{ mt: 2 }}
          >
            Cancel
          </Button>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default QRScanner; 