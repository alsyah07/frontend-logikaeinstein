import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const AllCourses = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [viewMode, setViewMode] = useState('grid');
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [apiCourses, setApiCourses] = useState([]); // Data dari API
  const [loading, setLoading] = useState(true); // Untuk status loading
  const [error, setError] = useState(null); // Untuk handle error

  // Ambil data dari API dengan axios
  useEffect(() => {
    axios.get('http://localhost:3100/api/v1/sub_mapel')
      .then((response) => {
        if (response.data.success) {
          setApiCourses(response.data.data);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching data:', err);
        setError('Gagal mengambil data.');
        setLoading(false);
      });
  }, []);

  // Data statis
  const staticCourses = [
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
    // ... data lainnya
  ];

  // Gabungkan data API dan data statis jika diperlukan
  const courses = [...apiCourses, ...staticCourses];

  // Filter berdasarkan pencarian
  const filteredCourses = courses.filter(course =>
    course.sub_mapel?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    course.mapel?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    course.title?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Sorting
  const sortedCourses = filteredCourses.slice().sort((a, b) => {
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

  if (loading) {
    return <div>Loading data...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div className="all-courses-page">
      <div className="container">
        {/* Header, controls, dll... */}
        {/* ... */}
        <div className="row">
          <div className="col-lg-12">
            <div className={`courses-grid ${viewMode}`}>
              {sortedCourses.map((course) => (
                <div key={course.id} className="course-item" onClick={() => handleCourseClick(course)}>
                  <div className="course-image">
                    <img src={course.image} alt={course.title} />
                  </div>
                  <div className="course-info">
                    <div className="course-category">{course.category || course.sub_mapel}</div>
                    <h3>{course.title || course.sub_mapel}</h3>
                    <div className="course-stats">
                      <span className="lessons">{course.lessons || '0'} Lessons</span>
                      <span className="members-badge">{course.members || '0'} Members</span>
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
                  <div className="course-category">{selectedCourse.category || selectedCourse.sub_mapel}</div>
                  <h2>{selectedCourse.title || selectedCourse.sub_mapel}</h2>
                </div>
              </div>
              <div className="modal-body">
                <div className="course-stats">
                  <div className="stat-item">
                    <span className="stat-number">{selectedCourse.lessons || '0'}</span>
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