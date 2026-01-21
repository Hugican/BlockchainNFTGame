import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import CartasABI from './Cartas.json';

const CONTRACT_ADDRESS = "0x5C37aD68657589990000a0d2Da03AEC15756c87E";

function App() {
  const [cuenta, setCuenta] = useState("");
  const [cartas, setCartas] = useState([]); // Aquí guardaremos la lista para el .map
  const [cargando, setCargando] = useState(false);

  useEffect(() => {
    if (window.ethereum) {
      // Escucha si el usuario cambia de cuenta en MetaMask
      window.ethereum.on('accountsChanged', (accounts) => {
        if (accounts.length > 0) {
          setCuenta(accounts[0]);
          cargarCartas(accounts[0]);
        } else {
          setCuenta("");
          setCartas([]);
        }
      });
    }
  }, []);

  // Función para obtener las cartas del contrato
  const cargarCartas = async (direccion) => {
    if (!window.ethereum || !direccion) return;
    try {
      // Usamos el proveedor de MetaMask
      const provider = new ethers.BrowserProvider(window.ethereum);
      const contrato = new ethers.Contract(CONTRACT_ADDRESS, CartasABI.abi, provider);

      // Forzamos la consulta del balance
      const balanceGrande = await contrato.balanceOf(direccion);
      const numCartas = Number(balanceGrande);

      console.log("Dirección consultada:", direccion);
      console.log("Balance detectado:", numCartas);

      if (numCartas === 0) {
        setCartas([]);
        return;
      }

      let listaCartas = [];
      for (let i = 0; i < numCartas; i++) {
        // Usamos la función de Enumerable para obtener el ID real
        const tokenId = await contrato.tokenOfOwnerByIndex(direccion, i);
        const bichoId = await contrato.bichoAsignado(tokenId);
        const uri = await contrato.tokenURI(tokenId);

        listaCartas.push({
          id: Number(tokenId),
          bichoReal: Number(bichoId),
          uri: uri.replace("ipfs://", "https://ipfs.io/ipfs/")
        });
      }
      setCartas(listaCartas);
    } catch (error) {
      console.error("Error detallado en cargarCartas:", error);
    }
  };

  const conectarWallet = async () => {
    if (window.ethereum) {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        const walletActiva = accounts[0]; // Usamos una variable local

        const chainId = await window.ethereum.request({ method: 'eth_chainId' });
        if (chainId !== '0xaa36a7') {
          await cambiarARedSepolia();
        }

        setCuenta(walletActiva);
        await cargarCartas(walletActiva); // Pasamos la variable local, no el estado 'cuenta'
      } catch (error) {
        console.error("Error al conectar:", error);
      }
    }
  };
  const reclamarCarta = async () => {
    try {
      if (!window.ethereum || !cuenta) return;
      setCargando(true);

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contrato = new ethers.Contract(CONTRACT_ADDRESS, CartasABI.abi, signer);

      // Mandamos la transacción a la cuenta activa
      const tx = await contrato.ganarCarta(cuenta);
      console.log("Transacción enviada...", tx.hash);

      await tx.wait(); // Esperamos confirmación en la blockchain
      console.log("Transacción confirmada");

      alert("¡Carta minteada con éxito!");

      // IMPORTANTE: Esperamos un segundo extra para que el nodo de Sepolia se actualice
      setTimeout(() => {
        cargarCartas(cuenta);
      }, 2000);

    } catch (error) {
      console.error("Error completo:", error);
      alert("Error al mintear. Revisa la consola.");
    } finally {
      setCargando(false);
    }
  };

  const cambiarARedSepolia = async () => {
    const chainIdSepolia = '0xaa36a7';
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: chainIdSepolia }],
      });
    } catch (error) {
      if (error.code === 4902) {
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [{
            chainId: chainIdSepolia,
            chainName: 'Sepolia Test Network',
            nativeCurrency: { name: 'SepoliaETH', symbol: 'ETH', decimals: 18 },
            rpcUrls: ['https://sepolia.infura.io/v3/'],
            blockExplorerUrls: ['https://sepolia.etherscan.io'],
          }],
        });
      }
    }
  };

  return (
    <div style={estiloContenedorPrincipal}>
      <h1 style={{ marginTop: '0', paddingBottom: '20px' }}>EtherBeasts 🃏</h1>

      {!cuenta ? (
        <button onClick={conectarWallet} style={estiloBoton}>
          Conectar MetaMask
        </button>
      ) : (
        <div>
          <p>Wallet: <b>{cuenta.substring(0, 6)}...{cuenta.substring(38)}</b></p>
          <p>Tienes {cartas.length} cartas en tu colección</p>

          <button onClick={reclamarCarta} style={estiloBotonEspecial} disabled={cargando}>
            {cargando ? "⏳ Minteando..." : "🚀 ¡Abrir sobre de cartas!"}
          </button>

          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', marginTop: '40px' }}>
            {cartas.map((carta) => (
              <div
                key={carta.id}
                style={estiloCarta}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-10px)';
                  e.currentTarget.style.boxShadow = '0 10px 25px rgba(255, 215, 0, 0.3)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.6)';
                }}
              >
                <div style={{ width: '100%', height: '320px', overflow: 'hidden', borderRadius: '14px 14px 0 0' }}>
                  <img
                    src={`https://gateway.pinata.cloud/ipfs/bafybeicwuguf2zsxwcs7p4zeiseea62kgeqwdgksvpexxno6ofajo4njci/${carta.bichoReal}.png`}
                    alt="EtherBeast"
                    style={{
                      width: '100%',
                      height: '100%',
                      display: 'block',
                      objectFit: 'cover',
                      backgroundColor: '#333'
                    }}
                    onError={(e) => console.error("Error cargando imagen:", e.target.src)}
                  />
                </div>

                <div style={{ padding: '15px' }}>
                  <h2 style={{ margin: '5px 0', color: '#fff', fontSize: '1.2rem', fontWeight: 'bold' }}>
                    EtherBeast #{carta.id}
                  </h2>

                  <p style={{ fontSize: '11px', color: '#aaa', fontStyle: 'italic', marginTop: '5px' }}>
                    NFT Verificado en IPFS
                  </p>

                  <a
                    href={carta.uri}
                    target="_blank"
                    rel="noreferrer"
                    style={{ fontSize: '10px', color: '#00ccff', textDecoration: 'none' }}
                  >
                    🔗 Ver Metadatos
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Estilos actualizados para la galería
const estiloBoton = { padding: '10px 20px', fontSize: '16px', cursor: 'pointer', borderRadius: '8px' };
const estiloBotonEspecial = { padding: '15px 30px', fontSize: '20px', cursor: 'pointer', borderRadius: '12px', backgroundColor: '#4CAF50', color: 'white', border: 'none', fontWeight: 'bold' };

const estiloCarta = {
  width: '310px',
  margin: '10px',
  borderRadius: '16px',
  border: '2px solid #ffd700',
  backgroundColor: '#2c2c2c',
  boxShadow: '0 4px 20px rgba(0,0,0,0.6)',
  overflow: 'hidden',
  transition: 'all 0.3s ease-in-out',
  cursor: 'pointer'
};

const estiloContenedorPrincipal = {
  textAlign: 'center',
  margin: '0',
  paddingTop: '50px',
  fontFamily: 'Arial',
  backgroundColor: '#1a1a1a',
  color: 'white',
  minHeight: '100vh',
  paddingBottom: '50px'
};

export default App;