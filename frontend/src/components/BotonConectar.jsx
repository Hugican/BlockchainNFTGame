import React from 'react';

/**
 * Wallet connection button component
 * @param {string} cuenta - Connected wallet address (empty if not connected)
 * @param {function} onConectar - Callback when connect button is clicked
 * @param {function} onDesconectar - Callback when disconnect button is clicked
 */
function BotonConectar({ cuenta, onConectar, onDesconectar }) {
    if (cuenta) {
        return (
            <div className="wallet-info">
                <span className="wallet-label">Wallet:</span>
                <span className="wallet-address">
                    {cuenta.substring(0, 6)}...{cuenta.substring(38)}
                </span>
                <button
                    className="btn-disconnect"
                    onClick={onDesconectar}
                    title="Desconectar wallet"
                >
                    ✕
                </button>
            </div>
        );
    }

    return (
        <button className="btn-connect" onClick={onConectar}>
            🦊 Conectar Wallet
        </button>
    );
}

export default BotonConectar;
