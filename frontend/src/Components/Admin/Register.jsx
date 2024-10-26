import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Register = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [rol, setRol] = useState('user'); // Define un estado inicial para `rol`

    const handleRegister = (event) => {
        event.preventDefault();
        
        // Simulación de registro sin conexión
        console.log('Simulando registro del usuario:', {
            email,
            password,
            rol
        });
        
        // Redirecciona a la página de inicio después del "registro"
        navigate('/');
    };

    const redirectToLogin = (event) => {
        event.preventDefault();
        navigate('/login'); // Redirecciona a la página de login
    };

    return (
        <div>
            <div className="login-wrapper">
                <div className='containerRegister'>
                    <div className="header">
                        <h2>Registrar usuario</h2>
                        <img src={logo} alt="Logo" className="logo" />
                    </div>
                    <form className='formRegister' onSubmit={handleRegister}>
                        <div className='form-group'>
                            <input
                                type='email'
                                placeholder='Email'
                                id='email'
                                name='email'
                                autoComplete='off'
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                            <input
                                type='password'
                                placeholder='Password'
                                id='password'
                                name='password'
                                autoComplete='off'
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                            <label>
                                <span>Rol</span>
                                <select id='rol' name='rol' value={rol} onChange={(e) => setRol(e.target.value)}>
                                    <option value="admin">Administrador</option>
                                    <option value="user">Usuario</option>
                                </select>
                            </label>
                        </div>
                        <button type='submit' className='btnRegister'>Registrarse</button>
                    </form>
                    <div className='registerLink'>
                        ¿Ya tienes cuenta? <a href="#" onClick={redirectToLogin}>Iniciar Sesión</a>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Register;

