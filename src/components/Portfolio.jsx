import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Portfolio = ({ onShowAllClick }) => {
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState('*');
  const [isAnimating, setIsAnimating] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [categories, setCategories] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  // Function to get Google Drive embed URL for iframe
  const getGoogleDriveEmbedUrl = (driveUrl) => {
    let fileId = null;

    const patterns = [
      /\/file\/d\/([^\/]+)/,
      /[?&]id=([^&]+)/,
      /\/open\?id=([^&]+)/
    ];

    for (const pattern of patterns) {
      const match = driveUrl.match(pattern);
      if (match) {
        fileId = match[1];
        break;
      }
    }

    if (fileId) {
      return `https://drive.google.com/file/d/${fileId}/preview`;
    }

    return null;
  };

  // Function to get thumbnail/preview URL
  const getThumbnailUrl = (course) => {
    // Untuk Google Drive, pakai thumbnail API
    if (course.video_url && course.video_url.includes('drive.google.com')) {
      const patterns = [
        /\/file\/d\/([^\/]+)/,
        /[?&]id=([^&]+)/,
      ];

      for (const pattern of patterns) {
        const match = course.video_url.match(pattern);
        if (match) {
          const fileId = match[1];
          return `https://drive.google.com/thumbnail?id=${fileId}&sz=w400`;
        }
      }
    }

    // Fallback
    return '/assets/images/default-course.jpg';
  };

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/mapel`);
        if (response.data.success) {
          setCategories(response.data.data.filter(cat => cat.status === 1));
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };

    fetchCategories();
  }, [API_BASE_URL]);

  // Fetch courses
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/sub_mapel`);
        if (response.data.success) {
          const transformedCourses = await Promise.all(
            response.data.data
              .filter(course => course.status === 1)
              .map(async (course) => {
                let videoUrl = null;
                let videoCount = 0;

                try {
                  const videoResponse = await axios.get(
                    `${API_BASE_URL}/detail_video_mapel/sub_mapel/${course.id_sub_mapel}`
                  );

                  if (Array.isArray(videoResponse.data) && videoResponse.data.length > 0) {
                    const activeVideos = videoResponse.data.filter(v => v.status === 1);
                    videoCount = activeVideos.length;

                    if (activeVideos.length > 0) {
                      videoUrl = activeVideos[0].video_mapel;
                    }
                  }
                } catch (error) {
                  console.error(`Error fetching video:`, error.message);
                }

                const courseObj = {
                  ...course,
                  video_url: videoUrl
                };

                return {
                  id: course.id_sub_mapel,
                  id_mapel: course.id_mapel,
                  category: course.kode_mapel.toLowerCase(),
                  categoryName: course.mapel,
                  title: course.sub_mapel,
                  video_url: videoUrl,
                  embedUrl: videoUrl ? getGoogleDriveEmbedUrl(videoUrl) : null,
                  videoCount: videoCount,
                  thumbnail: getThumbnailUrl(courseObj)
                };
              })
          );

          setCourses(transformedCourses);
          setLoading(false);
        }
      } catch (error) {
        console.error('Error fetching courses:', error);
        setLoading(false);
      }
    };

    fetchCourses();
  }, [API_BASE_URL]);

  const filteredCourses = useMemo(() => {
    return activeFilter === '*'
      ? courses
      : courses.filter(course => course.category === activeFilter);
  }, [activeFilter, courses]);

  const handleFilterClick = useCallback((filter) => {
    if (filter !== activeFilter) {
      setIsAnimating(true);
      setTimeout(() => {
        setActiveFilter(filter);
        setTimeout(() => setIsAnimating(false), 50);
      }, 300);
    }
  }, [activeFilter]);

  const handleCourseClick = useCallback((course) => {
    setSelectedCourse(course);
    setShowModal(true);
  }, []);

  const closeModal = useCallback(() => {
    setShowModal(false);
    setSelectedCourse(null);
  }, []);

  if (loading) {
    return (
      <div id="portfolio" className="our-portfolio section">
        <div className="container">
          <div className="row">
            <div className="col-lg-12 text-center">
              <div className="loading-spinner" style={{ padding: '3rem' }}>
                <i className="bi bi-hourglass-split" style={{ fontSize: '2rem', color: '#0d6efd' }}></i>
                <p style={{ marginTop: '1rem', color: '#6c757d' }}>Loading courses...</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

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
                {categories.map(cat => (
                  <li
                    key={cat.id_mapel}
                    className={activeFilter === cat.kode_mapel.toLowerCase() ? 'active' : ''}
                    onClick={() => handleFilterClick(cat.kode_mapel.toLowerCase())}
                  >
                    {cat.mapel}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
      <div className="container">
        <div className={`row portfolio-grid ${isAnimating ? 'animating' : ''}`}>
          {filteredCourses.length === 0 ? (
            <div className="col-lg-12 text-center">
              <p style={{ padding: '2rem', color: '#6c757d' }}>No courses available</p>
            </div>
          ) : (
            filteredCourses.map((course, index) => (
              <div
                key={`${activeFilter}-${course.id}`}
                className={`col-lg-4 col-md-6 portfolio-item ${course.category} ${isAnimating ? 'fade-out' : 'fade-in'}`}
                style={{
                  animationDelay: `${index * 0.1}s`
                }}
              >
                <div className="course-card" onClick={() => handleCourseClick(course)}>
                  <div className="course-image" style={{ position: 'relative', paddingTop: '56.25%', overflow: 'hidden', backgroundColor: '#f8f9fa' }}>
                    {course.embedUrl ? (
                      <iframe
                        src={course.embedUrl}
                        style={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          width: '100%',
                          height: '100%',
                          border: 'none',
                          pointerEvents: 'none'
                        }}
                        allow="autoplay"
                      />
                    ) : course.videoCount === 0 ? (
                      <div style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: '#e9ecef',
                        color: '#6c757d'
                      }}>
                        <i className="bi bi-camera-video-off" style={{ fontSize: '3rem', marginBottom: '0.5rem' }}></i>
                        <p style={{ margin: 0, fontSize: '0.9rem' }}>No videos available</p>
                      </div>
                    ) : (
                      <img
                        src={course.thumbnail}
                        alt={course.title}
                        style={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover'
                        }}
                        loading="lazy"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = '/assets/images/default-course.jpg';
                        }}
                      />
                    )}
                  </div>
                  <div className="course-content">
                    <span className="course-category">
                      {course.categoryName}
                    </span>
                    <h4>{course.title}</h4>
                    <div className="course-meta">
                      <span className="members-only">
                        <span>👑</span> Members Only
                      </span>
                      {course.videoCount > 0 && (
                        <span className="video-count" style={{
                          marginLeft: '0.5rem',
                          fontSize: '0.85rem',
                          color: '#6c757d'
                        }}>
                          <i className="bi bi-play-circle me-1"></i>
                          {course.videoCount} Video{course.videoCount > 1 ? 's' : ''}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
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
                  <span className="stat-text">{selectedCourse.videoCount} Lectures</span>
                </div>
              </div>
              <div className="modal-actions">
                <button
                  className="btn-preview"
                  onClick={() => navigate(`/course/${selectedCourse.id}`)}
                >
                  PREVIEW THIS COURSE
                  <div className="course-label" style={{ marginLeft: '12px' }}>
                    {selectedCourse.title}
                  </div>
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