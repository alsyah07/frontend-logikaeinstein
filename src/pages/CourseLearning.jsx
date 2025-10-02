import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  FaPlay, 
  FaPause,
  FaVolumeUp,
  FaExpand,
  FaList,
  FaCheck, 
  FaClock,
  FaUser
} from 'react-icons/fa';
import { Link } from 'react-router-dom';

const CourseLearning = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [currentLesson, setCurrentLesson] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [completedLessons, setCompletedLessons] = useState(new Set());
  const [bookmarkedLessons, setBookmarkedLessons] = useState(new Set());

  // Mock data - replace with actual API call
  const course = {
    id: parseInt(courseId),
    title: "Logika Einstein - Pola Matematika",
    description: "Pelajari cara menyelesaikan soal-soal pola matematika dengan logika Einstein",
    instructor: "Dr. Albert Einstein",
    duration: "2 jam 30 menit",
    totalLessons: 8,
    lessons: [
      {
        id: 1,
        title: "Pengenalan Pola Matematika",
        duration: "15 menit",
        videoUrl: "/videos/lesson1.mp4",
        isCompleted: true,
        isLocked: false,
        description: "Memahami dasar-dasar pola dalam matematika"
      },
      {
        id: 2,
        title: "Pola Bilangan Sederhana",
        duration: "20 menit", 
        videoUrl: "/videos/lesson2.mp4",
        isCompleted: true,
        isLocked: false,
        description: "Mengenal pola bilangan aritmatika dan geometri"
      },
      {
        id: 3,
        title: "Pola Lingkaran dan Bentuk",
        duration: "25 menit",
        videoUrl: "/videos/lesson3.mp4", 
        isCompleted: false,
        isLocked: false,
        description: "Menganalisis pola dalam bentuk geometri"
      },
      {
        id: 4,
        title: "Pola Kompleks",
        duration: "30 menit",
        videoUrl: "/videos/lesson4.mp4",
        isCompleted: false,
        isLocked: true,
        description: "Menyelesaikan pola matematika tingkat lanjut"
      },
      {
        id: 5,
        title: "Aplikasi Pola dalam Kehidupan",
        duration: "20 menit",
        videoUrl: "/videos/lesson5.mp4",
        isCompleted: false,
        isLocked: true,
        description: "Penerapan pola matematika dalam situasi nyata"
      }
    ]
  };

  useEffect(() => {
    // Simulate loading
    setTimeout(() => {
      setCurrentLesson(course.lessons[2]); // Start with lesson 3
      setIsLoading(false);
    }, 1000);
  }, [courseId]);

  const handleLessonSelect = (lesson) => {
    if (!lesson.isLocked) {
      setCurrentLesson(lesson);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-indigo-500 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Memuat kursus...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link 
                to="/courses" 
                className="flex items-center text-gray-600 hover:text-blue-600 transition-colors"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                <span className="text-sm">Curriculum</span>
              </Link>
              <div className="text-gray-400">|</div>
              <h1 className="text-lg font-semibold text-gray-900">Matematika UTBK</h1>
            </div>
            <div className="flex items-center space-x-4">
              <button className="p-2 text-gray-400 hover:text-gray-600">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a8.949 8.949 0 008.354-5.646z" />
                </svg>
              </button>
              <button className="p-2 text-gray-400 hover:text-gray-600">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </button>
              <span className="text-sm text-gray-600">Discussions</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto flex">
        {/* Left Sidebar */}
        <div className="w-80 bg-white border-r border-gray-200 min-h-screen">
          <div className="p-4">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Matematika UTBK</h2>
            <div className="space-y-2">
              {course.lessons.map((lesson, index) => (
                <div 
                  key={lesson.id}
                  className={`group cursor-pointer ${
                    currentLesson && lesson.id === currentLesson.id 
                      ? 'bg-blue-50 border-l-4 border-blue-500' 
                      : 'hover:bg-gray-50'
                  }`}
                  onClick={() => handleLessonSelect(lesson)}
                >
                  <div className="flex items-center justify-between p-3">
                    <div className="flex items-center space-x-3">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                        lesson.isCompleted 
                          ? 'bg-green-500 text-white' 
                          : currentLesson && lesson.id === currentLesson.id
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-200 text-gray-600'
                      }`}>
                        {lesson.isCompleted ? <FaCheck className="w-3 h-3" /> : index + 1}
                      </div>
                      <div className="flex-1">
                        <h4 className="text-sm font-medium text-gray-900 truncate">
                          {lesson.title}
                        </h4>
                        <div className="flex items-center space-x-2 text-xs text-gray-500">
                          <FaClock className="w-3 h-3" />
                          <span>{lesson.duration}</span>
                        </div>
                      </div>
                    </div>
                    <button className="opacity-0 group-hover:opacity-100 transition-opacity bg-blue-500 text-white px-3 py-1 rounded text-xs font-medium">
                      PREVIEW
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 bg-white">
          <div className="p-6">
            {/* Video Section */}
            <div className="mb-6">
              <div className="text-sm text-gray-500 mb-2">Video lesson</div>
              <h1 className="text-2xl font-bold text-gray-900 mb-4">
                {currentLesson ? currentLesson.title : 'Matematika UTBK (bagian 1)'}
              </h1>
              
              {/* Video Player */}
              <div className="relative bg-gray-900 rounded-lg overflow-hidden mb-6">
                <div className="aspect-video">
                  <video 
                    controls={true}
                    poster="/assets/images/portfolio-03.jpg"
                    className="w-full h-full object-cover"
                  >
                    <source src="/path/to/video.mp4" type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
                </div>
              </div>
            </div>

            {/* Complete & Next Button */}
            <div className="flex justify-end">
              <button className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2">
                <span>Complete & Next</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseLearning;