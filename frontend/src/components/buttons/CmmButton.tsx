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
      ? 'cmm-button--gold text-black'
      : 'bg-cmm-button-primary-background-default hover:bg-cmm-button-primary-background-hover text-cmm-button-primary-text';

  return (
    <Button
      className={`${baseClasses} ${variantClasses} ${className || ''}`}
      {...props}
    >
      {children}
    </Button>
  );
};