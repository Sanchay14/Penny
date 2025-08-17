import React from 'react';
import { ReactNode } from 'react';

type AuthLayoutProps = {
  children: ReactNode;
};

function AuthLayout({ children }: AuthLayoutProps) {
  
  return (
    <div className="flex justify-center pt-40">

      {children}
    </div>
  );
}

export default AuthLayout;
