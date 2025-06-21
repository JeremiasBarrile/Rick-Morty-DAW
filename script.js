const contenedorResultados = document.getElementById('contenedorResultados');
const mensajeError = document.getElementById('mensajeError');


document.getElementById('botonPersonajes').addEventListener('click', () => {
  obtenerPersonajes('https://rickandmortyapi.com/api/character');
});

document.getElementById('formularioFiltros').addEventListener('submit', (evento) => {
  evento.preventDefault();

  const nombre = document.getElementById('filtroNombre').value.trim();
  const estado = document.getElementById('filtroEstado').value.trim();
  const especie = document.getElementById('filtroEspecie').value.trim();
  const tipo = document.getElementById('filtroTipo').value.trim();
  const genero = document.getElementById('filtroGenero').value.trim();

  const url = new URL('https://rickandmortyapi.com/api/character');
  const parametros = {
    name: nombre,
    status: estado,
    species: especie,
    type: tipo,
    gender: genero
  };

  Object.entries(parametros).forEach(([clave, valor]) => {
    if (valor) url.searchParams.append(clave, valor);
  });

  obtenerPersonajes(url.toString());
});

function obtenerPersonajes(url) {
  contenedorResultados.innerHTML = '';
  mensajeError.classList.add('oculto');

  fetch(url)
    .then(respuesta => {
      if (!respuesta.ok) throw new Error('No se encontraron personajes');
      return respuesta.json();
    })
    .then(datos => mostrarPersonajes(datos.results))
    .catch(error => mostrarError(error.message));
}

function mostrarPersonajes(personajes) {
  contenedorResultados.innerHTML = '';

  personajes.forEach(personaje => {
    const div = document.createElement('div');
    div.classList.add('tarjetaPersonaje');
    div.innerHTML = `
      <img src="${personaje.image}" alt="${personaje.name}">
      <h3>${personaje.name}</h3>
      <p>Estado: ${personaje.status}</p>
      <p>Especie: ${personaje.species}</p>
    `;
    contenedorResultados.appendChild(div);
  });
}

function mostrarError(mensaje) {
  mensajeError.textContent = mensaje;
  mensajeError.classList.remove('oculto');
}
