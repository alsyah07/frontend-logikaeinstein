import React from 'react'
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import Preloader from './components/Preloader'
import Header from './components/Header'
import Banner from './components/Banner'
import Features from './components/Features'
import About from './components/About'
import Services from './components/Services'
import Portfolio from './components/Portfolio'
import Contact from './components/Contact'
import Footer from './components/Footer'
import Courses from './components/Courses';
import AllCourses from './components/AllCourses';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import CourseDetail from './pages/CourseDetail';
import CourseLearning from './pages/CourseLearning';
import './App.css'

function AppContent() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, loading } = useAuth();
  
  React.useEffect(() => {
    // Smooth scroll to section if URL has a hash (e.g., /#features)
    const { hash, pathname } = location;
    if (hash) {
      // ensure we're on the home route where sections exist
      if (pathname !== '/') {
        navigate('/' + hash, { replace: true });
        return;
      }
      const targetId = hash.replace('#', '');
      // wait for route elements to render
      setTimeout(() => {
        const el = document.getElementById(targetId);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 0);
    } else if (pathname === '/') {
      // no hash and on home -> scroll to top
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [location, navigate]);
  
  const getCurrentPage = () => {
    const path = location.pathname;
    if (path === '/courses') return 'courses';
    if (path === '/allcourses') return 'all-courses';
    if (path.startsWith('/course/') && path.includes('/learn/')) return 'course-learning';
    if (path.startsWith('/course/')) return 'course-detail';
    if (path === '/login') return 'login';
    if (path === '/register') return 'register';
    if (path === '/dashboard') return 'dashboard';
    return 'home';
  };

  const setCurrentPage = (page) => {
    switch (page) {
      case 'courses':
        navigate('/courses');
        break;
      case 'all-courses':
        navigate('/allcourses');
        break;
      case 'login':
        navigate('/login');
        break;
      case 'register':
        navigate('/register');
        break;
      case 'dashboard':
        navigate('/dashboard');
        break;
      case 'home':
      default:
        navigate('/');
        break;
    }
  };

  const shouldShowHeader = () => {
    const currentPage = getCurrentPage();
    // Don't show header on login, register, course learning pages
    if (['login', 'register', 'course-learning'].includes(currentPage)) {
      return false;
    }
    // Don't show header on dashboard if user is authenticated
    if (currentPage === 'dashboard' && isAuthenticated) {
      return false;
    }
    return true;
  };

  return (
    <>
      {/* Only show Preloader, Header, and Footer based on authentication and page */}
      {shouldShowHeader() && <Preloader />}
      {shouldShowHeader() && <Header currentPage={getCurrentPage()} setCurrentPage={setCurrentPage} />}
      
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/courses" element={<Courses />} />
        <Route path="/allcourses" element={<AllCourses />} />
        <Route path="/course/:courseId/learn/:lessonId" element={<CourseLearning />} />
        <Route path="/course/:courseId/learn" element={<CourseLearning />} />
        <Route path="/course/:id" element={<CourseDetail />} />
        <Route path="/" element={
          <>
            <Banner />
            <Features />
            <About />
            <Services />
            <Portfolio onShowAllClick={() => navigate('/allcourses')} />
            <Contact />
          </>
        } />
      </Routes>
      
      {shouldShowHeader() && <Footer />}
    </>
  )
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  )
}

export default App
