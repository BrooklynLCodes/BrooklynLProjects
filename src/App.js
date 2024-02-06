import './App.css';
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import CalendarWithEvents from './CalendarWithEvents';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/:year/:month" element={<CalendarWithEvents />} />
        <Route path="/" element={<Navigate replace to={`/${new Date().getFullYear()}/${new Date().getMonth() + 1}`} />} />
        <Route path="*" element={<Navigate replace to={`/${new Date().getFullYear()}/${new Date().getMonth() + 1}`} />} />
      </Routes>
    </Router>
  );
}

export default App;
