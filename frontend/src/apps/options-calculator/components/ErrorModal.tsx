import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Alert,
  Box,
} from '@mui/material';
import { Error as ErrorIcon, Refresh } from '@mui/icons-material';

interface ErrorModalProps {
  open: boolean;
  onClose: () => void;
  onRetry?: () => void;
  error: string;
  title?: string;
}

export const ErrorModal: React.FC<ErrorModalProps> = ({
  open,
  onClose,
  onRetry,
  error,
  title = 'Data Retrieval Failed',
}) => {
  const getErrorSuggestion = (errorMessage: string) => {
    if (errorMessage.includes('API key')) {
      return 'Please verify your API key is correct and has the necessary permissions.';
    }
    if (errorMessage.includes('404') || errorMessage.includes('endpoint')) {
      return 'Please check that your API endpoints are configured correctly and accessible.';
    }
    if (errorMessage.includes('CORS')) {
      return 'The API server needs to include proper CORS headers to allow browser requests.';
    }
    if (errorMessage.includes('network') || errorMessage.includes('fetch')) {
      return 'Please check your internet connection and that the API server is running.';
    }
    return 'Please verify your API configuration and try again.';
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <ErrorIcon color="error" />
        {title}
      </DialogTitle>
      
      <DialogContent>
        <Alert severity="error" sx={{ mb: 2 }}>
          <Typography variant="body2" component="div">
            <strong>Error Details:</strong>
            <Box component="pre" sx={{ 
              mt: 1, 
              p: 1, 
              bgcolor: 'grey.100', 
              borderRadius: 1,
              fontSize: '0.875rem',
              fontFamily: 'monospace',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word'
            }}>
              {error}
            </Box>
          </Typography>
        </Alert>

        <Alert severity="info">
          <Typography variant="body2">
            <strong>Suggested Solution:</strong><br />
            {getErrorSuggestion(error)}
          </Typography>
        </Alert>

        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
          If the problem persists, please:
        </Typography>
        <Typography variant="body2" color="text.secondary" component="ul" sx={{ mt: 1, pl: 2 }}>
          <li>Check your API endpoints are running and accessible</li>
          <li>Verify your API key has the correct permissions</li>
          <li>Ensure the API responses match the expected format</li>
          <li>Check the browser console for additional error details</li>
        </Typography>
      </DialogContent>
      
      <DialogActions>
        <Button onClick={onClose} color="primary">
          Close
        </Button>
        {onRetry && (
          <Button
            onClick={() => {
              onClose();
              onRetry();
            }}
            variant="contained"
            color="primary"
            startIcon={<Refresh />}
          >
            Retry
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};
