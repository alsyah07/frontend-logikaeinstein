import React, { useState, useEffect } from 'react'
import { useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom' 
import axios from 'axios'

export default function Pembahasan() {
  const navigate = useNavigate()
  const { state } = useLocation()
  const { id } = useParams()
  const [searchParams, setSearchParams] = useSearchParams()

  const course = state?.course
  const materi = state?.materi

  const initialTitle = materi?.judul || 'Materi Video'
  const initialUrl = materi?.videoUrl || ''
  const channel = 'Logika Einstein'

  // STATE
  const [currentVideo, setCurrentVideo] = useState({
    title: initialTitle,
    url: initialUrl,
    views: '0',
    date: '—',
    description: '',
  })
  const [showPayModal, setShowPayModal] = useState(false)
  const [playlist, setPlaylist] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [isVideoLoading, setIsVideoLoading] = useState(true)

  const categoryData = {
    Matematika: {
      emoji: '🧮',
      gradient: 'linear-gradient(135deg, #2e6ca9 0%, #9dc6f4ff 100%)',
      color: '#155ea0',
    },
    Fisika: {
      emoji: '⚛️',
      gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      color: '#0ea5e9',
    },
  }

  const catData = categoryData[course?.category] || categoryData.Matematika

  // Function untuk extract Google Drive ID dari URL
  const extractDriveId = (url) => {
    if (!url) return null
    
    const patterns = [
      /\/file\/d\/([a-zA-Z0-9_-]+)/,
      /id=([a-zA-Z0-9_-]+)/,
      /\/d\/([a-zA-Z0-9_-]+)/,
    ]

    for (const pattern of patterns) {
      const match = url.match(pattern)
      if (match && match[1]) {
        return match[1]
      }
    }

    if (url.length < 50 && /^[a-zA-Z0-9_-]+$/.test(url)) {
      return url
    }

    return null
  }

  // Function untuk membuat embed URL yang optimal
  const getEmbedUrl = (url) => {
    if (!url) return ''
    
    // Bersihkan URL dari backtick/whitespace
    const cleanUrl = String(url).replace(/[`"' ]/g, '').trim()
    
    // Cek apakah YouTube
    if (cleanUrl.includes('youtube.com') || cleanUrl.includes('youtu.be')) {
      return cleanUrl
    }
    
    // Cek apakah Google Drive
    const driveId = extractDriveId(cleanUrl)
    if (driveId) {
      return `https://drive.google.com/file/d/${driveId}/preview`
    }

    return cleanUrl
  }

  // Muat playlist dan tentukan video awal
  useEffect(() => {
    const fetchPlaylist = async () => {
      setIsLoading(true)
      setIsVideoLoading(true)
      
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/detail_video_mapel/sub_mapel/${id}`)
        const items = res.data?.data?.detail_video_mapel || []

        const mapped = items.map((it, idx) => ({
          id_detail_video_mapel: it.id_detail_video_mapel,
          id_sub_mapel_detail: it.id_sub_mapel_detail,
          title: it.tittle || it.sub_mapel || `Video ${idx + 1}`,
          url: getEmbedUrl(it.video_mapel),
          originalUrl: it.video_mapel,
          views: it.reviews || it.members || '0',
          date: it.date ? new Date(it.date).toLocaleDateString('id-ID') : '—',
          description: it.deskripsi || '',
          premium: it.premium || (idx >= 2), // Video ke-3 dst premium
          duration: it.durasi || '—',
        }))

        setPlaylist(mapped)

        // Logika penentuan video awal
        const videoIdTarget = searchParams.get('v') || materi?.id_sub_mapel_detail 
        
        let initial = mapped[0] // Default: Video pertama

        if (videoIdTarget) {
          const match = mapped.find(m => String(m.id_sub_mapel_detail) === String(videoIdTarget))
          if (match) initial = match
        }
        
        if (initial) {
          setCurrentVideo({
            title: initial.title,
            url: initial.url || initialUrl,
            views: initial.views,
            date: initial.date,
            description: initial.description,
          })
          
          setSearchParams({ v: initial.id_sub_mapel_detail }, { replace: true })
        }

      } catch (err) {
        console.error('Gagal memuat playlist:', err)
      } finally {
        setIsLoading(false)
      }
    }

    if (id) fetchPlaylist()
  }, [id])

  const playVideo = (item, index) => {
    // Kunci untuk video premium
    if (item.premium) {
      setShowPayModal(true)
      return
    }
    
    // Update state video
    setIsVideoLoading(true)
    setCurrentVideo({
      title: item.title,
      url: item.url,
      views: item.views || '0',
      date: item.date || '—',
      description: item.description || '',
    })
    
    // Update query parameter
    setSearchParams({ v: item.id_sub_mapel_detail }, { replace: true })

    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // Handle video load
  const handleVideoLoad = () => {
    setIsVideoLoading(false)
  }

  const handleVideoError = () => {
    setIsVideoLoading(false)
    console.error('Error loading video')
  }

  // Utility untuk cek video sedang aktif
  const isPlaying = (item) => {
    return String(currentVideo.title) === String(item.title) && 
           String(currentVideo.url) === String(item.url)
  }
  
  // Player Content dengan Loading State
  const PlayerContent = () => {
    if (isLoading) {
      return (
        <div className="d-flex align-items-center justify-content-center text-white h-100">
          <div className="text-center">
            <div className="spinner-border text-light mb-3" role="status" style={{ width: '3rem', height: '3rem' }}>
              <span className="visually-hidden">Loading...</span>
            </div>
            <p>Memuat Video...</p>
          </div>
        </div>
      )
    }

    if (!currentVideo.url) {
      return (
        <div className="d-flex align-items-center justify-content-center text-white h-100">
          <div className="text-center">
            <div style={{ fontSize: '64px', marginBottom: '16px' }}>🎬</div>
            <h5>Tidak Ada Video</h5>
            <p className="text-white-50">Video tidak tersedia</p>
          </div>
        </div>
      )
    }
    
    return (
      <>
        {/* Loading Overlay */}
        {isVideoLoading && (
          <div 
            className="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
            style={{ backgroundColor: '#000', zIndex: 10 }}
          >
            <div className="text-center text-white">
              <div className="spinner-border mb-3" role="status" style={{ width: '3rem', height: '3rem' }}>
                <span className="visually-hidden">Loading...</span>
              </div>
              <p>Memuat video...</p>
            </div>
          </div>
        )}

        {/* Video Iframe */}
        <iframe
          src={currentVideo.url}
          title={currentVideo.title}
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          loading="lazy"
          onLoad={handleVideoLoad}
          onError={handleVideoError}
          style={{ 
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%'
          }}
        />
      </>
    )
  }

  // Get current video index for navigation
  const currentIndex = playlist.findIndex(item => isPlaying(item))
  const hasNext = currentIndex < playlist.length - 1 && currentIndex >= 0
  const hasPrev = currentIndex > 0

  const goToNext = () => {
    if (hasNext) {
      playVideo(playlist[currentIndex + 1], currentIndex + 1)
    }
  }

  const goToPrev = () => {
    if (hasPrev) {
      playVideo(playlist[currentIndex - 1], currentIndex - 1)
    }
  }

  return (
    <div className="d-flex flex-column" style={{ minHeight: '100vh', backgroundColor: '#f8f9fa' }}>
      {/* Header */}
      <header className="glass-effect sticky-top" style={{ zIndex: 1020, borderBottom: '1px solid rgba(0,0,0,0.05)', background: 'rgba(255, 255, 255, 0.95)', backdropFilter: 'blur(10px)' }}>
        <div className="container py-3" style={{ maxWidth: '1400px' }}>
          <div className="d-flex align-items-center justify-content-between">
            <div className="d-flex align-items-center gap-3">
              <img
                src="/images/logo_logika.png"
                alt="Logika Einstein"
                className="rounded-3 flex-shrink-0"
                style={{ width: '40px', height: '40px', objectFit: 'cover' }}
              />
              <div>
                <h6 className="fw-bold mb-0">{course?.title || 'Video Pembahasan'}</h6>
                <small className="text-muted">
                  {course?.category ? `${catData.emoji} ${course.category} • ${channel}` : channel}
                </small>
              </div>
            </div>
            <div className="d-flex align-items-center ms-auto gap-2">
              <button className="btn btn-light rounded-pill px-3" onClick={() => navigate(-1)}>
                ⬅️ Kembali
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-grow-1 overflow-auto" style={{ paddingBottom: '40px' }}>
        <div className="container" style={{ maxWidth: '1400px' }}>
          <div className="row g-4 mt-2">
            {/* Video Player Column */}
            <div className="col-12 col-lg-8">
              {/* Video Player */}
              <div className="position-relative rounded-3 shadow-sm overflow-hidden bg-dark" style={{ paddingBottom: '56.25%' }}>
                <PlayerContent />
              </div>

              {/* Video Info */}
              <div className="mt-3">
                <h4 className="fw-bold mb-2">{currentVideo.title}</h4>
                <div className="d-flex flex-wrap align-items-center gap-3 text-muted mb-3">
                  <span>👁️ {currentVideo.views} x ditonton</span>
                  <span>•</span>
                  <span>📅 {currentVideo.date}</span>
                </div>

                {/* Navigation Buttons */}
                {playlist.length > 1 && (
                  <div className="d-flex gap-2 mb-3">
                    <button
                      className="btn btn-outline-primary rounded-pill px-4"
                      disabled={!hasPrev}
                      onClick={goToPrev}
                    >
                      ⬅️ Sebelumnya
                    </button>
                    <button
                      className="btn rounded-pill px-4 text-white"
                      style={{ background: catData.gradient, border: 'none' }}
                      disabled={!hasNext}
                      onClick={goToNext}
                    >
                      Selanjutnya ➡️
                    </button>
                  </div>
                )}
              </div>

              {/* Description Card */}
              <div className="card border-0 shadow-sm rounded-4 mt-3">
                <div className="card-body">
                  <h6 className="fw-bold mb-3">📝 Deskripsi</h6>
                  <div className="text-muted" style={{ whiteSpace: 'pre-wrap' }}>
                    {currentVideo.description || course?.description || 'Video pembelajaran untuk materi ini.'}
                  </div>
                </div>
              </div>

              {/* Course Info Card */}
              {course && (
                <div className="card border-0 shadow-sm rounded-4 mt-3">
                  <div className="card-body">
                    <div className="d-flex align-items-center gap-3">
                      <div
                        className="d-flex align-items-center justify-content-center rounded-3"
                        style={{ 
                          width: '56px', 
                          height: '56px', 
                          background: catData.gradient,
                          fontSize: '24px'
                        }}
                      >
                        {catData.emoji}
                      </div>
                      <div>
                        <h6 className="fw-bold mb-1">{course.title}</h6>
                        <small className="text-muted">
                          ⭐ {course.rating?.toFixed(1) || '0.0'} • 👥 {course.students || 0} siswa
                        </small>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Playlist Sidebar */}
            <div className="col-12 col-lg-4">
              <div className="card border-0 shadow-sm rounded-4 sticky-top" style={{ top: '80px' }}>
                <div className="card-header bg-white border-0 p-3">
                  <h6 className="fw-bold mb-0">
                    📚 Playlist Video ({playlist.length})
                  </h6>
                  {currentIndex >= 0 && (
                    <small className="text-muted">Video {currentIndex + 1} dari {playlist.length}</small>
                  )}
                </div>
                
                <div className="card-body p-0" style={{ maxHeight: '600px', overflowY: 'auto' }}>
                  {isLoading ? (
                    <div className="text-center py-5">
                      <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                      </div>
                      <p className="mt-2 text-muted small">Memuat playlist...</p>
                    </div>
                  ) : playlist.length === 0 ? (
                    <div className="text-center py-5">
                      <div style={{ fontSize: '48px', marginBottom: '16px' }}>📹</div>
                      <p className="text-muted small">Tidak ada video dalam daftar ini</p>
                    </div>
                  ) : (
                    playlist.map((item, i) => (
                      <button
                        key={item.id_detail_video_mapel || i}
                        className={`w-100 d-flex align-items-start gap-3 text-start btn mb-2 border-0 ${
                          isPlaying(item) 
                            ? 'text-white shadow' 
                            : 'btn-light'
                        }`}
                        style={{
                          background: isPlaying(item) ? catData.gradient : 'transparent',
                          transition: 'all 0.2s ease',
                          padding: '12px 16px'
                        }}
                        onClick={() => playVideo(item, i)}
                        disabled={isPlaying(item)}
                      >
                        {/* Thumbnail/Number */}
                        <div
                          className="rounded-2 d-flex align-items-center justify-content-center flex-shrink-0 fw-bold"
                          style={{ 
                            width: '60px', 
                            height: '45px', 
                            fontSize: '16px',
                            backgroundColor: isPlaying(item) ? 'rgba(255,255,255,0.2)' : '#e5e7eb',
                            color: isPlaying(item) ? 'white' : '#6b7280'
                          }}
                        >
                          {isPlaying(item) ? '▶️' : i + 1}
                        </div>

                        {/* Video Info */}
                        <div className="flex-grow-1" style={{ minWidth: 0 }}>
                          <div className={`d-flex align-items-center gap-2 mb-1`}>
                            <div 
                              className="fw-semibold text-truncate" 
                              style={{ fontSize: '14px' }}
                              title={item.title}
                            >
                              {item.title}
                            </div>
                            {item.premium && (
                              <span className="badge bg-warning text-dark rounded-pill flex-shrink-0" style={{ fontSize: '10px' }}>
                                Premium
                              </span>
                            )}
                          </div>
                          <div className={`small ${isPlaying(item) ? 'text-white-50' : 'text-muted'}`}>
                            {channel}
                          </div>
                          <div className={`small ${isPlaying(item) ? 'text-white-50' : 'text-muted'}`}>
                            👁️ {item.views} • 📅 {item.date}
                          </div>
                        </div>
                      </button>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Modal Premium */}
      <div 
        className={`modal fade ${showPayModal ? 'show d-block' : ''}`} 
        tabIndex="-1" 
        aria-hidden={!showPayModal} 
        style={{ backgroundColor: showPayModal ? 'rgba(0,0,0,0.5)' : 'transparent' }}
      >
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content rounded-4 border-0 shadow-lg">
            <div className="modal-header border-0">
              <h5 className="modal-title fw-bold">🔒 Konten Premium</h5>
              <button 
                type="button" 
                className="btn-close" 
                onClick={() => setShowPayModal(false)} 
                aria-label="Close"
              />
            </div>
            <div className="modal-body">
              <p className="mb-3">Video ini adalah konten premium. Upgrade untuk mengakses semua fitur!</p>
              <div className="card border-0 bg-light rounded-3 p-3 mb-3">
                <h6 className="fw-bold mb-2">✨ Keuntungan Premium:</h6>
                <ul className="mb-0">
                  <li>✅ Akses semua video premium</li>
                  <li>✅ Materi lengkap dan pembahasan</li>
                  <li>✅ Download materi PDF</li>
                  <li>✅ Tanpa iklan</li>
                  <li>✅ Sertifikat digital</li>
                </ul>
              </div>
            </div>
            <div className="modal-footer border-0">
              <button 
                className="btn btn-light rounded-pill px-4" 
                onClick={() => setShowPayModal(false)}
              >
                Batal
              </button>
              <button 
                className="btn rounded-pill px-4 text-white" 
                style={{ background: catData.gradient, border: 'none' }}
                onClick={() => {
                  setShowPayModal(false)
                  alert('Fitur pembayaran akan segera tersedia!')
                }}
              >
                💳 Upgrade Sekarang
              </button>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .card-body::-webkit-scrollbar {
          width: 6px;
        }

        .card-body::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 10px;
        }

        .card-body::-webkit-scrollbar-thumb {
          background: #888;
          border-radius: 10px;
        }

        .card-body::-webkit-scrollbar-thumb:hover {
          background: #555;
        }

        .glass-effect {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
        }
      `}</style>
    </div>
  )
}