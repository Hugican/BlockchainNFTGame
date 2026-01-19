const hre = require("hardhat");

async function main() {

  const Cartas = await hre.ethers.getContractFactory("Cartas");

  console.log("Desplegando contrato...");
  const cartas = await Cartas.deploy();

  await cartas.waitForDeployment();

  console.log("¡Éxito! Tu contrato de cartas está vivo.");
  console.log("Dirección del contrato:", cartas.target);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});