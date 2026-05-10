import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Swal from 'sweetalert2';

export default function Index() {
    const [tab, setTab] = useState('Home');
    const [query, setQuery] = useState('');
    const [category, setCategory] = useState('');
    const [showAuthModal, setShowAuthModal] = useState(false);
    const [authTab, setAuthTab] = useState('login');

    // State untuk categories dari API
    const [categories, setCategories] = useState([]);
    const [categoriesData, setCategoriesData] = useState([]); // Menyimpan data lengkap mapel
    const [isLoadingCategories, setIsLoadingCategories] = useState(true);

    // State untuk courses dari API
    const [courses, setCourses] = useState([]);
    const [isLoadingCourses, setIsLoadingCourses] = useState(false);

    // State untuk user yang sedang login
    const [currentUser, setCurrentUser] = useState(null);

    // State untuk form login
    const [loginEmail, setLoginEmail] = useState('');
    const [loginPassword, setLoginPassword] = useState('');

    // State untuk form register
    const [registerName, setRegisterName] = useState('');
    const [registerEmail, setRegisterEmail] = useState('');
    const [registerPhone, setRegisterPhone] = useState('');
    const [registerPassword, setRegisterPassword] = useState('');

    // State untuk loading
    const [isLoading, setIsLoading] = useState(false);

    const [savedVideos, setSavedVideos] = useState([]);

    // Hapus satu item riwayat
    const handleDeleteSavedVideo = (videoId) => {
        try {
            const rawUser = localStorage.getItem('user');
            const user = rawUser ? JSON.parse(rawUser) : null;
            const userId = user?.id;
            if (!userId) return;

            const listKey = `saved_videos:${userId}`;
            const list = JSON.parse(localStorage.getItem(listKey) || '[]') || [];
            const newList = list.filter(v => String(v.id_sub_mapel_detail) !== String(videoId));

            localStorage.setItem(listKey, JSON.stringify(newList));
            setSavedVideos(prev => prev.filter(v => String(v.id_sub_mapel_detail) !== String(videoId)));
        } catch (e) {
            console.warn('Gagal menghapus riwayat', e);
        }
    };

    // Hapus semua riwayat
    const handleClearAllSavedVideos = () => {
        try {
            const rawUser = localStorage.getItem('user');
            const user = rawUser ? JSON.parse(rawUser) : null;
            const userId = user?.id;
            if (!userId) return;

            const listKey = `saved_videos:${userId}`;
            localStorage.setItem(listKey, JSON.stringify([]));
            setSavedVideos([]);
        } catch (e) {
            console.warn('Gagal mengosongkan riwayat', e);
        }
    };

    const navigate = useNavigate();

    // Inisialisasi channel broadcast untuk logout lintas-tab
    const [logoutChannel, setLogoutChannel] = useState(null);

    // Pastikan tidak bisa berada di tab Profil jika belum login
    useEffect(() => {
        if (!currentUser && tab === 'Profil') {
            setTab('Home');
        }
    }, [currentUser, tab]);

    useEffect(() => {
        if (typeof BroadcastChannel === 'undefined') {
            // Browser tidak mendukung BroadcastChannel
            return;
        }

        const channel = new BroadcastChannel('logout');
        setLogoutChannel(channel);

        return () => {
            try {
                channel.close();
            } catch (e) { }
            setLogoutChannel(null);
        };
    }, []);

    // ==================== DEVICE TRACKING FUNCTIONS ====================

    // Generate unique device ID
    const generateDeviceId = () => {
        // Cek apakah sudah ada device ID di localStorage
        let deviceId = localStorage.getItem('device_id');

        if (!deviceId) {
            // Generate device ID baru berdasarkan informasi browser dan waktu
            const userAgent = navigator.userAgent;
            const screenResolution = `${window.screen.width}x${window.screen.height}`;
            const timestamp = Date.now();
            const randomString = Math.random().toString(36).substring(2, 15);

            // Kombinasi untuk membuat ID unik
            const combinedString = `${userAgent}-${screenResolution}-${timestamp}-${randomString}`;

            // Hash sederhana (gunakan btoa untuk encoding)
            deviceId = btoa(combinedString).substring(0, 32);

            // Simpan ke localStorage
            localStorage.setItem('device_id', deviceId);
        }

        return deviceId;
    };

    // Get device info untuk logging
    const getDeviceInfo = () => {
        const userAgent = navigator.userAgent;
        let deviceType = 'Unknown';
        let browserName = 'Unknown';

        // Detect device type
        if (/mobile/i.test(userAgent)) {
            deviceType = 'Mobile';
        } else if (/tablet/i.test(userAgent)) {
            deviceType = 'Tablet';
        } else {
            deviceType = 'Desktop';
        }

        // Detect browser
        if (userAgent.includes('Chrome')) {
            browserName = 'Chrome';
        } else if (userAgent.includes('Firefox')) {
            browserName = 'Firefox';
        } else if (userAgent.includes('Safari')) {
            browserName = 'Safari';
        } else if (userAgent.includes('Edge')) {
            browserName = 'Edge';
        }

        return {
            type: deviceType,
            browser: browserName,
            userAgent: userAgent.substring(0, 100) // Limit length
        };
    };

    // Ambil IP publik pengguna (dengan fallback)
    const fetchPublicIP = async () => {
        try {
            const res = await axios.get('https://api.ipify.org?format=json', { timeout: 5000 });
            return res.data?.ip || null;
        } catch (e1) {
            try {
                const res2 = await axios.get('https://ipapi.co/json/', { timeout: 5000 });
                return res2.data?.ip || null;
            } catch (e2) {
                console.warn('Gagal mengambil IP publik', e2);
                return null;
            }
        }
    };

    // Periodic check untuk device session
    useEffect(() => {
        if (!logoutChannel) return;

        const handler = (event) => {
            if (event?.data?.type === 'FORCE_LOGOUT' && currentUser && event.data.userId === currentUser.id) {
                // Force logout tanpa konfirmasi
                localStorage.removeItem('user');
                localStorage.removeItem(`user_${currentUser.id}_device`);
                setCurrentUser(null);
                setTab('Home');

                Swal.fire({
                    icon: 'warning',
                    title: 'Sesi Berakhir',
                    text: 'Akun Anda telah login di perangkat lain.',
                    confirmButtonText: 'OK',
                    confirmButtonColor: '#155ea0',
                    allowOutsideClick: false,
                    allowEscapeKey: false,
                });
            }
        };

        logoutChannel.onmessage = handler;

        return () => {
            if (logoutChannel) {
                logoutChannel.onmessage = null;
            }
        };
    }, [logoutChannel, currentUser]);

    // Auto logout jika terdeteksi login dari device lain
    const handleAutoLogout = () => {
        Swal.fire({
            icon: 'warning',
            title: 'Sesi Berakhir',
            text: 'Akun Anda telah login di perangkat lain. Anda akan logout dari perangkat ini.',
            confirmButtonText: 'OK',
            confirmButtonColor: '#155ea0',
            allowOutsideClick: false,
            allowEscapeKey: false,
        }).then(() => {
            // Clear user data
            localStorage.removeItem('user');
            if (currentUser) {
                localStorage.removeItem(`user_${currentUser.id}_device`);
            }
            setCurrentUser(null);
            setTab('Home');
        });
    };

    // ==================== END DEVICE TRACKING FUNCTIONS ====================

    // Fetch categories dari API saat component mount
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/mapel`);
                if (response.data.success && response.data.data.length > 0) {
                    // Simpan data lengkap mapel
                    setCategoriesData(response.data.data);

                    // Extract nama mapel untuk categories
                    const mapelList = response.data.data.map(item => item.mapel);
                    setCategories(mapelList);

                    // Set default category ke yang pertama
                    setCategory(mapelList[0]);
                }
            } catch (error) {
                console.error('Error fetching categories:', error);
                // Fallback ke kategori default jika API gagal
                setCategories(['Matematika', 'Fisika']);
                setCategory('Matematika');
            } finally {
                setIsLoadingCategories(false);
            }
        };

        fetchCategories();
    }, []);

    // Fetch courses berdasarkan category yang dipilih
    useEffect(() => {
        const fetchCourses = async () => {
            if (!category) return;

            // Cari id_mapel berdasarkan nama category
            const selectedMapel = categoriesData.find(item => item.mapel === category);
            if (!selectedMapel) return;

            setIsLoadingCourses(true);
            try {
                const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/sub_mapel/${selectedMapel.id_mapel}`);

                if (response.data.success && response.data.data) {
                    // Transform data dari API ke format yang dibutuhkan
                    const transformedCourses = response.data.data.map(item => ({
                        id: item.id_sub_mapel,
                        id_sub_mapel: item.id_sub_mapel, // Tambahkan untuk routing
                        title: item.sub_mapel,
                        type_mapel: item.id_working_hours,
                        category: item.mapel,
                        progress: 0, // Bisa disesuaikan jika ada data progress dari user
                        rating: parseFloat(item.rating) || 0,
                        students: parseInt(item.members) || 0,
                        modules: parseInt(item.lessons) || 0,
                        level: item.level || 'Pemula',
                        description: item.deskripsi || '',
                        instructor: item.instructor,
                        date: item.date,
                        kode_mapel: item.kode_mapel
                    }));
                    console.log("response", transformedCourses)
                    setCourses(transformedCourses);
                }
            } catch (error) {
                console.error('Error fetching courses:', error);
                setCourses([]);
            } finally {
                setIsLoadingCourses(false);
            }
        };

        fetchCourses();
    }, [category, categoriesData]);

    // Check localStorage saat component mount dan validasi device
    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            try {
                const userData = JSON.parse(storedUser);

                // Validasi device
                const currentDeviceId = generateDeviceId();

                // UUID perangkat dari server (jika tersedia di user data)
                const serverDeviceId = userData.device_uuid || userData.deviceId || null;

                // Fallback lama dari localStorage
                const fallbackDeviceId = localStorage.getItem(`user_${userData.id}_device`);

                // Jika server punya UUID dan berbeda dengan perangkat saat ini -> logout
                // Jika server belum punya UUID, gunakan fallback untuk validasi
                if ((serverDeviceId && serverDeviceId !== currentDeviceId) ||
                    (!serverDeviceId && fallbackDeviceId && fallbackDeviceId !== currentDeviceId)) {
                    handleAutoLogout();
                } else {
                    setCurrentUser(userData);
                }
            } catch (error) {
                console.error('Error parsing user data:', error);
                localStorage.removeItem('user');
            }
        }
    }, []);

    useEffect(() => {
        try {
            const rawUser = localStorage.getItem('user');
            const user = rawUser ? JSON.parse(rawUser) : null;
            const userId = user?.id;

            const listKey = userId ? `saved_videos:${userId}` : null;
            let list = [];

            if (listKey) {
                try {
                    list = JSON.parse(localStorage.getItem(listKey) || '[]');
                    if (!Array.isArray(list)) list = [];
                } catch {
                    list = [];
                }
            }

            // Fallback migrasi dari format lama saved_video:{userId}:{videoId}
            if (list.length === 0 && userId) {
                const migrated = [];
                for (let i = 0; i < localStorage.length; i++) {
                    const key = localStorage.key(i);
                    if (key && key.startsWith(`saved_video:${userId}:`)) {
                        const val = localStorage.getItem(key);
                        try {
                            const obj = JSON.parse(val);
                            migrated.push(obj);
                        } catch { }
                    }
                }
                if (migrated.length) {
                    localStorage.setItem(listKey, JSON.stringify(migrated));
                    list = migrated;
                }
            }

            const results = list.map(obj => ({
                ...obj,
                title: obj.courseTitle || obj.judul || obj.title,
                lastAccessed: obj.savedAt
                    ? new Date(obj.savedAt).toLocaleString('id-ID')
                    : '-',
                status: 'Tersimpan',
                progress: 0,
                completedModules: 0,
                totalModules: 0,
                totalTime: '—',
            }));

            results.sort(
                (a, b) => new Date(b.savedAt || 0) - new Date(a.savedAt || 0)
            );
            setSavedVideos(results);
        } catch (e) {
            console.warn('Gagal memuat video tersimpan', e);
        }
    }, []);


    useEffect(() => {
        const checkSessionConsistency = async () => {
            try {
                const storedUserRaw = localStorage.getItem('user');
                if (!storedUserRaw) return;

                const storedUser = JSON.parse(storedUserRaw);

                // Panggil API cek sesi sesuai user_id
                const res = await axios.get(
                    `${import.meta.env.VITE_API_BASE_URL}/cek_session/${storedUser.id}`,
                    { withCredentials: true }
                );

                if (res.data?.success && res.data?.data) {
                    const session = res.data.data;

                    const currentDeviceId = generateDeviceId();
                    const ipAddress = await fetchPublicIP();

                    const deviceMatch = session.device_id === currentDeviceId;
                    const ipMatch = !session.ip_address || !ipAddress || session.ip_address === ipAddress;
                    const active = session.active === '1' || session.active === 1 || session.active === true;

                    if (!active || !deviceMatch || !ipMatch) {
                        await Swal.fire({
                            icon: 'warning',
                            title: 'Sesi di Perangkat Lain',
                            text: 'Akun Anda masih terhubung ke perangkat berbeda. Anda akan logout dari perangkat ini.',
                            confirmButtonText: 'OK'
                        });
                     localStorage.removeItem('user');
                        localStorage.removeItem('session');
                        if (storedUser?.id) {
                            localStorage.removeItem(`user_${storedUser.id}_device`);
                            localStorage.removeItem(`user_${storedUser.id}_ip`);
                        }
                        setCurrentUser(null);
                        setTab('Home');
                        return;
                    }

                    // Sesi valid, lanjutkan
                    setCurrentUser(storedUser);
                }
            } catch (err) {
                console.error('Gagal cek sesi:', err);
            }
        };

        checkSessionConsistency();
    }, []);

    // ... existing code ...}


const filtered = courses.filter((c) => {
    const matchCat = c.category === category;
    const matchQuery = c.title.toLowerCase().includes(query.toLowerCase());
    return matchCat && matchQuery;
});

const categoryData = {
    Matematika: {
        color: '#f093fb',
        emoji: '📐',
        icon: '📐',
        gradient: 'linear-gradient(135deg, #2e6ca9 0%, #9dc6f4ff 100%)',
        lightGradient: 'linear-gradient(135deg, #2e6ca9 0%, #9dc6f4ff 100%)'
    },
    Fisika: {
        color: '#667eea',
        emoji: '⚡',
        icon: '⚡',
        gradient: 'linear-gradient(135deg, #2e6ca9 0%, #9dc6f4ff 100%)',
        lightGradient: 'linear-gradient(135deg,  #2e6ca9 0%, #9dc6f4ff 100%)'
    },
};

const styles = `
    @keyframes slideUp {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }

    .animate-in {
      animation: slideUp 0.5s ease-out forwards;
    }

    .card-hover {
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }
    .card-hover:hover {
      transform: translateY(-4px);
      box-shadow: 0 10px 20px rgba(0,0,0,0.05) !important;
    }

    .no-scrollbar::-webkit-scrollbar {
      display: none;
    }
    .no-scrollbar {
      -ms-overflow-style: none;
      scrollbar-width: none;
    }

    .text-primary-dark {
      color: #1a1a9e !important;
    }
    .bg-primary-dark {
      background-color: #1a1a9e !important;
    }
    .bg-light-purple {
      background-color: #E8EFFF !important;
    }
    .border-primary-dark {
      border-color: #1a1a9e !important;
    }
    
    .nav-link-custom {
      color: white;
      text-decoration: none;
      font-weight: 600;
      font-size: 14px;
      margin: 0 15px;
      transition: opacity 0.2s;
    }
    .nav-link-custom:hover {
      opacity: 0.8;
      color: white;
    }
    
    .pill-toggle {
      display: inline-flex;
      border: 2px solid #1a1a9e;
      border-radius: 50px;
      overflow: hidden;
      margin: 0 auto;
    }
    .pill-toggle-btn {
      background: transparent;
      color: #1a1a9e;
      border: none;
      padding: 10px 40px;
      font-weight: 700;
      font-size: 15px;
      transition: all 0.2s;
    }
    .pill-toggle-btn.active {
      background: #1a1a9e;
      color: white;
    }

    .hero-title {
      font-size: 48px;
      font-weight: 900;
      color: #1a1a9e;
      line-height: 1.2;
    }
    
    @media (max-width: 768px) {
        .hero-title {
            font-size: 32px;
        }
        .hero-img {
            max-width: 250px !important;
        }
        .nav-center-desktop {
            display: none !important;
        }
        .pill-toggle-btn {
            padding: 8px 20px;
            font-size: 13px;
        }
    }
  `;

// Handler untuk login MENGIRIM device_id dan ip_address ke backend
const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
        // Siapkan deviceId dan ipAddress sesuai kebutuhan backend
        const currentDeviceId = generateDeviceId();
        const ipAddress = await fetchPublicIP();

        const response = await axios.post(
            `${import.meta.env.VITE_API_BASE_URL}/users/login`,
            {
                email: loginEmail,
                password: loginPassword,
                device_id: currentDeviceId,
                ip_address: ipAddress,
            },
            { withCredentials: true }
        );
        console.log("responselogin", response);

        if (response.data.success) {
            const userData = response.data.data.user;
            const sessionData = response.data.data.session;

            // Fallback compat: simpan juga deviceId lokal
            localStorage.setItem(`user_${userData.id}_device`, currentDeviceId);
            if (ipAddress) {
                localStorage.setItem(`user_${userData.id}_ip`, ipAddress);
            }

            // Logging device info (opsional)
            const deviceInfo = getDeviceInfo();
            console.log('Login from device:', {
                deviceId: currentDeviceId,
                ip: ipAddress || 'unknown',
                ...deviceInfo,
            });

            // Simpan user dan session
            localStorage.setItem('user', JSON.stringify(userData));
            if (sessionData) {
                localStorage.setItem('session', JSON.stringify(sessionData));
            }
            setCurrentUser(userData);

            // Tutup modal dan reset form
            setShowAuthModal(false);
            setLoginEmail('');
            setLoginPassword('');

            // Sweet Alert Success
            Swal.fire({
                icon: 'success',
                title: 'Login Berhasil!',
                html: `
                        <p>Selamat datang kembali, <strong>${userData.name}</strong>!</p>
                        <p class="text-muted small">Login dari: ${deviceInfo.type} - ${deviceInfo.browser}</p>
                        <p class="text-muted small">IP: ${ipAddress || 'unknown'}</p>
                    `,
                showConfirmButton: false,
                timer: 2500,
                timerProgressBar: true,
            });
        }
    } catch (error) {
        let errorMessage = 'Login gagal. Silakan coba lagi.';

        if (error.response) {
            errorMessage = error.response.data.message || errorMessage;
        } else if (error.request) {
            errorMessage = 'Tidak dapat terhubung ke server. Periksa koneksi Anda.';
        }

        Swal.fire({
            icon: 'error',
            title: 'Login Gagal!',
            text: errorMessage,
            confirmButtonText: 'Coba Lagi',
            confirmButtonColor: '#155ea0',
        });
    } finally {
        setIsLoading(false);
    }
};

// Handler untuk register dengan auto login DAN DEVICE TRACKING
const handleRegister = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
        // Generate username dari email (ambil bagian sebelum @)
        const username = registerEmail.split('@')[0];

        // Simpan email dan password untuk auto login
        const tempEmail = registerEmail;
        const tempPassword = registerPassword;

        const response = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/users`, {
            username: username,
            name: registerName,
            email: registerEmail,
            password: registerPassword,
            id_role: 1, // Role default untuk user biasa
            phone: registerPhone || null // Gunakan phone dari form atau null
        });

        if (response) {
            // Reset form
            setRegisterName('');
            setRegisterEmail('');
            setRegisterPhone('');
            setRegisterPassword('');

            // Sweet Alert Success dengan timer
            Swal.fire({
                icon: 'success',
                title: 'Registrasi Berhasil!',
                text: 'Akun Anda telah berhasil dibuat. Sedang masuk...',
                showConfirmButton: false,
                timer: 1500,
                timerProgressBar: true,
            });

            // Auto login setelah delay
            setTimeout(async () => {
                try {
                    // Siapkan deviceId dan ipAddress untuk auto-login
                    const currentDeviceId = generateDeviceId();
                    const ipAddress = await fetchPublicIP();

                    const loginResponse = await axios.post(
                        `${import.meta.env.VITE_API_BASE_URL}/users/login`,
                        {
                            email: tempEmail,
                            password: tempPassword,
                            device_id: currentDeviceId,
                            ip_address: ipAddress,
                        },
                        { withCredentials: true }
                    );

                    if (loginResponse.data.success) {
                        const userData = loginResponse.data.data.user;
                        const sessionData = loginResponse.data.data.session;

                        // Tidak perlu set/update device_uuid ke server
                        localStorage.setItem(`user_${userData.id}_device`, currentDeviceId);
                        if (ipAddress) {
                            localStorage.setItem(`user_${userData.id}_ip`, ipAddress);
                        }

                        localStorage.setItem('user', JSON.stringify(userData));
                        if (sessionData) {
                            localStorage.setItem('session', JSON.stringify(sessionData));
                        }
                        setCurrentUser(userData);

                        setShowAuthModal(false);

                        Swal.fire({
                            icon: 'success',
                            title: 'Selamat Datang!',
                            text: `Halo, ${userData.name}! Akun Anda berhasil dibuat dan Anda telah login.`,
                            showConfirmButton: false,
                            timer: 2000,
                            timerProgressBar: true,
                        });
                    }
                } catch (loginError) {
                    // Jika auto login gagal, arahkan ke tab login
                    setAuthTab('login');
                    setLoginEmail(tempEmail);

                    Swal.fire({
                        icon: 'warning',
                        title: 'Silakan Login Manual',
                        text: 'Registrasi berhasil, tetapi gagal login otomatis. Silakan login manual.',
                        confirmButtonText: 'OK',
                        confirmButtonColor: '#155ea0',
                    });
                } finally {
                    setIsLoading(false);
                }
            }, 1500);
        }
    } catch (error) {
        let errorMessage = 'Registrasi gagal. Silakan coba lagi.';

        if (error.response) {
            // Cek jika error duplicate email atau username
            if (error.response.status === 400 || error.response.status === 409) {
                errorMessage = 'Email sudah terdaftar. Gunakan email lain.';
            } else {
                errorMessage = error.response.data.message || errorMessage;
            }
        } else if (error.request) {
            errorMessage = 'Tidak dapat terhubung ke server. Periksa koneksi Anda.';
        }

        // Sweet Alert Error
        Swal.fire({
            icon: 'error',
            title: 'Registrasi Gagal!',
            text: errorMessage,
            confirmButtonText: 'Coba Lagi',
            confirmButtonColor: '#155ea0',
        });

        setIsLoading(false);
    }
};

// Handler untuk logout DENGAN CLEAR DEVICE ID
const handleLogout = () => {
    Swal.fire({
        title: 'Keluar dari Akun?',
        text: 'Apakah Anda yakin ingin keluar?',
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#155ea0',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Ya, Keluar',
        cancelButtonText: 'Batal',
        reverseButtons: true,
    }).then((result) => {
        if (result.isConfirmed) {
            // Clear device ID
            if (currentUser) {
                localStorage.removeItem(`user_${currentUser.id}_device`);
            }

            localStorage.removeItem('user');
            setCurrentUser(null);
            setTab('Home');

            Swal.fire({
                icon: 'success',
                title: 'Berhasil Keluar',
                text: 'Anda telah keluar dari akun.',
                showConfirmButton: false,
                timer: 1500,
                timerProgressBar: true,
            });
        }
    });
};

// Reset pesan saat ganti tab
const handleTabSwitch = (newTab) => {
    setAuthTab(newTab);
};

// Handler untuk navigate ke detail mapel - TANPA ALERT LOGIN (dipindah ke Video/Pembahasan)
const handleCourseClick = (course) => {
    console.log("course", course.type_mapel);
    // Halaman Video/Pembahasan akan menangani alert login jika user belum login
    if (course.type_mapel == 0) {
        navigate(`/detail-mapel/${course.id_sub_mapel}`, {
            state: { course }
        });
    } else if (course.type_mapel == 1) {
        const titleLower = course.title.toLowerCase();
        const isOnlyPembahasan = titleLower.includes('kelas 7') || 
                                 titleLower.includes('kelas 8') || 
                                 titleLower.includes('kelas 9') || 
                                 titleLower.includes('kelas 10') || 
                                 titleLower.includes('kelas 11') || 
                                 titleLower.includes('kelas 12') || 
                                 titleLower.includes('utbk');

        if (isOnlyPembahasan) {
            navigate(`/pembahasan/${course.id_sub_mapel}/${course.title}`, {
                state: { course }
            });
        } else {
            navigate(`/video/${course.id_sub_mapel}/${course.title}/mapel`, {
                state: { course }
            });
        }
    }
};

const renderContent = () => {
    if (tab === 'Home') {
        return (
            <div className="container-fluid px-0">
                {/* Hero Section */}
                <div className="bg-light-purple w-100 py-5 mb-5 animate-in position-relative overflow-hidden">
                    {/* Watermark */}
                    <img 
                        src="/Logogram_LogikaEinstein_indigo.png" 
                        alt="Watermark" 
                        style={{ 
                            position: 'absolute', 
                            left: '-10%', 
                            top: '10%', 
                            height: '120%', 
                            opacity: 0.05, 
                            pointerEvents: 'none',
                            zIndex: 0
                        }} 
                    />
                    <div className="container position-relative" style={{ maxWidth: '1200px', zIndex: 1 }}>
                        <div className="row align-items-center">
                            <div className="col-12 col-md-6 mb-4 mb-md-0 text-center text-md-start">
                                <h4 className="text-primary-dark fst-italic mb-2 fw-normal" style={{ fontSize: '34px' }}>
                                    Selamat Datang di
                                </h4>
                                <h1 className="hero-title mb-4 text-primary-dark" style={{ letterSpacing: '-1px' }}>
                                    Logika<span className="fw-bold">Einstein</span><span style={{ fontSize: '0.9em', fontWeight: 'bold' }}>.com</span>
                                </h1>
                                <button 
                                    className="btn bg-transparent border-primary-dark text-primary-dark fw-bold rounded-pill px-4 py-2 d-inline-flex align-items-center gap-2"
                                    style={{ borderWidth: '2px' }}
                                    onClick={() => {
                                        const subjectSection = document.getElementById('subject-section');
                                        if (subjectSection) {
                                            subjectSection.scrollIntoView({ behavior: 'smooth' });
                                        }
                                    }}
                                >
                                    MULAI BELAJAR <span style={{ fontSize: '1.2em' }}>→</span>
                                </button>
                            </div>
                            <div className="col-12 col-md-6 text-center d-flex justify-content-center">
                                <img 
                                    src="/Logo_LogikaEinstein_Indigo.png" 
                                    alt="Logika Einstein Seal" 
                                    className="img-fluid hero-img"
                                    style={{ maxWidth: '350px', objectFit: 'contain' }}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="container mb-5 text-center" style={{ maxWidth: '1200px' }}>


                    {/* Category Filter Pill */}
                                    <div id="subject-section"></div>
                    {!isLoadingCategories && categories.length > 0 && (
                        <div className="mb-5">
                            <div className="pill-toggle shadow-sm">
                                {categories.map((c) => (
                                    <button
                                        key={c}
                                        className={`pill-toggle-btn ${c === category ? 'active' : ''}`}
                                        onClick={() => setCategory(c)}
                                    >
                                        {c.toUpperCase()}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Course Grid */}
                    {isLoadingCourses ? (
                        <div className="text-center py-5">
                            <div className="spinner-border text-primary-dark" role="status">
                                <span className="visually-hidden">Loading...</span>
                            </div>
                        </div>
                    ) : filtered.length === 0 ? (
                        <div className="text-center py-5">
                            <p className="text-muted">Tidak ada Mata Pelajaran tersedia</p>
                        </div>
                    ) : (
                        <div className="row g-4 justify-content-center">
                            {filtered.map((c, i) => {
                                const titleLower = c.title.toLowerCase();
                                const isClassCard = titleLower.includes('kelas');
                                const colClass = isClassCard ? "col-12 col-md-4" : "col-12 col-md-6";

                                // Determine icon
                                let iconSrc = '/Icons/Icon_Premium.png';
                                if (titleLower.includes('kelas 7')) iconSrc = '/Icons/Kelas7.png';
                                else if (titleLower.includes('kelas 8')) iconSrc = '/Icons/Kelas8.png';
                                else if (titleLower.includes('kelas 9')) iconSrc = '/Icons/Kelas9.png';
                                else if (titleLower.includes('kelas 10')) iconSrc = '/Icons/Kelas10.png';
                                else if (titleLower.includes('kelas 11')) iconSrc = '/Icons/Kelas11.png';
                                else if (titleLower.includes('kelas 12')) iconSrc = '/Icons/Kelas12.png';
                                else if (c.category.toLowerCase().includes('fisika') && titleLower.includes('utbk')) iconSrc = '/Icons/Icon_FisikaUTBK.png';
                                else if (c.category.toLowerCase().includes('fisika')) iconSrc = '/Icons/Icon_FisikaDasar.png';
                                else if (c.category.toLowerCase().includes('matematika') && titleLower.includes('utbk')) iconSrc = '/Icons/Icon_MatematikaUTBK.png';
                                else if (c.category.toLowerCase().includes('matematika')) iconSrc = '/Icons/Icon_MatematikaDasar.png';

                                return (
                                    <div key={i} className={`${colClass} animate-in`} style={{ animationDelay: `${i * 0.05}s` }}>
                                        <div
                                            className={`card border-0 card-hover bg-light-purple d-flex flex-row align-items-center p-3 p-md-4 ${!isClassCard ? 'justify-content-center' : ''}`}
                                            style={{
                                                borderRadius: '35px',
                                                cursor: 'pointer',
                                                minHeight: isClassCard ? '120px' : '140px',
                                                gap: '15px'
                                            }}
                                            onClick={() => handleCourseClick(c)}
                                        >
                                            <div className="flex-shrink-0 d-flex justify-content-center align-items-center" style={{ width: isClassCard ? '60px' : '90px' }}>
                                                <img 
                                                    src={iconSrc}
                                                    alt={c.title}
                                                    style={{ maxHeight: isClassCard ? '60px' : '80px', maxWidth: '100%', objectFit: 'contain' }}
                                                />
                                            </div>
                                            <div className="text-start d-flex flex-column justify-content-center">
                                                {isClassCard ? (
                                                    <h5 className="fw-bold text-primary-dark mb-0" style={{ lineHeight: '1.4', fontSize: '1.1rem' }}>
                                                        {c.title.includes('Pembahasan') 
                                                            ? c.title.replace('Pembahasan ', 'Pembahasan\n').split('\n').map((line, idx) => (
                                                                <span key={idx} style={{ display: 'block' }}>{line}</span>
                                                            ))
                                                            : c.title
                                                        }
                                                    </h5>
                                                ) : (
                                                    <h4 className="fw-bold text-primary-dark mb-0 text-uppercase" style={{ letterSpacing: '1px' }}>
                                                        {c.title}
                                                    </h4>
                                                )}
                                                {c.description && !isClassCard && !titleLower.includes('fisika dasar') && (
                                                    <p className="mt-2 text-muted small mb-0">
                                                        {c.description.length > 60 ? `${c.description.substring(0, 60)}...` : c.description}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        );
    } else if (tab === 'Riwayat') {
        return (
            <div className="container py-4" style={{ maxWidth: '1000px' }}>
                <div className="card border-0 p-4 p-md-5" style={{ backgroundColor: '#eaf0fb', borderRadius: '24px', minHeight: '600px' }}>
                    <div className="d-flex align-items-center justify-content-between mb-5 position-relative">
                        <div className="w-100 d-flex align-items-center justify-content-center gap-2 text-primary-dark">
                            <span style={{ fontSize: '36px', lineHeight: '1' }}>★</span>
                            <h2 className="fw-bold mb-0" style={{ fontSize: '24px', letterSpacing: '0.5px' }}>FAVORIT</h2>
                        </div>
                        <div className="position-absolute end-0 fw-bold" style={{ cursor: 'pointer', fontSize: '14px', color: '#1a1a9e' }}>
                            sortir ▾
                        </div>
                    </div>

                    <div className="d-flex flex-column gap-3">
                        {savedVideos.length === 0 ? (
                            <div className="text-center py-5">
                                <span style={{ fontSize: '48px', color: '#1a1a9e' }}>☆</span>
                                <h5 className="fw-bold text-primary-dark mt-3">Belum ada video tersimpan</h5>
                                <p className="text-muted">Simpan video dari halaman materi untuk ditampilkan di sini.</p>
                            </div>
                        ) : (
                            savedVideos.map((item, idx) => (
                                <div 
                                    key={idx} 
                                    className="card d-flex flex-row align-items-center justify-content-between px-4 py-3 border-0 shadow-sm"
                                    style={{
                                        backgroundColor: 'white',
                                        borderRadius: '12px',
                                        cursor: 'pointer',
                                    }}
                                    onClick={() => {
                                        const titleLower = (item.courseTitle || '').toLowerCase();
                                        const isOnlyPembahasan = titleLower.includes('kelas 7') || 
                                                                 titleLower.includes('kelas 8') || 
                                                                 titleLower.includes('kelas 9') || 
                                                                 titleLower.includes('kelas 10') || 
                                                                 titleLower.includes('kelas 11') || 
                                                                 titleLower.includes('kelas 12') || 
                                                                 titleLower.includes('utbk');
                                        
                                        if (isOnlyPembahasan) {
                                            navigate(`/pembahasan/${item.id_sub_mapel_detail}/${encodeURIComponent(item.judul || item.title)}`, { state: { course: item.courseData, materi: item } });
                                        } else {
                                            navigate(`/video/${item.id_sub_mapel_detail}/${encodeURIComponent(item.judul || item.title)}/logika`, { state: { course: item.courseData, materi: item } });
                                        }
                                    }}
                                >
                                    <div className="fw-bold" style={{ color: '#111', fontSize: '16px' }}>
                                        {item.courseTitle || item.category} - {item.title}
                                    </div>
                                    <div 
                                        className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0"
                                        style={{ width: '32px', height: '32px', backgroundColor: '#1a1a9e', color: 'white', paddingLeft: '3px' }}
                                    >
                                        ▶
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        );
    } else if (tab === 'Profil' && currentUser) {
        const storedUserRaw = localStorage.getItem('user');
        const storedUserFromLocal = storedUserRaw ? JSON.parse(storedUserRaw) : null;
        const user = currentUser || storedUserFromLocal;

        const deviceId = user ? localStorage.getItem(`user_${user.id}_device`) : localStorage.getItem('device_id');
        const ipAddress = user ? localStorage.getItem(`user_${user.id}_ip`) : null;

        const personalInfo = {
            name: user?.name || '-',
            username: user?.username || '-',
            email: user?.email || '-',
            phone: user?.phone || '-',
            userId: user?.id ?? '-',
            deviceId: deviceId || '-',
            ipAddress: ipAddress || '-',
        };
        const isPremium = user?.is_premium === 1 || user?.is_premium === true || user?.premium === true;
        const expiredDate = user?.expired_date ? new Date(user.expired_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : '18 April 2027'; // Defaulting to a demo date if not available to match screenshot

        return (
            <div className="container py-4" style={{ maxWidth: '900px' }}>
                <div className="card border-0 p-4 p-md-5 position-relative" style={{ backgroundColor: '#eaf0fb', borderRadius: '24px', minHeight: '600px' }}>
                    <div className="d-flex align-items-center justify-content-center mb-5 position-relative">
                        <div className="w-100 d-flex align-items-center justify-content-center gap-2 text-primary-dark">
                            <span style={{ fontSize: '32px', lineHeight: '1' }}>👤</span>
                            <h2 className="fw-bold mb-0" style={{ fontSize: '24px', letterSpacing: '0.5px' }}>PROFIL</h2>
                        </div>
                        <div className="position-absolute end-0 fw-bold" style={{ cursor: 'pointer', fontSize: '14px', color: '#1a1a9e' }}>
                            edit profil
                        </div>
                    </div>

                    <div className="d-flex flex-column gap-2 mb-5">
                        <div className="card border-0 rounded-3 px-4 py-3 shadow-sm d-flex flex-row align-items-center">
                            <div className="fw-bold text-primary-dark" style={{ width: '35%', fontSize: '15px' }}>Nama</div>
                            <div className="fw-bold" style={{ width: '65%', fontSize: '15px', color: '#111' }}>{personalInfo.name}</div>
                        </div>
                        <div className="card border-0 rounded-3 px-4 py-3 shadow-sm d-flex flex-row align-items-center">
                            <div className="fw-bold text-primary-dark" style={{ width: '35%', fontSize: '15px' }}>Email</div>
                            <div className="fw-bold" style={{ width: '65%', fontSize: '15px', color: '#111' }}>{personalInfo.email}</div>
                        </div>
                        <div className="card border-0 rounded-3 px-4 py-3 shadow-sm d-flex flex-row align-items-center">
                            <div className="fw-bold text-primary-dark" style={{ width: '35%', fontSize: '15px' }}>Nomor Handphone</div>
                            <div className="fw-bold" style={{ width: '65%', fontSize: '15px', color: '#111' }}>{personalInfo.phone}</div>
                        </div>
                        <div className="card border-0 rounded-3 px-4 py-3 shadow-sm d-flex flex-row align-items-center">
                            <div className="fw-bold text-primary-dark" style={{ width: '35%', fontSize: '15px' }}>Status</div>
                            <div className="fw-bold" style={{ width: '65%', fontSize: '15px', color: '#111' }}>
                                {isPremium ? (
                                    <span className="badge text-dark" style={{ backgroundColor: '#fde047', fontSize: '14px', padding: '6px 10px', borderRadius: '4px' }}>
                                        PREMIUM
                                    </span>
                                ) : (
                                    'Pengguna Gratis'
                                )}
                            </div>
                        </div>
                        {isPremium && (
                            <div className="card border-0 rounded-3 px-4 py-3 shadow-sm d-flex flex-row align-items-center">
                                <div className="fw-bold text-primary-dark" style={{ width: '35%', fontSize: '15px' }}>Berlaku Sampai</div>
                                <div className="fw-bold" style={{ width: '65%', fontSize: '15px', color: '#111' }}>{expiredDate}</div>
                            </div>
                        )}
                    </div>

                    {!isPremium && (
                        <div className="text-center mb-4">
                            <button className="btn fw-bold rounded-pill text-dark shadow-sm" style={{ backgroundColor: '#fde047', fontSize: '20px', padding: '16px 40px', width: '100%', maxWidth: '350px' }}>
                                BELI PREMIUM
                            </button>
                        </div>
                    )}

                    {/* Logout Button */}
                    <div className="text-center mt-auto pt-4">
                        <button
                            className="btn btn-outline-danger w-100 rounded-pill py-2 fw-bold"
                            style={{ fontSize: '15px', maxWidth: '350px' }}
                            onClick={handleLogout}
                        >
                            🚪 Keluar dari Akun
                        </button>
                    </div>
                </div>
            </div>
        );
    }
};

return (
    <>
        <style>{styles}</style>
        <div className="d-flex flex-column" style={{ minHeight: '100vh', backgroundColor: '#f8f9fa' }}>
            {/* Header */}
            <header
                className="bg-primary-dark sticky-top"
                style={{ zIndex: 1020 }}
            >
                <div className="container py-2" style={{ maxWidth: '1200px' }}>
                    <div className="d-flex align-items-center justify-content-between">
                        {/* Logo */}
                        <div className="d-flex align-items-center gap-2 cursor-pointer" onClick={() => setTab('Home')} style={{ cursor: 'pointer' }}>
                            <img
                                src="/Logogram_LogikaEinstein_IndigoWhite_Transparent_Outline.png"
                                alt="Logika Einstein"
                                style={{
                                    height: '50px',
                                    objectFit: 'contain'
                                }}
                            />
                            <div className="text-white lh-1 d-none d-sm-block ms-1">
                                <span className="fw-bold" style={{ fontSize: '18px', display: 'block' }}>Logika</span>
                                <span className="fw-bold" style={{ fontSize: '18px' }}>Einstein<span style={{ fontSize: '12px' }}>.com</span></span>
                            </div>
                        </div>

                        {/* Center Nav - Desktop Only */}
                        <div className="d-flex align-items-center nav-center-desktop">
                            <a href="#" className="nav-link-custom" onClick={(e) => { e.preventDefault(); setTab('Home'); setCategory('Fisika'); }}>FISIKA</a>
                            <a href="#" className="nav-link-custom" onClick={(e) => { e.preventDefault(); setTab('Home'); setCategory('Matematika'); }}>MATEMATIKA</a>
                            {currentUser && (
                                <a href="#" className="nav-link-custom" onClick={(e) => { e.preventDefault(); setTab('Riwayat'); }}>FAVORIT</a>
                            )}
                        </div>

                        {/* Right Icons */}
                        <div className="d-flex align-items-center gap-2 gap-md-3">
                            {/* Integrated Search Bar */}
                            <div className="position-relative d-flex align-items-center">
                                <input
                                    type="text"
                                    className="form-control rounded-pill bg-white border-0"
                                    placeholder="Cari..."
                                    value={query}
                                    onChange={(e) => {
                                        setTab('Home');
                                        setQuery(e.target.value);
                                    }}
                                    style={{
                                        height: '36px',
                                        paddingLeft: '35px',
                                        fontSize: '13px',
                                        width: '150px',
                                        color: '#1a1a9e'
                                    }}
                                />
                                <div className="position-absolute" style={{ left: '12px', top: '50%', transform: 'translateY(-50%)' }}>
                                    <img src="/Icons/Icon_Cari_indigo.png" alt="Search" style={{ width: '15px', height: '15px', objectFit: 'contain' }} />
                                </div>
                            </div>

                            {currentUser ? (
                                <button
                                    onClick={() => setTab('Profil')}
                                    className="d-flex align-items-center gap-2 px-3 py-1 rounded-pill text-white bg-transparent border border-white"
                                    style={{ height: '36px' }}
                                >
                                    <img src="/Icons/Icon_Profil_white.png" alt="Profile" style={{ width: '18px', height: '18px', objectFit: 'contain' }} />
                                    <span className="small fw-bold">{currentUser.name.split(' ')[0]}</span>
                                </button>
                            ) : (
                                <button
                                    onClick={() => setShowAuthModal(true)}
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

            {/* Content */}
            <main className="flex-grow-1 overflow-auto" style={{ paddingBottom: '80px' }}>
                <div>
                    {renderContent()}
                </div>
            </main>
        </div>

        {/* Modal Autentikasi */}
        <div
            className={`modal fade ${showAuthModal ? 'show d-block' : ''}`}
            tabIndex="-1"
            aria-hidden={!showAuthModal}
            style={{ backgroundColor: showAuthModal ? 'rgba(0,0,0,0.4)' : 'transparent' }}
        >
            <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content rounded-4">
                    <div className="modal-header border-0">
                        <h5 className="modal-title fw-bold">
                            {authTab === 'login' ? '🔐 MASUK KE AKUN' : '📝 DAFTAR AKUN BARU'}
                        </h5>
                        <button
                            type="button"
                            className="btn-close"
                            onClick={() => {
                                setShowAuthModal(false);
                            }}
                            aria-label="Close"
                        ></button>
                    </div>

                    <div className="modal-body">
                        {/* Tab Switcher */}
                        <div className="d-flex gap-2 mb-4">
                            <button
                                className={`btn rounded-pill px-4 py-2 flex-grow-1 ${authTab === 'login'
                                    ? 'btn-primary'
                                    : 'btn-outline-secondary'
                                    }`}
                                onClick={() => handleTabSwitch('login')}
                                disabled={isLoading}
                            >
                                LOGIN
                            </button>
                            <button
                                className={`btn rounded-pill px-4 py-2 flex-grow-1 ${authTab === 'register'
                                    ? 'btn-primary'
                                    : 'btn-outline-secondary'
                                    }`}
                                onClick={() => handleTabSwitch('register')}
                                disabled={isLoading}
                            >
                                REGISTER
                            </button>
                        </div>

                        {/* Form Login */}
                        {authTab === 'login' && (
                            <form onSubmit={handleLogin}>
                                <div className="mb-3">
                                    <label className="form-label fw-semibold">Email</label>
                                    <input
                                        type="email"
                                        className="form-control rounded-pill px-4 py-2"
                                        placeholder="NAMA@CONTOH.COM"
                                        value={loginEmail}
                                        onChange={(e) => setLoginEmail(e.target.value)}
                                        required
                                        disabled={isLoading}
                                    />
                                </div>
                                <div className="mb-4">
                                    <label className="form-label fw-semibold">Password</label>
                                    <input
                                        type="password"
                                        className="form-control rounded-pill px-4 py-2"
                                        placeholder="••••••••"
                                        value={loginPassword}
                                        onChange={(e) => setLoginPassword(e.target.value)}
                                        required
                                        disabled={isLoading}
                                    />
                                </div>
                                <button
                                    type="submit"
                                    className="btn btn-primary w-100 rounded-pill py-3 fw-bold"
                                    disabled={isLoading}
                                >
                                    {isLoading ? (
                                        <>
                                            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                            Memproses...
                                        </>
                                    ) : (
                                        '🚀 MASUK'
                                    )}
                                </button>
                            </form>
                        )}

                        {/* Form Register */}
                        {authTab === 'register' && (
                            <form onSubmit={handleRegister}>
                                <div className="mb-3">
                                    <label className="form-label fw-semibold">Nama Lengkap</label>
                                    <input
                                        type="text"
                                        className="form-control rounded-pill px-4 py-2"
                                        placeholder="Nama Anda"
                                        value={registerName}
                                        onChange={(e) => setRegisterName(e.target.value)}
                                        required
                                        disabled={isLoading}
                                    />
                                </div>
                                <div className="mb-3">
                                    <label className="form-label fw-semibold">Email</label>
                                    <input
                                        type="email"
                                        className="form-control rounded-pill px-4 py-2"
                                        placeholder="nama@contoh.com"
                                        value={registerEmail}
                                        onChange={(e) => setRegisterEmail(e.target.value)}
                                        required
                                        disabled={isLoading}
                                    />
                                </div>
                                <div className="mb-3">
                                    <label className="form-label fw-semibold">Nomor Handphone</label>
                                    <input
                                        type="text"
                                        className="form-control rounded-pill px-4 py-2"
                                        placeholder="081234567890"
                                        value={registerPhone}
                                        onChange={(e) => setRegisterPhone(e.target.value)}
                                        disabled={isLoading}
                                    />
                                    <small className="text-muted">Opsional</small>
                                </div>
                                <div className="mb-4">
                                    <label className="form-label fw-semibold">Password</label>
                                    <input
                                        type="password"
                                        className="form-control rounded-pill px-4 py-2"
                                        placeholder="••••••••"
                                        value={registerPassword}
                                        onChange={(e) => setRegisterPassword(e.target.value)}
                                        required
                                        disabled={isLoading}
                                        minLength={6}
                                    />
                                    <small className="text-muted">Minimal 6 karakter</small>
                                </div>
                                <button
                                    type="submit"
                                    className="btn btn-primary w-100 rounded-pill py-3 fw-bold"
                                    disabled={isLoading}
                                >
                                    {isLoading ? (
                                        <>
                                            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                            Memproses...
                                        </>
                                    ) : (
                                        '✨ DAFTAR SEKARANG'
                                    )}
                                </button>
                            </form>
                        )}
                    </div>

                    <div className="modal-footer border-0">
                        <button
                            className="btn btn-light rounded-pill px-4"
                            onClick={() => {
                                setShowAuthModal(false);
                            }}
                            disabled={isLoading}
                        >
                            Tutup
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </>
);
}