import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { FaFacebookF, FaGoogle, FaLinkedinIn } from 'react-icons/fa';
import { useLoginMutation, useRegisterMutation } from '../../slices/usersApiSlice';
import { setCredentials } from '../../slices/authSlice';
import './AuthModal.css';

const AuthModal = () => {
    const [isSignUpActive, setIsSignUpActive] = useState(false);

    // Login state
    const [loginEmail, setLoginEmail] = useState('');
    const [loginPassword, setLoginPassword] = useState('');
    const [loginError, setLoginError] = useState('');

    // Register state
    const [regName, setRegName] = useState('');
    const [regEmail, setRegEmail] = useState('');
    const [regPassword, setRegPassword] = useState('');
    const [regError, setRegError] = useState('');

    const dispatch = useDispatch();
    const navigate = useNavigate();

    const [login, { isLoading: isLoginLoading }] = useLoginMutation();
    const [registerUser, { isLoading: isRegLoading }] = useRegisterMutation();

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoginError('');
        try {
            const result = await login({ email: loginEmail, password: loginPassword }).unwrap();
            dispatch(setCredentials(result));
            navigate('/rent');
        } catch (err) {
            setLoginError(err?.data?.message || 'Invalid email or password. Please try again.');
        }
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        setRegError('');
        try {
            const result = await registerUser({
                fullName: regName,
                email: regEmail,
                password: regPassword,
            }).unwrap();
            dispatch(setCredentials(result));
            navigate('/rent');
        } catch (err) {
            setRegError(err?.data?.message || 'Registration failed. Please try again.');
        }
    };

    return (
        <div className="auth-container">
            <div className={`auth-wrapper ${isSignUpActive ? 'panel-active' : ''}`} id="authWrapper">

                {/* Register Form */}
                <div className="auth-form-box register-form-box">
                    <form onSubmit={handleRegister}>
                        <h1>Create Account</h1>
                        <div className="social-links">
                            <a href="#" aria-label="Facebook"><FaFacebookF /></a>
                            <a href="#" aria-label="Google"><FaGoogle /></a>
                            <a href="#" aria-label="LinkedIn"><FaLinkedinIn /></a>
                        </div>
                        <span>or use your email for registration</span>
                        {regError && <p className="auth-error">{regError}</p>}
                        <input
                            type="text"
                            placeholder="Full Name"
                            value={regName}
                            onChange={(e) => setRegName(e.target.value)}
                            required
                        />
                        <input
                            type="email"
                            placeholder="Email Address"
                            value={regEmail}
                            onChange={(e) => setRegEmail(e.target.value)}
                            required
                        />
                        <input
                            type="password"
                            placeholder="Password"
                            value={regPassword}
                            onChange={(e) => setRegPassword(e.target.value)}
                            required
                        />
                        <button type="submit" disabled={isRegLoading}>
                            {isRegLoading ? 'Creating...' : 'Sign Up'}
                        </button>
                        <div className="mobile-switch">
                            <p>Already have an account?</p>
                            <button onClick={() => setIsSignUpActive(false)} type="button">Sign In</button>
                        </div>
                    </form>
                </div>

                {/* Login Form */}
                <div className="auth-form-box login-form-box">
                    <form onSubmit={handleLogin}>
                        <h1>Sign In</h1>
                        <div className="social-links">
                            <a href="#" aria-label="Facebook"><FaFacebookF /></a>
                            <a href="#" aria-label="Google"><FaGoogle /></a>
                            <a href="#" aria-label="LinkedIn"><FaLinkedinIn /></a>
                        </div>
                        <span>or use your account</span>
                        {loginError && <p className="auth-error">{loginError}</p>}
                        <input
                            type="email"
                            placeholder="Email Address"
                            value={loginEmail}
                            onChange={(e) => setLoginEmail(e.target.value)}
                            required
                        />
                        <input
                            type="password"
                            placeholder="Password"
                            value={loginPassword}
                            onChange={(e) => setLoginPassword(e.target.value)}
                            required
                        />
                        <a href="#">Forgot your password?</a>
                        <button type="submit" disabled={isLoginLoading}>
                            {isLoginLoading ? 'Signing in...' : 'Sign In'}
                        </button>
                        <div className="mobile-switch">
                            <p>Don't have an account?</p>
                            <button onClick={() => setIsSignUpActive(true)} type="button">Sign Up</button>
                        </div>
                    </form>
                </div>

                {/* Sliding Overlay Panels */}
                <div className="slide-panel-wrapper">
                    <div className="slide-panel">
                        <div className="panel-content panel-content-left">
                            <h2>Welcome Back!</h2>
                            <p>Stay connected by logging in with your credentials and continue your experience</p>
                            <button className="transparent-btn" onClick={() => setIsSignUpActive(false)}>Sign In</button>
                        </div>
                        <div className="panel-content panel-content-right">
                            <h2>Hey There!</h2>
                            <p>Begin your amazing journey by creating an account with us today</p>
                            <button className="transparent-btn" onClick={() => setIsSignUpActive(true)}>Sign Up</button>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default AuthModal;
