import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './CourseDetail.css';

const CourseDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [activeTab, setActiveTab] = useState('description');
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // State untuk data mapel dan mapel detail
  const [mapelData, setMapelData] = useState(null);

  useEffect(() => {
    let ceklogin = localStorage.getItem('user');
    console.log('cekdatausers', JSON.parse(ceklogin));
    
    // Cek status login
    setIsLoggedIn(!!ceklogin);

    // Fetch data dari API
    fetch(`http://localhost:3100/api/v1/sub_mapel/${id}`)
      .then(res => res.json())
      .then(data => {
        if (data.success && data.data) {
          const dataSubMapel = data.data;
          const datajadwalmapel = data.mapel;

          // Data mapel terkait
          fetch(`http://localhost:3100/api/v1/mapel/${dataSubMapel.id_mapel}`)
            .then(res => res.json())
            .then(resMapel => {
              if (resMapel.success) {
                setMapelData(resMapel.data);
              }
            });
          console.log(datajadwalmapel);

          // Set data course
          setCourse({
            name: dataSubMapel.name,
            id: dataSubMapel.id_sub_mapel,
            title: dataSubMapel.sub_mapel,
            description: dataSubMapel.deskripsi,
            lessons: dataSubMapel.lessons,
            members: dataSubMapel.members,
            date: dataSubMapel.date,
            level: dataSubMapel.level,
            instructor: dataSubMapel.instructor,
            rating: parseFloat(dataSubMapel.rating),
            reviews: dataSubMapel.reviews,
            workingHours: datajadwalmapel,
            popularCourses: [
              { id: 1, title: 'Fisika Kelas 12', members: 'Members only', rating: 4 },
              { id: 2, title: 'Fisika UTBK', members: 'Members only', rating: 5 }
            ],
          });
        }
      });
  }, [id]);

  const handleStartCourse = () => {
  if (!isLoggedIn) {
    navigate('/login');
    return;
  }
  navigate(`/course/${course.id}/learn`);
};


  if (!course || !mapelData) {
    return (
      <div className="course-detail-loading">
        <div className="container">
          <div className="loading-content">
            <h2>Loading...</h2>
            <p>Memuat detail kursus...</p>
          </div>
        </div>
      </div>
    );
  }

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, index) => (
      <span key={index} className={`star ${index < rating ? 'filled' : ''}`}>
        ★
      </span>
    ));
  };

  return (
    <div className="course-detail-page">
      <div className="container">
        {/* Breadcrumb */}
        <div className="breadcrumb">
          <span>{mapelData.mapel}</span>
          <span className="separator">›</span>
          <span>{course.title}</span>
        </div>

        <div className="course-detail-content">
          <div className="row">
            {/* Left Column - Course Info */}
            <div className="col-lg-8">
              <div className="course-header">
                <h1 className="course-title">{course.title}</h1>

                <div className="course-meta">
                  <div className="instructor-info">
                    <div className="instructor-avatar">
                      <img src="/assets/images/logo-icon.png" alt="Instructor" />
                    </div>
                    <div className="instructor-details">
                      <span className="instructor-label">Instructor</span>
                      <span className="instructor-name">
                        {course.name || 'N/A'}
                      </span>
                    </div>
                  </div>

                  <div className="course-rating">
                    <div className="stars">
                      {renderStars(course.rating)}
                    </div>
                    <span className="rating-text">{course.rating} reviews</span>
                  </div>
                </div>
              </div>

              {/* Tabs */}
              <div className="course-tabs">
                <div className="tab-buttons">
                  <button
                    className={`tab-button ${activeTab === 'description' ? 'active' : ''}`}
                    onClick={() => setActiveTab('description')}
                  >
                    Description
                  </button>
                  <button
                    className={`tab-button ${activeTab === 'reviews' ? 'active' : ''}`}
                    onClick={() => setActiveTab('reviews')}
                  >
                    Reviews
                  </button>
                </div>

                <div className="tab-content">
                  {activeTab === 'description' && (
                    <div className="description-content">
                      <p>{course.description}</p>
                    </div>
                  )}
{activeTab === 'reviews' && (
  <div className="reviews-content">
    <p>Belum ada review untuk kursus ini.</p>
    {!isLoggedIn && (
      <p>
        <span
          style={{ color: 'blue', cursor: 'pointer', textDecoration: 'underline' }}
          onClick={() => navigate('/login')}
        >
          Login
        </span>{' '}
        untuk memulai course.
      </p>
    )}
  </div>
)}


                </div>
              </div>
            </div>

            {/* Right Column - Course Details */}
            <div className="col-lg-4">
              <div className="course-sidebar">
                {/* Course Details Card */}
                <div className="course-details-card">
                  <h3>Course details</h3>

                  <div className="detail-item">
                    <i className="fa fa-book"></i>
                    <div className="detail-content">
                      <span className="detail-label">Lectures</span>
                      <span className="detail-value">{course.lessons}</span>
                    </div>
                  </div>

                  <div className="detail-item">
                    <i className="fa fa-signal"></i>
                    <div className="detail-content">
                      <span className="detail-label">Level</span>
                      <span className="detail-value">{course.level || 'N/A'}</span>
                    </div>
                  </div>

                  <div className="course-actions">
                    <button
                      className="btn-start-course"
                      onClick={handleStartCourse}
                    >
                      {isLoggedIn ? 'START COURSE' : 'LOGIN TO START COURSE'}
                    </button>
                    <div className="action-buttons">
                      <button className="btn-wishlist">
                        <i className="fa fa-heart-o"></i>
                        Add to wishlist
                      </button>
                      <button className="btn-share">
                        <i className="fa fa-share"></i>
                        Share
                      </button>
                    </div>
                  </div>
                </div>

                {/* Popular Courses */}
                <div className="popular-courses-card">
                  <h3>Popular courses</h3>
                  {course.popularCourses.map((popularCourse, index) => (
                    <div key={index} className="popular-course-item">
                      <div className="popular-course-image">
                        <img src="/assets/images/portfolio-01.jpg" alt={popularCourse.title} />
                      </div>
                      <div className="popular-course-info">
                        <h4>{popularCourse.title}</h4>
                        <div className="popular-course-meta">
                          <span className="crown-icon">👑</span>
                          <span className="members-text">{popularCourse.members}</span>
                          <div className="popular-course-rating">
                            {renderStars(popularCourse.rating)}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Working Hours */}
                <div className="working-hours-card">
                  <h3>WORKING HOURS</h3>
                  <div className="working-hours-list">
                    <div className="working-hour-item">
                      <span className="day">Monday</span>
                      <span className="time">{course.workingHours?.monday}</span>
                    </div>
                    <div className="working-hour-item">
                      <span className="day">Tuesday</span>
                      <span className="time">{course.workingHours.tuesday}</span>
                    </div>
                    <div className="working-hour-item">
                      <span className="day">Wednesday</span>
                      <span className="time">{course.workingHours.wednesday}</span>
                    </div>
                    <div className="working-hour-item">
                      <span className="day">Thursday</span>
                      <span className="time">{course.workingHours.thursday}</span>
                    </div>
                    <div className="working-hour-item">
                      <span className="day">Friday</span>
                      <span className="time">{course.workingHours.friday}</span>
                    </div>
                    <div className="working-hour-item closed">
                      <span className="day">Saturday</span>
                      <span className="time closed-text">{course.workingHours.saturday}</span>
                    </div>
                    <div className="working-hour-item closed">
                      <span className="day">Sunday</span>
                      <span className="time closed-text">{course.workingHours.sunday}</span>
                    </div>
                  </div>
                </div>

                {/* Cart Section */}
                <div className="cart-section">
                  <h3>Cart</h3>
                  <button className="btn-cart">Cart</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseDetail;