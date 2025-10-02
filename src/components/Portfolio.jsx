import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Portfolio = ({ onShowAllClick }) => {
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState('*');
  const [isAnimating, setIsAnimating] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const courses = [
    { id: 1, category: 'matematika', title: 'Matematika UTBK', image: '/assets/images/portfolio-01.jpg' },
    { id: 2, category: 'fisika', title: 'Fisika UTBK', image: '/assets/images/portfolio-02.jpg' },
    { id: 3, category: 'matematika', title: 'Matematika Kelas 10', image: '/assets/images/portfolio-03.jpg' },
    { id: 4, category: 'matematika', title: 'Matematika Kelas 12', image: '/assets/images/portfolio-04.jpg' },
    { id: 5, category: 'matematika', title: 'Matematika Kelas 11', image: '/assets/images/portfolio-05.jpg' },
    { id: 6, category: 'fisika', title: 'Fisika Kelas 12', image: '/assets/images/portfolio-06.jpg' }
  ];

  const filteredCourses = activeFilter === '*' 
    ? courses 
    : courses.filter(course => course.category === activeFilter);

  const handleFilterClick = (filter) => {
    if (filter !== activeFilter) {
      setIsAnimating(true);
      setTimeout(() => {
        setActiveFilter(filter);
        setTimeout(() => setIsAnimating(false), 50);
      }, 300);
    }
  };

  const handleCourseClick = (course) => {
    setSelectedCourse(course);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedCourse(null);
  };
  return (
    <div id="portfolio" className="our-portfolio section">
      <div className="container">
          <div className="row">
            <div className="col-lg-6 offset-lg-3 text-center">
              <div className="section-heading">
                <h2>Pelajaran Populer</h2>
              </div>
            </div>
          </div>
          <div className="row">
            <div className="col-lg-12">
              <div className="portfolio-filters">
                <ul>
                  <li 
                    className={activeFilter === '*' ? 'active' : ''}
                    onClick={() => handleFilterClick('*')}
                  >
                    All Categories
                  </li>
                  <li 
                    className={activeFilter === 'fisika' ? 'active' : ''}
                    onClick={() => handleFilterClick('fisika')}
                  >
                    Fisika
                  </li>
                  <li 
                    className={activeFilter === 'matematika' ? 'active' : ''}
                    onClick={() => handleFilterClick('matematika')}
                  >
                    Matematika
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
        <div className="container">
          <div className={`row portfolio-grid ${isAnimating ? 'animating' : ''}`}>
            {filteredCourses.map((course, index) => (
              <div 
                key={`${activeFilter}-${course.id}`} 
                className={`col-lg-4 col-md-6 portfolio-item ${course.category} ${isAnimating ? 'fade-out' : 'fade-in'}`}
                style={{
                  animationDelay: `${index * 0.1}s`
                }}
              >
                <div className="course-card" onClick={() => handleCourseClick(course)}>
                  <div className="course-image">
                    <img src={course.image} alt={course.title} />
                  </div>
                  <div className="course-content">
                    <span className="course-category">
                      {course.category.charAt(0).toUpperCase() + course.category.slice(1)}
                    </span>
                    <h4>{course.title}</h4>
                    <div className="course-meta">
                      <span className="members-only">
                        <span>👑</span> Members Only
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="row">
            <div className="col-lg-12 text-center">
              <button className="btn btn-primary show-all-btn" onClick={onShowAllClick}>SHOW ALL</button>
            </div>
          </div>
        </div>

      {/* Modal */}
      {showModal && selectedCourse && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={closeModal}>
              ×
            </button>
            <div className="modal-header">
              <div className="instructor-info">
                <div className="instructor-avatar">
                  <img src="/assets/images/logo-icon.png" alt="admin" />
                </div>
                <span className="instructor-name">admin</span>
              </div>
            </div>
            <div className="modal-body">
              <h2 className="course-title">{selectedCourse.title}</h2>
              <div className="course-stats">
                <div className="stat-item">
                  <span className="stat-icon">📊</span>
                  <span className="stat-text">Advanced</span>
                </div>
                <div className="stat-item">
                  <span className="stat-icon">📚</span>
                  <span className="stat-text">50 Lectures</span>
                </div>
              </div>
              <div className="modal-actions">
                <button 
                  className="btn-preview"
                  onClick={() => navigate(`/course/${selectedCourse.id}`)}
                >
                  PREVIEW THIS COURSE
                  <div className="course-label">{selectedCourse.title}</div>
                </button>
                <button className="btn-wishlist">
                  <span className="heart-icon">♡</span>
                  Add to Wishlist
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Portfolio;