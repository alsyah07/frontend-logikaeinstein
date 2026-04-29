import React, { useState, useEffect } from 'react'
import { useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import axios from 'axios'
import Swal from 'sweetalert2'

export default function VideoPembahasan() {
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
    } catch { }
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
          ? `${base}/detail_video_pembahasan/${id}/${userId}`
          : `${base}/detail_video_pembahasan/${id}`
        console.log(endpoint)
        const res = await axios.get(endpoint)
        console.log(res)
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
        //console.log("items",items[0].sub_mapel)
        const mapped = items.map((it, idx) => ({
          id_detail_video_mapel: it.id_detail_video_mapel,
          id_sub_mapel_detail: it.id_sub_mapel_detail,
          title: judul || it.sub_mapel || `Video ${idx + 1}`,
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
    // Cek login terlebih dahulu sebelum menampilkan Konten Premium
    if (index >= freePlayableCount || item.premium) {
      if (!currentUser || !currentUser.id) {
        Swal.fire({
          icon: 'info',
          title: 'Login Diperlukan',
          text: 'Silakan login terlebih dahulu untuk mengakses Mata Pelajaran ini.',
          confirmButtonText: 'Login Sekarang',
          confirmButtonColor: '#155ea0',
          showCancelButton: true,
          cancelButtonText: 'Batal',
          reverseButtons: true,
        }).then((result) => {
          if (result.isConfirmed) {
            navigate('/')
          }
        })
        return
      }
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

  const handleNextVideo = () => {
    if (currentIndex < playlist.length - 1) {
      playVideo(playlist[currentIndex + 1], currentIndex + 1)
    }
  }

  const handlePrevVideo = () => {
    if (currentIndex > 0) {
      playVideo(playlist[currentIndex - 1], currentIndex - 1)
    }
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

      const { success, code, message } = response.data || {}

      if (success) {
        setShowPayModal(false)
        setRedeemCode('')

        if (code === 200) {
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
        } else if (code === 100) {
          await Swal.fire({
            icon: 'warning',
            title: 'Kode Sudah Digunakan',
            text: message || 'Code already used by another user',
            confirmButtonColor: '#155ea0',
          })
        } else {
          await Swal.fire({
            icon: 'error',
            title: 'Redeem Gagal',
            text: message || 'Terjadi kesalahan pada kode redeem.',
            confirmButtonColor: '#155ea0',
          })
        }
      } else {
        await Swal.fire({
          icon: 'error',
          title: 'Redeem Gagal',
          text: message || 'Kode redeem tidak valid atau sudah digunakan.',
          confirmButtonColor: '#155ea0',
        })
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

  const handleLoginOrRedeem = async () => {
    if (!currentUser || !currentUser.id) {
      navigate('/')
      return
    }

    const { value } = await Swal.fire({
      icon: 'info',
      title: 'Masukkan Kode Redeem',
      input: 'text',
      inputPlaceholder: 'Contoh: ABC123',
      confirmButtonText: 'Gunakan',
      confirmButtonColor: '#155ea0',
      showCancelButton: true,
      cancelButtonText: 'Batal',
    })

    if (value) {
      setRedeemCode(String(value).trim())
      handleRedeemCode()
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

      const phoneNumber = '6285591611938'
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
          allow="autoplay"
          sandbox="allow-scripts allow-same-origin"
          allowFullScreen
          loading="lazy"
          onLoad={handleVideoLoad}
          onError={handleVideoError}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
          }}
        />
      </>
    )
  }

  const currentIndex = playlist.findIndex(item => isPlaying(item))
  const hasNext = currentIndex < playlist.length - 1 && currentIndex >= 0
  const hasPrev = currentIndex > 0

  const styles = `
    .text-primary-dark { color: #1a1a9e !important; }
    .bg-primary-dark { background-color: #1a1a9e !important; }
    .bg-light-purple { background-color: #eaf0fb !important; }
    .nav-link-custom { color: white; text-decoration: none; font-weight: 600; font-size: 14px; margin: 0 15px; transition: opacity 0.2s; }
    .nav-link-custom:hover { opacity: 0.8; color: white; }
    .pill-toggle { display: inline-flex; border: 2px solid #1a1a9e; border-radius: 50px; overflow: hidden; margin: 0 auto; }
    .pill-toggle-btn { background: transparent; color: #1a1a9e; border: none; padding: 10px 40px; font-weight: 700; font-size: 15px; transition: all 0.2s; }
    .pill-toggle-btn.active { background: #1a1a9e; color: white; }
    
    .playlist-scroll::-webkit-scrollbar { width: 6px; }
    .playlist-scroll::-webkit-scrollbar-track { background: transparent; }
    .playlist-scroll::-webkit-scrollbar-thumb { background: #ccc; border-radius: 10px; }
    .playlist-scroll::-webkit-scrollbar-thumb:hover { background: #aaa; }
    
    @media (max-width: 768px) {
        .nav-center-desktop { display: none !important; }
        .pill-toggle-btn { padding: 8px 20px; font-size: 13px; }
        .top-bar-container { flex-direction: column; align-items: flex-start !important; gap: 15px; }
        .back-btn-container { position: static !important; }
        .pill-container { width: 100%; text-align: center; }
    }
  `;

  return (
    <>
      <style>{styles}</style>
      <div className="d-flex flex-column" style={{ minHeight: '100vh', backgroundColor: '#f8f9fa' }}>
        {/* Header */}
        <header className="bg-primary-dark sticky-top" style={{ zIndex: 1020 }}>
          <div className="container py-3" style={{ maxWidth: '1200px' }}>
            <div className="d-flex align-items-center justify-content-between">
              {/* Logo */}
              <div className="d-flex align-items-center gap-2 cursor-pointer" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
                <img
                  src="/Logogram_LogikaEinstein_IndigoWhite_Transparent_Outline.png"
                  alt="Logika Einstein"
                  style={{ height: '50px', objectFit: 'contain' }}
                />
                <div className="text-white lh-1 d-none d-sm-block ms-1">
                  <span className="fw-bold" style={{ fontSize: '18px', display: 'block' }}>Logika</span>
                  <span className="fw-bold" style={{ fontSize: '18px' }}>Einstein<span style={{ fontSize: '12px' }}>.com</span></span>
                </div>
              </div>

              {/* Center Nav - Desktop Only */}
              <div className="d-flex align-items-center nav-center-desktop">
                <a href="#" className="nav-link-custom" onClick={(e) => { e.preventDefault(); navigate('/'); }}>FISIKA</a>
                <a href="#" className="nav-link-custom" onClick={(e) => { e.preventDefault(); navigate('/'); }}>MATEMATIKA</a>
                <a href="#" className="nav-link-custom" onClick={(e) => { e.preventDefault(); navigate('/'); }}>FAVORIT</a>
              </div>

              {/* Right Icons */}
              <div className="d-flex align-items-center gap-2 gap-md-3">
                <button 
                  className="btn btn-link p-0 text-white border border-white rounded-circle d-flex align-items-center justify-content-center"
                  style={{ width: '36px', height: '36px' }}
                  onClick={() => navigate('/')}
                >
                  <img src="/Icons/Icon_Cari_white.png" alt="Search" style={{ width: '18px', height: '18px', objectFit: 'contain' }} />
                </button>
                {currentUser ? (
                  <button
                    className="d-flex align-items-center gap-2 px-3 py-1 rounded-pill text-white bg-transparent border border-white"
                    style={{ height: '36px' }}
                  >
                    <img src="/Icons/Icon_Profil_white.png" alt="Profile" style={{ width: '18px', height: '18px', objectFit: 'contain' }} />
                    <span className="small fw-bold">{currentUser.name.split(' ')[0]}</span>
                  </button>
                ) : (
                  <button
                    onClick={() => navigate('/')}
                    className="d-flex align-items-center gap-2 px-3 py-1 rounded-pill text-primary-dark bg-white border-0"
                    style={{ height: '36px' }}
                  >
                    <span className="small fw-bold">Login</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </header>

        <main className="flex-grow-1 overflow-auto" style={{ paddingBottom: '40px' }}>
          <div className="container py-4" style={{ maxWidth: '1200px' }}>
            
            {/* Top Bar with Back Button and Pill Toggle */}
            <div className="d-flex align-items-center position-relative mb-4 top-bar-container">
              <div className="back-btn-container position-absolute start-0">
                <button 
                  className="btn btn-link text-primary-dark text-decoration-none fw-bold p-0" 
                  onClick={() => navigate(-1)}
                  style={{ fontSize: '14px' }}
                >
                  ◀ kembali
                </button>
              </div>
              <div className="w-100 pill-container text-center">
                <div className="pill-toggle shadow-sm">
                  <button 
                    className="pill-toggle-btn" 
                    onClick={() => navigate(`/video/${id}/${encodeURIComponent(judul)}/logika`, { state: { course, materi } })}
                  >
                    TEORI
                  </button>
                  <button className="pill-toggle-btn active">
                    PEMBAHASAN SOAL
                  </button>
                </div>
              </div>
            </div>

            <div className="row g-4 mt-2">
              {/* Video Player Column */}
              <div className="col-12 col-lg-8">
                {/* Video Player */}
                <div className="position-relative shadow-sm overflow-hidden bg-dark" style={{ paddingBottom: '56.25%', borderRadius: '12px' }}>
                  <PlayerContent />
                </div>

                {/* Video Info */}
                <div className="mt-4 d-flex align-items-start justify-content-between flex-column flex-md-row gap-3">
                  <div>
                    <h2 className="fw-bold mb-0 text-uppercase" style={{ color: '#111', fontSize: '1.8rem' }}>
                      {course?.title || 'Fisika Dasar'} - {currentVideo.title} ({currentIndex >= 0 ? currentIndex + 1 : 1})
                    </h2>
                    <div className="d-flex gap-2 mt-3">
                      <button 
                        onClick={handlePrevVideo} 
                        disabled={currentIndex <= 0}
                        className="btn btn-sm rounded-pill px-3 py-2 d-flex align-items-center gap-2"
                        style={{ border: '1.5px solid #1a1a9e', color: '#1a1a9e', backgroundColor: '#f0f4ff', fontWeight: 'bold', fontSize: '12px' }}
                      >
                        <span style={{ fontSize: '14px' }}>⬅</span> Sebelumnya
                      </button>
                      <button 
                        onClick={handleNextVideo} 
                        disabled={currentIndex >= playlist.length - 1}
                        className="btn btn-sm rounded-pill px-3 py-2 d-flex align-items-center gap-2"
                        style={{ border: '1.5px solid #1a1a9e', color: 'white', backgroundColor: '#1a1a9e', fontWeight: 'bold', fontSize: '12px' }}
                      >
                        Selanjutnya <span style={{ fontSize: '14px' }}>➡</span>
                      </button>
                    </div>
                  </div>
                  <div className="d-flex flex-column align-items-end gap-2">
                    <button
                      className="btn rounded-pill px-4 py-2 d-flex align-items-center justify-content-center gap-2 fw-bold"
                      onClick={handleToggleSaveVideo}
                      disabled={isSaving || !currentUser}
                      style={{
                        border: '2px solid #6b7280',
                        backgroundColor: 'white',
                        color: '#374151',
                        fontSize: '14px',
                        minWidth: '120px'
                      }}
                    >
                      {isSaving ? (
                        <span className="spinner-border spinner-border-sm" role="status"></span>
                      ) : (
                        <>
                          <span style={{ fontSize: '18px' }}>{isSaved ? '★' : '☆'}</span>
                          <span>{isSaved ? 'Tersimpan' : 'Simpan'}</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Playlist Sidebar */}
              <div className="col-12 col-lg-4">
                <div className="card border-0 bg-light-purple p-4" style={{ borderRadius: '24px', minHeight: '100%' }}>
                  <h5 className="fw-bold text-center text-primary-dark mb-1">
                    📚 Playlist Video ({playlist.length})
                  </h5>
                  <div className="text-center mb-4">
                    <small className="text-muted" style={{ fontSize: '12px' }}>
                      Video {currentIndex >= 0 ? currentIndex + 1 : 1} dari {playlist.length}
                    </small>
                  </div>

                  <div className="d-flex flex-column gap-3 playlist-scroll" style={{ maxHeight: '600px', overflowY: 'auto', paddingRight: '5px' }}>
                    {isLoading ? (
                      <div className="text-center py-5">
                        <div className="spinner-border text-primary-dark" role="status">
                          <span className="visually-hidden">Loading...</span>
                        </div>
                      </div>
                    ) : playlist.length === 0 ? (
                      <div className="text-center py-5">
                        <p className="text-muted small">Tidak ada video dalam daftar ini</p>
                      </div>
                    ) : (
                      playlist.map((item, i) => {
                        const active = isPlaying(item);
                        return (
                          <div
                            key={item.id_detail_video_mapel || i}
                            className={`d-flex align-items-center gap-3 p-3 mb-2 w-100 border-0 ${active ? 'rounded-3' : ''}`}
                            style={{
                              backgroundColor: active ? '#bfdbfe' : 'transparent',
                              cursor: 'pointer',
                              transition: 'all 0.2s'
                            }}
                            onClick={() => playVideo(item, i)}
                          >
                            {/* Box Nomor / Icon */}
                            <div 
                              className="flex-shrink-0 rounded-3 d-flex align-items-center justify-content-center fw-bold"
                              style={{ 
                                width: '45px', 
                                height: '40px', 
                                backgroundColor: active ? 'rgba(255,255,255,0.5)' : '#e5e7eb',
                                color: active ? '#1a1a9e' : '#666',
                                fontSize: '16px'
                              }}
                            >
                              {active ? '▶' : i + 1}
                            </div>

                            {/* Content */}
                            <div className="flex-grow-1 min-w-0">
                              <div className="d-flex align-items-center gap-2 flex-wrap">
                                <div className={`fw-bold text-truncate ${active ? 'text-primary-dark' : 'text-dark'}`} style={{ fontSize: '14px' }}>
                                  {course?.title || 'Fisika Dasar'} - {item.title} ({i + 1})
                                </div>
                                {item.premium && !isPremiumUser && (
                                  <span className="badge rounded-pill text-dark" style={{ backgroundColor: '#fde047', fontSize: '10px', fontWeight: 'bold' }}>
                                    Premium
                                  </span>
                                )}
                              </div>
                              <div className="text-muted" style={{ fontSize: '12px', marginTop: '1px' }}>
                                {channel}
                              </div>
                              <div className="d-flex align-items-center gap-2 text-muted" style={{ fontSize: '11px', marginTop: '2px' }}>
                                <span>👁️ {item.views}</span>
                                <span>•</span>
                                <span>📅 {item.date}</span>
                              </div>
                            </div>
                          </div>
                        )
                      })
                    )}
                  </div>
                </div>
              </div>

              {/* Description Section */}
              <div className="col-12 col-lg-8 mt-5">
                <div className="card border-0 bg-white p-4 p-md-5 shadow-sm" style={{ borderRadius: '24px' }}>
                  <h4 className="fw-bold text-primary-dark mb-4 d-flex align-items-center gap-2">
                    <span>📝</span> Deskripsi
                  </h4>
                  <p className="text-muted" style={{ whiteSpace: 'pre-wrap', lineHeight: '1.8' }}>
                    {currentVideo.description || 'Tidak ada deskripsi untuk video ini.'}
                  </p>
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
                <p className="mb-3">
                  <div className="card border-0 bg-light rounded-3 p-3 mb-3">
                    <h6 className="fw-bold mb-2">Biaya berlangganan: 1 juta rupiah/tahun</h6>
                    <hr />
                    <h6 className="fw-bold mb-2">✨ Keuntungan Premium:</h6>
                    <ul className="mb-0">
                      <li style={{ fontSize: '10px' }}>No redeem yg kamu dapat bisa digunakan selama setahun dan
                        kamu bebas buka sebanyak banyaknya video dari materi kelas 7 hingga kelas 12</li>
                    </ul>
                  </div>
                </p>

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
                      className="btn text-white bg-primary-dark"
                      style={{
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

                <div className="position-relative my-4">
                  <hr />
                  <span
                    className="position-absolute top-50 start-50 translate-middle bg-white px-3 text-muted"
                    style={{ fontSize: '14px' }}
                  >
                    atau
                  </span>
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
                  className="btn rounded-pill px-4 text-white d-flex align-items-center gap-2 bg-primary-dark"
                  style={{ border: 'none' }}
                  onClick={handleUpgradePremium}
                >
                  <span>💬</span>
                  <span>Dapatkan Kode</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}