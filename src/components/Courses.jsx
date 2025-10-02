import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Courses = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [viewMode, setViewMode] = useState('grid');
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const courses = [
    {
      id: 1,
      title: 'Matematika UTBK',
      category: 'Matematika',
      level: 'Advanced',
      lectures: 50,
      image: '/assets/images/portfolio-01.jpg',
      instructor: 'admin'
    },
    {
      id: 2,
      title: 'Fisika UTBK',
      category: 'Fisika',
      level: 'Advanced',
      lectures: 45,
      image: '/assets/images/portfolio-02.jpg',
      instructor: 'admin'
    },
    {
      id: 3,
      title: 'Matematika Kelas 10',
      category: 'Matematika',
      level: 'Intermediate',
      lectures: 35,
      image: '/assets/images/portfolio-03.jpg',
      instructor: 'admin'
    },
    {
      id: 4,
      title: 'Matematika Kelas 12',
      category: 'Matematika',
      level: 'Advanced',
      lectures: 40,
      image: '/assets/images/portfolio-04.jpg',
      instructor: 'admin'
    },
    {
      id: 5,
      title: 'Matematika Kelas 11',
      category: 'Matematika',
      level: 'Intermediate',
      lectures: 38,
      image: '/assets/images/portfolio-05.jpg',
      instructor: 'admin'
    },
    {
      id: 6,
      title: 'Fisika Kelas 12',
      category: 'Fisika',
      level: 'Advanced',
      lectures: 42,
      image: '/assets/images/portfolio-06.jpg',
      instructor: 'admin'
    }
  ];

  const filteredCourses = courses.filter(course =>
    course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    course.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sortedCourses = [...filteredCourses].sort((a, b) => {
    switch (sortBy) {
      case 'newest':
        return b.id - a.id;
      case 'oldest':
        return a.id - b.id;
      case 'title':
        return a.title.localeCompare(b.title);
      default:
        return 0;
    }
  });

  const handleCourseClick = (course) => {
    setSelectedCourse(course);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedCourse(null);
  };

  return (
    <div className="courses-page">
      <div className="container-fluid">
        <div className="courses-inner">
          {/* Header */}
          <div className="courses-header">
            <h1>Courses</h1>
            
            {/* Search and Controls */}
            <div className="courses-controls">
              <div className="search-container">
                <input
                  type="text"
                  placeholder="Search Courses"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="search-input"
                />
                <button className="search-btn">
                  <span>🔍</span>
                </button>
              </div>
              
              <div className="sort-container">
                <label>Sort By:</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="sort-select"
                >
                  <option value="newest">Release date (newest first)</option>
                  <option value="oldest">Release date (oldest first)</option>
                  <option value="title">Title (A-Z)</option>
                </select>
              </div>
              
              <div className="view-controls">
                <button
                  className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
                  onClick={() => setViewMode('grid')}
                >
                  ⊞
                </button>
                <button
                  className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
                  onClick={() => setViewMode('list')}
                >
                  ☰
                </button>
              </div>
            </div>
          </div>

          {/* Courses Grid */}
          <div className={`courses-grid ${viewMode}`}>
          {sortedCourses.map((course) => (
            <div key={course.id} className="course-item" onClick={() => handleCourseClick(course)}>
              <div className="course-image">
                <img src={course.image} alt={course.title} />
              </div>
              <div className="course-info">
                <div className="instructor-info">
                  <div className="instructor-avatar">
                    <img src="/assets/images/logo-icon.png" alt={course.instructor} />
                  </div>
                  <span className="instructor-name">{course.instructor}</span>
                </div>
                <h3 className="course-title">{course.title}</h3>
                <div className="course-stats">
                  <div className="stat-item">
                    <span className="stat-icon">📊</span>
                    <span className="stat-text">{course.level}</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-icon">📚</span>
                    <span className="stat-text">{course.lectures} Lectures</span>
                  </div>
                </div>
                <div className="course-actions">
                  <button 
                    className="btn-preview"
                    onClick={() => navigate(`/course/${course.id}`)}
                  >
                    PREVIEW THIS COURSE
                  </button>
                  <button className="btn-wishlist">
                    <span className="heart-icon">♡</span>
                    Add to Wishlist
                  </button>
                </div>
                <div className="members-badge">
                  <span className="crown-icon">👑</span>
                  <span>Members only</span>
                </div>
              </div>
            </div>
          ))}
          </div>
        </div>
      </div>

      {/* Modal */}
      {showModal && selectedCourse && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={closeModal}>×</button>
            <div className="modal-header">
              <div className="modal-image">
                <img src={selectedCourse.image} alt={selectedCourse.title} />
              </div>
              <div className="modal-info">
                <div className="course-category">{selectedCourse.category}</div>
                <h2>{selectedCourse.title}</h2>
              </div>
            </div>
            <div className="modal-body">
              <div className="course-stats">
                <div className="stat-item">
                  <span className="stat-number">{selectedCourse.lectures}</span>
                  <span className="stat-label">Lectures</span>
                </div>
                <div className="stat-item">
                  <span className="stat-number">{selectedCourse.level}</span>
                  <span className="stat-label">Level</span>
                </div>
                <div className="stat-item">
                  <span className="stat-number">{selectedCourse.instructor}</span>
                  <span className="stat-label">Instructor</span>
                </div>
              </div>
              <div className="modal-actions">
                <button 
                  className="btn-preview"
                  onClick={() => navigate(`/course/${selectedCourse.id}`)}
                >
                  PREVIEW THIS COURSE
                </button>
                <button className="btn-wishlist">♡ ADD TO WISHLIST</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Courses;