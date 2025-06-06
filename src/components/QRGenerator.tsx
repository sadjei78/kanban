import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Box, Dialog, DialogContent, DialogTitle, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

interface QRGeneratorProps {
  open: boolean;
  onClose: () => void;
  data: string;
}

const QRGenerator: React.FC<QRGeneratorProps> = ({ open, onClose, data }) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>
        QR Code
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
          justifyContent: 'center', 
          alignItems: 'center',
          p: 4
        }}>
          <QRCodeSVG
            value={data}
            size={256}
            level="H"
            includeMargin={true}
            bgColor="#ffffff"
            fgColor="#000000"
          />
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default QRGenerator; 