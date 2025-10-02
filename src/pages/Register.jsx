import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    agreeToTerms: false
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
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
    
    if (!formData.username.trim()) {
      newErrors.username = 'Username harus diisi';
    } else if (formData.username.trim().length < 3) {
      newErrors.username = 'Username minimal 3 karakter';
    }
    
    if (!formData.name.trim()) {
      newErrors.name = 'Nama lengkap harus diisi';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Nama lengkap minimal 2 karakter';
    }
    
    if (!formData.email) {
      newErrors.email = 'Email harus diisi';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Format email tidak valid';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password harus diisi';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password minimal 8 karakter';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password = 'Password harus mengandung huruf besar, huruf kecil, dan angka';
    }
    
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Konfirmasi password harus diisi';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Password tidak cocok';
    }
    
    if (!formData.agreeToTerms) {
      newErrors.agreeToTerms = 'Anda harus menyetujui syarat dan ketentuan';
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
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: formData.username,
          name: formData.name,
          email: formData.email,
          password: formData.password,
          id_role: 1 // Default role untuk user biasa
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Registrasi gagal');
      }

      const data = await response.json();
      console.log('Registration successful:', data);
      
      // Redirect to login page after successful registration
      navigate('/login', { 
        state: { 
          message: 'Registrasi berhasil! Silakan login dengan akun Anda.' 
        }
      });
    } catch (error) {
      console.error('Registration error:', error);
      setErrors({ general: error.message || 'Terjadi kesalahan saat registrasi. Silakan coba lagi.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="register-page">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-lg-6 col-md-8">
            <div className="register-form-container">
              <div className="text-center mb-4">
                <h2 className="register-title">Buat Akun Baru</h2>
                <p className="register-subtitle">Bergabunglah dengan kami hari ini</p>
              </div>
              
              <form onSubmit={handleSubmit} className="register-form">
                {errors.general && (
                  <div className="alert alert-danger" role="alert">
                    {errors.general}
                  </div>
                )}
                
                <div className="form-group mb-3">
                  <label htmlFor="username" className="form-label">Username</label>
                  <input
                    type="text"
                    id="username"
                    name="username"
                    className={`form-control ${errors.username ? 'is-invalid' : ''}`}
                    value={formData.username}
                    onChange={handleChange}
                    placeholder="Masukkan username Anda"
                    disabled={isLoading}
                  />
                  {errors.username && (
                    <div className="invalid-feedback">
                      {errors.username}
                    </div>
                  )}
                </div>
                
                <div className="form-group mb-3">
                  <label htmlFor="name" className="form-label">Nama Lengkap</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    className={`form-control ${errors.name ? 'is-invalid' : ''}`}
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Masukkan nama lengkap Anda"
                    disabled={isLoading}
                  />
                  {errors.name && (
                    <div className="invalid-feedback">
                      {errors.name}
                    </div>
                  )}
                </div>
                
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
                
                <div className="form-group mb-3">
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
                  <small className="form-text text-muted">
                    Password harus minimal 8 karakter dengan huruf besar, huruf kecil, dan angka
                  </small>
                </div>
                
                <div className="form-group mb-4">
                  <label htmlFor="confirmPassword" className="form-label">Konfirmasi Password</label>
                  <input
                    type="password"
                    id="confirmPassword"
                    name="confirmPassword"
                    className={`form-control ${errors.confirmPassword ? 'is-invalid' : ''}`}
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="Konfirmasi password Anda"
                    disabled={isLoading}
                  />
                  {errors.confirmPassword && (
                    <div className="invalid-feedback">
                      {errors.confirmPassword}
                    </div>
                  )}
                </div>
                
                <div className="form-group mb-4">
                  <div className="form-check">
                    <input
                      type="checkbox"
                      className={`form-check-input ${errors.agreeToTerms ? 'is-invalid' : ''}`}
                      id="agreeToTerms"
                      name="agreeToTerms"
                      checked={formData.agreeToTerms}
                      onChange={handleChange}
                      disabled={isLoading}
                    />
                    <label className="form-check-label" htmlFor="agreeToTerms">
                      Saya menyetujui <Link to="/terms" className="text-primary">Syarat dan Ketentuan</Link> serta <Link to="/privacy" className="text-primary">Kebijakan Privasi</Link>
                    </label>
                    {errors.agreeToTerms && (
                      <div className="invalid-feedback d-block">
                        {errors.agreeToTerms}
                      </div>
                    )}
                  </div>
                </div>
                
                <button
                  type="submit"
                  className="btn btn-primary w-100 register-btn"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      Mendaftar...
                    </>
                  ) : (
                    'Daftar Sekarang'
                  )}
                </button>
                
                <div className="text-center mt-4">
                  <p className="login-link">
                    Sudah punya akun? <Link to="/login" className="text-primary">Masuk sekarang</Link>
                  </p>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
      
      <style>{`
        .register-page {
          min-height: 100vh;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          display: flex;
          align-items: center;
          padding: 40px 0;
        }
        
        .register-form-container {
          background: white;
          border-radius: 15px;
          padding: 40px;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
          backdrop-filter: blur(10px);
        }
        
        .register-title {
          color: #333;
          font-weight: 700;
          margin-bottom: 8px;
        }
        
        .register-subtitle {
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
        
        .form-check-input.is-invalid {
          border-color: #dc3545;
        }
        
        .invalid-feedback {
          display: block;
          font-size: 14px;
          margin-top: 5px;
        }
        
        .register-btn {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border: none;
          border-radius: 10px;
          padding: 14px 20px;
          font-size: 16px;
          font-weight: 600;
          transition: all 0.3s ease;
        }
        
        .register-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 10px 20px rgba(102, 126, 234, 0.3);
        }
        
        .register-btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }
        
        .login-link {
          color: #666;
          margin-bottom: 0;
        }
        
        .form-check-label {
          font-size: 14px;
          color: #666;
        }
        
        .form-text {
          font-size: 12px;
          margin-top: 5px;
        }
        
        .alert {
          border-radius: 10px;
          border: none;
        }
        
        @media (max-width: 768px) {
          .register-form-container {
            padding: 30px 20px;
            margin: 20px;
          }
          
          .register-title {
            font-size: 24px;
          }
          
          .form-check-label {
            font-size: 13px;
          }
        }
      `}</style>
    </div>
  );
};

export default Register;