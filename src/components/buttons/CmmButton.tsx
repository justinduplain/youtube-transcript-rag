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

  const variantClasses = 
    variant === 'gold' 
      ? 'bg-cmm-color-brand-gold text-black hover:bg-yellow-400'
      : 'bg-cmm-color-brand-primary hover:bg-uswds-color-blue-70';

  return (
    <Button
      className={`${variantClasses} ${className || ''}`}
      {...props}
    >
      {children}
    </Button>
  );
};