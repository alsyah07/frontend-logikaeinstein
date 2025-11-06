import React, { useState, useEffect } from 'react'
import { useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import axios from 'axios'
import Swal from 'sweetalert2'

export default function Video() {
  const [currentUser, setCurrentUser] = useState(null);
  const navigate = useNavigate()
  const { state } = useLocation()
  const { id, judul } = useParams()
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
  
  // State untuk kode redeem
  const [redeemCode, setRedeemCode] = useState('')
  const [isRedeeming, setIsRedeeming] = useState(false)
  
  // State untuk status premium user
  const [isPremiumUser, setIsPremiumUser] = useState(false)
  
  // State untuk free playable count
  const [freePlayableCount, setFreePlayableCount] = useState(2)
  
  // State untuk video yang disimpan
  const [isSaved, setIsSaved] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

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
      if (match && match[1]) return match[1]
    }
    if (url.length < 50 && /^[a-zA-Z0-9_-]+$/.test(url)) return url
    return null
  }

  // Function untuk membuat embed URL yang optimal
  const getEmbedUrl = (url) => {
    if (!url) return ''
    const cleanUrl = String(url).replace(/[`"' ]/g, '').trim()
    if (cleanUrl.includes('youtube.com') || cleanUrl.includes('youtu.be')) return cleanUrl
    const driveId = extractDriveId(cleanUrl)
    if (driveId) return `https://drive.google.com/file/d/${driveId}/preview`
    return cleanUrl
  }

  // Check premium status dari localStorage atau API
  const checkPremiumStatus = () => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        const isPremium = userData.is_premium === 1 || userData.is_premium === true || userData.premium === true;
        setIsPremiumUser(isPremium);
        return isPremium;
      } catch (error) {
        console.error('Error checking premium status:', error);
        return false;
      }
    }
    return false;
  }

  // Helper baca/tulis daftar arsip per user
  const SAVED_LIST_KEY = (uid) => `saved_videos:${uid}`
  const readSavedList = (uid) => {
    try {
      const raw = localStorage.getItem(SAVED_LIST_KEY(uid)) || '[]'
      const arr = JSON.parse(raw)
      return Array.isArray(arr) ? arr : []
    } catch {
      return []
    }
  }
  const writeSavedList = (uid, list) => {
    try {
      localStorage.setItem(SAVED_LIST_KEY(uid), JSON.stringify(list))
    } catch {}
  }

  // Muat playlist dan tentukan video awal
  useEffect(() => {
    const fetchPlaylist = async () => {
      setIsLoading(true)
      setIsVideoLoading(true)

      let userId = null
      try {
        const raw = localStorage.getItem('user')
        if (raw) {
          const userData = JSON.parse(raw)
          setCurrentUser(userData)
          userId = userData?.id ?? null
        }
      } catch (error) {
        console.error('Error parsing user data:', error)
        localStorage.removeItem('user')
      }

      try {
        const base = import.meta.env.VITE_API_BASE_URL
        const endpoint = userId
          ? `${base}/detail_video_mapel/sub_mapel/${id}/${userId}`
          : `${base}/detail_video_mapel/sub_mapel/${id}`

        const res = await axios.get(endpoint)
        const data = res.data?.data || {}
        const items = data.detail_video_mapel || []
        const redeem = data.redeem

        const parseDate = (s) => {
          if (!s) return null
          const iso = s.includes('T') ? s : s.replace(' ', 'T')
          const d = new Date(iso)
          return isNaN(d) ? null : d
        }
        
        const now = new Date()
        const start = parseDate(redeem?.start_date || redeem?.date)
        const end = parseDate(redeem?.expired_date)
        const statusOk = String(redeem?.status || '').toLowerCase() === 'success'
        const flagOk = String(redeem?.status_redeem) === '0'
        const inWindow = (!start || now >= start) && (!end || now <= end)
        const redeemActive = !!redeem && statusOk && flagOk && inWindow
        const hasRedeemedBefore = !!redeem && statusOk && flagOk

        const isPremiumFromCheck = checkPremiumStatus()
        const userIsPremium = redeemActive || isPremiumFromCheck

        const totalVideos = items.length
        let freeCount = 2

        if (userIsPremium) {
          freeCount = totalVideos
        } else if (hasRedeemedBefore && !redeemActive) {
          freeCount = Math.max(2, Math.ceil(totalVideos * 0.2))
        }
        
        setFreePlayableCount(freeCount)
        setIsPremiumUser(userIsPremium)

        const mapped = items.map((it, idx) => ({
          id_detail_video_mapel: it.id_detail_video_mapel,
          id_sub_mapel_detail: it.id_sub_mapel_detail,
          title: it.tittle || it.sub_mapel || `Video ${idx + 1}`,
          url: getEmbedUrl(it.video_mapel),
          originalUrl: it.video_mapel,
          views: it.reviews || it.members || '0',
          date: it.date ? new Date(it.date).toLocaleDateString('id-ID') : '—',
          description: it.deskripsi || '',
          premium: idx >= freeCount,
          duration: it.durasi || '—',
        }))

        setPlaylist(mapped)

        const videoIdTarget = searchParams.get('v') || materi?.id_sub_mapel_detail
        let initial = mapped[0]
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
            id_sub_mapel_detail: initial.id_sub_mapel_detail,
          })
          setSearchParams({ v: initial.id_sub_mapel_detail }, { replace: true })
          
          // Tandai apakah video sudah disimpan pada arsip pengguna
          const saved = currentUser?.id
            ? readSavedList(currentUser.id).some(v => String(v.id_sub_mapel_detail) === String(initial.id_sub_mapel_detail))
            : false
          setIsSaved(saved)
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
    if (index >= freePlayableCount || item.premium) {
      setShowPayModal(true)
      return
    }
    
    setIsVideoLoading(true)
    setCurrentVideo({
      title: item.title,
      url: item.url,
      views: item.views || '0',
      date: item.date || '—',
      description: item.description || '',
      id_sub_mapel_detail: item.id_sub_mapel_detail,
    })

    setSearchParams({ v: item.id_sub_mapel_detail }, { replace: true })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleVideoLoad = () => {
    setIsVideoLoading(false)
  }

  const handleVideoError = () => {
    setIsVideoLoading(false)
    console.error('Error loading video')
  }

  // Tandai status 'isSaved' setiap kali user/video berubah
  useEffect(() => {
    if (!currentUser?.id || !currentVideo?.id_sub_mapel_detail) {
      setIsSaved(false)
      return
    }
    const list = readSavedList(currentUser.id)
    const exists = list.some(v => String(v.id_sub_mapel_detail) === String(currentVideo.id_sub_mapel_detail))
    setIsSaved(exists)
  }, [currentUser?.id, currentVideo?.id_sub_mapel_detail])

  const handleToggleSaveVideo = async () => {
    if (!currentUser) {
      Swal.fire({
        icon: 'warning',
        title: 'Login Diperlukan',
        text: 'Silakan login terlebih dahulu untuk menyimpan video.',
        confirmButtonColor: '#155ea0',
      })
      return
    }

    if (!currentVideo?.id_sub_mapel_detail) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Video tidak valid untuk disimpan.',
        confirmButtonColor: '#155ea0',
      })
      return
    }

    setIsSaving(true)

    try {
      const userId = currentUser.id
      let list = readSavedList(userId)

      // Cek apakah video sudah ada di arsip
      const idx = list.findIndex(v => String(v.id_sub_mapel_detail) === String(currentVideo.id_sub_mapel_detail))

      if (idx !== -1) {
        // Hapus dari arsip
        list.splice(idx, 1)
        writeSavedList(userId, list)
        setIsSaved(false)

        Swal.fire({
          icon: 'success',
          title: 'Dihapus dari Arsip',
          text: 'Video berhasil dihapus dari daftar tersimpan.',
          showConfirmButton: false,
          timer: 1500,
          timerProgressBar: true,
        })
      } else {
        // Simpan ke arsip (boleh lebih dari satu, simpan sebagai item baru)
        const videoData = {
          id_sub_mapel_detail: currentVideo.id_sub_mapel_detail,
          id_sub_mapel: id,
          title: currentVideo.title,
          judul: judul,
          url: currentVideo.url,
          views: currentVideo.views,
          date: currentVideo.date,
          description: currentVideo.description,
          category: course?.category || 'Matematika',
          courseTitle: course?.title || judul,
          savedAt: new Date().toISOString(),
          courseData: course,
        }

        // Masukkan di depan agar terbaru tampil dulu
        list.unshift(videoData)
        writeSavedList(userId, list)
        setIsSaved(true)

        Swal.fire({
          icon: 'success',
          title: 'Disimpan ke Arsip',
          html: `
            <p class="mb-2">✨ Video berhasil disimpan!</p>
            <p class="text-muted small mb-0">Lihat di halaman Riwayat untuk mengakses video tersimpan.</p>
          `,
          showConfirmButton: false,
          timer: 2000,
          timerProgressBar: true,
        })
      }
    } catch (error) {
      console.error('Error toggling save video:', error)
      Swal.fire({
        icon: 'error',
        title: 'Gagal Menyimpan',
        text: 'Terjadi kesalahan saat menyimpan video. Silakan coba lagi.',
        confirmButtonColor: '#155ea0',
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleRedeemCode = async () => {
    if (!redeemCode.trim()) {
      Swal.fire({
        icon: 'warning',
        title: 'Kode Kosong',
        text: 'Silakan masukkan kode redeem terlebih dahulu.',
        confirmButtonColor: '#155ea0',
      })
      return
    }

    if (!currentUser || !currentUser.id) {
      Swal.fire({
        icon: 'warning',
        title: 'Login Diperlukan',
        text: 'Silakan login terlebih dahulu untuk menggunakan kode redeem.',
        confirmButtonColor: '#155ea0',
      })
      return
    }

    setIsRedeeming(true)

    try {
      const codeUpperCase = redeemCode.trim().toUpperCase();
      const userId = currentUser.id;
      
      const response = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/redeem_users`, {
        code_redeem: codeUpperCase,
        id_users: userId
      })

      if (response.data.success) {
        setShowPayModal(false)
        setRedeemCode('')

        await Swal.fire({
          icon: 'success',
          title: 'Kode Berhasil Digunakan!',
          html: `
            <p class="mb-2">🎉 Selamat! Anda sekarang memiliki akses premium.</p>
            <p class="text-muted small mb-2">Kode: <strong>${codeUpperCase}</strong></p>
            <p class="text-success small mb-0">✨ Semua video premium kini dapat diakses!</p>
          `,
          confirmButtonColor: '#155ea0',
          confirmButtonText: 'Mulai Belajar',
        })

        window.location.reload()
      }
    } catch (error) {
      let errorMessage = 'Kode redeem tidak valid atau sudah digunakan.'

      if (error.response) {
        if (error.response.status === 404) {
          errorMessage = 'Kode redeem tidak ditemukan.'
        } else if (error.response.status === 400) {
          errorMessage = error.response.data.message || 'Kode redeem sudah digunakan atau tidak valid.'
        } else if (error.response.status === 409) {
          errorMessage = 'Kode redeem sudah digunakan.'
        } else {
          errorMessage = error.response.data.message || errorMessage
        }
      } else if (error.request) {
        errorMessage = 'Tidak dapat terhubung ke server. Periksa koneksi Anda.'
      }

      Swal.fire({
        icon: 'error',
        title: 'Redeem Gagal',
        text: errorMessage,
        confirmButtonColor: '#155ea0',
      })
    } finally {
      setIsRedeeming(false)
    }
  }

  const handleUpgradePremium = () => {
    try {
      const userData = currentUser || JSON.parse(localStorage.getItem('user') || '{}')

      if (!userData || !userData.email) {
        Swal.fire({
          icon: 'warning',
          title: 'Login Diperlukan',
          text: 'Silakan login terlebih dahulu untuk melakukan upgrade premium.',
          confirmButtonColor: '#155ea0',
        })
        setShowPayModal(false)
        return
      }

      const phoneNumber = '6285216463884'
      const message = `🔔 *PERMINTAAN UPGRADE PREMIUM* 🔔

Halo Admin Logika Einstein,

Saya ingin mengajukan upgrade ke akun Premium.

📋 *DATA PENGGUNA:*
━━━━━━━━━━━━━━━━
👤 Nama: ${userData.name || 'Tidak tersedia'}
📧 Email: ${userData.email || 'Tidak tersedia'}
📱 No HP: ${userData.no_hp || userData.phone || 'Tidak tersedia'}
🆔 Username: ${userData.username || 'Tidak tersedia'}
🔑 User ID: ${userData.id || 'Tidak tersedia'}

📚 *KURSUS:*
${course?.title || 'Tidak tersedia'}
🎯 Kategori: ${course?.category || 'Tidak tersedia'}

⏰ Waktu Pengajuan: ${new Date().toLocaleString('id-ID', {
        dateStyle: 'full',
        timeStyle: 'short'
      })}

Mohon informasi lebih lanjut mengenai cara upgrade ke Premium dan dapatkan kode redeem.

Terima kasih! 🙏`

      const encodedMessage = encodeURIComponent(message)
      const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`
      window.open(whatsappUrl, '_blank')
      setShowPayModal(false)

      Swal.fire({
        icon: 'info',
        title: 'WhatsApp Dibuka',
        html: `
          <p>Silakan kirim pesan untuk melanjutkan proses upgrade premium.</p>
          <p class="text-muted small">Admin akan memberikan kode redeem yang dapat Anda gunakan.</p>
        `,
        confirmButtonColor: '#155ea0',
        timer: 3000,
        timerProgressBar: true,
      })
    } catch (error) {
      console.error('Error membuka WhatsApp:', error)
      Swal.fire({
        icon: 'error',
        title: 'Terjadi Kesalahan',
        text: 'Gagal membuka WhatsApp. Pastikan Anda sudah login dan coba lagi.',
        confirmButtonColor: '#155ea0',
      })
    }
  }

  const isPlaying = (item) => {
    return String(currentVideo.title) === String(item.title) &&
      String(currentVideo.url) === String(item.url)
  }

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
                <h6 className="fw-bold mb-0">{course?.title || 'Logika Einstein'}</h6>
                <small className="text-muted">
                  {course?.category ? `${catData.emoji} ${course.category} • ${channel}` : channel}
                </small>
              </div>
            </div>
            <div className="d-flex align-items-center ms-auto gap-2">
              {isPremiumUser && (
                <span className="badge bg-warning text-dark rounded-pill px-3 py-2 me-2">
                  ⭐ Premium
                </span>
              )}
              <button className="btn btn-light rounded-pill px-3" onClick={() => navigate(-1)}>
                {/* ⬅️ Kembali */}
                Kembali
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
                <div className="d-flex align-items-start justify-content-between gap-3 mb-2">
                  <h4 className="fw-bold mb-0">{currentVideo.title} - {judul}</h4>
                  
                  {/* Save Button */}
                  <button
                    className={`btn rounded-pill px-4 d-flex align-items-center gap-2 ${
                      isSaved ? 'btn-warning' : 'btn-outline-secondary'
                    }`}
                    onClick={handleToggleSaveVideo}
                    disabled={isSaving || !currentUser}
                    title={isSaved ? 'Hapus dari arsip' : 'Simpan ke arsip'}
                  >
                    {isSaving ? (
                      <>
                        <span className="spinner-border spinner-border-sm" role="status"></span>
                        <span>Menyimpan...</span>
                      </>
                    ) : (
                      <>
                        <span style={{ fontSize: '20px' }}>{isSaved ? '⭐' : '☆'}</span>
                        <span>{isSaved ? 'Tersimpan' : 'Simpan'}</span>
                      </>
                    )}
                  </button>
                </div>
                
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
                        className={`w-100 d-flex align-items-start gap-3 text-start btn mb-2 border-0 ${isPlaying(item)
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

                        <div className="flex-grow-1" style={{ minWidth: 0 }}>
                          <div className={`d-flex align-items-center gap-2 mb-1`}>
                            <div
                              className="fw-semibold text-truncate"
                              style={{ fontSize: '14px' }}
                              title={item.title}
                            >
                              {item.title} - {judul}
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

      {/* Modal Premium dengan Kode Redeem */}
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
                onClick={() => {
                  setShowPayModal(false)
                  setRedeemCode('')
                }}
                aria-label="Close"
              />
            </div>
            <div className="modal-body">
              <p className="mb-3">Video ini adalah konten premium. Upgrade untuk mengakses semua fitur!</p>
              
              {/* Kode Redeem Section */}
              <div className="card border-0 bg-light rounded-3 p-3 mb-3">
                <h6 className="fw-bold mb-2">🎟️ Punya Kode Redeem?</h6>
                <p className="text-muted small mb-3">
                  Masukkan kode redeem untuk mendapatkan akses premium
                </p>
                <div className="input-group mb-2">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Masukkan kode redeem"
                    value={redeemCode}
                    onChange={(e) => setRedeemCode(e.target.value.toUpperCase())}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && redeemCode.trim()) {
                        handleRedeemCode()
                      }
                    }}
                    disabled={isRedeeming}
                    maxLength={20}
                    style={{ 
                      borderRadius: '8px 0 0 8px',
                      fontSize: '14px',
                      letterSpacing: '1px',
                      fontWeight: '600'
                    }}
                  />
                  <button
                    className="btn text-white"
                    style={{ 
                      background: catData.gradient, 
                      border: 'none',
                      borderRadius: '0 8px 8px 0',
                      minWidth: '100px'
                    }}
                    onClick={handleRedeemCode}
                    disabled={isRedeeming || !redeemCode.trim()}
                  >
                    {isRedeeming ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Proses...
                      </>
                    ) : (
                      '✨ Gunakan'
                    )}
                  </button>
                </div>
                <small className="text-muted">
                  Contoh format: PREMIUM2025
                </small>
              </div>

              {/* Divider */}
              <div className="position-relative my-4">
                <hr />
                <span 
                  className="position-absolute top-50 start-50 translate-middle bg-white px-3 text-muted"
                  style={{ fontSize: '14px' }}
                >
                  atau
                </span>
              </div>

              {/* Benefits Section */}
              <div className="card border-0 bg-light rounded-3 p-3 mb-3">
                <h6 className="fw-bold mb-2">✨ Keuntungan Premium:</h6>
                <ul className="mb-0">
                  <li>✅ Akses semua video premium</li>
                  <li>✅ Materi lengkap dan pembahasan</li>
                </ul>
              </div>
              
              <div className="alert alert-info rounded-3 mb-0">
                <small>
                  💬 Klik tombol di bawah untuk menghubungi admin via WhatsApp dan dapatkan kode redeem.
                </small>
              </div>
            </div>
            <div className="modal-footer border-0">
              <button
                className="btn btn-light rounded-pill px-4"
                onClick={() => {
                  setShowPayModal(false)
                  setRedeemCode('')
                }}
              >
                Batal
              </button>
              <button
                className="btn rounded-pill px-4 text-white d-flex align-items-center gap-2"
                style={{ background: catData.gradient, border: 'none' }}
                onClick={handleUpgradePremium}
              >
                <span>💬</span>
                <span>Dapatkan Kode</span>
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

        .input-group input:focus {
          box-shadow: none;
          border-color: #dee2e6;
        }

        .input-group button:hover:not(:disabled) {
          opacity: 0.9;
          transform: scale(1.02);
          transition: all 0.2s ease;
        }
      `}</style>
    </div>
  )
}