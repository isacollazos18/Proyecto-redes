import React from 'react';
import { Routes, Route } from 'react-router-dom';
import UserPage from './Components/Users/UserPage';

function AppRouter() {
    return (
        <Routes>
            <Route path="/" element={<UserPage />} />
        </Routes>
    );
}

export default AppRouter;

