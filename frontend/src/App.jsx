import React from 'react';
import './App.css';
import AppRouter from './AppRouter';
import { BrowserRouter as Router } from 'react-router-dom';

function App() {
    return (
        <Router>
            <div>
                <AppRouter />
            </div>
        </Router>
    );
}

export default App;

