import React from 'react';
import { Button } from '@trussworks/react-uswds';

type CmmButtonProps = React.ComponentProps<typeof Button> & {
  variant?: 'primary' | 'gold';
};

export const CmmButton = ({ 
  children, 
  className, 
  variant = 'primary', 
  ...props 
}: CmmButtonProps) => {

  // The 'cmm-button' class provides a hook for targeted overrides
  const baseClasses = 'cmm-button';

  const variantClasses = 
    variant === 'gold' 
      ? 'cmm-button--gold text-black' // Style is now handled in index.css
      : 'bg-cmm-color-brand-primary hover:bg-uswds-color-blue-70';

  return (
    <Button
      className={`${baseClasses} ${variantClasses} ${className || ''}`}
      {...props}
    >
      {children}
    </Button>
  );
};