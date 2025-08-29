import './App.css'
import WalletConnect from './components/WalletConnect'

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>ETH Wallet Balance Checker</h1>
      </header>
      <main>
        <WalletConnect />
      </main>
    </div>
  )
}

export default App
