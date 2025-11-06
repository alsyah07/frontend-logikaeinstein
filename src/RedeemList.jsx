import React, { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'

export default function RedeemList() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [codes, setCodes] = useState([])

  // Tambah util untuk menyalin kode
  const copyCode = async (code) => {
    try {
      await navigator.clipboard.writeText(String(code || ''))
      alert('Kode disalin ke clipboard.')
    } catch {
      alert('Gagal menyalin kode.')
    }
  }

  // Hilangkan ketergantungan pada userId; fetch langsung ke all_code_redeem
  useEffect(() => {
    const fetchCodes = async () => {
      setLoading(true)
      setError('')
      try {
        const base = import.meta.env.VITE_API_BASE_URL
        const url = `${base}/all_code_redeem`
        const res = await axios.get(url)
        const list = res.data?.data || res.data || []

        const toDate = (s) => {
          if (!s) return null
          const iso = s.includes('T') ? s : s.replace(' ', 'T')
          const d = new Date(iso)
          return isNaN(d) ? null : d
        }

        const mapped = (Array.isArray(list) ? list : [list]).map((it) => {
          const start = toDate(it.start_date)
          const end = toDate(it.end_date || it.expired_date)
          return {
            code_redeem: it.code_redeem,
            start_date: start ? start.toLocaleString('id-ID') : '—',
            end_date: end ? end.toLocaleString('id-ID') : '—',
          }
        })

        setCodes(mapped)
      } catch (e) {
        console.error('Gagal memuat daftar redeem:', e)
        setError('Gagal memuat daftar redeem. Coba lagi nanti.')
      } finally {
        setLoading(false)
      }
    }

    fetchCodes()
  }, [])

  return (
    <div className="container py-4" style={{ maxWidth: '1100px' }}>
      <div className="d-flex align-items-center justify-content-between mb-3">
        <div className="d-flex align-items-center gap-2">
          <button className="btn btn-light rounded-pill px-3" onClick={() => navigate(-1)}>⬅️ Kembali</button>
          <h5 className="fw-bold mb-0">Daftar Kode Redeem</h5>
        </div>
        <Link className="btn btn-outline-primary rounded-pill" to="/">Beranda</Link>
      </div>

      {/* Hapus alert login karena tidak lagi butuh userId */}

      <div className="card border-0 shadow-sm rounded-4">
        <div className="card-body">
          {loading ? (
            <div className="text-center py-5 text-muted">Memuat data redeem…</div>
          ) : error ? (
            <div className="alert alert-danger rounded-3">{error}</div>
          ) : codes.length === 0 ? (
            <div className="d-flex flex-column align-items-center text-center py-5">
              <div
                className="rounded-circle d-flex align-items-center justify-content-center mb-3"
                style={{
                  width: '84px',
                  height: '84px',
                  background: 'linear-gradient(135deg, #eef2f7 0%, #f8fafc 100%)',
                  color: '#9aa3b2',
                  fontSize: '40px',
                }}
                aria-label="Tidak tersedia"
                title="Tidak tersedia"
              >
                📭
              </div>
              <h6 className="fw-bold mb-1">Belum ada kode redeem</h6>
              <p className="text-muted mb-0" style={{ maxWidth: 520 }}>
                Ketika Anda melakukan pembelian, kode redeem akan tampil di sini.
              </p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table align-middle">
                <thead>
                  <tr>
                    <th>Kode Redeem</th>
                    <th>Mulai</th>
                    <th>Berakhir</th>
                  </tr>
                </thead>
                <tbody>
                  {codes.map((r, idx) => (
                    <tr key={r.code_redeem || idx}>
                      <td className="fw-bold">
                        <span>{r.code_redeem}</span>
                        <button
                          className="btn btn-sm btn-outline-primary rounded-pill ms-2"
                          onClick={() => copyCode(r.code_redeem)}
                          title="Salin kode"
                        >
                          Salin
                        </button>
                      </td>
                      <td className="small text-muted">{r.start_date}</td>
                      <td className="small text-muted">{r.end_date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}