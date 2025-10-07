import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './AllCourses2.css';

const AllCourses = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [viewMode, setViewMode] = useState('grid');
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [apiCourses, setApiCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedMapel, setSelectedMapel] = useState('all');
  const [isAnimating, setIsAnimating] = useState(false);

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  // Function to get Google Drive embed URL
  const getGoogleDriveEmbedUrl = (driveUrl) => {
    if (!driveUrl) return null;
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

  // Function to get thumbnail URL
  const getThumbnailUrl = (videoUrl) => {
    if (videoUrl && videoUrl.includes('drive.google.com')) {
      const patterns = [
        /\/file\/d\/([^\/]+)/,
        /[?&]id=([^&]+)/,
      ];
      
      for (const pattern of patterns) {
        const match = videoUrl.match(pattern);
        if (match) {
          const fileId = match[1];
          return `https://drive.google.com/thumbnail?id=${fileId}&sz=w400`;
        }
      }
    }
    return '/assets/images/default-course.jpg';
  };

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

                return {
                  id: course.id_sub_mapel,
                  id_mapel: course.id_mapel,
                  title: course.sub_mapel,
                  category: course.mapel,
                  categoryCode: course.kode_mapel?.toLowerCase(),
                  video_url: videoUrl,
                  embedUrl: videoUrl ? getGoogleDriveEmbedUrl(videoUrl) : null,
                  thumbnail: getThumbnailUrl(videoUrl),
                  videoCount: videoCount,
                  date: course.created_at || new Date().toISOString(),
                  level: 'Advanced',
                  instructor: 'admin'
                };
              })
          );
          
          setApiCourses(transformedCourses);
          setLoading(false);
        }
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Gagal mengambil data. Silakan coba lagi.');
        setLoading(false);
      }
    };

    fetchCourses();
  }, [API_BASE_URL]);

  const staticCourses = useMemo(() => [], []);

  const normalizedCourses = useMemo(() => {
    return [...apiCourses, ...staticCourses];
  }, [apiCourses, staticCourses]);

  const availableMapel = useMemo(() => {
    const mapelSet = new Set();
    normalizedCourses.forEach(course => {
      if (course.category) mapelSet.add(course.category);
    });
    return ['all', ...Array.from(mapelSet).sort()];
  }, [normalizedCourses]);

  const sortedCourses = useMemo(() => {
    let filtered = normalizedCourses;
    if (selectedMapel !== 'all') {
      filtered = filtered.filter(course => course.category === selectedMapel);
    }
    filtered = filtered.filter(course => {
      const searchLower = searchTerm.toLowerCase();
      return (
        course.title?.toLowerCase().includes(searchLower) ||
        course.category?.toLowerCase().includes(searchLower)
      );
    });
    return filtered.sort((a, b) => {
      switch (sortBy) {
        case 'newest': return new Date(b.date) - new Date(a.date);
        case 'oldest': return new Date(a.date) - new Date(b.date);
        case 'alphabetical': return (a.title || '').localeCompare(b.title || '');
        case 'members': return (b.videoCount || 0) - (a.videoCount || 0);
        default: return 0;
      }
    });
  }, [normalizedCourses, searchTerm, sortBy, selectedMapel]);

  const handleCourseClick = (course) => {
    setSelectedCourse(course);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedCourse(null);
  };

  useEffect(() => {
    if (showModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [showModal]);

  if (loading) {
    return (
      <div className="modern-courses-page">
        <div className="loading-container">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3 text-muted">Memuat kursus...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="modern-courses-page">
        <div className="container py-5">
          <div className="alert alert-danger" role="alert">
            <i className="bi bi-exclamation-triangle-fill me-2"></i>
            {error}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="modern-courses-page">
     <br></br>
      <div className="hero-section">
        <div className="container">
          <div className="row">
            <div className="col-lg-8 mx-auto text-center">
              <h1 className="hero-title mb-3">Temukan Kursus Impianmu</h1>
              <p className="hero-subtitle">Jelajahi koleksi lengkap kursus berkualitas tinggi</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container">
        {/* Search and Filter Card */}
        <div className="controls-card">
          <div className="row g-3">
            <div className="col-lg-5">
              <div className="search-wrapper">
                <i className="bi bi-search search-icon"></i>
                <input
                  type="text"
                  className="form-control form-control-lg search-input"
                  placeholder="Cari kursus..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <div className="col-lg-3">
              <div className="filter-wrapper">
                <i className="bi bi-funnel filter-icon"></i>
                <select
                  className="form-select form-select-lg filter-select"
                  value={selectedMapel}
                  onChange={(e) => setSelectedMapel(e.target.value)}
                >
                  <option value="all">Semua Mata Pelajaran</option>
                  {availableMapel.filter(m => m !== 'all').map((mapel) => (
                    <option key={mapel} value={mapel}>{mapel}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="col-lg-2">
              <select
                className="form-select form-select-lg"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="newest">Terbaru</option>
                <option value="oldest">Terlama</option>
                <option value="alphabetical">A-Z</option>
                <option value="members">Populer</option>
              </select>
            </div>

            <div className="col-lg-2">
              <div className="btn-group w-100" role="group">
                <button
                  type="button"
                  className={`btn btn-lg ${viewMode === 'grid' ? 'btn-primary' : 'btn-outline-primary'}`}
                  onClick={() => setViewMode('grid')}
                >
                  <i className="bi bi-grid-3x3-gap"></i>
                </button>
                <button
                  type="button"
                  className={`btn btn-lg ${viewMode === 'list' ? 'btn-primary' : 'btn-outline-primary'}`}
                  onClick={() => setViewMode('list')}
                >
                  <i className="bi bi-list-ul"></i>
                </button>
              </div>
            </div>
          </div>

          <div className="results-info mt-3">
            <i className="bi bi-graph-up me-2"></i>
            <span>
              <strong>{sortedCourses.length}</strong> kursus ditemukan
              {selectedMapel !== 'all' && ` dalam ${selectedMapel}`}
              {searchTerm && ` untuk "${searchTerm}"`}
            </span>
          </div>
        </div>

        {/* Courses Grid - Portfolio Style */}
        {sortedCourses.length === 0 ? (
          <div className="no-results text-center py-5">
            <i className="bi bi-inbox display-1 text-muted mb-3"></i>
            <h3>Tidak ada kursus ditemukan</h3>
            <p className="text-muted">Coba sesuaikan filter atau kata kunci pencarian</p>
          </div>
        ) : (
          <div className={`row g-4 portfolio-grid ${viewMode === 'list' ? 'courses-list-view' : ''}`}>
            {sortedCourses.map((course, index) => (
              <div 
                key={course.id} 
                className={viewMode === 'grid' ? 'col-lg-4 col-md-6' : 'col-12'}
              >
                <div 
                  className="portfolio-course-card"
                  onClick={() => handleCourseClick(course)}
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  {/* Video/Image Section */}
                  <div className="portfolio-course-image">
                    {course.embedUrl ? (
                      <iframe
                        src={course.embedUrl}
                        className="course-iframe"
                        allow="autoplay"
                      />
                    ) : course.videoCount === 0 ? (
                      <div className="no-video-placeholder">
                        <i className="bi bi-camera-video-off"></i>
                        <p>No videos available</p>
                      </div>
                    ) : (
                      <iframe
                        src={course.embedUrl || course.thumbnail}
                        className="course-iframe"
                        allow="autoplay"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          const placeholder = document.createElement('div');
                          placeholder.className = 'no-video-placeholder';
                          placeholder.innerHTML = '<i class="bi bi-camera-video-off"></i><p>Video not available</p>';
                          e.target.parentNode.appendChild(placeholder);
                        }}
                      />
                    )}
                    <div className="portfolio-overlay">
                      <button className="btn btn-light btn-sm preview-btn">
                        <i className="bi bi-eye me-1"></i> Preview
                      </button>
                    </div>
                  </div>

                  {/* Course Content */}
                  <div className="portfolio-course-content">
                    <span className="portfolio-course-category">{course.category}</span>
                    <h4 className="portfolio-course-title">{course.title}</h4>
                    <div className="portfolio-course-meta">
                      <span className="members-badge">
                        <span>👑</span> Members Only
                      </span>
                      {course.videoCount > 0 && (
                        <span className="video-count-badge">
                          <i className="bi bi-play-circle me-1"></i>
                          {course.videoCount} Video{course.videoCount > 1 ? 's' : ''}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal - Portfolio Style */}
      {showModal && selectedCourse && (
        <div className="portfolio-modal-overlay" onClick={closeModal}>
          <div className="portfolio-modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="portfolio-modal-close" onClick={closeModal}>×</button>
            
            <div className="portfolio-modal-header">
              <div className="instructor-info">
                <div className="instructor-avatar">
                  <img src="/assets/images/logo-icon.png" alt="admin" />
                </div>
                <span className="instructor-name">{selectedCourse.instructor}</span>
              </div>
            </div>

            <div className="portfolio-modal-body">
              <h2 className="portfolio-modal-title">{selectedCourse.title}</h2>
              
              <div className="portfolio-course-stats">
                <div className="portfolio-stat-item">
                  <span className="stat-icon">📊</span>
                  <span className="stat-text">{selectedCourse.level}</span>
                </div>
                <div className="portfolio-stat-item">
                  <span className="stat-icon">📚</span>
                  <span className="stat-text">{selectedCourse.videoCount} Lectures</span>
                </div>
              </div>

              <div className="portfolio-modal-actions">
                <button 
                  className="portfolio-btn-preview"
                  onClick={() => navigate(`/course/${selectedCourse.id}`)}
                >
                  PREVIEW THIS COURSE
                </button>
                <button 
                  className="portfolio-btn-wishlist"
                  onClick={(e) => e.stopPropagation()}
                >
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

export default AllCourses;