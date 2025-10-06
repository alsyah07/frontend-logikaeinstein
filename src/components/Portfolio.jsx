import React, { useState, useEffect } from 'react';
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

  // Function to generate thumbnail from video
  const generateVideoThumbnail = (videoUrl) => {
    return new Promise((resolve, reject) => {
      const video = document.createElement('video');
      video.crossOrigin = 'anonymous';
      video.src = videoUrl;
      video.currentTime = 1; // Capture at 1 second

      video.addEventListener('loadeddata', () => {
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        
        const ctx = canvas.getContext('2d');
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        const thumbnail = canvas.toDataURL('image/jpeg');
        resolve(thumbnail);
      });

      video.addEventListener('error', () => {
        reject(new Error('Failed to load video'));
      });
    });
  };

  // Function to get Google Drive thumbnail
  const getGoogleDriveThumbnail = (driveUrl) => {
    // Extract file ID from various Google Drive URL formats
    let fileId = null;
    
    // Format 1: /file/d/FILE_ID/preview
    const previewMatch = driveUrl.match(/\/file\/d\/([^\/]+)\/preview/);
    if (previewMatch) {
      fileId = previewMatch[1];
    }
    
    // Format 2: /file/d/FILE_ID/view
    const viewMatch = driveUrl.match(/\/file\/d\/([^\/]+)\/view/);
    if (viewMatch) {
      fileId = viewMatch[1];
    }
    
    // Format 3: ?id=FILE_ID
    const idMatch = driveUrl.match(/[?&]id=([^&]+)/);
    if (idMatch) {
      fileId = idMatch[1];
    }
    
    // Format 4: /open?id=FILE_ID
    const openMatch = driveUrl.match(/\/open\?id=([^&]+)/);
    if (openMatch) {
      fileId = openMatch[1];
    }
    
    if (fileId) {
      // Return Google Drive thumbnail URL
      return `https://drive.google.com/thumbnail?id=${fileId}&sz=w400-h300`;
    }
    
    return null;
  };

  // Function to get image/thumbnail URL
  const getImageUrl = (course) => {
    // Priority 1: If video URL exists in video_mapel, extract thumbnail
    if (course.video_url) {
      // Check if Google Drive video
      if (course.video_url.includes('drive.google.com')) {
        const driveThumbnail = getGoogleDriveThumbnail(course.video_url);
        if (driveThumbnail) return driveThumbnail;
      }
      
      // Check if Vimeo video
      const vimeoMatch = course.video_url.match(/vimeo\.com\/(\d+)/);
      if (vimeoMatch) {
        return `https://vumbnail.com/${vimeoMatch[1]}.jpg`;
      }
      
      // If direct video file (.mp4, .webm, etc)
      if (course.video_url.match(/\.(mp4|webm|ogg)$/i)) {
        return course.video_url;
      }
    }
    
    // Priority 2: If banner field exists in API (fallback)
    if (course.banner) {
      return `${API_BASE_URL.replace('/api/v1', '')}/uploads/${course.banner}`;
    }
    
    // Priority 3: Generate from title
    return `/assets/images/${course.sub_mapel.toLowerCase().replace(/\s+/g, '-')}.jpg`;
  };

  // Fetch categories (mapel)
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
  }, []);

  // Fetch courses (sub_mapel)
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/sub_mapel`);
        if (response.data.success) {
          // Transform API data and fetch video details for each course
          const transformedCourses = await Promise.all(
            response.data.data
              .filter(course => course.status === 1)
              .map(async (course) => {
                let videoUrl = null;
                let videoCount = 0;

                // Fetch video details for this sub_mapel
                try {
                  const videoResponse = await axios.get(
                    `${API_BASE_URL}/detail_video_mapel/sub_mapel/${course.id_sub_mapel}`
                  );
                  
                  // Check if response is array and has data
                  if (Array.isArray(videoResponse.data) && videoResponse.data.length > 0) {
                    // Filter only active videos (status = 1)
                    const activeVideos = videoResponse.data.filter(v => v.status === 1);
                    videoCount = activeVideos.length;
                    
                    if (activeVideos.length > 0) {
                      // Get first active video
                      const firstVideo = activeVideos[0];
                      videoUrl = firstVideo.video_mapel; // Ambil video_mapel untuk banner
                      
                      console.log(`Course: ${course.sub_mapel}`);
                      console.log(`- Video URL: ${videoUrl}`);
                      console.log(`- Total videos: ${videoCount}`);
                    }
                  }
                } catch (error) {
                  console.error(`Error fetching video for sub_mapel ${course.id_sub_mapel}:`, error.message);
                }

                // Build course object with video_url for banner extraction
                const courseObj = {
                  ...course,
                  video_url: videoUrl // Gunakan video_mapel sebagai sumber banner
                };

                return {
                  id: course.id_sub_mapel,
                  id_mapel: course.id_mapel,
                  category: course.kode_mapel.toLowerCase(),
                  categoryName: course.mapel,
                  title: course.sub_mapel,
                  video_url: videoUrl,
                  videoCount: videoCount,
                  image: getImageUrl(courseObj) // Generate banner dari video_mapel
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
  }, []);

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
                  <div className="course-image">
                    <img 
                      src={course.banner} 
                      alt={course.title}
                      onError={(e) => {
                        e.target.onerror = null;
                        // Final fallback
                        e.target.src = '/assets/images/default-course.jpg';
                      }}
                    />
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