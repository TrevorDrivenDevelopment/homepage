import React from 'react';
import { IconButton, Tooltip } from '@mui/material';
import { Info as InfoIcon } from '@mui/icons-material';

interface ResponsiveInfoIconProps {
  title: string;
  description: string;
  color?: string;
  isMobile: boolean;
  onShowInfo?: (title: string, description: string) => void;
}

const ResponsiveInfoIcon: React.FC<ResponsiveInfoIconProps> = ({
  title,
  description,
  color = '#7CE2FF',
  isMobile,
  onShowInfo
}) => {
  const handleClick = () => {
    if (isMobile && onShowInfo) {
      onShowInfo(title, description);
    }
  };

  if (isMobile) {
    return (
      <IconButton 
        size="small" 
        sx={{ p: 0.25, color }} 
        onClick={handleClick}
      >
        <InfoIcon fontSize="small" />
      </IconButton>
    );
  }

  return (
    <Tooltip title={description} arrow>
      <IconButton size="small" sx={{ p: 0.25, color }}>
        <InfoIcon fontSize="small" />
      </IconButton>
    </Tooltip>
  );
};

export default ResponsiveInfoIcon;
