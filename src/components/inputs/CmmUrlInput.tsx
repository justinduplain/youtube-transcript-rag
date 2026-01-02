import React from 'react';
import { TextInput, Label, ErrorMessage, FormGroup } from '@trussworks/react-uswds';

interface CmmUrlInputProps extends React.ComponentProps<'input'> {
  id: string;
  label: string;
  error?: string;
  hint?: string;
}

export const CmmUrlInput = ({
  id,
  label,
  error,
  hint,
  className,
  ...props
}: CmmUrlInputProps) => {
  return (
    // FormGroup handles the red border logic automatically when error=true
    <FormGroup error={error ? 'true' : undefined} className={className}>
      
      <Label 
        htmlFor={id} 
        className="text-uswds-gray-90 font-bold" // Token usage
      >
        {label}
      </Label>

      {hint && (
        <span className="usa-hint text-uswds-gray-50 block mb-2">
          {hint}
        </span>
      )}

      {error && (
        <ErrorMessage id={`${id}-error-message`}>
          {error}
        </ErrorMessage>
      )}

      <TextInput
        id={id}
        name={id}
        type="url"
        aria-describedby={error ? `${id}-error-message` : undefined}
        // Tailwind utilities layer wins over USWDS defaults
        className="max-w-xl focus:ring-cmm-brand-primary" 
        error={error ? 'true' : undefined}
        {...props}
      />
    </FormGroup>
  );
};