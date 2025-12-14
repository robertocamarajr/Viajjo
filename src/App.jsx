import { useState, useEffect } from 'react'
import { Pie, Bar, Line } from 'react-chartjs-2'
import { Chart as ChartJS, ArcElement, CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend } from 'chart.js'
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'

ChartJS.register(ArcElement, CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend)

// Simples criptografia base64
const encryptData = (data) => btoa(JSON.stringify(data))
const decryptData = (data) => JSON.parse(atob(data))

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [currentUser, setCurrentUser] = useState(null)
  const [loginEmail, setLoginEmail] = useState('')
  const [loginPassword, setLoginPassword] = useState('')
  const [showSignup, setShowSignup] = useState(false)
  const [currentScreen, setCurrentScreen] = useState('dashboard')
  const [trips, setTrips] = useState([])
  const [expenses, setExpenses] = useState([])
  const [companies, setCompanies] = useState([])
  const [userProfile, setUserProfile] = useState({
    name: '',
    homeCity: '',
    personalLogo: '',
    companyLogos: {}
  })

  // Carregar dados do usuário
  useEffect(() => {
    const savedUser = localStorage.getItem('viajjoUser')
    if (savedUser) {
      const user = decryptData(savedUser)
      setCurrentUser(user)
      setIsLoggedIn(true)
      loadUserData(user.email)
    }
  }, [])

  const loadUserData = (email) => {
    const userData = localStorage.getItem(`viajjo_${email}`)
    if (userData) {
      const data = decryptData(userData)
      setTrips(data.trips || [])
      setExpenses(data.expenses || [])
      setCompanies(data.companies || [])
      setUserProfile(data.profile || {})
    }
  }

  const saveUserData = () => {
    if (currentUser) {
      const userData = {
        trips,
        expenses,
        companies,
        profile: userProfile
      }
      localStorage.setItem(`viajjo_${currentUser.email}`, encryptData(userData))
    }
  }

  useEffect(() => {
    saveUserData()
  }, [trips, expenses, companies, userProfile])

  const handleLogin = (e) => {
    e.preventDefault()
    if (loginEmail && loginPassword.length >= 6) {
      const user = { email: loginEmail, name: loginEmail.split('@')[0] }
      localStorage.setItem('viajjoUser', encryptData(user))
      setCurrentUser(user)
      setIsLoggedIn(true)
      loadUserData(loginEmail)
      setLoginEmail('')
      setLoginPassword('')
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('viajjoUser')
    setIsLoggedIn(false)
    setCurrentUser(null)
    setCurrentScreen('dashboard')
  }

  const addTrip = (tripData) => {
    const newTrip = { id: Date.now(), ...tripData }
    setTrips([...trips, newTrip])
  }

  const addExpense = (expenseData) => {
    const newExpense = { id: Date.now(), ...expenseData }
    setExpenses([...expenses, newExpense])
  }

  const calculateDistance = (city1, city2) => {
    const distances = {
      'São Paulo': { 'Rio de Janeiro': 429, 'Belo Horizonte': 586, 'Salvador': 1657 },
      'Rio de Janeiro': { 'São Paulo': 429, 'Belo Horizonte': 450, 'Salvador': 1228 },
      'Belo Horizonte': { 'São Paulo': 586, 'Rio de Janeiro': 450, 'Salvador': 1287 },
      'Salvador': { 'São Paulo': 1657, 'Rio de Janeiro': 1228, 'Belo Horizonte': 1287 }
    }
    return distances[city1]?.[city2] || Math.random() * 1000
  }

  const getTotalExpenses = () => expenses.reduce((sum, exp) => sum + exp.amount, 0)
  const getExpensesByCategory = () => {
    const categories = {}
    expenses.forEach(exp => {
      categories[exp.category] = (categories[exp.category] || 0) + exp.amount
    })
    return categories
  }

  const getPieChartData = () => {
    const byCategory = getExpensesByCategory()
    return {
      labels: Object.keys(byCategory),
      datasets: [{
        data: Object.values(byCategory),
        backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0']
      }]
    }
  }

  if (!isLoggedIn) {
    return (
      <div className="login-container">
        <div className="login-box">
          <h1>Viajjo Professional</h1>
          <p>Gestor de Despesas para Representantes Comerciais</p>
          <form onSubmit={handleLogin}>
            <input type="email" placeholder="Email" value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} required />
            <input type="password" placeholder="Senha" value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} required />
            <button type="submit">Entrar</button>
          </form>
          <p className="toggle-signup">Primeira vez? Crie uma conta com o email acima!</p>
        </div>
      </div>
    )
  }

  return (
    <div className="app-container">
      <nav className="navbar">
        <div className="nav-left">
          <h2>Viajjo</h2>
        </div>
        <div className="nav-menu">
          <button onClick={() => setCurrentScreen('dashboard')}>Dashboard</button>
          <button onClick={() => setCurrentScreen('trips')}>Viagens</button>
          <button onClick={() => setCurrentScreen('expenses')}>Despesas</button>
          <button onClick={() => setCurrentScreen('reports')}>Relatórios</button>
          <button onClick={() => setCurrentScreen('profile')}>Perfil</button>
          <button onClick={handleLogout} className="logout-btn">Sair</button>
        </div>
      </nav>

      <div className="main-content">
        {currentScreen === 'dashboard' && (
          <div className="dashboard">
            <h2>Bem-vindo, {currentUser?.name}!</h2>
            <div className="stats-grid">
              <div className="stat-card">
                <h3>Total Gasto</h3>
                <p className="stat-value">R$ {getTotalExpenses().toFixed(2)}</p>
              </div>
              <div className="stat-card">
                <h3>Viagens</h3>
                <p className="stat-value">{trips.length}</p>
              </div>
              <div className="stat-card">
                <h3>Despesas</h3>
                <p className="stat-value">{expenses.length}</p>
              </div>
            </div>
            <div className="chart-container">
              {Object.keys(getExpensesByCategory()).length > 0 && (
                <Pie data={getPieChartData()} />
              )}
            </div>
          </div>
        )}

        {currentScreen === 'trips' && (
          <div className="trips-screen">
            <h2>Minhas Viagens</h2>
            <form onSubmit={(e) => {
              e.preventDefault()
              const formData = new FormData(e.target)
              addTrip({
                company: formData.get('company'),
                startDate: formData.get('startDate'),
                endDate: formData.get('endDate'),
                destination: formData.get('destination')
              })
              e.target.reset()
            }}>
              <input type="text" name="company" placeholder="Empresa" required />
              <input type="date" name="startDate" required />
              <input type="date" name="endDate" required />
              <input type="text" name="destination" placeholder="Destino" required />
              <button type="submit">Adicionar Viagem</button>
            </form>
            <div className="trips-list">
              {trips.map(trip => (
                <div key={trip.id} className="trip-card">
                  <h3>{trip.company}</h3>
                  <p>Destino: {trip.destination}</p>
                  <p>De {trip.startDate} até {trip.endDate}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {currentScreen === 'expenses' && (
          <div className="expenses-screen">
            <h2>Minhas Despesas</h2>
            <form onSubmit={(e) => {
              e.preventDefault()
              const formData = new FormData(e.target)
              addExpense({
                description: formData.get('description'),
                amount: parseFloat(formData.get('amount')),
                category: formData.get('category'),
                date: formData.get('date')
              })
              e.target.reset()
            }}>
              <input type="text" name="description" placeholder="Descrição" required />
              <input type="number" name="amount" placeholder="Valor" step="0.01" required />
              <select name="category" required>
                <option>Hospedagem</option>
                <option>Alimentação</option>
                <option>Transporte</option>
                <option>Outras</option>
              </select>
              <input type="date" name="date" required />
              <button type="submit">Adicionar Despesa</button>
            </form>
            <div className="expenses-list">
              {expenses.map(exp => (
                <div key={exp.id} className="expense-item">
                  <span>{exp.description}</span>
                  <span>{exp.category}</span>
                  <span className="amount">R$ {exp.amount.toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {currentScreen === 'reports' && (
          <div className="reports-screen">
            <h2>Relatórios</h2>
            <div className="report-summary">
              <h3>Resumo do Ano</h3>
              <p>Total Gasto: <strong>R$ {getTotalExpenses().toFixed(2)}</strong></p>
              <p>Total de Viagens: <strong>{trips.length}</strong></p>
              <p>Total de Despesas: <strong>{expenses.length}</strong></p>
            </div>
            <button onClick={() => {
              const doc = new jsPDF()
              doc.text('Relatório Anual - Viajjo', 10, 10)
              doc.text(`Total Gasto: R$ ${getTotalExpenses().toFixed(2)}`, 10, 30)
              doc.text(`Viagens: ${trips.length}`, 10, 40)
              doc.save('relatorio_viajjo.pdf')
            }} className="export-btn">Exportar PDF</button>
          </div>
        )}

        {currentScreen === 'profile' && (
          <div className="profile-screen">
            <h2>Meu Perfil</h2>
            <form onSubmit={(e) => {
              e.preventDefault()
              const formData = new FormData(e.target)
              setUserProfile({
                name: formData.get('name'),
                homeCity: formData.get('homeCity'),
                personalLogo: userProfile.personalLogo,
                companyLogos: userProfile.companyLogos
              })
            }}>
              <input type="text" placeholder="Nome Completo" defaultValue={userProfile.name} name="name" />
              <input type="text" placeholder="Cidade de Origem" defaultValue={userProfile.homeCity} name="homeCity" />
              <button type="submit">Salvar Perfil</button>
            </form>
          </div>
        )}
      </div>
    </div>
  )
}

export default App
