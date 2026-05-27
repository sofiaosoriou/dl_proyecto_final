import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { CartProvider } from './context/CartContext'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import PrivateRoute from './components/PrivateRoute'

import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import Profile from './pages/Profile'
import Gallery from './pages/Gallery'
import PublicationDetail from './pages/PublicationDetail'
import Cart from './pages/Cart'
import Orders from './pages/Orders'
import MyPublications from './pages/MyPublications'
import CreatePublication from './pages/CreatePublication'
import EditPublication from './pages/EditPublication'

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <div className="app-layout">
            <Navbar />
            <main className="main-content">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/tienda" element={<Gallery />} />
                <Route path="/publicaciones/:id" element={<PublicationDetail />} />
                <Route path="/carrito" element={<Cart />} />

                <Route path="/perfil" element={<PrivateRoute><Profile /></PrivateRoute>} />
                <Route path="/pedidos" element={<PrivateRoute><Orders /></PrivateRoute>} />
                <Route path="/mis-publicaciones" element={<PrivateRoute><MyPublications /></PrivateRoute>} />
                <Route path="/publicaciones/nueva" element={<PrivateRoute><CreatePublication /></PrivateRoute>} />
                <Route path="/publicaciones/:id/editar" element={<PrivateRoute><EditPublication /></PrivateRoute>} />

                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>
            <Footer />
          </div>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
