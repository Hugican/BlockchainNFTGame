import React, { useState } from 'react';
import { ethers } from 'ethers';
import CartasABI from './Cartas.json'; // El archivo que acabas de copiar

// IMPORTANTE: Pega aquí la dirección que te salió al desplegar el contrato
const CONTRACT_ADDRESS = "0xCa80fE6853d70919603F221c3c4A7E398f735043"; 

function App() {
  const [cuenta, setCuenta] = useState("");
  const [cargando, setCargando] = useState(false);

  // 1. Conectar MetaMask (lo que ya tenías)
  const conectarWallet = async () => {
  if (window.ethereum) {
    try {
      // 1. Pedir las cuentas
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      
      // 2. Verificar la red (Sepolia es 11155111 en decimal o 0xaa36a7 en hex)
      const chainId = await window.ethereum.request({ method: 'eth_chainId' });
      
      if (chainId !== '0xaa36a7') {
        alert("¡Cuidado! No estás en la red Sepolia. Cambiando de red...");
        await cambiarARedSepolia(); // La función que te pasé antes
      }
      
      setCuenta(accounts[0]);
    } catch (error) {
      console.error("Error al conectar:", error);
    }
  } else {
    alert("Por favor, instala MetaMask");
  }
};

  // Función mágica: Llama al contrato para ganar una carta
  const reclamarCarta = async () => {
  try {
    if (!window.ethereum) return;
    
    // En v6, Web3Provider cambia a BrowserProvider
    const provider = new ethers.BrowserProvider(window.ethereum);
    
    // Obtenemos el "signer" (quien firma la transacción)
    const signer = await provider.getSigner();
    
    // Creamos la instancia del contrato
    const contrato = new ethers.Contract(CONTRACT_ADDRESS, CartasABI.abi, signer);

    console.log("Llamando al contrato...");
    
    // Ejecutamos la función ganarCarta
    const tx = await contrato.ganarCarta(cuenta);
    
    alert("Transacción enviada. Esperando confirmación...");
    
    // En v6, esperamos el recibo de la transacción así:
    await tx.wait(); 
    
    alert("¡Felicidades! Carta registrada en la blockchain.");
  } catch (error) {
    console.error("Error al reclamar carta:", error);
    // Si el error dice "resolver name", revisa que CONTRACT_ADDRESS sea correcto
    alert("Hubo un error. Revisa la consola del navegador.");
  }
};

const cambiarARedSepolia = async () => {
  const chainIdSepolia = '0xaa36a7'; // ID de Sepolia en hexadecimal
  try {
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: chainIdSepolia }],
    });
  } catch (error) {
    // Si la red no está agregada en el MetaMask del usuario, la añadimos
    if (error.code === 4902) {
      await window.ethereum.request({
        method: 'wallet_addEthereumChain',
        params: [{
          chainId: chainIdSepolia,
          chainName: 'Sepolia Test Network',
          nativeCurrency: { name: 'SepoliaETH', symbol: 'ETH', decimals: 18 },
          rpcUrls: ['https://sepolia.infura.io/v3/'], // O tu URL de Alchemy
          blockExplorerUrls: ['https://sepolia.etherscan.io'],
        }],
      });
    }
  }
};

  return (
    <div style={{ textAlign: 'center', marginTop: '50px', fontFamily: 'Arial' }}>
      <h1>CardChain TFG 🃏</h1>
      
      {!cuenta ? (
        <button onClick={conectarWallet} style={estiloBoton}>
          Conectar MetaMask
        </button>
      ) : (
        <div>
          <p>Bienvenido: <b>{cuenta.substring(0,6)}...{cuenta.substring(38)}</b></p>
          
          <div style={{ marginTop: '30px' }}>
            <button onClick={reclamarCarta} style={estiloBotonEspecial}>
              🚀 ¡Abrir sobre de cartas!
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// Unos estilos rápidos para que no quede feo
const estiloBoton = {
  padding: '10px 20px',
  fontSize: '16px',
  cursor: 'pointer',
  borderRadius: '8px',
  backgroundColor: '#f3f3f3'
};

const estiloBotonEspecial = {
  padding: '15px 30px',
  fontSize: '20px',
  cursor: 'pointer',
  borderRadius: '12px',
  backgroundColor: '#4CAF50',
  color: 'white',
  border: 'none'
};

export default App;