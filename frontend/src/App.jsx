import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import PersonaForm from './components/PersonaForm'
import EmpresaForm from './components/EmpresaForm'

function App() {
  const [msg, setMsg] = useState("Bolsa de Talentos - Frontend ✅")

  return (
    <div className="container">
      <div className="header">
        <h1>{msg}</h1>
        <p>Sistema Multiparadigma - Agregar Personas</p>
      </div>
      
      <PersonaForm />
      <EmpresaForm />
      
      <div className="logos">
        <a href="https://vitejs.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
    </div>
  )
}

export default App