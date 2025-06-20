import { Close as CloseIcon } from '@mui/icons-material';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Typography
} from '@mui/material';
import React from 'react';
import { MBTI_STYLES } from '../theme/mbtiTheme';

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
        sx: MBTI_STYLES.modalPaper
      }}
    >
      <DialogTitle sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        pb: 1,
        ...MBTI_STYLES.modalDivider
      }}>
        <Typography variant="h6" component="div" sx={{ fontWeight: 'bold' }}>
          {title}
        </Typography>
        <IconButton
          onClick={onClose}
          size="small"
          sx={MBTI_STYLES.iconButton}
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
          sx={MBTI_STYLES.primaryButton}
        >
          Got it
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default InfoModal;
