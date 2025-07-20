import React, { ReactNode } from 'react';

type DashboardLayoutProps = {
  children: ReactNode;
};

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  return <div className="container mx-auto">{children}</div>;
};

export default DashboardLayout;