import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import {
  FaPlay,
  FaPause,
  FaVolumeUp,
  FaExpand,
  FaCheck,
  FaClock,
  FaUser,
  FaArrowLeft,
  FaArrowRight,
  FaLock,
  FaCheckCircle,
  FaTimes,
  FaWhatsapp
} from "react-icons/fa";
import "./CourseLearning.css";

const CourseLearning = () => {
  const { courseId } = useParams();
  const [courseData, setCourseData] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [currentLesson, setCurrentLesson] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);
  const [error, setError] = useState(null);
  const [showWhatsAppModal, setShowWhatsAppModal] = useState(false);

  useEffect(() => {
    if (courseId) {
      fetchCourseData();
    }
  }, [courseId]);

  const fetchCourseData = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/detail_video_mapel/sub_mapel/${courseId}`
      );

      if (!response.ok) {
        throw new Error("Gagal memuat data kursus");
      }

      const data = await response.json();

      if (!data || data.length === 0) {
        throw new Error("Tidak ada data materi untuk kursus ini");
      }

      const transformedLessons = data.map((item, index) => {
        return {
          id: item.id_detail_video_mapel,
          title: item.tittle || item.sub_mapel || `Video ${index + 1}`,
          duration: item.durasi || "0 menit",
          isCompleted: false,
          isLocked: index >= 3,
          description:
            item.summary ||
            (item.deskripsi ? item.deskripsi.substring(0, 80) + "..." : ""),
          fullDescription: item.deskripsi || "",
          videoUrl: item.video_mapel,
          thumbnail: item.banner_video || null
        };
      });

      const firstItem = data[0];
      const courseInfo = {
        title: firstItem.sub_mapel || "Kursus",
        subtitle: firstItem.mapel || "",
        instructor: firstItem.mapel || "Instructor",
        description: firstItem.deskripsi || "",
        level: firstItem.level || "",
        rating: firstItem.rating || "0",
        progress: 40
      };

      setCourseData(courseInfo);
      setLessons(transformedLessons);
      if (transformedLessons.length > 0) {
        setCurrentLesson(transformedLessons[0]);
      }
      setIsLoading(false);
    } catch (err) {
      setError(err.message);
      setIsLoading(false);
    }
  };

  const handleLessonSelect = (lesson) => {
    if (lesson.isLocked) {
      setShowWhatsAppModal(true);
    } else {
      setCurrentLesson(lesson);
      setIsPlaying(false);
    }
  };

  const handleCompleteAndNext = () => {
    const currentIndex = lessons.findIndex((l) => l.id === currentLesson.id);
    if (currentIndex < lessons.length - 1) {
      const nextLesson = lessons[currentIndex + 1];
      if (nextLesson.isLocked) {
        setShowWhatsAppModal(true);
      } else {
        setCurrentLesson(nextLesson);
        setIsPlaying(false);
      }
    }
  };

  const handleWhatsAppClick = () => {
    const phoneNumber = "6283811104348";
    const courseName = courseData?.title || "kursus ini";
    const message = encodeURIComponent(
      `Halo, saya tertarik untuk mendapatkan akses premium ke ${courseName}. Mohon informasi lebih lanjut mengenai program pembelajaran dan biaya yang diperlukan.`
    );
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${message}`;
    window.open(whatsappUrl, "_blank");
    setShowWhatsAppModal(false);
  };

  const completedCount = lessons.filter((l) => l.isCompleted).length;

  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="loading-content">
          <div className="spinner"></div>
          <p className="loading-text">Memuat kursus...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="loading-container">
        <div className="loading-content">
          <p style={{ color: "#ef4444", fontSize: "18px", fontWeight: "600" }}>
            Terjadi Kesalahan
          </p>
          <p style={{ color: "#6b7280", fontSize: "14px", marginTop: "8px" }}>
            {error}
          </p>
        </div>
      </div>
    );
  }

  if (!courseData || lessons.length === 0) return null;

  return (
    <div className="course-learning">
      {/* WhatsApp Modal */}
      {/* WhatsApp Modal */}
      {showWhatsAppModal && (
        <div
          className="modal-overlay"
          onClick={() => setShowWhatsAppModal(false)}
        >
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button
              className="modal-close"
              onClick={() => setShowWhatsAppModal(false)}
            >
              <FaTimes size={20} />
            </button>

            <div className="modal-icon">
              <FaLock size={48} color="#3b82f6" />
            </div>

            <h2 className="modal-title">Akses Premium Diperlukan</h2>
            <p className="modal-description">
              Konten ini merupakan bagian dari program pembelajaran premium
              kami. Untuk mendapatkan akses penuh ke seluruh materi
              pembelajaran, silakan hubungi tim kami.
            </p>

            <div className="modal-benefits">
              <div className="benefit-item">
                <FaCheckCircle color="#10b981" size={20} />
                <span>Akses ke semua video pembelajaran</span>
              </div>
              <div className="benefit-item">
                <FaCheckCircle color="#10b981" size={20} />
                <span>Materi pembelajaran terstruktur</span>
              </div>
              <div className="benefit-item">
                <FaCheckCircle color="#10b981" size={20} />
                <span>Dukungan instruktur profesional</span>
              </div>
            </div>

            <button className="whatsapp-button" onClick={handleWhatsAppClick}>
              <FaWhatsapp size={22} />
              <span>Konsultasi via WhatsApp</span>
            </button>

            <button
              className="modal-cancel"
              onClick={() => setShowWhatsAppModal(false)}
            >
              Kembali ke Pembelajaran
            </button>
          </div>
        </div>
      )}

      <div className="main-layout">
        {/* Sidebar */}
        <aside
          className={`sidebar ${
            showSidebar ? "sidebar-open" : "sidebar-closed"
          }`}
        >
          <div className="sidebar-content">
            {/* Course Info */}
            <div className="course-info">
              <div className="instructor-card">
                <div className="instructor-avatar">
                  <FaUser size={20} />
                </div>
                <div>
                  <h3 className="instructor-name">{courseData.instructor}</h3>
                  <p className="instructor-label">Mata Pelajaran</p>
                </div>
              </div>
            </div>

            {/* Lessons List */}
            <div className="lessons-section">
              <h2 className="lessons-title">
                DAFTAR MATERI ({lessons.length})
              </h2>
              <div className="lessons-list">
                {lessons.map((lesson, index) => (
                  <div
                    key={lesson.id}
                    className={`lesson-card ${
                      currentLesson && lesson.id === currentLesson.id
                        ? "lesson-card-active"
                        : ""
                    } ${lesson.isLocked ? "lesson-card-locked" : ""}`}
                    onClick={() => handleLessonSelect(lesson)}
                  >
                    <div className="lesson-content">
                      {/* Video Thumbnail */}
                      <div className="lesson-thumbnail">
                        {lesson.videoUrl ? (
                          <>
                            <iframe
                              src={lesson.videoUrl}
                              style={{
                                width: "100%",
                                height: "100%",
                                border: "none",
                                pointerEvents: "none"
                              }}
                              title={lesson.title}
                            />
                            {/* Duration Badge */}
                            <div className="duration-badge">
                              <FaClock size={10} />
                              {lesson.duration}
                            </div>
                          </>
                        ) : (
                          <div className="thumbnail-placeholder">
                            {index + 1}
                          </div>
                        )}

                        {/* Status Badge */}
                        {lesson.isLocked && (
                          <div className="status-badge status-locked">
                            <FaLock size={16} />
                          </div>
                        )}

                        {/* Play Overlay on Current */}
                        {currentLesson &&
                          lesson.id === currentLesson.id &&
                          !lesson.isLocked && (
                            <div className="play-overlay">
                              <div className="play-overlay-button">
                                <FaPlay
                                  size={12}
                                  color="white"
                                  style={{ marginLeft: "2px" }}
                                />
                              </div>
                            </div>
                          )}
                      </div>

                      {/* Lesson Info */}
                      <div className="lesson-info">
                        <h4
                          className={`lesson-title ${
                            lesson.isLocked ? "lesson-title-locked" : ""
                          }`}
                        >
                          {lesson.title}
                        </h4>

                        <p
                          className={`lesson-description ${
                            lesson.isLocked ? "lesson-description-locked" : ""
                          }`}
                        >
                          {lesson.description}
                        </p>

                        {/* Status Label */}
                        <div className="lesson-status-labels">
                          {lesson.isLocked && (
                            <span className="status-label status-label-locked">
                              <FaLock size={10} />
                              Terkunci
                            </span>
                          )}
                          {currentLesson &&
                            lesson.id === currentLesson.id &&
                            !lesson.isLocked && (
                              <span className="status-label status-label-playing">
                                Sedang diputar
                              </span>
                            )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="main-content">
          <div className="content-wrapper">
            {/* Video Player */}
            <div className="video-section">
              <div className="video-player">
                <div className="video-content">
                  <iframe
                    src={currentLesson?.videoUrl}
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      width: "100%",
                      height: "100%",
                      border: "none"
                    }}
                    allow="autoplay; fullscreen"
                    allowFullScreen
                  ></iframe>
                </div>
              </div>
            </div>

            {/* Lesson Header */}
            <div className="lesson-header">
              <div className="lesson-meta-info">
                <span>Video Lesson</span>
                <span>•</span>
                <span>{currentLesson?.duration}</span>
              </div>
              <h1 className="main-title">{currentLesson?.title}</h1>
              <p className="main-description">
                {lessons.find((l) => l.id === currentLesson?.id)
                  ?.fullDescription ||
                  courseData?.description ||
                  currentLesson?.description}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="action-buttons">
              <button className="prev-button">
                <FaArrowLeft size={14} />
                <span>Materi Sebelumnya</span>
              </button>

              <button onClick={handleCompleteAndNext} className="next-button">
                <FaCheckCircle size={16} />
                <span>Selesai & Lanjutkan</span>
                <FaArrowRight size={14} />
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default CourseLearning;
