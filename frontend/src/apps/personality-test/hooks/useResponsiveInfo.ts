import { createSignal, createMemo } from 'solid-js';

export const useResponsiveInfo = () => {
  // Simple mobile detection based on window width
  const isMobile = createMemo(() => {
    if (typeof window === 'undefined') return false;
    return window.innerWidth < 768; // md breakpoint equivalent
  });
  
  const [modalOpen, setModalOpen] = createSignal(false);
  const [modalContent, setModalContent] = createSignal({ title: '', description: '' });

  const showInfo = (title: string, description: string) => {
    if (isMobile()) {
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
