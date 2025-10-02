import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import './CourseDetail.css';

const CourseDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [activeTab, setActiveTab] = useState('description');

  // Sample course data - in real app this would come from API
  const coursesData = [
    {
      id: 1,
      title: 'Matematika UTBK',
      category: 'Matematika',
      subcategory: 'Matematika UTBK',
      image: '/assets/images/portfolio-01.jpg',
      lessons: 50,
      members: 234,
      date: '2024-01-15',
      level: 'Advanced',
      instructor: 'admin',
      rating: 5,
      reviews: 234,
      description: 'Kursus Matematika UTBK yang komprehensif untuk persiapan ujian masuk perguruan tinggi. Materi mencakup semua topik yang diujikan dalam UTBK dengan metode pembelajaran yang efektif dan mudah dipahami.',
      workingHours: {
        monday: '9:30 am - 6:00 pm',
        tuesday: '9:30 am - 6:00 pm',
        wednesday: '9:30 am - 6:00 pm',
        thursday: '9:30 am - 6:00 pm',
        friday: '9:30 am - 5:00 pm',
        saturday: 'CLOSED',
        sunday: 'CLOSED'
      },
      popularCourses: [
        { id: 2, title: 'Fisika Kelas 9', members: 'Members only', rating: 5 },
        { id: 3, title: 'Fisika Kelas 9', members: 'Members only', rating: 5 }
      ]
    },
    {
      id: 2,
      title: 'Fisika UTBK',
      category: 'Fisika',
      subcategory: 'Fisika UTBK',
      image: '/assets/images/portfolio-02.jpg',
      lessons: 45,
      members: 189,
      date: '2024-01-10',
      level: 'Intermediate',
      instructor: 'admin',
      rating: 4,
      reviews: 189,
      description: 'Kursus Fisika UTBK yang dirancang khusus untuk membantu siswa mempersiapkan ujian masuk perguruan tinggi dengan materi yang lengkap dan metode pembelajaran yang interaktif.',
      workingHours: {
        monday: '9:30 am - 6:00 pm',
        tuesday: '9:30 am - 6:00 pm',
        wednesday: '9:30 am - 6:00 pm',
        thursday: '9:30 am - 6:00 pm',
        friday: '9:30 am - 5:00 pm',
        saturday: 'CLOSED',
        sunday: 'CLOSED'
      },
      popularCourses: [
        { id: 1, title: 'Matematika UTBK', members: 'Members only', rating: 5 },
        { id: 3, title: 'Matematika Kelas 10', members: 'Members only', rating: 5 }
      ]
    },
    {
      id: 3,
      title: 'Matematika Kelas 10',
      category: 'Matematika',
      subcategory: 'Matematika Kelas 10',
      image: '/assets/images/portfolio-03.jpg',
      lessons: 30,
      members: 156,
      date: '2024-01-05',
      level: 'Beginner',
      instructor: 'Pak Budi',
      rating: 4,
      reviews: 156,
      description: 'Kursus Matematika untuk siswa kelas 10 dengan pendekatan yang mudah dipahami. Materi disusun secara sistematis mulai dari konsep dasar hingga aplikasi dalam soal-soal.',
      workingHours: {
        monday: '9:30 am - 6:00 pm',
        tuesday: '9:30 am - 6:00 pm',
        wednesday: '9:30 am - 6:00 pm',
        thursday: '9:30 am - 6:00 pm',
        friday: '9:30 am - 5:00 pm',
        saturday: 'CLOSED',
        sunday: 'CLOSED'
      },
      popularCourses: [
        { id: 1, title: 'Matematika UTBK', members: 'Members only', rating: 5 },
        { id: 4, title: 'Matematika Kelas 11', members: 'Members only', rating: 4 }
      ]
    },
    {
      id: 4,
      title: 'Matematika Kelas 11',
      category: 'Matematika',
      subcategory: 'Matematika Kelas 11',
      image: '/assets/images/portfolio-04.jpg',
      lessons: 35,
      members: 178,
      date: '2024-01-08',
      level: 'Intermediate',
      instructor: 'Bu Sari',
      rating: 4,
      reviews: 178,
      description: 'Kursus Matematika untuk siswa kelas 11 dengan materi yang lebih mendalam. Mencakup fungsi, trigonometri, dan konsep-konsep matematika tingkat menengah.',
      workingHours: {
        monday: '9:30 am - 6:00 pm',
        tuesday: '9:30 am - 6:00 pm',
        wednesday: '9:30 am - 6:00 pm',
        thursday: '9:30 am - 6:00 pm',
        friday: '9:30 am - 5:00 pm',
        saturday: 'CLOSED',
        sunday: 'CLOSED'
      },
      popularCourses: [
        { id: 3, title: 'Matematika Kelas 10', members: 'Members only', rating: 4 },
        { id: 5, title: 'Matematika Kelas 12', members: 'Members only', rating: 5 }
      ]
    },
    {
      id: 5,
      title: 'Matematika Kelas 12',
      category: 'Matematika',
      subcategory: 'Matematika Kelas 12',
      image: '/assets/images/portfolio-05.jpg',
      lessons: 40,
      members: 203,
      date: '2024-01-12',
      level: 'Advanced',
      instructor: 'Dr. Ahmad',
      rating: 5,
      reviews: 203,
      description: 'Kursus Matematika untuk siswa kelas 12 sebagai persiapan ujian akhir dan masuk perguruan tinggi. Materi mencakup kalkulus, statistika, dan topik-topik matematika tingkat lanjut.',
      workingHours: {
        monday: '9:30 am - 6:00 pm',
        tuesday: '9:30 am - 6:00 pm',
        wednesday: '9:30 am - 6:00 pm',
        thursday: '9:30 am - 6:00 pm',
        friday: '9:30 am - 5:00 pm',
        saturday: 'CLOSED',
        sunday: 'CLOSED'
      },
      popularCourses: [
        { id: 1, title: 'Matematika UTBK', members: 'Members only', rating: 5 },
        { id: 4, title: 'Matematika Kelas 11', members: 'Members only', rating: 4 }
      ]
    },
    {
      id: 6,
      title: 'Fisika Kelas 12',
      category: 'Fisika',
      subcategory: 'Fisika Kelas 12',
      image: '/assets/images/portfolio-06.jpg',
      lessons: 38,
      members: 167,
      date: '2024-01-14',
      level: 'Advanced',
      instructor: 'Prof. Sari',
      rating: 4,
      reviews: 167,
      description: 'Kursus Fisika untuk siswa kelas 12 dengan pendekatan konseptual dan praktis. Materi mencakup fisika modern, gelombang, dan topik-topik fisika tingkat lanjut.',
      workingHours: {
        monday: '9:30 am - 6:00 pm',
        tuesday: '9:30 am - 6:00 pm',
        wednesday: '9:30 am - 6:00 pm',
        thursday: '9:30 am - 6:00 pm',
        friday: '9:30 am - 5:00 pm',
        saturday: 'CLOSED',
        sunday: 'CLOSED'
      },
      popularCourses: [
        { id: 2, title: 'Fisika UTBK', members: 'Members only', rating: 4 },
        { id: 5, title: 'Matematika Kelas 12', members: 'Members only', rating: 5 }
      ]
    }
  ];

  useEffect(() => {
    const foundCourse = coursesData.find(c => c.id === parseInt(id));
    setCourse(foundCourse);
  }, [id]);

  if (!course) {
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
          <span>{course.category}</span>
          <span className="separator">›</span>
          <span>{course.subcategory}</span>
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
                      <span className="instructor-name">{course.instructor}</span>
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
                      <span className="detail-value">{course.level}</span>
                    </div>
                  </div>

                  <div className="course-actions">
                    <button 
                      className="btn-start-course"
                      onClick={() => navigate(`/course/${course.id}/learn`)}
                    >
                      START COURSE
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

                {/* Popular Courses Section */}
                <div className="popular-courses-section">
                  <h3>Popular Courses</h3>
                  {course.popularCourses.map((popularCourse, index) => (
                    <div key={`section-${index}`} className="popular-course-section-item">
                      <div className="popular-course-section-image">
                        <img src="/assets/images/portfolio-01.jpg" alt={popularCourse.title} />
                      </div>
                      <div className="popular-course-section-info">
                        <h4>{popularCourse.title}</h4>
                        <div className="popular-course-section-meta">
                          <span className="crown-icon">👑</span>
                          <span className="members-text">{popularCourse.members}</span>
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
                      <span className="time">{course.workingHours.monday}</span>
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