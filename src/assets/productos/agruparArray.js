const fs = require('fs');
const path = require('path');

function agruparArchivosPorClave() {
  const directorioActual = process.cwd();
  const archivos = fs.readdirSync(directorioActual);

  const objetoAgrupado = {};

  archivos.forEach((archivo) => {
    const rutaCompleta = path.join(directorioActual, archivo);

    // Solo procesar archivos (no directorios)
    if (!fs.statSync(rutaCompleta).isFile()) return;

    // Tomar todo lo que está antes del primer "_"
    const idx = archivo.indexOf('_');
    if (idx === -1) return; // si no hay "_", se ignora

    const nombreClave = archivo.slice(0, idx);
    if (!nombreClave) return; // evita claves vacías

    const rutaFormateada = `src/assets/productos/${archivo}`;

    // Crear el array si no existe y agregar el archivo
    (objetoAgrupado[nombreClave] ||= []).push(rutaFormateada);
  });

  return objetoAgrupado;
}

// Ejecutar la función y mostrar/guardar el resultado
const resultado = agruparArchivosPorClave();
console.log('Objeto agrupado:');
console.log(JSON.stringify(resultado, null, 2));

fs.writeFileSync('archivos-agrupados.json', JSON.stringify(resultado, null, 2));
console.log('\nResultado guardado en archivos-agrupados.json');
