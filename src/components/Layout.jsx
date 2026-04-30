import React from 'react';
import Header from './Header';

const Layout = ({ children }) => {
  return (
    <div className="app-layout">
      <Header />
      <main className="main-content">
        {children}
      </main>
      <footer className="footer">
        <p>© 2026 Мой магазин лампочек. Все права защищены.</p>
      </footer>
    </div>
  );
};

export default Layout;
