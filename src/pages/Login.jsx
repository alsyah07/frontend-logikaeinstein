import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.email) {
      newErrors.email = 'Email harus diisi';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Format email tidak valid';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password harus diisi';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password minimal 6 karakter';
    }
    
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Call the actual API
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/users/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password
        })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Login failed');
      }

      if (result.success && result.data && result.data.user) {
        console.log('Login successful:', result);
        
        // Create user data from API response
        const userData = {
          id: result.data.user.id,
          name: result.data.user.name,
          username: result.data.user.username,
          email: result.data.user.email,
          displayName: result.data.user.name,
          bio: '',
          phone: '',
          location: '',
          id_role: result.data.user.id_role,
          created_at: result.data.user.created_at,
          updated_at: result.data.user.updated_at
        };
        
        login(userData);
        
        // Redirect to dashboard after successful login
        navigate('/dashboard');
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error) {
      console.error('Login error:', error);
      setErrors({ general: error.message || 'Terjadi kesalahan saat login. Silakan coba lagi.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-lg-6 col-md-8">
            <div className="login-form-container">
              <div className="text-center mb-4">
                <h1 className="brand-title">LogikaEinstein</h1>
                <h2 className="login-title">Masuk ke Akun Anda</h2>
                <p className="login-subtitle">Silakan masuk untuk melanjutkan</p>
              </div>
              
              <form onSubmit={handleSubmit} className="login-form">
                {errors.general && (
                  <div className="alert alert-danger" role="alert">
                    {errors.general}
                  </div>
                )}
                
                <div className="form-group mb-3">
                  <label htmlFor="email" className="form-label">Email</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Masukkan email Anda"
                    disabled={isLoading}
                  />
                  {errors.email && (
                    <div className="invalid-feedback">
                      {errors.email}
                    </div>
                  )}
                </div>
                
                <div className="form-group mb-4">
                  <label htmlFor="password" className="form-label">Password</label>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    className={`form-control ${errors.password ? 'is-invalid' : ''}`}
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Masukkan password Anda"
                    disabled={isLoading}
                  />
                  {errors.password && (
                    <div className="invalid-feedback">
                      {errors.password}
                    </div>
                  )}
                </div>
                
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <div className="form-check">
                    <input
                      type="checkbox"
                      className="form-check-input"
                      id="remember"
                    />
                    <label className="form-check-label" htmlFor="remember">
                      Ingat saya
                    </label>
                  </div>
                  <Link to="/forgot-password" className="forgot-password-link">
                    Lupa password?
                  </Link>
                </div>
                
                <button
                  type="submit"
                  className="btn btn-primary w-100 login-btn"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      Masuk...
                    </>
                  ) : (
                    'Masuk'
                  )}
                </button>
                
                <div className="text-center mt-4">
                  <p className="register-link">
                    Belum punya akun? <Link to="/register" className="text-primary">Daftar sekarang</Link>
                  </p>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
      
      <style>{`
        .login-page {
          min-height: 100vh;
          background: linear-gradient(135deg, #667eea 0%,rgb(75, 162, 143) 100%);
          display: flex;
          align-items: center;
          padding: 0;
        }
        
        .login-form-container {
          background: rgba(255, 255, 255, 0.95);
          border-radius: 15px;
          padding: 40px;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.2);
        }
        
        .brand-title {
          color: #667eea;
          font-weight: 800;
          font-size: 32px;
          margin-bottom: 20px;
          text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.1);
        }
        
        .login-title {
          color: #333;
          font-weight: 700;
          margin-bottom: 8px;
        }
        
        .login-subtitle {
          color: #666;
          margin-bottom: 0;
        }
        
        .form-label {
          font-weight: 600;
          color: #333;
          margin-bottom: 8px;
        }
        
        .form-control {
          border: 2px solid #e1e5e9;
          border-radius: 10px;
          padding: 12px 16px;
          font-size: 16px;
          transition: all 0.3s ease;
        }
        
        .form-control:focus {
          border-color: #667eea;
          box-shadow: 0 0 0 0.2rem rgba(102, 126, 234, 0.25);
        }
        
        .form-control.is-invalid {
          border-color: #dc3545;
        }
        
        .invalid-feedback {
          display: block;
          font-size: 14px;
          margin-top: 5px;
        }
        
        .login-btn {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border: none;
          border-radius: 10px;
          padding: 14px 20px;
          font-size: 16px;
          font-weight: 600;
          transition: all 0.3s ease;
        }
        
        .login-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 10px 20px rgba(102, 126, 234, 0.3);
        }
        
        .login-btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }
        
        .forgot-password-link {
          color: #667eea;
          text-decoration: none;
          font-size: 14px;
        }
        
        .forgot-password-link:hover {
          text-decoration: underline;
        }
        
        .register-link {
          color: #666;
          margin-bottom: 0;
        }
        
        .form-check-label {
          font-size: 14px;
          color: #666;
        }
        
        .alert {
          border-radius: 10px;
          border: none;
        }
        
        @media (max-width: 768px) {
          .login-form-container {
            padding: 30px 20px;
            margin: 20px;
          }
          
          .login-title {
            font-size: 24px;
          }
        }
      `}</style>
    </div>
  );
};

export default Login;