import React, { ReactNode } from 'react';

type MainLayoutProps = {
  children: ReactNode;
};

const MainLayout = ({ children }: MainLayoutProps) => {
  return <div className='pt-32 px-4'>{children}</div>;  
};

export default MainLayout;
