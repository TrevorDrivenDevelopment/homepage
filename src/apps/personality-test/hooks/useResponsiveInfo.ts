import { useState } from 'react';
import { useMediaQuery, useTheme } from '@mui/material';

export const useResponsiveInfo = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [modalOpen, setModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState({ title: '', description: '' });

  const showInfo = (title: string, description: string) => {
    if (isMobile) {
      setModalContent({ title, description });
      setModalOpen(true);
    }
    // On desktop, tooltip will handle the display
  };

  const closeModal = () => {
    setModalOpen(false);
  };

  return {
    isMobile,
    modalOpen,
    modalContent,
    showInfo,
    closeModal
  };
};
