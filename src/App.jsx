import { useState } from 'react'

function App() {
  const [expenses, setExpenses] = useState([])
  const [description, setDescription] = useState('')
  const [amount, setAmount] = useState('')

  const addExpense = () => {
    if (description && amount) {
      setExpenses([...expenses, { id: Date.now(), description, amount: parseFloat(amount) }])
      setDescription('')
      setAmount('')
    }
  }

  const deleteExpense = (id) => {
    setExpenses(expenses.filter(exp => exp.id !== id))
  }

  const total = expenses.reduce((sum, exp) => sum + exp.amount, 0)

  return (
    <div className="app">
      <header>
        <h1>Viajjo - Travel Expense Tracker</h1>
        <p>Track your travel expenses with ease</p>
      </header>
      
      <main>
        <div className="input-section">
          <div className="input-group">
            <input
              type="text"
              placeholder="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
            <input
              type="number"
              placeholder="Amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
            <button onClick={addExpense}>Add Expense</button>
          </div>
        </div>

        <div className="expenses-section">
          <div className="total-box">
            <h2>Total Spent</h2>
            <p className="total">${total.toFixed(2)}</p>
          </div>

          <div className="expenses-list">
            <h3>Expenses</h3>
            {expenses.length === 0 ? (
              <p className="empty">No expenses yet. Start adding your travel costs!</p>
            ) : (
              <ul>
                {expenses.map((exp) => (
                  <li key={exp.id}>
                    <span>{exp.description}</span>
                    <span>${exp.amount.toFixed(2)}</span>
                    <button onClick={() => deleteExpense(exp.id)}>Delete</button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}

export default App
