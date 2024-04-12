// PasswordResetParent.tsx
import React, { useState } from 'react';
import OTPInput from './OTPInput';
import PasswordReset from './PasswordReset';

export default function PasswordResetParent() {
  const [step, setStep] = useState(1);

  const handleStepChange = (nextStep: number) => {
    setStep(nextStep);
  };

  return (
    <div>
      {step === 1 && <OTPInput onNextStep={() => handleStepChange(2)} />}
      {step === 2 && <PasswordReset />}
    </div>
  );
}
