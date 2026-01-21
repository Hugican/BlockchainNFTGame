const fs = require("fs");
const path = require("path");

async function main() {
    // 1. Ruta de donde Hardhat guarda el resultado de la compilación
    const abiPath = path.resolve(__dirname, "..", "artifacts/contracts/Cartas.sol/Cartas.json");

    // 2. Ruta de tu carpeta src de React
    const frontendPath = path.resolve(__dirname, "..", "..", "frontend", "src", "Cartas.json");

    if (!fs.existsSync(abiPath)) {
        console.log("❌ No se encontró el archivo en artifacts. ¡Compila primero!");
        return;
    }

    // 3. Leemos el archivo original
    const abiFile = fs.readFileSync(abiPath, "utf8");

    // 4. Lo escribimos en la carpeta src
    fs.writeFileSync(frontendPath, abiFile);

    console.log("✅ Cartas.json actualizado correctamente en src/");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });