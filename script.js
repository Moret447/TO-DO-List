document.addEventListener('DOMContentLoaded', () => {
  const categoryButtons = document.querySelectorAll('.category-btn');
  const taskInput = document.getElementById('task-input');
  const addButton = document.getElementById('btn__add-task');
  const botonAgregar = document.getElementById('btn__add-task');
  const selectCategoria = document.getElementById('categoria');
  const contenedorTareas = document.querySelector('.tasks__container');

  const totalStats = document.getElementById('total-tasks');
  const taksCompletas = document.getElementById('completed-tasks');
  const statsPendientes = document.getElementById('pending-tasks');


  let tareas = [];

  // Cargar tareas desde localStorage
  const tareasGuardadas = localStorage.getItem('tareas');
  if (tareasGuardadas) {
    tareas = JSON.parse(tareasGuardadas);
    tareas.forEach(tarea => mostrarTarea(tarea));
    actualizarContadoresPorCategoria();
  }

  actualizarEstadisticas();

  categoryButtons.forEach(button => {
    button.addEventListener('click', () => {
      categoryButtons.forEach(btn => btn.classList.remove('active'));
      button.classList.add('active');
    });
  });

  addButton.disabled = true;
  taskInput.addEventListener('input', () => {
    addButton.disabled = taskInput.value.trim() === '';
  });

  botonAgregar.addEventListener('click', () => {
    const texto = taskInput.value.trim();
    const categoria = selectCategoria.value;

    if (texto === '') {
      alert('Por favor escribe una tarea antes de agregar.');
      return;
    }

    const nuevaTareaObj = {
      id: Date.now(),
      texto: texto,
      categoria: categoria,
      completada: false
    };

    tareas.push(nuevaTareaObj);
    guardarEnLocalStorage();
    mostrarTarea(nuevaTareaObj);

    taskInput.value = '';
    selectCategoria.value = 'trabajo';
    addButton.disabled = true;
    actualizarEstadisticas();
    actualizarContadoresPorCategoria();
    actualizarContadoresPorCategoria();

  });

  function mostrarTarea(tarea) {
    const nuevaTarea = document.createElement('div');
    nuevaTarea.className = 'task__item';
    nuevaTarea.dataset.id = tarea.id;

    nuevaTarea.innerHTML = `
      <input type="checkbox" class="task-checkbox" ${tarea.completada ? 'checked' : ''}>
      <span class="task-text">${tarea.texto}</span>
      <button class="edit-task">✏️</button>
      <button class="delete-task">🗑️</button>
      <p class="task__item-category" id="c-${tarea.categoria}">
        ${capitalizarCategoria(tarea.categoria)}
      </p>
    `;

    contenedorTareas.appendChild(nuevaTarea);
    inicializarEventosTarea(nuevaTarea);
  }

  function inicializarEventosTarea(tarea) {
    const checkbox = tarea.querySelector('.task-checkbox');
    const botonEditar = tarea.querySelector('.edit-task');
    const botonEliminar = tarea.querySelector('.delete-task');
    const id = Number(tarea.dataset.id);

    checkbox.addEventListener('change', () => {
      tarea.classList.toggle('completed', checkbox.checked);
      const index = tareas.findIndex(t => t.id === id);
      if (index !== -1) {
        tareas[index].completada = checkbox.checked;
        guardarEnLocalStorage();
        actualizarEstadisticas();
        actualizarContadoresPorCategoria();
      }
    });

    botonEditar.addEventListener('click', () => {
      let textoElemento = botonEditar.previousElementSibling;

      if (textoElemento.tagName === 'SPAN') {
        const input = document.createElement('input');
        input.type = 'text';
        input.value = textoElemento.textContent;
        input.className = 'task-text';
        botonEditar.textContent = '✅';
        botonEditar.id = 'btn-checked';
        textoElemento.replaceWith(input);
        input.focus();

        const cerrarClickFuera = (e) => {
          if (e.target !== input && e.target !== botonEditar) {
            cerrarEdicion(input, botonEditar, id);
          }
        };

        document.addEventListener('click', cerrarClickFuera);
        input._cerrarHandler = cerrarClickFuera;

      } else if (textoElemento.tagName === 'INPUT') {
        cerrarEdicion(textoElemento, botonEditar, id);
      }
    });

    botonEliminar.addEventListener('click', () => {
      tarea.remove();
      tareas = tareas.filter(t => t.id !== id);
      guardarEnLocalStorage();
      actualizarEstadisticas();
      actualizarContadoresPorCategoria();
      
    });

    if (checkbox.checked) {
      tarea.classList.add('completed');
    }
  }

  function cerrarEdicion(input, botonEditar, id) {
    const nuevoSpan = document.createElement('span');
    nuevoSpan.textContent = input.value;
    nuevoSpan.className = 'task-text';
    input.replaceWith(nuevoSpan);

    if (input._cerrarHandler) {
      document.removeEventListener('click', input._cerrarHandler);
      delete input._cerrarHandler;
    }

    botonEditar.textContent = '✏️';
    botonEditar.id = 'btn-notchecked';

    const index = tareas.findIndex(t => t.id === id);
    if (index !== -1) {
      tareas[index].texto = nuevoSpan.textContent;
      guardarEnLocalStorage();
      actualizarContadoresPorCategoria();
    }
  }

  function guardarEnLocalStorage() {
    localStorage.setItem('tareas', JSON.stringify(tareas));
  }

  function capitalizarCategoria(categoria) {
    if (categoria === 'educacion') return 'Educación';
    return categoria.charAt(0).toUpperCase() + categoria.slice(1);
  }

  function actualizarEstadisticas() {
    const total = tareas.length;
    const completadas = tareas.filter(t => t.completada).length;
    const pendientes = total - completadas;

    totalStats.textContent = total;
    taksCompletas.textContent = completadas;
    statsPendientes.textContent = pendientes;
  }

  const eliminarCompletadas = document.querySelector('.delete-completes');
  eliminarCompletadas.addEventListener('click', () => {
    const tareasCompletadas = document.querySelectorAll('.task__item.completed');
    tareasCompletadas.forEach(tarea => tarea.remove());
    tareas = tareas.filter(t => !t.completada);
    guardarEnLocalStorage();
    actualizarEstadisticas();
    actualizarContadoresPorCategoria();
  });

  const eliminarTodas = document.querySelector('.delete-all');
  eliminarTodas.addEventListener('click', () => {
    const todasLasTareas = document.querySelectorAll('.task__item');
    todasLasTareas.forEach(tarea => tarea.remove());
    tareas = [];
    guardarEnLocalStorage();
    actualizarEstadisticas();
    actualizarContadoresPorCategoria();
  });

  // Seccion de categorías 

  // función para las categorías
  function actualizarContadoresPorCategoria() {
  const conteo = {
    trabajo: 0,
    educacion: 0,
    hogar: 0,
    salud: 0,
    personal: 0,
    otro: 0
  };

  tareas.forEach(tarea => {
    if (conteo.hasOwnProperty(tarea.categoria)) {
      conteo[tarea.categoria]++;
    }
  });

  for (let categoria in conteo) {
    const span = document.getElementById(`cc-${categoria}`); // el id es con "cc-"
    if (span) {
      span.textContent = conteo[categoria];
    }
  }

  const todas = document.getElementById('cc-todas');
  if (todas) {
    todas.textContent = tareas.length;
  }
}
  // Filtrar tareas por categoría al hacer clic en un botón
  categoryButtons.forEach(button => {
    button.addEventListener('click', () => {
      // Activar estilo solo en el botón seleccionado
      categoryButtons.forEach(btn => btn.classList.remove('active'));
      button.classList.add('active');

      const categoriaSeleccionada = button.dataset.category;

      const tareasDOM = document.querySelectorAll('.task__item');

      tareasDOM.forEach(tarea => {
        const idCategoria = tarea.querySelector('.task__item-category').id; // ejemplo: cc-trabajo
        const categoriaTarea = idCategoria.replace('c-', '');

        if (categoriaSeleccionada === 'todas' || categoriaTarea === categoriaSeleccionada) {
          tarea.style.display = 'flex';
        } else {
          tarea.style.display = 'none';
        }
      });
    });
  });
  // modo noche 
  document.getElementById('night-mode').addEventListener('click', () => {
  
  const html = document.documentElement;
  const isDark = html.getAttribute('data-theme') === 'dark';

  if (isDark) {
    html.removeAttribute('data-theme');
    localStorage.setItem('tema', 'claro');
    document.getElementById('night-mode').textContent = '🌚';
  } else {
    html.setAttribute('data-theme', 'dark');
    localStorage.setItem('tema', 'oscuro');
    document.getElementById('night-mode').textContent = '🌞';
  }
});

// Al cargar la página, aplicar el tema guardado
document.addEventListener('DOMContentLoaded', () => {
  const tema = localStorage.getItem('tema');
  if (tema === 'oscuro') {
    document.documentElement.setAttribute('data-theme', 'dark');
  }
});

});