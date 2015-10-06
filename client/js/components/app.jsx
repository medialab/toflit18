/**
 * TOFLIT18 Client Application Component
 * ======================================
 *
 * Root component for the application.
 */
import React from 'react';
import NavBar from './navbar.jsx';

export default function App({children}) {
  return (
    <div id="main">
      <NavBar />
      <main className="container">
        {children}
      </main>
    </div>
  );
}
