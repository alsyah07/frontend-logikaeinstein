import React, { useEffect, useState } from 'react'
import axios from 'axios'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line
} from 'recharts'

export default function RedeemList() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [codes, setCodes] = useState([])
  const [activeTab, setActiveTab] = useState('active')
  const [usersData, setUsersData] = useState([])
  const [loadingUsers, setLoadingUsers] = useState(false)
  const [redeemStats, setRedeemStats] = useState({ total_redeem: 0, code_redeem_free: 0 })

  // ubah ke "bar" atau "line" sesuai preferensi
  const typeChart = 'bar'

  const copyCode = async (code) => {
    try {
      await navigator.clipboard.writeText(String(code || ''))
      alert('Kode disalin ke clipboard.')
    } catch {
      alert('Gagal menyalin kode.')
    }
  }

  const fetchAllUsers = async () => {
    setLoadingUsers(true)
    try {
      const base = import.meta.env.VITE_API_BASE_URL
      const res = await axios.get(`${base}/all_code_redeem_users`)
      const users = res.data?.data || res.data || []
      console.log('dffdfdd',users)
      setUsersData(users)
    } catch {
      setUsersData([])
    } finally {
      setLoadingUsers(false)
    }
  }

  useEffect(() => {
    const fetchCodes = async () => {
      setLoading(true)
      try {
        const base = import.meta.env.VITE_API_BASE_URL
        const res = await axios.get(`${base}/all_code_redeem`)
        const list = res.data?.data || res.data || []
        console.log('list', list)
        const toDate = (s) => {
          if (!s) return null
          const iso = s.includes('T') ? s : s.replace(' ', 'T')
          const d = new Date(iso)
          return isNaN(d) ? null : d
        }

        const mapped = (Array.isArray(list) ? list : [list]).map((it) => {
          const start = toDate(it.start_date)
          const end = toDate(it.end_date || it.expired_date)
          const now = new Date()
          const isExpired = end && end < now
          const isActive = start && end && start <= now && now <= end
          return {
            code_redeem: it.code_redeem,
            start_display: start ? start.toLocaleString('id-ID') : '—',
            end_display: end ? end.toLocaleString('id-ID') : '—',
            used_count: it.used_count || 0,
            max_usage: it.max_usage || null,
            status: isExpired ? 'expired' : isActive ? 'active' : 'upcoming',
            discount_value: it.discount_value || 0,
            discount_type: it.discount_type || 'percentage'
          }
        })
        setCodes(mapped)
      } catch {
        setError('Gagal memuat daftar redeem.')
      } finally {
        setLoading(false)
      }
    }
    fetchCodes()
  }, [])

  useEffect(() => {
    const fetchRedeemStats = async () => {
      try {
        const base = import.meta.env.VITE_API_BASE_URL
        const res = await axios.get(`${base}/all_code_redeem_statistik`)
        const data = res.data?.data || res.data || {}
        setRedeemStats({
          total_redeem: Number(data.total_redeem) || 0,
          code_redeem_free: Number(data.code_redeem_free) || 0,
        })
      } catch {
        setRedeemStats({ total_redeem: 0, code_redeem_free: 0 })
      }
    }
    fetchRedeemStats()
  }, [])

  useEffect(() => {
    if (activeTab === 'used') fetchAllUsers()
  }, [activeTab])

  const getStatusColor = (status) => {
    if (status === 'active') return 'success'
    if (status === 'expired') return 'danger'
    if (status === 'upcoming') return 'warning'
    return 'secondary'
  }

  const getUsagePercent = (used, max) => (!max ? 0 : Math.min(100, (used / max) * 100))

  const activeCodes = codes.filter((c) => c.status === 'active')
  const usedCodes = codes.filter((c) => c.used_count > 0)

  const stats = {
    total: codes.length,
    active: codes.filter((c) => c.status === 'active').length,
    expired: codes.filter((c) => c.status === 'expired').length,
    upcoming: codes.filter((c) => c.status === 'upcoming').length,
  }

  const chartData = [
    { name: 'Kode Belum Terpakai', value: redeemStats.code_redeem_free },
    { name: 'Kode Terpakai', value: stats.active },
    // { name: 'Kedaluwarsa', value: stats.expired },
    // { name: 'Akan Datang', value: stats.upcoming },
  ]

  return (
    <div className="container py-4 pb-5" style={{ maxWidth: '800px' }}>
      <h5 className="fw-bold mb-3 text-center">Manajemen Kode Redeem</h5>

      {loading ? (
        <div className="text-center py-5 text-muted">
          <div className="spinner-border text-primary mb-3" />
          <div>Memuat data…</div>
        </div>
      ) : error ? (
        <div className="alert alert-danger">{error}</div>
      ) : (
        <>
          {/* Statistik & Grafik */}
          {activeTab === 'stats' && (
            <div className="p-3 text-center">
              <h6 className="fw-bold mb-3">📊 Statistik & Grafik</h6>
              <div className="d-flex justify-content-around mb-3">
                <div>
                  <div className="fw-bold fs-5 text-primary">{redeemStats.total_redeem}</div>
                  <div className="text-muted small">Total Redeem</div>
                </div>
                <div>
                  <div className="fw-bold fs-5 text-success">{redeemStats.code_redeem_free}</div>
                  <div className="text-muted small">Kode Redeem Gratis</div>
                </div>
              </div>

              <div style={{ width: '100%', height: 250 }}>
                <ResponsiveContainer>
                  {typeChart === 'bar' ? (
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="value" fill="#4e73df" barSize={40} />
                    </BarChart>
                  ) : (
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="value" stroke="#4e73df" strokeWidth={3} />
                    </LineChart>
                  )}
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Data Pengguna */}
          
          {/* Kode Aktif */}
          {activeTab === 'active' && (
            <div className="p-2">
              {activeCodes.length === 0 ? (
                <div className="text-center py-5">
                  <div style={{ fontSize: '60px' }}>✅</div>
                  <p className="fw-bold mb-1">Tidak Ada Kode Aktif</p>
                </div>
              ) : (
                <div className="d-flex flex-column gap-3">
                  {activeCodes.map((code, i) => (
                    <div key={i} className="card border-0 shadow-sm rounded-4">
                      <div className="card-body">
                        <div className="d-flex justify-content-between align-items-center mb-2">
                          <h6 className="fw-bold mb-0">{code.code_redeem}</h6>
                          <span className={`badge bg-${getStatusColor(code.status)}`}>{code.status}</span>
                        </div>
                        <div className="text-muted small">
                          <div>Mulai: {code.start_display}</div>
                          <div>Berakhir: {code.end_display}</div>
                        </div>
                        <div className="mt-3 text-end">
                          <button
                            className="btn btn-sm btn-outline-primary rounded-pill"
                            onClick={() => copyCode(code.code_redeem)}
                          >
                            📋 Salin
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Kode Terpakai */}
          {activeTab === 'used' && (
            <div className="p-2">
              {(!Array.isArray(usersData) || usersData.length === 0) ? (
                <div className="text-center py-5">
                  <div style={{ fontSize: '60px' }}>📊</div>
                  <p className="fw-bold mb-1">Belum Ada Kode Terpakai</p>
                </div>
              ) : (
                <div className="d-flex flex-column gap-3">
                  {usersData.map((item, i) => {
                    const formatDate = (s) => {
                      if (!s) return '—'
                      const iso = s.includes('T') ? s : s.replace(' ', 'T')
                      const d = new Date(iso)
                      return isNaN(d) ? String(s) : d.toLocaleString('id-ID')
                    }
                    const start = formatDate(item.start_date)
                    const expired = formatDate(item.expired_date)

                    return (
                      <div key={i} className="card border-0 shadow-sm rounded-4">
                        <div className="card-body">
                          <div className="d-flex justify-content-between align-items-center mb-2">
                            <h6 className="fw-bold mb-0">{item.code_redeem}</h6>
                            <span className={`badge bg-${getStatusColor(item.status)}`}>{item.status}</span>
                          </div>

                          <div className="text-muted small mb-2">
                            Pengguna: <b>{item.name || item.username || '—'}</b> ({item.email || '—'})
                          </div>

                          <div className="small mb-2">
                            Periode: <b>{start}</b> s/d <b>{expired}</b>
                          </div>

                          <div className="small">
                            Status Redeem: <b>{String(item.status_redeem)}</b>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* Bottom Navigation */}
      <nav className="bottom-nav d-flex justify-content-around align-items-center border-top shadow-sm bg-white fixed-bottom py-2">
        <button
          className={`btn flex-fill text-center border-0 ${activeTab === 'stats' ? 'text-primary fw-bold' : 'text-muted'}`}
          onClick={() => setActiveTab('stats')}
        >
          📈
          <div style={{ fontSize: '12px' }}>Statistik</div>
        </button>
        <button
          className={`btn flex-fill text-center border-0 ${activeTab === 'active' ? 'text-success fw-bold' : 'text-muted'}`}
          onClick={() => setActiveTab('active')}
        >
          ✅
          <div style={{ fontSize: '12px' }}>Code Redeem Aktif</div>
        </button>
        <button
          className={`btn flex-fill text-center border-0 ${activeTab === 'used' ? 'text-danger fw-bold' : 'text-muted'}`}
          onClick={() => setActiveTab('used')}
        >
          📊
          <div style={{ fontSize: '12px' }}>Terpakai</div>
        </button>
      </nav>

      <style>
        {`
          body { padding-bottom: 70px !important; }
          @media (max-width: 576px) {
            h5.fw-bold { font-size: 1rem; }
            .card-body { padding: 0.75rem !important; }
          }
        `}
      </style>
    </div>
  )
}
