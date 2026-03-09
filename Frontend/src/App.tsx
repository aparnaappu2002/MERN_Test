import './App.css'
import { BrowserRouter as Router,Routes,Route } from 'react-router-dom'
import Login from './components/Login'
import Signup from './components/Signup'
import Dashboard from './components/Dashboard'
import KYC from './components/KycPage'
import ProtectedKYC from './ProtectRoute/ProtectedKyc'
import ProtectedRoute from './ProtectRoute/ProtectedRoute'

function App() {

  return (
    <>
      <Router>
        <Routes>
          <Route path='/' element={<Login/>} />
          <Route path='/signup' element={<Signup/>} />
          <Route path='/kyc' element={<ProtectedKYC><KYC/></ProtectedKYC>} />
          <Route path='/dashboard' element={<ProtectedRoute><Dashboard/></ProtectedRoute>} />
        </Routes>
      </Router>
    </>
  )
}

export default App
