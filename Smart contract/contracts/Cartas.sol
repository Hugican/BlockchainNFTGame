// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract Cartas is ERC721, Ownable {
    uint256 public nextTokenId;

    // Inicializa el nombre y símbolo del juego de cartas
    constructor() ERC721("Cartas", "C") Ownable(msg.sender) {}

    // Función para "abrir sobre" y asignar la carta al jugador
    function ganarCarta(address jugador) public onlyOwner {
        _safeMint(jugador, nextTokenId);
        nextTokenId++;
    }
}