import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import OnboardingFlow from './OnboardingFlow';

interface OnboardingGuardProps {
  children: React.ReactNode;
}

const OnboardingGuard: React.FC<OnboardingGuardProps> = ({ children }) => {
  const { user, completeOnboarding } = useAuth();

  // If user hasn't completed onboarding, show the onboarding flow
  if (user && !user.hasCompletedOnboarding) {
    return <OnboardingFlow onComplete={completeOnboarding} />;
  }

  // If user has completed onboarding, show the protected content
  return <>{children}</>;
};

export default OnboardingGuard;