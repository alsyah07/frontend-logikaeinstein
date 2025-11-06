import Index from './Index.jsx'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import DetailMapel from './DetailMapel.jsx'
import Video from './Video.jsx'
import Pembahasan from './Pembahasan.jsx'
import RedeemList from './RedeemList'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/detail-mapel/:id" element={<DetailMapel />} />
        <Route path="/video" element={<Video />} />
         <Route path="/video/:id/:judul" element={<Video />} />
        <Route path="/pembahasan" element={<Pembahasan />} />
        <Route path="/pembahasan/:id" element={<Pembahasan />} />
        <Route path="/code_redeem_logika" element={<RedeemList />} />
      </Routes>
    </Router>
  )
}

export default App
