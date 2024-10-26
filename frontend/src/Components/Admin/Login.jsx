import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Login = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(''); // Estado para manejar errores
    const logo = "path/to/logo.png"; // Cambia esta ruta por la ubicación de tu logo

    const handleLogin = (event) => {
        event.preventDefault();

        // Simulación de inicio de sesión sin conexión a base de datos
        if (email === 'test@example.com' && password === '123456') {
            console.log('Inicio de sesión exitoso');
            navigate('/'); // Redirige al usuario después de la simulación de inicio de sesión
        } else {
            console.error('Credenciales inválidas');
            setError('Credenciales inválidas. Por favor, verifica tu correo y contraseña.');
        }
    };

    const redirectToRegister = (event) => {
        event.preventDefault();
        navigate('/register');
    };

    return (
        <div className="login-wrapper">
            <div className='containerRegister'>
                <div className="header">
                    <h2>Iniciar Sesión</h2>
                    <img src={logo} alt="Logo" className="logo" />
                </div>
                <form className='formRegister' onSubmit={handleLogin}>
                    <div className='form-group'>
                        <input
                            type='email'
                            placeholder='Email'
                            id='email'
                            name='email'
                            autoComplete='email'
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                        <input
                            type='password'
                            placeholder='Password'
                            id='password'
                            name='password'
                            autoComplete='current-password'
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>
                    {error && <p className="error">{error}</p>}
                    <button type='submit' className='btnRegister'>Iniciar Sesión</button>
                </form>
                <div className='registerLink'>
                    No tienes cuenta <a href="#" onClick={redirectToRegister}>Registrarse</a>
                </div>
            </div>
        </div>
    );
}

export default Login
