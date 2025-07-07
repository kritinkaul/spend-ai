import { Routes, Route } from 'react-router-dom'
import { ThemeProvider } from './contexts/ThemeContext'
import Layout from './components/layout/Layout'
import Dashboard from './pages/Dashboard'
import Upload from './pages/Upload'
import Analysis from './pages/Analysis'
import Stocks from './pages/Stocks'
import StockVisualizer from './pages/StockVisualizer'
import CurrencyConverter from './pages/CurrencyConverter'

function App() {
  return (
    <ThemeProvider>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/upload" element={<Upload />} />
          <Route path="/analysis" element={<Analysis />} />
          <Route path="/stocks" element={<Stocks />} />
          <Route path="/visualizer" element={<StockVisualizer />} />
          <Route path="/converter" element={<CurrencyConverter />} />
          <Route path="*" element={<Dashboard />} />
        </Routes>
      </Layout>
    </ThemeProvider>
  )
}

export default App 