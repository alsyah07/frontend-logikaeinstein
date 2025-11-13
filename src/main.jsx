import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap/dist/js/bootstrap.bundle.min.js'
import 'bootstrap-icons/font/bootstrap-icons.css'
import { registerSW } from 'virtual:pwa-register'
import Swal from 'sweetalert2'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)

// Registrasi service worker (auto update)
registerSW({ immediate: true })

function isStandalone() {
  return window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true
}

let deferredPrompt = null

window.addEventListener('appinstalled', () => {
  localStorage.setItem('pwa_installed', '1')
})

window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault()
  deferredPrompt = e

  const installed = isStandalone() || localStorage.getItem('pwa_installed') === '1'
  if (installed) return
  if (localStorage.getItem('pwa_prompt_shown') === '1') return

  Swal.fire({
    icon: 'info',
    title: 'Install Aplikasi?',
    text: 'Pasang aplikasi agar akses lebih cepat.',
    showCancelButton: true,
    confirmButtonText: 'Install',
    cancelButtonText: 'Nanti',
    confirmButtonColor: '#155ea0',
  }).then(async (result) => {
    localStorage.setItem('pwa_prompt_shown', '1')
    if (result.isConfirmed && deferredPrompt) {
      deferredPrompt.prompt()
      const choice = await deferredPrompt.userChoice
      deferredPrompt = null
      if (choice.outcome === 'accepted') {
        // appinstalled akan dipicu setelah instalasi selesai
      }
    }
  })
})

window.addEventListener('load', () => {
  const installed = isStandalone() || localStorage.getItem('pwa_installed') === '1'
  const isIos = /iphone|ipad|ipod/i.test(navigator.userAgent)
  if (!installed && isIos && localStorage.getItem('pwa_prompt_shown') !== '1') {
    Swal.fire({
      icon: 'info',
      title: 'Tambah ke Layar Utama',
      html: 'Buka menu bagikan, lalu pilih "Add to Home Screen".',
      confirmButtonColor: '#155ea0',
    }).then(() => {
      localStorage.setItem('pwa_prompt_shown', '1')
    })
  }
})
