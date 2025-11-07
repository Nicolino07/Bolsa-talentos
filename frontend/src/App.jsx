import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

function App() {
  const [msg, setMsg] = useState("Frontend Bolsa de tanlentos funcionando ✅");

  return (
    <div className="container">
      <h1>{msg}</h1>
    </div>
  );
}

export default App
