const contenedorResultados = document.getElementById('contenedorResultados');
const mensajeError = document.getElementById('mensajeError');
const paginacion = document.getElementById('paginacion');
const botonAnterior = document.getElementById('botonAnterior');
const botonSiguiente = document.getElementById('botonSiguiente');
const paginaActual = document.getElementById('paginaActual');
const loader = document.getElementById('loader');
const formularioFiltros = document.getElementById('formularioFiltros');
const botonLimpiar = document.getElementById('botonLimpiar');
const botonFavoritos = document.getElementById('botonFavoritos');
const modalDetalle = document.getElementById('modalDetalle');
const contenidoDetalle = document.getElementById('contenidoDetalle');
const cerrarModal = document.getElementById('cerrarModal');
const botonModoOscuro = document.getElementById('botonModoOscuro');
const modalFavoritos = document.getElementById('modalFavoritos');
const contenidoFavoritos = document.getElementById('contenidoFavoritos');
const cerrarFavoritos = document.getElementById('cerrarFavoritos');

let pagina = 1;
let ultimaPagina = 1;
let parametrosBusqueda = {};
let favoritos = cargarFavoritosLocal();

document.getElementById('botonPersonajes').addEventListener('click', () => {
  pagina = 1;
  parametrosBusqueda = {};
  formularioFiltros.reset();
  cargarPersonajes();
});

formularioFiltros.addEventListener('submit', (evento) => {
  evento.preventDefault();
  pagina = 1;
  parametrosBusqueda = {
    name: document.getElementById('filtroNombre').value.trim(),
    status: document.getElementById('filtroEstado').value.trim(),
    species: document.getElementById('filtroEspecie').value.trim(),
    type: document.getElementById('filtroTipo').value.trim(),
    gender: document.getElementById('filtroGenero').value.trim(),
  };
  cargarPersonajes();
});

botonAnterior.addEventListener('click', () => {
  if (pagina > 1) {
    pagina--;
    cargarPersonajes();
  }
});
botonSiguiente.addEventListener('click', () => {
  if (pagina < ultimaPagina) {
    pagina++;
    cargarPersonajes();
  }
});

botonLimpiar.addEventListener('click', () => {
  formularioFiltros.reset();
  pagina = 1;
  parametrosBusqueda = {};
  cargarPersonajes();
});

function cargarPersonajes(datosFavoritos = null) {
  mostrarLoader(true);
  contenedorResultados.innerHTML = '';
  mensajeError.classList.add('oculto');
  paginacion.classList.add('oculto');
  if (datosFavoritos) {
    mostrarLoader(false);
    mostrarPersonajes(datosFavoritos, true);
    paginacion.classList.add('oculto');
    return;
  }
  const url = new URL('https://rickandmortyapi.com/api/character');
  url.searchParams.set('page', pagina);
  Object.entries(parametrosBusqueda).forEach(([clave, valor]) => {
    if (valor) url.searchParams.append(clave, valor);
  });
  fetch(url.toString())
    .then(respuesta => {
      if (!respuesta.ok) throw new Error('No se encontraron personajes. Probá con otros filtros 🙂');
      return respuesta.json();
    })
    .then(datos => {
      mostrarLoader(false);
      if (!datos.results || datos.results.length === 0) {
        mostrarSinResultados();
        return;
      }
      mostrarPersonajes(datos.results);
      mostrarPaginacion(datos.info);
    })
    .catch(error => {
      mostrarLoader(false);
      mostrarError(error.message);
    });
}

function mostrarPersonajes(personajes, esFavoritos = false) {
  contenedorResultados.innerHTML = '';
  if (personajes.length === 0) {
    mostrarSinResultados();
    return;
  }
  personajes.forEach(personaje => {
    const div = document.createElement('div');
    div.classList.add('tarjetaPersonaje');
    div.setAttribute('tabindex', 0);
    div.setAttribute('role', 'listitem');
    div.setAttribute('aria-label', `Detalles de ${personaje.name}`);
    div.innerHTML = `
      <img src="${personaje.image}" alt="${personaje.name}">
      <h3>${personaje.name}</h3>
      <p>Estado: ${personaje.status}</p>
      <p>Especie: ${personaje.species}</p>
      <button class="botonFavorito ${esFavorito(personaje.id) ? '' : 'noFavorito'}" aria-label="Marcar o desmarcar favorito" data-id="${personaje.id}" tabindex="0">
        ${esFavorito(personaje.id) ? '★' : '☆'}
      </button>
    `;
    div.addEventListener('click', (e) => {
      if (!e.target.classList.contains('botonFavorito')) {
        mostrarDetalle(personaje.id);
      }
    });
    div.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        mostrarDetalle(personaje.id);
      }
    });
    div.querySelector('.botonFavorito').addEventListener('click', (e) => {
      e.stopPropagation();
      alternarFavorito(personaje);
      mostrarPersonajes(esFavoritos ? obtenerFavoritosComoArray() : personajes, esFavoritos);
    });
    contenedorResultados.appendChild(div);
  });
}

function mostrarDetalle(id) {
  mostrarLoader(true);
  fetch(`https://rickandmortyapi.com/api/character/${id}`)
    .then(res => res.json())
    .then(p => {
      mostrarLoader(false);
      contenidoDetalle.innerHTML = `
        <img src="${p.image}" alt="${p.name}" style="width:120px;margin:0 auto 10px;display:block;">
        <h2 style="margin-bottom:10px;">${p.name}</h2>
        <p><b>Estado:</b> ${p.status}</p>
        <p><b>Especie:</b> ${p.species}</p>
        <p><b>Género:</b> ${p.gender}</p>
        <p><b>Origen:</b> ${p.origin.name}</p>
        <p><b>Ubicación:</b> ${p.location.name}</p>
        <p><b>Primer episodio:</b> ${p.episode && p.episode[0] ? p.episode[0].split('/').pop() : 'Desconocido'}</p>
        <button class="botonFavorito ${esFavorito(p.id) ? '' : 'noFavorito'}" aria-label="Marcar o desmarcar favorito" data-id="${p.id}" style="font-size:2em;margin-top:7px;">
          ${esFavorito(p.id) ? '★' : '☆'}
        </button>
      `;
      modalDetalle.classList.remove('oculto');
      document.body.style.overflow = 'hidden';
      setTimeout(() => {
        modalDetalle.focus();
      }, 10);
      contenidoDetalle.querySelector('.botonFavorito').addEventListener('click', function (e) {
        e.stopPropagation();
        alternarFavorito(p);
        this.innerHTML = esFavorito(p.id) ? '★' : '☆';
        this.classList.toggle('noFavorito', !esFavorito(p.id));
      });
    });
}

if (localStorage.getItem('modoOscuro') === 'true') {
  document.body.classList.add('modoOscuro');
  botonModoOscuro.textContent = '☀️';
}

botonModoOscuro.addEventListener('click', () => {
  document.body.classList.toggle('modoOscuro');
  const esOscuro = document.body.classList.contains('modoOscuro');
  botonModoOscuro.textContent = esOscuro ? '☀️' : '🌙';
  localStorage.setItem('modoOscuro', esOscuro);
});
