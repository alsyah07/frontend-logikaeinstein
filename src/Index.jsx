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
            } catch (e) {}
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

    const riwayatData = [
        {
            title: 'Matematika Kelas 7',
            category: 'Matematika',
            progress: 80,
            lastAccessed: '2 jam lalu',
            totalTime: '12 jam 30 menit',
            completedModules: 20,
            totalModules: 25,
            status: 'Berlangsung'
        },
        {
            title: 'Fisika Kelas 7',
            category: 'Fisika',
            progress: 65,
            lastAccessed: '1 hari lalu',
            totalTime: '8 jam 15 menit',
            completedModules: 13,
            totalModules: 20,
            status: 'Berlangsung'
        },
        {
            title: 'Matematika Kelas 8',
            category: 'Matematika',
            progress: 45,
            lastAccessed: '3 hari lalu',
            totalTime: '6 jam 45 menit',
            completedModules: 10,
            totalModules: 22,
            status: 'Berlangsung'
        },
        {
            title: 'Mekanika',
            category: 'Fisika',
            progress: 30,
            lastAccessed: '1 minggu lalu',
            totalTime: '4 jam 20 menit',
            completedModules: 7,
            totalModules: 24,
            status: 'Berlangsung'
        },
    ];

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
      from {
        opacity: 0;
        transform: translateY(20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    @keyframes float {
      0%, 100% {
        transform: translateY(0px);
      }
      50% {
        transform: translateY(-10px);
      }
    }

    .card-hover {
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }

    @media (min-width: 768px) {
      .card-hover:hover {
        transform: translateY(-8px);
        box-shadow: 0 20px 40px rgba(0,0,0,0.15) !important;
      }
    }

    .category-btn {
      transition: all 0.3s ease;
    }

    .animate-in {
      animation: slideUp 0.5s ease-out forwards;
    }

    .float-animation {
      animation: float 3s ease-in-out infinite;
    }

    .nav-item {
      position: relative;
      transition: all 0.3s ease;
    }

    .nav-item.active::before {
      content: '';
      position: absolute;
      top: -2px;
      left: 50%;
      transform: translateX(-50%);
      width: 30px;
      height: 3px;
      background: linear-gradient(90deg, #2e6ca9 0%, #9dc6f4ff 100%);
      border-radius: 0 0 10px 10px;
    }

    .glass-effect {
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(10px);
      -webkit-backdrop-filter: blur(10px);
    }

    .no-scrollbar::-webkit-scrollbar {
      display: none;
    }
    
    .no-scrollbar {
      -ms-overflow-style: none;
      scrollbar-width: none;
    }

    .stat-card {
      transition: all 0.3s ease;
    }

    .stat-card:hover {
      transform: translateY(-4px);
    }

    .profile-stat {
      transition: all 0.3s ease;
    }

    .profile-stat:hover {
      transform: scale(1.05);
    }
  `;

    // Handler untuk login DENGAN DEVICE TRACKING (single-device menggunakan UUID dari database)
    const handleLogin = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const response = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/users/login`, {
                email: loginEmail,
                password: loginPassword
            }, { withCredentials: true });
            console.log("responselogin", response)
            if (response.data.success) {
                const userData = response.data.data.user;

                // UUID perangkat saat ini (persisten di browser ini)
                const currentDeviceId = generateDeviceId();
                // UUID perangkat yang tersimpan di database (field dari server)
                const serverDeviceId = userData.device_uuid || userData.deviceId || null;

                // Jika server sudah punya UUID dan berbeda -> tegakkan single-device
                if (serverDeviceId && serverDeviceId !== currentDeviceId) {
                    const result = await Swal.fire({
                        icon: 'warning',
                        title: 'Login dari Device Lain',
                        html: `
                            <p>Akun ini sedang aktif di perangkat lain.</p>
                            <p class="text-muted small">Melanjutkan akan menonaktifkan perangkat sebelumnya.</p>
                        `,
                        showCancelButton: true,
                        confirmButtonColor: '#155ea0',
                        cancelButtonColor: '#6c757d',
                        confirmButtonText: 'Lanjutkan Login',
                        cancelButtonText: 'Batal',
                        reverseButtons: true,
                    });

                    if (!result.isConfirmed) {
                        setIsLoading(false);
                        return;
                    }

                    // Update UUID perangkat di server ke perangkat saat ini
                    try {
                        await axios.post(`${import.meta.env.VITE_API_BASE_URL}/users/update_device_uuid`, {
                            user_id: userData.id,
                            device_uuid: currentDeviceId,
                        });
                        userData.device_uuid = currentDeviceId;
                    } catch (e) {
                        console.error('Gagal update device UUID di server:', e);
                    }
                } else if (!serverDeviceId) {
                    // Jika server belum punya UUID -> set pertama kali
                    try {
                        await axios.post(`${import.meta.env.VITE_API_BASE_URL}/users/update_device_uuid`, {
                            user_id: userData.id,
                            device_uuid: currentDeviceId,
                        });
                        userData.device_uuid = currentDeviceId;
                    } catch (e) {
                        console.error('Gagal set device UUID di server:', e);
                    }
                }

                // Simpan juga ID perangkat di local sebagai fallback lama
                localStorage.setItem(`user_${userData.id}_device`, currentDeviceId);

                // Logging device info (opsional)
                const deviceInfo = getDeviceInfo();
                console.log('Login from device:', {
                    deviceId: currentDeviceId,
                    ...deviceInfo
                });

                // Simpan data user ke localStorage (termasuk device_uuid terkini)
                localStorage.setItem('user', JSON.stringify(userData));
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
                        const loginResponse = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/users/login`, {
                            email: tempEmail,
                            password: tempPassword
                        }, { withCredentials: true });

                        if (loginResponse.data.success) {
                            const userData = loginResponse.data.data.user;

                            // UUID perangkat saat ini (persisten di browser ini)
                            const currentDeviceId = generateDeviceId();

                            // Set device UUID di server untuk user baru
                            try {
                                await axios.post(`${import.meta.env.VITE_API_BASE_URL}/users/update_device_uuid`, {
                                    user_id: userData.id,
                                    device_uuid: currentDeviceId,
                                });
                                userData.device_uuid = currentDeviceId;
                            } catch (e) {
                                console.error('Gagal set device UUID di server untuk user baru:', e);
                            }

                            // Simpan juga ID perangkat di local sebagai fallback lama
                            localStorage.setItem(`user_${userData.id}_device`, currentDeviceId);

                            // Simpan data user ke localStorage
                            localStorage.setItem('user', JSON.stringify(userData));
                            setCurrentUser(userData);

                            // Tutup modal
                            setShowAuthModal(false);

                            // Sweet Alert Welcome
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
            navigate(`/video/${course.id_sub_mapel}/${course.title}`, {
                state: { course }
            });
        }
    };

    const renderContent = () => {
        if (tab === 'Home') {
            return (
                <div className="container" style={{ maxWidth: '1200px' }}>
                    {/* Welcome Banner */}
                    <div className="mb-3 mb-md-4 animate-in">
                        <div
                            className="rounded-4 p-4 text-white position-relative overflow-hidden"
                            style={{
                                background: 'linear-gradient(135deg, #155ea0 0%, #829dc5ff 100%)',
                                minHeight: '280px'
                            }}
                        >
                            <div className="position-relative" style={{ zIndex: 2 }}>
                                <div className="d-flex align-items-center gap-2 mb-3">
                                    <div
                                        className="bg-white bg-opacity-25 rounded-3 d-flex align-items-center justify-content-center"
                                        style={{ width: '48px', height: '48px', fontSize: '24px' }}
                                    >
                                        👋
                                    </div>
                                    <span
                                        className="badge rounded-pill px-3 py-2"
                                        style={{
                                            background: 'rgba(255,255,255,0.25)',
                                            fontSize: '13px',
                                            fontWeight: 700,
                                        }}
                                    >
                                        Level 5 - Intermediate
                                    </span>
                                </div>

                                <h1 className="fw-bold mb-3" style={{ fontSize: '28px', lineHeight: 1.2 }}>
                                    {currentUser ? `Halo, ${currentUser.name}!` : 'Cara Belajar Seru'}
                                    <br />
                                    {currentUser ? 'Selamat Datang Kembali' : 'dan Gampang'}
                                </h1>

                                <p className="mb-4 opacity-90" style={{ fontSize: '15px', lineHeight: 1.5 }}>
                                    Kuasai konsep matematika dan fisika dengan metode pembelajaran interaktif dan menyenangkan
                                </p>

                                <button
                                    className="btn btn-light rounded-pill px-4 py-3 fw-bold shadow d-inline-flex align-items-center gap-2"
                                    style={{ fontSize: '15px' }}
                                >
                                    <span>🚀</span>
                                    <span>Lanjutkan Belajar</span>
                                </button>
                            </div>

                            <div
                                className="position-absolute d-none d-sm-block"
                                style={{
                                    right: '20px',
                                    bottom: '20px',
                                    fontSize: '100px',
                                    opacity: 0.15,
                                    zIndex: 1,
                                }}
                            >
                                🎓
                            </div>
                        </div>
                    </div>

                    {/* Search Bar */}
                    <div className="position-relative mb-3 mb-md-4">
                        <div
                            className="position-absolute d-flex align-items-center justify-content-center"
                            style={{
                                left: '20px',
                                top: '50%',
                                transform: 'translateY(-50%)',
                                width: '20px',
                                height: '20px',
                                zIndex: 10
                            }}
                        >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2.5">
                                <circle cx="11" cy="11" r="8" />
                                <path d="m21 21-4.35-4.35" />
                            </svg>
                        </div>
                        <input
                            type="text"
                            className="form-control border-0 shadow-sm rounded-pill"
                            placeholder="Cari Mata Pelajaran matematika atau fisika..."
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            style={{
                                backgroundColor: 'white',
                                paddingLeft: '52px',
                                paddingRight: '24px',
                                fontSize: '15px',
                                height: '56px',
                            }}
                        />
                    </div>

                    {/* Category Filter */}
                    <div className="mb-4 no-scrollbar" style={{ overflowX: 'auto', overflowY: 'hidden' }}>
                        {isLoadingCategories ? (
                            <div className="text-center py-3">
                                <div className="spinner-border text-primary" role="status">
                                    <span className="visually-hidden">Loading...</span>
                                </div>
                            </div>
                        ) : (
                            <div className="d-flex flex-nowrap gap-2 pb-2">
                                {categories.map((c) => {
                                    const isActive = c === category;
                                    const catData = categoryData[c] || {
                                        color: '#667eea',
                                        emoji: '📚',
                                        icon: '📚',
                                        gradient: 'linear-gradient(135deg, #2e6ca9 0%, #9dc6f4ff 100%)',
                                        lightGradient: 'linear-gradient(135deg, #2e6ca9 0%, #9dc6f4ff 100%)'
                                    };

                                    return (
                                        <button
                                            key={c}
                                            className="category-btn btn rounded-pill border-0 text-nowrap d-flex align-items-center gap-2 shadow-sm flex-shrink-0"
                                            style={{
                                                background: isActive ? catData.gradient : 'white',
                                                color: isActive ? 'white' : '#6b7280',
                                                padding: '12px 24px',
                                                fontWeight: isActive ? '700' : '600',
                                                fontSize: '15px',
                                                boxShadow: isActive ? '0 4px 20px rgba(46, 108, 169, 0.4)' : '0 2px 8px rgba(0,0,0,0.08)',
                                                whiteSpace: 'nowrap',
                                            }}
                                            onClick={() => setCategory(c)}
                                        >
                                            <span style={{ fontSize: '20px' }}>{catData.icon}</span>
                                            <span>{c}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* Section Header */}
                    {!isLoadingCategories && category && (
                        <div className="d-flex align-items-center justify-content-between mb-3 mb-md-4">
                            <div>
                                <h4 className="fw-bold mb-1" style={{ fontSize: '20px' }}>
                                    {`${categoryData[category]?.emoji || '📚'} Mata Pelajaran ${category}`}
                                </h4>
                                <p className="text-muted mb-0" style={{ fontSize: '13px' }}>
                                    {isLoadingCourses ? 'Memuat...' : `${filtered.length} Mata Pelajaran tersedia`}
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Course Grid */}
                    {isLoadingCourses ? (
                        <div className="text-center py-5">
                            <div className="spinner-border text-primary" role="status" style={{ width: '3rem', height: '3rem' }}>
                                <span className="visually-hidden">Loading...</span>
                            </div>
                            <p className="mt-3 text-muted">Memuat Mata Pelajaran...</p>
                        </div>
                    ) : filtered.length === 0 ? (
                        <div className="text-center py-5">
                            <div style={{ fontSize: '64px', marginBottom: '16px' }}>📚</div>
                            <h5 className="text-muted">Tidak ada Mata Pelajaran tersedia</h5>
                            <p className="text-muted">Coba cari dengan kata kunci lain</p>
                        </div>
                    ) : (
                        <div className="row g-3">
                            {filtered.map((c, i) => {
                                const catData = categoryData[c.category] || {
                                    color: '#667eea',
                                    emoji: '📚',
                                    icon: '📚',
                                    gradient: 'linear-gradient(135deg, #2e6ca9 0%, #9dc6f4ff 100%)',
                                    lightGradient: 'linear-gradient(135deg, #2e6ca9 0%, #9dc6f4ff 100%)'
                                };

                                return (
                                    <div key={i} className="col-12 col-md-6 col-lg-4 animate-in" style={{ animationDelay: `${i * 0.05}s` }}>
                                        <div
                                            className="card border-0 shadow-sm h-100 overflow-hidden card-hover"
                                            style={{
                                                borderRadius: '20px',
                                                cursor: 'pointer',
                                            }}
                                            onClick={() => handleCourseClick(c)}
                                        >
                                            <div
                                                className="text-white position-relative"
                                                style={{
                                                    background: catData.gradient,
                                                    minHeight: '150px',
                                                    padding: '20px',
                                                }}
                                            >
                                                <div className="d-flex justify-content-between align-items-start mb-3">
                                                    <span
                                                        className="badge text-white rounded-pill d-flex align-items-center gap-2"
                                                        style={{
                                                            backgroundColor: 'rgba(255,255,255,0.25)',
                                                            fontSize: '12px',
                                                            padding: '6px 14px',
                                                            fontWeight: 700,
                                                        }}
                                                    >
                                                        <span style={{ fontSize: '16px' }}>{catData.emoji}</span>
                                                        <span>{c.category}</span>
                                                    </span>
                                                    {/* <div
                                                        className="d-flex align-items-center gap-1 rounded-pill"
                                                        style={{
                                                            backgroundColor: 'rgba(255,255,255,0.3)',
                                                            padding: '6px 12px',
                                                        }}
                                                    >
                                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" className="text-warning">
                                                            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                                                        </svg>
                                                        <small style={{ fontSize: '13px', fontWeight: 700 }}>{c.rating.toFixed(1)}</small>
                                                    </div> */}
                                                </div>

                                                <h5 className="fw-bold mb-2" style={{ fontSize: '17px', lineHeight: 1.3 }}>
                                                    {c.title}
                                                </h5>

                                                <p className="mb-2 opacity-90" style={{ fontSize: '12px', lineHeight: 1.4 }}>
                                                    {c.description.length > 80 ? `${c.description.substring(0, 80)}...` : c.description}
                                                </p>

                                                {/* <span
                                                    className="badge rounded-pill"
                                                    style={{
                                                        backgroundColor: 'rgba(255,255,255,0.25)',
                                                        fontSize: '10px',
                                                        padding: '4px 12px',
                                                        fontWeight: 700,
                                                    }}
                                                >
                                                    {c.level}
                                                </span> */}
                                            </div>

                                            <div className="card-body bg-white" style={{ padding: '20px' }}>
                                                <div className="d-flex align-items-center justify-content-between mb-3 text-muted" style={{ fontSize: '13px' }}>
                                                    {/* <div className="d-flex align-items-center gap-2">
                                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                                                            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                                                        </svg>
                                                        <span className="fw-semibold">{c.modules} modul</span>
                                                    </div>
                                                    <div className="d-flex align-items-center gap-2">
                                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                                                            <circle cx="9" cy="7" r="4" />
                                                        </svg>
                                                        <span className="fw-semibold">{c.students}</span>
                                                    </div> */}
                                                </div>
                                                <button
                                                    className="btn w-100 rounded-pill fw-bold text-white d-flex align-items-center justify-content-center gap-2"
                                                    style={{
                                                        fontSize: '14px',
                                                        padding: '14px 20px',
                                                        background: catData.gradient,
                                                        border: 'none',
                                                    }}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleCourseClick(c);
                                                    }}
                                                >
                                                    <span>🚀</span>
                                                    <span>Mulai Belajar</span>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            );
        } else if (tab === 'Riwayat') {
            return (
                <div className="container" style={{ maxWidth: '1200px' }}>
                    {/* Header Section */}
                    <div className="mb-4 animate-in">
                        <div className="d-flex align-items-center gap-3 mb-3">
                            <div
                                className="d-flex align-items-center justify-content-center rounded-3"
                                style={{
                                    width: '56px',
                                    height: '56px',
                                    background: 'linear-gradient(135deg, #155ea0 0%, #829dc5ff 100%)',
                                    fontSize: '28px',
                                }}
                            >
                                📚
                            </div>
                            <div>
                                <h3 className="fw-bold mb-1">Riwayat Belajar</h3>
                                <p className="text-muted mb-0" style={{ fontSize: '14px' }}>
                                    Pantau progress dan aktivitas belajarmu
                                </p>
                            </div>
                        </div>

                        {/* Stats Overview */}
                        {/* <div className="row g-3 mb-4">
                            <div className="col-6 col-md-3">
                                <div className="stat-card card border-0 shadow-sm rounded-3 p-3 text-center">
                                    <div className="mb-2" style={{ fontSize: '32px' }}>🎯</div>
                                    <h4 className="fw-bold mb-0" style={{ color: '#155ea0' }}>4</h4>
                                    <small className="text-muted">Kursus Aktif</small>
                                </div>
                            </div>
                            <div className="col-6 col-md-3">
                                <div className="stat-card card border-0 shadow-sm rounded-3 p-3 text-center">
                                    <div className="mb-2" style={{ fontSize: '32px' }}>⏱️</div>
                                    <h4 className="fw-bold mb-0" style={{ color: '#155ea0' }}>31.5</h4>
                                    <small className="text-muted">Jam Belajar</small>
                                </div>
                            </div>
                            <div className="col-6 col-md-3">
                                <div className="stat-card card border-0 shadow-sm rounded-3 p-3 text-center">
                                    <div className="mb-2" style={{ fontSize: '32px' }}>✅</div>
                                    <h4 className="fw-bold mb-0" style={{ color: '#155ea0' }}>50</h4>
                                    <small className="text-muted">Modul Selesai</small>
                                </div>
                            </div>
                            <div className="col-6 col-md-3">
                                <div className="stat-card card border-0 shadow-sm rounded-3 p-3 text-center">
                                    <div className="mb-2" style={{ fontSize: '32px' }}>📈</div>
                                    <h4 className="fw-bold mb-0" style={{ color: '#155ea0' }}>60%</h4>
                                    <small className="text-muted">Rata-rata</small>
                                </div>
                            </div>
                        </div> */}
                    </div>

                    {/* Course History List */}
                    <div>
                        <div className="d-flex align-items-center justify-content-between mb-3">
                            <h5 className="fw-bold mb-0">Mata Pelajaran yang Sedang Dipelajari</h5>
                            {savedVideos.length > 0 && (
                                <button
                                    className="btn btn-outline-danger btn-sm rounded-pill"
                                    onClick={handleClearAllSavedVideos}
                                >
                                    Hapus Semua
                                </button>
                            )}
                        </div>
                        <div className="row g-3">
                            {savedVideos.length === 0 ? (
                                <div className="col-12">
                                    <div className="card border-0 shadow-sm rounded-4 text-center">
                                        <div className="card-body p-4">
                                            <div className="d-flex flex-column align-items-center">
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
                                                    <span>📭</span>
                                                </div>
                                                <h6 className="fw-bold mb-1">Belum ada video tersimpan</h6>
                                                <p className="text-muted mb-0" style={{ maxWidth: 520 }}>
                                                    Simpan video dari halaman materi untuk ditampilkan di sini.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                savedVideos.map((item, idx) => {
                                    const catData = categoryData[item.category] || {
                                        color: '#667eea',
                                        emoji: '📚',
                                        gradient: 'linear-gradient(135deg, #2e6ca9 0%, #9dc6f4ff 100%)',
                                    };
                                    return (
                                        <div key={idx} className="col-12 col-md-6">
                                            <div className="card border-0 shadow-sm rounded-4 overflow-hidden card-hover">
                                                <div className="card-body p-3 p-md-4">
                                                    <div className="d-flex align-items-start gap-3 mb-3">
                                                        <div
                                                            className="d-flex align-items-center justify-content-center rounded-3 flex-shrink-0"
                                                            style={{
                                                                width: '56px',
                                                                height: '56px',
                                                                background: catData.gradient,
                                                                fontSize: '24px',
                                                            }}
                                                        >
                                                            {catData.emoji}
                                                        </div>
                                                        <div className="flex-grow-1">
                                                            <div className="d-flex align-items-center gap-2 mb-1">
                                                                <h6 className="fw-bold mb-0" style={{ fontSize: '16px' }}>
                                                                    {item.title}
                                                                </h6>
                                                            </div>
                                                            <div className="d-flex align-items-center gap-2 text-muted" style={{ fontSize: '12px' }}>
                                                                <span>🕐 {item.lastAccessed}</span>
                                                            </div>
                                                        </div>
                                                        <div className="d-flex align-items-center gap-2">
                                                            <span
                                                                className="badge rounded-pill"
                                                                style={{
                                                                    background: catData.gradient,
                                                                    color: 'white',
                                                                    fontSize: '11px',
                                                                    padding: '6px 12px',
                                                                }}
                                                            >
                                                                {item.status}
                                                            </span>

                                                        </div>
                                                    </div>

                                                    <div className="mb-3">

                                                    </div>

                                                    <div className="row g-2 mb-3">

                                                    </div>

                                                    <div className="row g-2">
                                                        <div className="col-8">
                                                            <a
                                                                href={`/video/${item.id_sub_mapel_detail}/${item.title}`}
                                                                className="btn w-100 rounded-pill fw-bold text-white"
                                                                style={{
                                                                    fontSize: '14px',
                                                                    padding: '12px 20px',
                                                                    background: catData.gradient,
                                                                    border: 'none',
                                                                }}
                                                            >
                                                                Lanjutkan Belajar
                                                            </a>
                                                        </div>
                                                        <div className="col-4">
                                                            <button
                                                                className="btn w-100 rounded-pill btn-outline-danger"
                                                                style={{ fontSize: '14px', padding: '12px 20px' }}
                                                                onClick={() => handleDeleteSavedVideo(item.id_sub_mapel_detail)}
                                                            >
                                                                Hapus
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )
                                })
                            )}
                        </div>
                    </div>
                </div>
            );
        } else if (tab === 'Profil') {
            return (
                <div className="container" style={{ maxWidth: '900px' }}>
                    {/* Profile Header */}
                    <div className="mb-4 animate-in">
                        <div
                            className="rounded-4 p-4 text-white position-relative overflow-hidden"
                            style={{
                                background: 'linear-gradient(135deg, #155ea0 0%, #829dc5ff 100%)',
                                minHeight: '200px'
                            }}
                        >
                            <div className="position-relative text-center" style={{ zIndex: 2 }}>
                                <div
                                    className="mx-auto mb-3 d-flex align-items-center justify-content-center rounded-circle bg-white"
                                    style={{
                                        width: '100px',
                                        height: '100px',
                                        fontSize: '48px',
                                    }}
                                >
                                    👤
                                </div>
                                <h3 className="fw-bold mb-1">{currentUser ? currentUser.name : 'Tamu'}</h3>
                                <p className="mb-0 opacity-90">
                                    {currentUser ? currentUser.email : 'Silakan login untuk melanjutkan'}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Quick Stats */}
                    <div className="row g-3 mb-4">
                        {/* <div className="col-4">
                        <div className="profile-stat card border-0 shadow-sm rounded-3 p-3 text-center">
                            <div className="mb-2" style={{ fontSize: '32px' }}>🎯</div>
                            <h5 className="fw-bold mb-0" style={{ color: '#155ea0' }}>Level 5</h5>
                            <small className="text-muted">Intermediate</small>
                        </div>
                    </div>
                    <div className="col-4">
                        <div className="profile-stat card border-0 shadow-sm rounded-3 p-3 text-center">
                            <div className="mb-2" style={{ fontSize: '32px' }}>⭐</div>
                            <h5 className="fw-bold mb-0" style={{ color: '#155ea0' }}>850</h5>
                            <small className="text-muted">Total Poin</small>
                        </div>
                    </div>
                    <div className="col-4">
                        <div className="profile-stat card border-0 shadow-sm rounded-3 p-3 text-center">
                            <div className="mb-2" style={{ fontSize: '32px' }}>🔥</div>
                            <h5 className="fw-bold mb-0" style={{ color: '#155ea0' }}>7</h5>
                            <small className="text-muted">Hari Streak</small>
                        </div>
                    </div> */}
                    </div>

                    {/* Profile Menu */}
                    <div className="card border-0 shadow-sm rounded-4 mb-3">
                        <div className="card-body p-0">
                            <a href="#" className="d-flex align-items-center gap-3 p-3 text-decoration-none text-dark border-bottom">
                                <div
                                    className="d-flex align-items-center justify-content-center rounded-3"
                                    style={{
                                        width: '48px',
                                        height: '48px',
                                        background: 'linear-gradient(135deg, #155ea0 0%, #829dc5ff 100%)',
                                        fontSize: '20px',
                                    }}
                                >
                                    👤
                                </div>
                                <div className="flex-grow-1">
                                    <div className="fw-bold">Informasi Pribadi</div>
                                    <small className="text-muted">Kelola data diri kamu</small>
                                </div>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M9 18l6-6-6-6" />
                                </svg>
                            </a>



                            <a href="#" className="d-flex align-items-center gap-3 p-3 text-decoration-none text-dark border-bottom">
                                <div
                                    className="d-flex align-items-center justify-content-center rounded-3"
                                    style={{
                                        width: '48px',
                                        height: '48px',
                                        background: 'linear-gradient(135deg, #155ea0 0%, #829dc5ff 100%)',
                                        fontSize: '20px',
                                    }}
                                >
                                    💳
                                </div>
                                <div className="flex-grow-1">
                                    <div className="fw-bold">Langganan</div>
                                    <small className="text-muted">Kelola paket belajar kamu</small>
                                </div>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M9 18l6-6-6-6" />
                                </svg>
                            </a>

                            <a href="#" className="d-flex align-items-center gap-3 p-3 text-decoration-none text-dark">
                                <div
                                    className="d-flex align-items-center justify-content-center rounded-3"
                                    style={{
                                        width: '48px',
                                        height: '48px',
                                        background: 'linear-gradient(135deg, #155ea0 0%, #829dc5ff 100%)',
                                        fontSize: '20px',
                                    }}
                                >
                                    ℹ️
                                </div>
                                <div className="flex-grow-1">
                                    <div className="fw-bold">Bantuan & Dukungan</div>
                                    <small className="text-muted">Hubungi customer service</small>
                                </div>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M9 18l6-6-6-6" />
                                </svg>
                            </a>
                        </div>
                    </div>

                    {/* Logout Button */}
                    {currentUser && (
                        <button
                            className="btn btn-outline-danger w-100 rounded-pill py-3 fw-bold"
                            style={{ fontSize: '15px' }}
                            onClick={handleLogout}
                        >
                            🚪 Keluar dari Akun
                        </button>
                    )}
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
                    className="glass-effect sticky-top"
                    style={{ zIndex: 1020, borderBottom: '1px solid rgba(0,0,0,0.05)' }}
                >
                    <div className="container py-3" style={{ maxWidth: '1200px' }}>
                        <div className="d-flex align-items-center justify-content-between">
                            <div className="d-flex align-items-center gap-3">
                                <img
                                    src="/images/logo_logika.png"
                                    alt="Logika Einstein"
                                    className="rounded-3 flex-shrink-0"
                                    style={{
                                        width: '48px',
                                        height: '48px',
                                        objectFit: 'cover',
                                        boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)',
                                    }}
                                />
                                <div style={{ minWidth: 0 }}>
                                    <h6 className="fw-bold mb-0" style={{ color: '#1a202c', fontSize: '16px' }}>
                                        Logika Einstein
                                    </h6>
                                    <small className="text-muted d-none d-sm-block" style={{ fontSize: '13px' }}>
                                        Matematika & Fisika
                                    </small>
                                </div>
                            </div>

                            <div className="d-flex align-items-center ms-auto gap-2">
                                {currentUser ? (
                                    <button
                                        onClick={() => setTab('Profil')}
                                        className="d-flex align-items-center gap-2 px-3 py-2 rounded-pill shadow-sm text-decoration-none border-0"
                                        style={{ background: 'linear-gradient(135deg, #155ea0 0%, #829dc5ff 100%)' }}
                                    >
                                        <span style={{ fontSize: '18px' }}>👤</span>
                                        <span className="small fw-bold text-white">{currentUser.name}</span>
                                    </button>
                                ) : (
                                    <button
                                        onClick={() => setShowAuthModal(true)}
                                        className="d-flex align-items-center gap-2 px-3 py-2 rounded-pill shadow-sm text-decoration-none border-0"
                                        style={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' }}
                                    >
                                        <span style={{ fontSize: '18px' }}>🔐</span>
                                        <span className="small fw-bold text-white">Login</span>
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </header>

                {/* Content */}
                <main className="flex-grow-1 overflow-auto" style={{ paddingBottom: '80px' }}>
                    <div className="py-3 py-md-4">
                        {renderContent()}
                    </div>
                </main>

                {/* Bottom Navigation */}
                <nav
                    className="navbar fixed-bottom glass-effect border-top"
                    style={{
                        boxShadow: '0 -4px 20px rgba(0,0,0,0.08)',
                        zIndex: 1010,
                        paddingTop: '10px',
                        paddingBottom: '10px',
                    }}
                >
                    <div className="container d-flex justify-content-around" style={{ maxWidth: '1200px' }}>
                        {[
                            { name: 'Home', icon: '🏠' },
                            { name: 'Riwayat', icon: '📚' },
                            { name: 'Profil', icon: '👤' },
                        ].map(({ name, icon }) => (
                            <button
                                key={name}
                                className={`nav-item btn d-flex flex-column align-items-center border-0 p-2 ${tab === name ? 'active' : ''}`}
                                onClick={() => setTab(name)}
                                style={{
                                    fontSize: '11px',
                                    color: tab === name ? '#155ea0' : '#9ca3af',
                                    transition: 'all 0.3s ease',
                                    minWidth: '70px',
                                    background: 'transparent',
                                    fontWeight: tab === name ? '700' : '600',
                                }}
                            >
                                <span style={{ fontSize: '24px', marginBottom: '2px' }}>{icon}</span>
                                <small style={{ fontSize: '11px' }}>{name}</small>
                            </button>
                        ))}
                    </div>
                </nav>
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
                                {authTab === 'login' ? '🔐 Masuk ke Akun' : '📝 Daftar Akun Baru'}
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
                                    Login
                                </button>
                                <button
                                    className={`btn rounded-pill px-4 py-2 flex-grow-1 ${authTab === 'register'
                                        ? 'btn-primary'
                                        : 'btn-outline-secondary'
                                        }`}
                                    onClick={() => handleTabSwitch('register')}
                                    disabled={isLoading}
                                >
                                    Register
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
                                            placeholder="nama@contoh.com"
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
                                            '🚀 Masuk'
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
                                            '✨ Daftar Sekarang'
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