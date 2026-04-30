import React, { useState, useEffect } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import axios from 'axios'

export default function DetailMapel() {
    const { id } = useParams()
    const navigate = useNavigate()
    const { state } = useLocation()
    const course = state?.course

    const [query, setQuery] = useState('')
    const [materiData, setMateriData] = useState([])
    const [isLoadingMateri, setIsLoadingMateri] = useState(false)
    const [showModal, setShowModal] = useState(false)
    const [selectedMateri, setSelectedMateri] = useState(null)

    const filteredMateri = query
        ? materiData.filter(m =>
            String(m.judul || m.title || '')
                .toLowerCase()
                .includes(query.toLowerCase())
        )
        : materiData

    const categoryData = {
        Matematika: {
            emoji: '🧮',
            gradient: 'linear-gradient(135deg, #2e6ca9 0%, #9dc6f4ff 100%)',
            color: '#155ea0',
        },
        Fisika: {
            emoji: '⚛️',
            gradient: 'linear-gradient(135deg, #2e6ca9 0%, #9dc6f4ff 100%)',
            color: '#155ea0',
        },
    }

    useEffect(() => {
        const fetchMateri = async () => {
            if (!id) return

            setIsLoadingMateri(true)
            try {
                const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/sub_mapel_detail/${id}`)
                if (response.data.success && response.data.data) {
                    const transformedMateri = response.data.data.map(item => ({
                        id: item.id_sub_detail_mapel,
                        id_sub_detail_mapel: item.id_sub_detail_mapel,
                        id_sub_mapel: item.id_sub_mapel,
                        judul: item.sub_detail_mapel,
                        title: item.tittle || item.sub_detail_mapel,
                        selesai: false,
                        status: item.status,
                        created_at: item.created_at,
                        updated_at: item.updated_at
                    }))
                    setMateriData(transformedMateri)
                }
            } catch (error) {
                console.error('Error fetching materi:', error)
                setMateriData([])
            } finally {
                setIsLoadingMateri(false)
            }
        }

        fetchMateri()
    }, [id])

    const handleOpenModal = (materi) => {
        setSelectedMateri(materi)
        setShowModal(true)
    }

    const handleCloseModal = () => {
        setShowModal(false)
        setSelectedMateri(null)
    }

    const handleNavigateToVideo = () => {
        if (selectedMateri?.id_sub_detail_mapel && selectedMateri?.judul) {
            handleCloseModal()
            navigate(`/video/${selectedMateri.id_sub_detail_mapel}/${encodeURIComponent(selectedMateri.judul)}/logika`)
        }
    }

    const handleNavigateToPembahasan = () => {
        if (selectedMateri?.id_sub_detail_mapel && selectedMateri?.judul) {
            handleCloseModal()
            navigate(`/pembahasan/${selectedMateri.id_sub_detail_mapel}/${encodeURIComponent(selectedMateri.judul)}`)
        }
    }

    if (!course) {
        return (
            <div className="container" style={{ maxWidth: '900px' }}>
                <div className="alert alert-warning mt-3">
                    Data kursus tidak ditemukan. <button className="btn btn-sm btn-link" onClick={() => navigate('/')}>Kembali</button>
                </div>
            </div>
        )
    }

    const storedUserRaw = localStorage.getItem('user');
    const currentUser = storedUserRaw ? JSON.parse(storedUserRaw) : null;

    const titleLower = course.title.toLowerCase();
    let iconSrc = '/Icons/Icon_Premium.png';
    if (titleLower.includes('kelas 7')) iconSrc = '/Icons/Kelas7.png';
    else if (titleLower.includes('kelas 8')) iconSrc = '/Icons/Kelas8.png';
    else if (titleLower.includes('kelas 9')) iconSrc = '/Icons/Kelas9.png';
    else if (titleLower.includes('kelas 10')) iconSrc = '/Icons/Kelas10.png';
    else if (titleLower.includes('kelas 11')) iconSrc = '/Icons/Kelas11.png';
    else if (titleLower.includes('kelas 12')) iconSrc = '/Icons/Kelas12.png';
    else if (course.category.toLowerCase().includes('fisika') && titleLower.includes('utbk')) iconSrc = '/Icons/Icon_FisikaUTBK.png';
    else if (course.category.toLowerCase().includes('fisika')) iconSrc = '/Icons/Icon_FisikaDasar.png';
    else if (course.category.toLowerCase().includes('matematika') && titleLower.includes('utbk')) iconSrc = '/Icons/Icon_MatematikaUTBK.png';
    else if (course.category.toLowerCase().includes('matematika')) iconSrc = '/Icons/Icon_MatematikaDasar.png';

    const styles = `
    .text-primary-dark { color: #1a1a9e !important; }
    .bg-primary-dark { background-color: #1a1a9e !important; }
    .bg-light-purple { background-color: #E8EFFF !important; }
    .nav-link-custom { color: white; text-decoration: none; font-weight: 600; font-size: 14px; margin: 0 15px; transition: opacity 0.2s; }
    .nav-link-custom:hover { opacity: 0.8; color: white; }
    .hover-card { transition: all 0.2s; }
    .hover-card:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
    .list-title-text { font-size: 18px; }
    .list-action-text { font-size: 16px; }
    .list-index-text { font-size: 24px; width: 50px; }
    @media (max-width: 768px) {
        .nav-center-desktop { display: none !important; }
        .course-title-desktop { font-size: 1.3rem !important; }
        .back-btn-desktop { position: static !important; margin-bottom: 15px; }
        .list-title-text { font-size: 14px !important; }
        .list-action-text { font-size: 13px !important; }
        .list-index-text { font-size: 16px !important; width: 35px !important; }
    }
    `;

    const handleItemClick = (m) => {
        if (m.id_sub_detail_mapel && m.judul) {
            navigate(`/video/${m.id_sub_detail_mapel}/${encodeURIComponent(m.judul)}/logika`)
        }
    }

    return (
        <>
            <style>{styles}</style>
            <div className="d-flex flex-column" style={{ minHeight: '100vh', backgroundColor: '#f8f9fa' }}>
                {/* Header diselaraskan dengan Index */}
                <header className="bg-primary-dark sticky-top" style={{ zIndex: 1020 }}>
                    <div className="container py-2" style={{ maxWidth: '1200px' }}>
                        <div className="d-flex align-items-center justify-content-between">
                            {/* Logo */}
                            <div className="d-flex align-items-center gap-1 cursor-pointer" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
                                <img
                                    src="/Logogram_LogikaEinstein_IndigoWhite_Transparent_Outline.png"
                                    alt="Logika Einstein"
                                    style={{ height: '35px', objectFit: 'contain' }}
                                />
                                <img
                                    src="/Logotype_Logika_white.png"
                                    alt="Logika Einstein"
                                    style={{ height: '25px', objectFit: 'contain' }}
                                />
                            </div>

                            {/* Center Nav - Desktop Only */}
                            <div className="d-flex align-items-center nav-center-desktop">
                                <a href="#" className="nav-link-custom" onClick={(e) => { e.preventDefault(); navigate('/'); }}>FISIKA</a>
                                <a href="#" className="nav-link-custom" onClick={(e) => { e.preventDefault(); navigate('/'); }}>MATEMATIKA</a>
                                {currentUser && (
                                    <a href="#" className="nav-link-custom" onClick={(e) => { e.preventDefault(); navigate('/'); }}>FAVORIT</a>
                                )}
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
                                        className="d-flex align-items-center gap-2 px-4 py-1 rounded-pill text-primary-dark bg-white border-0"
                                        style={{ height: '36px' }}
                                    >
                                        <span className="small" style={{ fontWeight: '900', textTransform: 'uppercase' }}>Login</span>
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </header>

                <main className="flex-grow-1 overflow-auto" style={{ paddingBottom: '80px' }}>
                    <div className="container py-4" style={{ maxWidth: '900px' }}>
                        <div className="card border-0 bg-light-purple p-4 p-md-5" style={{ borderRadius: '24px' }}>
                            {/* Top part of card: Back button and Title */}
                            <div className="position-relative d-flex flex-column flex-md-row justify-content-center align-items-center mb-5">
                                <button 
                                    className="btn btn-link text-primary-dark text-decoration-none fw-bold p-0 position-absolute start-0 top-50 translate-middle-y back-btn-desktop" 
                                    onClick={() => navigate(-1)}
                                    style={{ fontSize: '14px' }}
                                >
                                    ◀ kembali
                                </button>
                                
                                <div className="d-flex flex-row align-items-center gap-3">
                                    <img src={iconSrc} alt={course.title} style={{ height: '60px', objectFit: 'contain' }} />
                                    <h2 className="fw-bold text-primary-dark mb-0 text-uppercase course-title-desktop" style={{ letterSpacing: '1px' }}>
                                        {course.title.includes('Pembahasan') 
                                            ? course.title.replace('Pembahasan ', 'Pembahasan\n').split('\n').map((line, idx) => (
                                                <span key={idx} style={{ display: 'block' }}>{line}</span>
                                            ))
                                            : course.title
                                        }
                                    </h2>
                                </div>
                            </div>

                            {/* List of Materi */}
                            {isLoadingMateri ? (
                                <div className="text-center py-5">
                                    <div className="spinner-border text-primary-dark" role="status">
                                        <span className="visually-hidden">Loading...</span>
                                    </div>
                                    <p className="mt-3 text-muted">Memuat materi...</p>
                                </div>
                            ) : filteredMateri.length === 0 ? (
                                <div className="text-center py-5">
                                    <p className="text-muted">Tidak ada materi yang tersedia</p>
                                </div>
                            ) : (
                                <div className="d-flex flex-column gap-3">
                                    {filteredMateri.map((m, idx) => (
                                        <div 
                                            key={m.id} 
                                            className="card border-0 bg-white hover-card d-flex flex-row align-items-center px-3 px-md-4 py-3"
                                            style={{ borderRadius: '16px', cursor: 'pointer', minHeight: '70px' }}
                                            onClick={() => handleItemClick(m)}
                                        >
                                            <div className="fw-bold text-primary-dark list-index-text text-center">
                                                {idx + 1}
                                            </div>
                                            <div className="flex-grow-1 fw-bold text-dark list-title-text ps-2 ps-md-3">
                                                {m.judul}
                                            </div>
                                            <div className="fw-bold text-primary-dark d-flex align-items-center gap-1 gap-md-2 list-action-text text-nowrap">
                                                Mulai <span>➔</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </main>

                {/* Modal Custom dengan React State */}
                {showModal && (
                    <>
                        <div 
                            className="modal-backdrop fade show" 
                            style={{ zIndex: 1040 }}
                            onClick={handleCloseModal}
                        ></div>
                        <div 
                            className="modal fade show d-block" 
                            tabIndex="-1" 
                            style={{ zIndex: 1050 }}
                        >
                            <div className="modal-dialog modal-dialog-centered">
                                <div className="modal-content rounded-4 border-0 shadow-lg">
                                    <div className="modal-header border-0 pb-0">
                                        <div>
                                            <h5 className="modal-title fw-bold text-primary-dark">
                                                {selectedMateri?.judul || 'Pilih Materi'}
                                            </h5>
                                            <small className="text-muted">Pilih cara belajar</small>
                                        </div>
                                        <button 
                                            type="button" 
                                            className="btn-close" 
                                            onClick={handleCloseModal}
                                        ></button>
                                    </div>
                                    <div className="modal-body">
                                        <div className="d-flex flex-column gap-3">
                                            <button
                                                type="button"
                                                className="btn btn-outline-primary rounded-pill d-flex align-items-center justify-content-center gap-2 py-3 fw-bold"
                                                style={{ borderWidth: '2px' }}
                                                onClick={handleNavigateToVideo}
                                            >
                                                <span>🎬</span>
                                                <span>Lihat Teori</span>
                                            </button>
                                            <button
                                                type="button"
                                                className="btn btn-outline-primary rounded-pill d-flex align-items-center justify-content-center gap-2 py-3 fw-bold"
                                                style={{ borderWidth: '2px' }}
                                                onClick={handleNavigateToPembahasan}
                                            >
                                                <span style={{ fontSize: '20px' }}>🧩</span>
                                                <span>Lihat Pembahasan Soal</span>
                                            </button>
                                        </div>
                                    </div>
                                    <div className="modal-footer border-0">
                                        <button 
                                            type="button" 
                                            className="btn btn-light rounded-pill px-4" 
                                            onClick={handleCloseModal}
                                        >
                                            Tutup
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </>
    )
}