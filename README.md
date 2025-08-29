# ETH Wallet Balance Checker

A React TypeScript application that connects to a user's Ethereum wallet and displays their ETH balance using web3.js.

## Features

- 🔗 Connect to MetaMask wallet
- 💰 Display real-time ETH balance
- 🔄 Auto-refresh balance every 30 seconds
- 📱 Responsive design
- 🎨 Modern UI with gradient backgrounds
- ⚡ Built with Vite for fast development

## Prerequisites

- Node.js (version 20.19+ or 22.12+)
- MetaMask browser extension installed
- An Ethereum wallet with some ETH (for testing)

## Installation

1. Clone or navigate to the project directory:
```bash
cd eth-wallet
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:5173`

## Usage

1. **Install MetaMask**: Make sure you have the MetaMask browser extension installed
2. **Connect Wallet**: Click the "Connect Wallet" button
3. **Authorize**: Approve the connection request in MetaMask
4. **View Balance**: Your ETH balance will be displayed automatically
5. **Refresh**: Use the "Refresh Balance" button to manually update the balance
6. **Disconnect**: Click "Disconnect" to disconnect your wallet

## Features Explained

### Wallet Connection
- Automatically detects if MetaMask is installed
- Requests permission to connect to the user's wallet
- Handles connection errors gracefully

### Balance Display
- Shows the connected wallet address (truncated for privacy)
- Displays ETH balance in a readable format
- Auto-updates every 30 seconds
- Manual refresh option available

### Event Handling
- Listens for account changes (switching accounts in MetaMask)
- Handles network changes (switching between Ethereum networks)
- Automatically reconnects when accounts change

## Technical Details

### Dependencies
- **React 19**: Latest React with hooks
- **TypeScript**: Type-safe development
- **Web3.js**: Ethereum blockchain interaction
- **Vite**: Fast build tool and dev server

### Architecture
- **WalletConnect Component**: Main component handling wallet logic
- **TypeScript Interfaces**: Type-safe state management
- **CSS Modules**: Scoped styling
- **Responsive Design**: Works on desktop and mobile

### Security Features
- No private keys stored locally
- Uses MetaMask's secure connection
- Address truncation for privacy
- Error handling for failed connections

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### Project Structure

```
src/
├── components/
│   └── WalletConnect.tsx    # Main wallet component
├── types/
│   └── ethereum.d.ts        # TypeScript declarations
├── App.tsx                  # Main app component
├── App.css                  # Application styles
└── main.tsx                 # Entry point
```

## Troubleshooting

### Common Issues

1. **"Please install MetaMask" error**
   - Install the MetaMask browser extension
   - Make sure it's enabled for your browser

2. **Connection fails**
   - Check if MetaMask is unlocked
   - Ensure you're on the correct network (Ethereum Mainnet)
   - Try refreshing the page

3. **Balance not updating**
   - Check your internet connection
   - Try clicking "Refresh Balance"
   - Ensure you have some ETH in your wallet

4. **Node.js version error**
   - Update Node.js to version 20.19+ or 22.12+
   - Use a Node version manager like `nvm`

### Browser Compatibility

- Chrome (recommended)
- Firefox
- Edge
- Safari (with MetaMask extension)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is open source and available under the MIT License.
