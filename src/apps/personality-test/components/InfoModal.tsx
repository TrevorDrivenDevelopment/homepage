import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  IconButton
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';

interface InfoModalProps {
  open: boolean;
  title: string;
  description: string;
  onClose: () => void;
}

const InfoModal: React.FC<InfoModalProps> = ({
  open,
  title,
  description,
  onClose
}) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          bgcolor: '#1E1E1E',
          color: '#FFFFFF',
          border: '1px solid #333'
        }
      }}
    >
      <DialogTitle sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        pb: 1,
        borderBottom: '1px solid #333'
      }}>
        <Typography variant="h6" component="div" sx={{ fontWeight: 'bold' }}>
          {title}
        </Typography>
        <IconButton
          onClick={onClose}
          size="small"
          sx={{ 
            color: '#7CE2FF',
            '&:hover': {
              backgroundColor: 'rgba(124, 226, 255, 0.1)'
            }
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      
      <DialogContent sx={{ pt: 2 }}>
        <Typography variant="body1" sx={{ lineHeight: 1.6 }}>
          {description}
        </Typography>
      </DialogContent>
      
      <DialogActions sx={{ p: 2, pt: 1 }}>
        <Button 
          onClick={onClose}
          variant="contained"
          sx={{
            bgcolor: '#7CE2FF',
            color: '#000',
            '&:hover': {
              bgcolor: '#5DCBF0'
            }
          }}
        >
          Got it
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default InfoModal;
