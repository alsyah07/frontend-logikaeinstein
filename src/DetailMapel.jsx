import React, { useState, useEffect } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import axios from 'axios'

export default function DetailMapel() {
    const { id } = useParams() // Ambil id dari URL parameter
    const navigate = useNavigate()
    const { state } = useLocation()
    const course = state?.course

    // State untuk materi dari API
    const [materiData, setMateriData] = useState([])
    const [isLoadingMateri, setIsLoadingMateri] = useState(false)
    const [selectedMateri, setSelectedMateri] = useState(null)

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

    // Fetch materi dari API saat component mount atau id berubah
    useEffect(() => {
      //  alert(id)
        const fetchMateri = async () => {
            if (!id) return

            setIsLoadingMateri(true)
            try {
                const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/sub_mapel_detail/${id}`)
                if (response.data.success && response.data.data) {
                    // Transform data dari API
                    const transformedMateri = response.data.data.map(item => ({
                        id: item.id_sub_detail_mapel,
                        id_sub_detail_mapel: item.id_sub_detail_mapel,
                        id_sub_mapel: item.id_sub_mapel,
                        judul: item.sub_detail_mapel,
                        title: item.tittle || item.sub_detail_mapel,
                        selesai: false, // Default, bisa disesuaikan jika ada data progress user
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

    if (!course) {
        return (
            <div className="container" style={{ maxWidth: '900px' }}>
                <div className="alert alert-warning mt-3">
                    Data kursus tidak ditemukan. <button className="btn btn-sm btn-link" onClick={() => navigate('/')}>Kembali</button>
                </div>
            </div>
        )
    }

    const catData = categoryData[course.category] || categoryData.Matematika

    return (
        <div className="d-flex flex-column" style={{ minHeight: '100vh', backgroundColor: '#f8f9fa' }}>
            <header className="glass-effect sticky-top" style={{ zIndex: 1020, borderBottom: '1px solid rgba(0,0,0,0.05)', background: 'rgba(255, 255, 255, 0.95)', backdropFilter: 'blur(10px)' }}>
                <div className="container py-3" style={{ maxWidth: '1200px' }}>
                    <div className="d-flex align-items-center justify-content-between">
                        <div className="d-flex align-items-center gap-3">
                            <img
                                src="/images/logo_logika.png"
                                alt="Logika Einstein"
                                className="rounded-3 flex-shrink-0"
                                style={{ width: '40px', height: '40px', objectFit: 'cover' }}
                            />
                            <div>
                                <h6 className="fw-bold mb-0">{course.title}</h6>
                                <small className="text-muted">{catData.emoji} {course.category}</small>
                            </div>
                        </div>
                        <div className="d-flex align-items-center ms-auto gap-2">
                            <button className="btn btn-light rounded-pill px-3" onClick={() => navigate('/')}>⬅️ Kembali</button>
                        </div>
                    </div>
                </div>
            </header>

            <main className="flex-grow-1 overflow-auto" style={{ paddingBottom: '80px' }}>
                <div className="container" style={{ maxWidth: '900px' }}>
                    {/* Course Header Card */}
                    <div className="card border-0 shadow-sm rounded-4 overflow-hidden mb-4 mt-3">
                        <div className="p-4 text-white" style={{ background: catData.gradient }}>
                            <div className="d-flex align-items-center gap-3 flex-wrap">
                                <span className="badge text-white rounded-pill" style={{ backgroundColor: 'rgba(255,255,255,0.25)', fontSize: '12px', padding: '6px 14px' }}>
                                    {catData.emoji} {course.category}
                                </span>
                                <span className="text-white-50 small">
                                    ⭐ Rating {course.rating?.toFixed(1) || '0.0'} • 👥 {course.students || 0} siswa • 📚 {course.modules || 0} modul
                                </span>
                            </div>
                            <h3 className="fw-bold mt-3 mb-2">{course.title}</h3>
                            <p className="mb-0 opacity-90">{course.description}</p>
                            <div className="mt-3">
                                <span className="badge rounded-pill" style={{ backgroundColor: 'rgba(255,255,255,0.25)', fontSize: '11px', padding: '6px 12px' }}>
                                    {course.level || 'Pemula'}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Materi List Header */}
                    <div className="mb-3 d-flex align-items-center justify-content-between">
                        <h5 className="fw-bold mb-0">📖 Daftar Materi</h5>
                        <span className="text-muted small">
                            {isLoadingMateri ? 'Memuat...' : `${materiData.length} materi`}
                        </span>
                    </div>

                    {/* Loading State */}
                    {isLoadingMateri ? (
                        <div className="text-center py-5">
                            <div className="spinner-border text-primary" role="status" style={{ width: '3rem', height: '3rem' }}>
                                <span className="visually-hidden">Loading...</span>
                            </div>
                            <p className="mt-3 text-muted">Memuat materi...</p>
                        </div>
                    ) : (
                        <>
                            {/* Materi List */}
                            <div className="list-group shadow-sm rounded-3">
                                {materiData.map((m, idx) => (
                                    <a
                                        key={m.id}
                                        href="#"
                                        className="list-group-item list-group-item-action d-flex align-items-center gap-3 border-0"
                                        style={{ 
                                            transition: 'all 0.2s ease',
                                            borderBottom: idx < materiData.length - 1 ? '1px solid #e5e7eb' : 'none'
                                        }}
                                        data-bs-toggle="modal"
                                        data-bs-target="#materiModal"
                                        onClick={(e) => {
                                            e.preventDefault()
                                            setSelectedMateri(m)
                                        }}
                                    >
                                        <div
                                            className="d-flex align-items-center justify-content-center rounded-3 flex-shrink-0"
                                            style={{ 
                                                width: '48px', 
                                                height: '48px', 
                                                background: m.selesai ? '#10b981' : catData.gradient, 
                                                color: 'white',
                                                fontSize: '20px'
                                            }}
                                        >
                                            {m.selesai ? '✅' : '📘'}
                                        </div>
                                        <div className="flex-grow-1">
                                            <div className="fw-bold" style={{ fontSize: '15px' }}>{m.judul}</div>
                                            <div className="d-flex align-items-center gap-2 mt-1">
                                                {/* <small className="text-muted">⏱️ Durasi {m.durasi}</small>
                                                {m.selesai && (
                                                    <span className="badge bg-success" style={{ fontSize: '10px' }}>Selesai</span>
                                                )} */}
                                            </div>
                                        </div>
                                        <button
                                            className="btn btn-sm rounded-pill px-3 text-white"
                                            style={{ 
                                                background: catData.gradient, 
                                                border: 'none',
                                                fontWeight: '600',
                                                fontSize: '13px'
                                            }}
                                            data-bs-toggle="modal"
                                            data-bs-target="#materiModal"
                                            onClick={(e) => {
                                                e.preventDefault()
                                                e.stopPropagation()
                                                setSelectedMateri(m)
                                            }}
                                        >
                                            {m.selesai ? '🔄 Ulangi' : '🚀 Mulai'}
                                        </button>
                                    </a>
                                ))}
                                
                                {/* Empty State */}
                                {materiData.length === 0 && !isLoadingMateri && (
                                    <div className="text-center py-5">
                                        <div style={{ fontSize: '64px', marginBottom: '16px' }}>📚</div>
                                        <h5 className="text-muted">Belum Ada Materi</h5>
                                        <p className="text-muted small">Materi untuk kursus ini akan segera tersedia</p>
                                    </div>
                                )}
                            </div>
                        </>
                    )}

                    {/* Modal Pilihan Materi */}
                    <div className="modal fade" id="materiModal" tabIndex="-1" aria-labelledby="materiModalLabel" aria-hidden="true">
                        <div className="modal-dialog modal-dialog-centered">
                            <div className="modal-content rounded-4 border-0 shadow-lg">
                                <div className="modal-header border-0 pb-0">
                                    <div>
                                        <h5 className="modal-title fw-bold" id="materiModalLabel">
                                            {selectedMateri ? selectedMateri.judul : 'Pilih Materi'}
                                        </h5>
                                        {selectedMateri && (
                                            <small className="text-muted">Pilih cara belajar</small>
                                        )}
                                    </div>
                                    <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                                </div>
                                <div className="modal-body">
                                    <div className="d-flex flex-column gap-3">
                                        <a
                                            href={`/video/${selectedMateri?.id_sub_mapel_detail || selectedMateri?.id || '1'}/${selectedMateri?.judul || '1'}`}
                                            className="btn btn-outline-primary rounded-pill d-flex align-items-center justify-content-center gap-2 py-3"
                                             style={{ 
                                                borderWidth: '2px',
                                                fontWeight: '600'
                                            }}
                                        >
                                            <span>🎬</span>
                                            <span>Lihat Teori</span>
                                        </a>
                                        <a
                                             href={`/pembahasan/${selectedMateri?.id_sub_mapel_detail || selectedMateri?.id || '1'}/${selectedMateri?.judul || '1'}`}
                                            className="btn btn-outline-primary rounded-pill d-flex align-items-center justify-content-center gap-2 py-3"
                                            style={{ 
                                                borderWidth: '2px',
                                                fontWeight: '600'
                                            }}
                                           
                                        >
                                            <span style={{ fontSize: '20px' }}>🧩</span>
                                            <span>Lihat Pembahasan Soal</span>
                                        </a>
                                    </div>
                                </div>
                                <div className="modal-footer border-0">
                                    <button type="button" className="btn btn-light rounded-pill px-4" data-bs-dismiss="modal">
                                        Tutup
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    )
}