import React from 'react';
import { Icon } from '@iconify/react';

interface IconifyIconProps {
  icon: string;
  width?: number;
  className?: string;
}

const IconifyIcon: React.FC<IconifyIconProps> = ({ icon, width = 20, className = '' }) => {
  return <Icon icon={icon} width={width} className={className} />;
};

export default IconifyIcon; 