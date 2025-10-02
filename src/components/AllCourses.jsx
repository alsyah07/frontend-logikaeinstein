import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const AllCourses = () => {
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
      image: '/assets/images/portfolio-01.jpg',
      lessons: 50,
      members: 234,
      date: '2024-01-15',
      level: 'Advanced',
      instructor: 'Dr. Ahmad'
    },
    {
      id: 2,
      title: 'Fisika UTBK',
      category: 'Fisika',
      image: '/assets/images/portfolio-02.jpg',
      lessons: 45,
      members: 189,
      date: '2024-01-10',
      level: 'Intermediate',
      instructor: 'Prof. Sari'
    },
    {
      id: 3,
      title: 'Matematika Kelas 10',
      category: 'Matematika',
      image: '/assets/images/portfolio-03.jpg',
      lessons: 30,
      members: 156,
      date: '2024-01-05',
      level: 'Beginner',
      instructor: 'Pak Budi'
    },
    {
      id: 4,
      title: 'Matematika Kelas 11',
      category: 'Matematika',
      image: '/assets/images/portfolio-04.jpg',
      lessons: 35,
      members: 178,
      date: '2024-01-08',
      level: 'Intermediate',
      instructor: 'Bu Ani'
    },
    {
      id: 5,
      title: 'Matematika Kelas 12',
      category: 'Matematika',
      image: '/assets/images/portfolio-05.jpg',
      lessons: 40,
      members: 201,
      date: '2024-01-12',
      level: 'Advanced',
      instructor: 'Dr. Rina'
    },
    {
      id: 6,
      title: 'Fisika Kelas 12',
      category: 'Fisika',
      image: '/assets/images/portfolio-06.jpg',
      lessons: 38,
      members: 167,
      date: '2024-01-07',
      level: 'Advanced',
      instructor: 'Prof. Dedi'
    },
    {
      id: 7,
      title: 'Kimia Dasar',
      category: 'Kimia',
      image: '/assets/images/portfolio-01.jpg',
      lessons: 25,
      members: 134,
      date: '2024-01-03',
      level: 'Beginner',
      instructor: 'Dr. Maya'
    },
    {
      id: 8,
      title: 'Biologi SMA',
      category: 'Biologi',
      image: '/assets/images/portfolio-02.jpg',
      lessons: 32,
      members: 145,
      date: '2024-01-06',
      level: 'Intermediate',
      instructor: 'Bu Lina'
    }
  ];

  const filteredCourses = courses.filter(course =>
    course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    course.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sortedCourses = filteredCourses.sort((a, b) => {
    switch (sortBy) {
      case 'newest':
        return new Date(b.date) - new Date(a.date);
      case 'oldest':
        return new Date(a.date) - new Date(b.date);
      case 'alphabetical':
        return a.title.localeCompare(b.title);
      case 'members':
        return b.members - a.members;
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
    <div className="all-courses-page">
      <div className="container">
        <div className="row">
          <div className="col-lg-12">
            <div className="courses-header">
              <h1>Semua Kursus</h1>
              <p>Jelajahi semua kursus pembelajaran yang tersedia</p>
            </div>
          </div>
        </div>

        <div className="row">
          <div className="col-lg-12">
            <div className="courses-controls">
              <div className="search-container">
                <input
                  type="text"
                  placeholder="Cari kursus..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="search-input"
                />
                <button className="search-btn">🔍</button>
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
                  <option value="alphabetical">Alphabetical</option>
                  <option value="members">Most popular</option>
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
        </div>

        <div className="row">
          <div className="col-lg-12">
            <div className={`courses-grid ${viewMode}`}>
              {sortedCourses.map((course) => (
                <div key={course.id} className="course-item" onClick={() => handleCourseClick(course)}>
                  <div className="course-image">
                    <img src={course.image} alt={course.title} />
                  </div>
                  <div className="course-info">
                    <div className="course-category">{course.category}</div>
                    <h3>{course.title}</h3>
                    <div className="course-stats">
                      <span className="lessons">{course.lessons} Lessons</span>
                      <span className="members-badge">{course.members} Members</span>
                    </div>
                    <div className="course-actions">
                      <button 
                        className="btn-preview"
                        onClick={() => navigate(`/course/${course.id}`)}
                      >
                        PREVIEW THIS COURSE
                      </button>
                      <button className="btn-wishlist">♡ ADD TO WISHLIST</button>
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
                    <span className="stat-number">{selectedCourse.lessons}</span>
                    <span className="stat-label">Lessons</span>
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
    </div>
  );
};

export default AllCourses;