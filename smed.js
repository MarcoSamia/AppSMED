// Actividades iniciales de la tabla
const actividades = [
  "Desconectar molde",
  "Desmontaje de molde",
  "Bajar recamara",
  "Cambio de altura",
  "Cambio de vastago",
  "Colocar recamara nueva",
  "Meter molde a maquina",
  "Montar vastago",
  "Conectar molde",
  "Cambio de cabezal",
  "Arranque de máquina (procesos)"  
];



// Función para mostrar notificacioness toast
function mostrarToast(mensaje, tipo = 'success', duracion = 3000) {
  const toast = document.createElement('div');
  toast.className = `toast toast-${tipo}`;
  toast.innerHTML = `
    <span class="toast-icon">${tipo === 'success' ? '✓' : '✗'}</span>
    <span class="toast-message">${mensaje}</span>
  `;
  document.body.appendChild(toast);
  
  setTimeout(() => {
    toast.style.opacity = '0';
    setTimeout(() => toast.remove(), 300);
  }, duracion);
}



// Función para usar Sortable en Drag Handle
function inicializarSortable() {
  const tablaBody = document.querySelector("#tabla tbody");
  
  new Sortable(tablaBody, {
    animation: 150,
    handle: ".drag-icon",
    filter: ".ignore-elements",
    preventOnFilter: false,
    onStart: function() {
      document.body.style.overflow = 'hidden';
    },
    onEnd: function() {
      document.body.style.overflow = '';
      guardarEstado();
    },
    // Configuración mejorada para móviles
    touchStartThreshold: 8,
    delay: 100,
    delayOnTouchOnly: true,
    forceFallback: true, // Forzar el modo fallback para mejor compatibilidad
    fallbackOnBody: true,
    fallbackTolerance: 5
  });
}



// Llamar esta función al cargar la página
window.addEventListener('DOMContentLoaded', inicializarSortable);



// Función para formatear el tiempo 
function formatearTiempo(segundos) {
  const m = Math.floor(segundos / 60).toString().padStart(2, '0');
  const s = Math.floor(segundos % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}



// Función para coneguir el numero de la semana 
function obtenerNumeroSemana(fecha) {
  const primerDia = new Date(fecha.getFullYear(), 0, 1);
  const diaDelAño = Math.floor((fecha - primerDia) / (24 * 60 * 60 * 1000));
  return Math.ceil((diaDelAño + primerDia.getDay() + 1) / 7);
}



// Constantes y variables universales
const tiempos = {};
const tabla = document.querySelector("#tabla tbody");
let dragTimeout;
let dragStartTime = 0;
let isDragging = false;
let currentDragElement = null;



// Crear filas iniciales
actividades.forEach(nombre => agregarFila(nombre));

function agregarFila(nombre) {
  const id = nombre.replace(/\s+/g, "_");
  const fila = document.createElement("tr");
  
  // Obtener responsable guardado (si existe)
  const responsableGuardado = tiempos[nombre]?.responsable || "";

  fila.innerHTML = `
    <td class="drag-handle" >
      <div class="drag-icon">☰</div>
    </td> 
    <td class="editable" data-label="Actividad" ondblclick="editarNombre(this, '${nombre}')">${nombre}</td>
    <td data-label="Acciones">
      <div class="mobile-actions">
        <button class="btn iniciar" onclick="iniciarPorNombre('${nombre}')">▶</button>
        <button class="btn pausar" onclick="pausarReanudar('${nombre}', this)">⏸</button>
        <button class="btn detener" onclick="detenerPorNombre('${nombre}')">⏹</button>
      </div>
    </td>
    <td data-label="Duración" id="duracion-${id}" 
      ondblclick="editarDuracion('actividad', '${nombre}')"
      ontouchstart="handleTouchStart(this)"
      ontouchend="handleTouchEnd(this)">
    ${formatearTiempo(0)}
  </td>
    <td data-label="Responsable">
      <select onchange="actualizarResponsable('${nombre}', this.value)" class="responsive-select">
        <option value="">--</option>
        <option value="SMED" ${responsableGuardado === "SMED" ? "selected" : ""}>SMED</option>
        <option value="Mantenimiento" ${responsableGuardado === "Mantenimiento" ? "selected" : ""}>Mantenimiento</option>
        <option value="Moldes" ${responsableGuardado === "Moldes" ? "selected" : ""}>Moldes</option>
        <option value="Procesos" ${responsableGuardado === "Procesos" ? "selected" : ""}>Procesos</option>
        <option value="Producción" ${responsableGuardado === "Producción" ? "selected" : ""}>Producción</option>
        <option value="Proyectos" ${responsableGuardado === "Proyectos" ? "selected" : ""}>Proyectos</option>
        <option value="Calidad" ${responsableGuardado === "Calidad" ? "selected" : ""}>Calidad</option>
      </select>
    </td>
    <td data-label="Eliminar"><button onclick="eliminarActividad(this, '${nombre}')">🗑️</button></td>
  `;

  tabla.appendChild(fila);

  // Inicializar el objeto si no existe
  if (!tiempos[nombre]) {
    tiempos[nombre] = {
      nombre: nombre,
      inicio: null,
      fin: null,
      duracion: 0,
      tiempoAcumulado: 0,
      estado: "detenido",
      timerID: null,
      responsable: responsableGuardado // Asegurar que se guarde el responsable
    };
  } else {
    // Si ya existe, asegurar que tenga la propiedad responsable
    tiempos[nombre].responsable = tiempos[nombre].responsable || responsableGuardado;
  }
}



// Función para actualizar el responsable de las actividades
function actualizarResponsable(nombre, departamento) {
  if (!tiempos[nombre]) {
    tiempos[nombre] = { nombre: nombre };
  }
  
  tiempos[nombre].responsable = departamento;
  
  // Guardar inmediatamente
  guardarEstado();
  
  // Actualizar visualmente (opcional)
  const id = nombre.replace(/\s+/g, "_");
  const select = document.getElementById(`responsable-${id}`);
  if (select) select.value = departamento;
}



// Función para iniciar a correr actividad 
function iniciarPorNombre(nombre) {
  const t = tiempos[nombre];
  if (!t || t.estado === "corriendo") {
    alert("Esta actividad ya está corriendo.");
    return;
  }

  t.inicio = new Date();
  t.estado = "corriendo";
  const celda = document.getElementById(`duracion-${nombre.replace(/\s+/g, "_")}`);

  t.timerID = setInterval(() => {
    const ahora = new Date();
    const tiempoTotal = t.tiempoAcumulado + (ahora - t.inicio) / 1000;
    celda.innerText = formatearTiempo(tiempoTotal);
  }, 100);

  guardarEstado();
}



// Función para detener actividad
function detenerPorNombre(nombre) {
  const t = tiempos[nombre];
  if (!t || t.estado === "detenido") {
    alert("Esta actividad no se ha iniciado.");
    return;
  }

  if (t.timerID !== null) {
    clearInterval(t.timerID);
  }

  if (t.estado === "corriendo") {
    const ahora = new Date();
    t.tiempoAcumulado += (ahora - t.inicio) / 1000;
  }

  t.fin = new Date();
  t.estado = "detenido";
  t.timerID = null;
  t.duracion = t.tiempoAcumulado;

  const celda = document.getElementById(`duracion-${nombre.replace(/\s+/g, "_")}`);
  celda.innerText = formatearTiempo(t.duracion);

  guardarEstado();
}



// Función para agregar una nueva actividad
function agregarActividad() {
  const input = document.getElementById("nuevaActividad");
  const nombre = input.value.trim();
  
  if (!nombre) {
    alert("Por favor, escribe el nombre de la actividad.");
    return;
  }

  // Usar la misma lógica de verificación que en renombrar
  const nombresEnUso = Array.from(document.querySelectorAll("#tabla tbody tr td:nth-child(2)"))
    .map(td => td.textContent.trim());

  if (nombresEnUso.includes(nombre)) {
    alert(`Ya existe una actividad llamada "${nombre}".`);
    return;
  }

  agregarFila(nombre);
  input.value = "";
  const nuevaFila = tabla.lastElementChild;
  nuevaFila.classList.add('guardado');
  setTimeout(() => nuevaFila.classList.remove('guardado'), 500);
  mostrarToast(`Actividad "${nombre}" agregada`, 'success');
  guardarEstado();
}
function mostrarInputActividad() {
  const nombre = prompt("Escribe el nombre de la nueva actividad:");
  if (nombre && nombre.trim() !== "") {
    // Usa la función existente
    const input = document.getElementById("nuevaActividad");
    input.value = nombre.trim();
    agregarActividad();
  }
}



// Funciones para editar el nombre de una actividad
function editarNombre(celda, nombreViejo) {
  const input = document.createElement("input");
  input.type = "text";
  input.value = nombreViejo;
  input.style.width = "90%";

  celda.innerText = "";
  celda.appendChild(input);
  input.focus();

  input.onblur = () => confirmarCambioNombre(celda, nombreViejo, input.value);
  input.onkeydown = (e) => {
    if (e.key === "Enter") {
      confirmarCambioNombre(celda, nombreViejo, input.value);
    }
  };
}
function confirmarCambioNombre(celda, nombreViejo, nuevoNombre) {
  nuevoNombre = nuevoNombre.trim();

  if (!nuevoNombre || nuevoNombre === nombreViejo) {
    celda.innerText = nombreViejo;
    return;
  }

  // Verificación de nombres duplicados
  const nombresEnUso = Array.from(document.querySelectorAll("#tabla tbody tr td:nth-child(2)"))
    .map(td => td.textContent.trim())
    .filter(n => n !== nombreViejo);

  if (nombresEnUso.includes(nuevoNombre)) {
    alert(`El nombre "${nuevoNombre}" ya está en uso por otra actividad.`);
    celda.innerText = nombreViejo;
    return;
  }

  // Copiar datos del objeto tiempos
  tiempos[nuevoNombre] = { 
    ...tiempos[nombreViejo], 
    nombre: nuevoNombre
  };
  delete tiempos[nombreViejo];

  const idViejo = nombreViejo.replace(/\s+/g, "_");
  const idNuevo = nuevoNombre.replace(/\s+/g, "_");

  const fila = celda.parentElement;

  // Actualizar celda de nombre
  fila.children[1].innerText = nuevoNombre;
  fila.children[1].setAttribute("ondblclick", `editarNombre(this, '${nuevoNombre}')`);

  // Actualizar celda de duración
  const celdaDuracion = fila.querySelector(`#duracion-${idViejo}`);
  if (celdaDuracion) {
    celdaDuracion.id = `duracion-${idNuevo}`;
    celdaDuracion.setAttribute("ondblclick", `editarDuracion('actividad', '${nuevoNombre}')`);
  }

  // Actualizar botones de acciones
  const botonesAcciones = fila.querySelectorAll("td[data-label='Acciones'] button");
  if (botonesAcciones.length === 3) {
    botonesAcciones[0].setAttribute("onclick", `iniciarPorNombre('${nuevoNombre}')`);
    botonesAcciones[1].setAttribute("onclick", `pausarReanudar('${nuevoNombre}', this)`);
    botonesAcciones[2].setAttribute("onclick", `detenerPorNombre('${nuevoNombre}')`);
  }

  // Actualizar botón de eliminar
  const botonEliminar = fila.querySelector("td[data-label='Eliminar'] button");
  if (botonEliminar) {
    botonEliminar.setAttribute("onclick", `eliminarActividad(this, '${nuevoNombre}')`);
  }

  // Actualizar select de responsable
  const selectResponsable = fila.querySelector("select");
  if (selectResponsable) {
    selectResponsable.id = `responsable-${idNuevo}`;
    selectResponsable.setAttribute("onchange", `actualizarResponsable('${nuevoNombre}', this.value)`);
  }

  guardarEstado();
}




// Función para eliminar una actividad
function eliminarActividad(boton, nombre) {
  const confirmar = confirm(`¿Estás seguro de que deseas eliminar la actividad "${nombre}"?`);
  if (!confirmar) return;

  // Detener cronómetro si está corriendo
  if (tiempos[nombre].timerID !== null) {
    clearInterval(tiempos[nombre].timerID);
  }

  // Eliminar de estructura de datos
  delete tiempos[nombre];
  if (tiempos[nombre]?.nombre === undefined) {
  delete tiempos[nombre];
}

  // Eliminar fila del DOM
  const fila = boton.closest("tr");
  fila.remove();

  // También elimina del array base (si está)
  const index = actividades.indexOf(nombre);
  if (index !== -1) {
    actividades.splice(index, 1);
}
mostrarToast(`Actividad "${nombre}" eliminada`, 'warning');

  guardarEstado();
}



// Función para pausar y reanudar el tiempo 
function pausarReanudar(nombre, boton) {
  const t = tiempos[nombre];
  const celda = document.getElementById(`duracion-${nombre.replace(/\s+/g, "_")}`);

  if (t.estado !== "corriendo" && t.estado !== "pausado") {
    mostrarToast(`La actividad "${nombre}" no se ha iniciado aún`, "warning");
    return;
  }

  if (t.estado === "corriendo") {
    clearInterval(t.timerID);
    t.estado = "pausado";
    const ahora = new Date();
    t.tiempoAcumulado += (ahora - t.inicio) / 1000;
    
    // Cambiar solo la clase, no el HTML interno
    boton.innerHTML = '<span class="icon-reanudar">▶</span>';
    boton.classList.remove('pausar');
    boton.classList.add('reanudar');
    
  } else if (t.estado === "pausado") {
    t.inicio = new Date();
    t.estado = "corriendo";
    
    // Cambiar solo la clase, no el HTML interno
    boton.innerHTML = '<span class="icon-pausar">⏸</span>';
    boton.classList.remove('reanudar');
    boton.classList.add('pausar');
    
    t.timerID = setInterval(() => {
      const ahora = new Date();
      const tiempoTotal = t.tiempoAcumulado + (ahora - t.inicio) / 1000;
      celda.innerText = formatearTiempo(tiempoTotal);
    }, 100);
  }

  guardarEstado();
}



// Funciones para guardar y cargar el estado de la aplicación
function guardarEstado() {
  const datos = {
    actividades: Array.from(document.querySelectorAll("#tabla tbody tr")).map(fila => {
      const nombre = fila.children[1].innerText;
      return tiempos[nombre];
    }),
    parosExternos: Object.values(parosExternos),
    datosCambio: {
      inyectora: document.getElementById("inyectora").value,
      moldeSale: document.getElementById("moldeSale").value,
      moldeEntra: document.getElementById("moldeEntra").value,
      tipoCambio: document.getElementById("tipoCambio").value,
      tiempoObjetivo: document.getElementById("tiempoObjetivo").value,
      horaInicio: document.getElementById("horaInicio").value,
      horaTermino: document.getElementById("horaTermino").value,
      fechaCambio: document.getElementById("fechaCambio").value,
      semanaCambio: document.getElementById("semanaCambio").value,
      razonCambio: document.getElementById("razonCambio").value
    }
  };
  localStorage.setItem("estadoSMED", JSON.stringify(datos));
}
function cargarEstado() {
  const datos = JSON.parse(localStorage.getItem("estadoSMED"));
  if (!datos) return;

  if (datos.actividades) {
    datos.actividades.forEach(actividad => {
      if (actividad && actividad.nombre && actividad.responsable) {
        if (!tiempos[actividad.nombre]) {
          tiempos[actividad.nombre] = actividad;
        } else {
          tiempos[actividad.nombre].responsable = actividad.responsable;
        }
      }
    });
  }

  const { actividades, datosCambio, parosExternos: parosGuardados } = datos;

  // Cargar datos del cambio
  if (datosCambio) {
    document.getElementById("inyectora").value = datosCambio.inyectora || "";
    document.getElementById("moldeSale").value = datosCambio.moldeSale || "";
    document.getElementById("moldeEntra").value = datosCambio.moldeEntra || "";
    document.getElementById("tipoCambio").value = datosCambio.tipoCambio || "";
    document.getElementById("tiempoObjetivo").value = datosCambio.tiempoObjetivo || "";
    document.getElementById("tiempoObjetivo").value = datosCambio.tiempoObjetivo || "";
    document.getElementById("fechaCambio").value = datosCambio.fechaCambio || "";
    document.getElementById("semanaCambio").value = datosCambio.semanaCambio || "";
    document.getElementById("horaInicio").value = datosCambio.horaInicio || "";
    document.getElementById("horaTermino").value = datosCambio.horaTermino || "";
    document.getElementById("razonCambio").value = datosCambio.razonCambio || "";
  }

  // Cargar paros externos
  if (parosGuardados) {
    parosGuardados.forEach(p => {
      parosExternos[p.id] = p;

      const fila = document.createElement("tr");
      fila.innerHTML = `
        <td data-label="Departamento">${p.departamento}</td>
        <td data-label="Paro">${p.nombre}</td>
        <td data-label="Acciones">
          <button class="btn iniciar" onclick="iniciarParo('${p.id}')">▶</button>
          <button class="btn pausar" onclick="pausarReanudarParo('${p.id}', this)">⏸</button>
          <button class="btn detener" onclick="detenerParo('${p.id}')">⏹</button>
        </td>
        <td data-label="Duración" id="duracion-paro-${p.id}" 
            ondblclick="editarDuracion('paro', '${p.id}')"
            ontouchstart="handleTouchStart(this)"
            ontouchend="handleTouchEnd(this)">${formatearTiempo(p.tiempoAcumulado)}</td>
        <td data-label="Eliminar">
          <button onclick="eliminarParo('${p.id}', this)">🗑️</button>
        </td>
      `;
      tablaParos.appendChild(fila);

      if (p.estado === "corriendo") {
  const celda = document.getElementById(`duracion-paro-${p.id}`);
  p.inicio = new Date(p.inicio); // restaurar objeto Date
  p.timerID = setInterval(() => {
    const ahora = new Date();
    const tiempoTotal = p.tiempoAcumulado + (ahora - p.inicio) / 1000;
    celda.innerText = formatearTiempo(tiempoTotal);
  }, 100);
}
    });
  }

    setTimeout(() => {
      CAMPOS_OBLIGATORIOS.forEach(id => {
        const campo = document.getElementById(id);
        if (campo && campo.value.trim()) {
          campo.classList.add('campo-valido');
        }
      });
    }, 100);

  // Limpiar tabla y objeto tiempos
  tabla.innerHTML = "";
  for (const actividad of actividades) {
    agregarFila(actividad.nombre);
    tiempos[actividad.nombre] = actividad;

    const nombre = actividad.nombre;
    const celdaDuracion = document.getElementById(`duracion-${nombre.replace(/\s+/g, "_")}`);

    if (actividad.estado === "corriendo") {
      const t = tiempos[nombre];
      t.inicio = new Date(t.inicio); // asegurar que sea objeto Date

      t.timerID = setInterval(() => {
        const ahora = new Date();
        const tiempoTotal = t.tiempoAcumulado + (ahora - t.inicio) / 1000;
        celdaDuracion.innerText = formatearTiempo(tiempoTotal);
      }, 100);
    } else {
      celdaDuracion.innerText = formatearTiempo(actividad.tiempoAcumulado || 0);
    }

    const select = tabla.querySelector(`tr:last-child select`);
    if (select && actividad.responsable) {
      select.value = actividad.responsable;
}
  }
}
function reiniciarTabla() {
  tabla.innerHTML = "";
  for (const nombre of actividades) {
    agregarFila(nombre);
  }
}



// Función para cambiar de pantallas
function cambiarPantalla(idMostrar) {
    const pantallas = ['pantalla-tiempos', 'pantalla-checklist'];
    pantallas.forEach(id => {
      document.getElementById(id).style.display = (id === idMostrar) ? 'block' : 'none';
    });
  }



// Funciones para la tabla de paros externos
const tablaParos = document.querySelector("#tablaParos tbody");
const parosExternos = {};

function agregarParo() {
  const departamento = document.getElementById("departamentoParo").value;
  const nombre = document.getElementById("nombreParo").value.trim();
  if (nombre === "") {
    alert("Escribe el nombre del paro.");
    return;
  }

  const id = nombre.replace(/\s+/g, "_") + "_" + Date.now();
  const fila = document.createElement("tr");
  
  fila.innerHTML = `
    <td data-label="Departamento">${departamento}</td>
    <td data-label="Paro">${nombre}</td>
    <td data-label="Acciones">
      <button class="btn iniciar" onclick="iniciarParo('${id}')">▶</button>
      <button class="btn pausar" onclick="pausarReanudarParo('${id}', this)">⏸</button>
      <button class="btn detener" onclick="detenerParo('${id}')">⏹</button>
    </td>
    <td data-label="Duración" id="duracion-paro-${id}" 
        ondblclick="editarDuracion('paro', '${id}')"
        ontouchstart="handleTouchStart(this)"
        ontouchend="handleTouchEnd(this)">00:00</td>
    <td data-label="Eliminar">
      <button class="icon-btn" onclick="eliminarParo('${id}', this)">🗑️</button>
    </td>
  `;

  tablaParos.appendChild(fila);

  parosExternos[id] = {
    id,
    departamento,
    nombre,
    inicio: null,
    fin: null,
    tiempoAcumulado: 0,
    estado: "detenido",
    timerID: null
  };

  guardarEstado();
  mostrarToast(`Paro "${nombre}" agregado`, 'success');
  document.getElementById("nombreParo").value = "";
  document.getElementById("departamentoParo").selectedIndex = 0;
}
function iniciarParo(id) {
  const p = parosExternos[id];
  if (!p || p.estado === "corriendo") return;

  p.inicio = new Date();
  p.estado = "corriendo";

  const celda = document.getElementById(`duracion-paro-${id}`);
  p.timerID = setInterval(() => {
    const ahora = new Date();
    const tiempoTotal = p.tiempoAcumulado + (ahora - p.inicio) / 1000;
    celda.innerText = formatearTiempo(tiempoTotal);
  }, 100);

  guardarEstado();
}
function pausarReanudarParo(id, btn) {
  const p = parosExternos[id];
  const celda = document.getElementById(`duracion-paro-${id}`);

  if (p.estado !== "corriendo" && p.estado !== "pausado") {
    mostrarToast(`El paro "${p.nombre}" no se ha iniciado aún`, "warning");
    return;
  }

  if (p.estado === "corriendo") {
    clearInterval(p.timerID);
    p.estado = "pausado";
    const ahora = new Date();
    p.tiempoAcumulado += (ahora - p.inicio) / 1000;
    btn.innerHTML = '<span class="icon-reanudar">▶</span>';
  } else if (p.estado === "pausado") {
    p.inicio = new Date();
    p.estado = "corriendo";
    btn.innerHTML = '<span class="icon-pausar">⏸</span>';
    p.timerID = setInterval(() => {
      const ahora = new Date();
      const tiempoTotal = p.tiempoAcumulado + (ahora - p.inicio) / 1000;
      celda.innerText = formatearTiempo(tiempoTotal);
    }, 100);
  }

  guardarEstado();
}
function detenerParo(id) {
  const p = parosExternos[id];
  if (!p || p.estado === "detenido") return;

  if (p.timerID) clearInterval(p.timerID);

  if (p.estado === "corriendo") {
    const ahora = new Date();
    p.tiempoAcumulado += (ahora - p.inicio) / 1000;
  }

  p.estado = "detenido";
  p.timerID = null;

  const celda = document.getElementById(`duracion-paro-${id}`);
  celda.innerText = formatearTiempo(p.tiempoAcumulado);

  guardarEstado();
}
function eliminarParo(id, btn) {
  const confirmar = confirm("¿Eliminar este paro?");
  if (!confirmar) return;

  if (parosExternos[id].timerID) clearInterval(parosExternos[id].timerID);
  delete parosExternos[id];

  const fila = btn.closest("tr");
  fila.remove();
  mostrarToast(`Paro eliminado`, 'warning');
  guardarEstado();
}



// Función para cargar elementos de la aplicación
window.onload = function() {
  cargarEstado();
  inicializarValidacion();

  const fechaInput = document.getElementById("fechaCambio");
  const semanaInput = document.getElementById("semanaCambio");

  if (!fechaInput.value || !semanaInput.value) {
    const hoy = new Date();
    const fechaStr = hoy.toLocaleDateString("es-MX"); // ejemplo: 15/07/2025
    const semana = obtenerNumeroSemana(hoy);
    fechaInput.value = fechaStr;
    semanaInput.value = semana;
}


  document.getElementById("btn-reset").addEventListener("click", () => {
  const confirmar = confirm("¿Seguro que quieres borrar todos los datos y reiniciar la aplicación?");
  if (!confirmar) return;

  function limpiarValidaciones() {
  // Limpiar mensajes de error
  document.querySelectorAll('.mensaje-error').forEach(mensaje => {
    mensaje.style.display = 'none';
  });
  
  // Limpiar estilos de campos
  document.querySelectorAll('.campo-obligatorio, .campo-valido').forEach(campo => {
    campo.classList.remove('campo-obligatorio');
    campo.classList.remove('campo-valido');
  });
  
  // Limpiar mensaje de feedback general
  document.getElementById('feedback').innerText = '';
}

  // Limpiar localStorage
  localStorage.removeItem("estadoSMED");
  localStorage.removeItem("checklistSMED");

  // Limpiar checklist visual
  const items = document.querySelectorAll("#tabla-checklist input[type=checkbox]");
  items.forEach(item => item.checked = false);

  // Limpiar cronómetros normales
  for (const key in tiempos) {
    if (tiempos[key].timerID) clearInterval(tiempos[key].timerID);
  }
  Object.keys(tiempos).forEach(k => delete tiempos[k]);
  tabla.innerHTML = "";

  // Limpiar cronómetros de paros
  for (const key in parosExternos) {
    if (parosExternos[key].timerID) clearInterval(parosExternos[key].timerID);
  }
  Object.keys(parosExternos).forEach(k => delete parosExternos[k]);
  const tablaParos = document.querySelector("#tablaParos tbody");
  if (tablaParos) tablaParos.innerHTML = "";

  // Limpiar inputs de datos cambio molde
  document.getElementById("inyectora").value = "";
  document.getElementById("moldeSale").value = "";
  document.getElementById("moldeEntra").value = "";
  document.getElementById("tipoCambio").value = "";
  document.getElementById("tiempoObjetivo").value = "";
  document.getElementById("tiempoObjetivo").value = "";
  document.getElementById("fechaCambio").value = "";
  document.getElementById("semanaCambio").value = "";
  document.getElementById("horaInicio").value = "";
  document.getElementById("horaTermino").value = "";
  document.getElementById("razonCambio").value = "";

  // Recargar actividades base
  console.log("Actividades base:", actividades);
  // Restaurar actividades base antes de reiniciar tabla
actividades.length = 0;
actividades.push(
  "Desconectar molde",
  "Desmontaje de molde",
  "Bajar recamara",
  "Cambio de altura",
  "Cambio de vastago",
  "Colocar recamara nueva",
  "Meter molde a maquina",
  "Montar vastago",
  "Conectar molde",
  "Cambio de cabezal",
  "Arranque de máquina (procesos)"
);
  reiniciarTabla();
  const hoy = new Date();
  document.getElementById("fechaCambio").value = hoy.toLocaleDateString("es-MX");
  document.getElementById("semanaCambio").value = obtenerNumeroSemana(hoy);
});

}



// Tiempos objetivos de cada molde
const tiemposObjetivos = {
  "CYLINDER WITH SLEEVE 176|CC": 495,
  "CYLINDER WITH SLEEVE 176|MxM": 360,
  "CYLINDER WITH SLEEVE 177|CC": 495,
  "CYLINDER WITH SLEEVE 177|MxM": 360,
  "IGNITION COVER 225|CC": 390,
  "IGNITION COVER 225|MxM": 255,
  "BODY BALANCE K5|CC": 480,
  "BODY BALANCE K5|MxM": 345,
  "BODY BALANCE K7|CC": 480,
  "BODY BALANCE K7|MxM": 345,
  "TIMMING 002|CC": 490,
  "TIMMING 002|MxM": 355,
  "TIMMING 661|CC": 490,
  "TIMMING 661|MxM": 355,
  "IGNITION WOLF 852|CC": 420,
  "IGNITION WOLF 852|MxM": 285,
  "IGNITION DOITER 061|CC": 450,
  "IGNITION DOITER 061|MxM": 315,
  "HSG AS 060|CC": 420,
  "HSG AS 060|MxM": 285,
  "HSG MS 071|CC": 420,
  "HSG MS 071|MxM": 285,
  "GHL 331|CC": 420,
  "GHL 331|MxM": 285,
  "GHR 336|CC": 420,
  "GHR 336|MxM": 285,
  "MAIN HOUSING 285|CC": 600,
  "MAIN HOUSING 285|MxM": 465,
  "CLUTCH HOUSING 308|CC": 490,
  "CLUTCH HOUSING 308|MxM": 355,
  "CRANKCASE AS 821|CC": 600,
  "CRANKCASE AS 821|MxM": 465,
  "CRANKCASE AS 822|CC": 600,
  "CRANKCASE AS 822|MxM": 465,
  "CRANKCASE MS 831|CC": 600,
  "CRANKCASE MS 831|MxM": 465,
  "CRANKCASE MS 832|CC": 600,
  "CRANKCASE MS 832|MxM": 465,
  "CRANKCASE HALF 701|CC": 600,
  "CRANKCASE HALF 701|MxM": 465,
  "EATON 697|CC": 555,
  "EATON 697|MxM": 420,
  "EATON 438|CC": 555,
  "EATON 438|MxM": 420,
  "EATON 130|CC": 555,
  "EATON 130|MxM": 420,
  "GHL 055|CC": 420,
  "GHL 055|MxM": 285,
  "TRANSMISSION COVER MIDDLE 045|CC": 600,
  "TRANSMISSION COVER MIDDLE 045|MxM": 465,
  "IGNITION COVER 059|CC": 390,
  "IGNITION COVER 059|MxM": 255,
  "IGNITION COVER 063|CC": 390,
  "IGNITION COVER 063|MxM": 255,
};
function actualizarTiempoObjetivo() {
  const molde = document.getElementById("moldeEntra").value;
  const tipo = document.getElementById("tipoCambio").value;

  const clave = `${molde}|${tipo}`;
  const tiempo = tiemposObjetivos[clave];

  if (tiempo !== undefined) {
    document.getElementById("tiempoObjetivo").value = tiempo;
  }
}



// Función para subir los datos al Google Sheets
function subirADatosGoogle() {
  if (!validarCampos()) {
    const feedback = document.getElementById("feedback");
    feedback.innerHTML = '<span style="color:red">❌ Complete todos los campos obligatorios</span>';
    
    // Hacer scroll al primer campo inválido
    const primerError = document.querySelector('.campo-obligatorio');
    if (primerError) {
      primerError.scrollIntoView({ behavior: 'smooth', block: 'center' });
      primerError.focus();
    }
    
    return;
  }

  const feedback = document.getElementById("feedback");
  feedback.innerText = "Enviando datos...";
  feedback.style.color = "#333";

  const actividadesValidas = Object.values(tiempos).filter(a => a && a.tiempoAcumulado > 0);
  const parosValidos = Object.values(parosExternos).filter(p => p && p.tiempoAcumulado > 0);

  const datos = {
    semanaCambio: document.getElementById("semanaCambio").value,
    razonCambio: document.getElementById("razonCambio").value,
    tipoCambio: document.getElementById("tipoCambio").value,
    fechaCambio: document.getElementById("fechaCambio").value,
    inyectora: document.getElementById("inyectora").value,
    moldeSale: document.getElementById("moldeSale").value,
    moldeEntra: document.getElementById("moldeEntra").value,
    horaInicio: document.getElementById("horaInicio").value,
    horaTermino: document.getElementById("horaTermino").value,
    tiempoObjetivo: document.getElementById("tiempoObjetivo").value,
    actividades: actividadesValidas,
    parosExternos: parosValidos
  };


  console.log("Responsables de actividades:");
  Object.values(tiempos).forEach(a => {
    console.log(a.nombre, "=>", a.responsable);
});
  console.log("Datos enviados:", JSON.stringify(datos, null, 2));

  enviarDatosGoogle(datos)
    .then(resultado => {
      if (resultado.exito) {
        feedback.innerText = "✅ Datos enviados correctamente";
        feedback.style.color = "green";
      } else {
        feedback.innerText = "❌ Error al enviar los datos";
        feedback.style.color = "red";
      }
    });



// Funciones para editar la duración de la actividades
function editarDuracion(tipo, id) {
  editarDuracionDesktop(tipo, id);
}
function editarDuracionDesktop(tipo, id) {
  const celdaID = tipo === "actividad" ? `duracion-${id.replace(/\s+/g, "_")}` : `duracion-paro-${id}`;
  const celda = document.getElementById(celdaID);
  if (!celda) return;

  const valorActual = celda.innerText.trim();
  const [minActual, segActual] = valorActual.split(":").map(part => part.padStart(2, '0'));

  // Crear modal específico para móviles
  const modal = document.createElement('div');
  modal.style.position = 'fixed';
  modal.style.top = '0';
  modal.style.left = '0';
  modal.style.right = '0';
  modal.style.bottom = '0';
  modal.style.backgroundColor = 'rgba(0,0,0,0.7)';
  modal.style.display = 'flex';
  modal.style.justifyContent = 'center';
  modal.style.alignItems = 'center';
  modal.style.zIndex = '1000';

  // Contenedor del editor
  const editor = document.createElement('div');
  editor.style.backgroundColor = 'white';
  editor.style.padding = '20px';
  editor.style.borderRadius = '10px';
  editor.style.width = '90%';
  editor.style.maxWidth = '400px';

  // Inputs para minutos y segundos
  editor.innerHTML = `
    <h3 style="margin-top: 0; color: #1e37a4">Editar tiempo</h3>
    <div style="display: flex; gap: 10px; margin-bottom: 20px; align-items: center">
      <div style="flex: 1">
        <label style="display: block; margin-bottom: 5px; font-weight: bold">Minutos</label>
        <input type="number" id="edit-min" value="${minActual}" min="0" max="999" class="edit-tiempo-input">
      </div>
      <span style="font-size: 24px">:</span>
      <div style="flex: 1">
        <label style="display: block; margin-bottom: 5px; font-weight: bold">Segundos</label>
        <input type="number" id="edit-sec" value="${segActual}" min="0" max="59" class="edit-tiempo-input">
      </div>
    </div>
    <div style="display: flex; gap: 10px">
      <button id="edit-cancel" style="flex: 1; padding: 10px; background: #f44336; color: white; border: none; border-radius: 5px">Cancelar</button>
      <button id="edit-save" style="flex: 1; padding: 10px; background: #4CAF50; color: white; border: none; border-radius: 5px">Guardar</button>
    </div>
  `;

  modal.appendChild(editor);
  document.body.appendChild(modal);

  // Focus automático en minutos
  const inputMin = editor.querySelector('#edit-min');
  inputMin.focus();
  inputMin.select();

  // Validación de segundos
  const inputSec = editor.querySelector('#edit-sec');
  inputSec.addEventListener('input', (e) => {
    if (parseInt(e.target.value) > 59) e.target.value = '59';
  });

  // Funcionalidad de botones
  editor.querySelector('#edit-cancel').addEventListener('click', () => {
    modal.remove();
  });

  editor.querySelector('#edit-save').addEventListener('click', () => {
    const minutos = editor.querySelector('#edit-min').value.padStart(2, '0');
    const segundos = editor.querySelector('#edit-sec').value.padStart(2, '0');
    const nuevoValor = `${minutos}:${segundos}`;
    const segundosTotales = parseInt(minutos) * 60 + parseInt(segundos);

    // Actualizar el objeto correspondiente
    if (tipo === "actividad" && tiempos[id]) {
      tiempos[id].tiempoAcumulado = segundosTotales;
      tiempos[id].duracion = segundosTotales;
      if (tiempos[id].timerID) {
        clearInterval(tiempos[id].timerID);
        tiempos[id].timerID = null;
      }
      tiempos[id].estado = "detenido";
    } else if (tipo === "paro" && parosExternos[id]) {
      parosExternos[id].tiempoAcumulado = segundosTotales;
      parosExternos[id].duracion = segundosTotales;
      if (parosExternos[id].timerID) {
        clearInterval(parosExternos[id].timerID);
        parosExternos[id].timerID = null;
      }
      parosExternos[id].estado = "detenido";
    }

    celda.innerText = nuevoValor;
    guardarEstado();
    modal.remove();
    mostrarToast('Tiempo actualizado', 'success');
  });

  // Cerrar al hacer clic fuera
  modal.addEventListener('click', (e) => {
    if (e.target === modal) modal.remove();
  });
}



// Funciones para editar la fecha
function editarCampoFecha(idCampo) {
  const campo = document.getElementById(idCampo);

  if (campo.hasAttribute("readonly")) {
    campo.removeAttribute("readonly");
    campo.style.border = "1px solid #ccc";
    campo.style.backgroundColor = "#fff";
    campo.focus();
  }

  campo.addEventListener("blur", () => {
    campo.setAttribute("readonly", true);
    campo.style.border = "";
    campo.style.backgroundColor = "";
    guardarEstado(); // Guardar al terminar edición
  }, { once: true });

  campo.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      campo.blur(); // Forzar blur y guardar
    } else if (e.key === "Escape") {
      campo.value = campo.defaultValue;
      campo.blur();
    }
  });
}
function finalizarEdicionCampoFecha(input, idCampo, valorAnterior) {
  const nuevoValor = input.value.trim();
  const span = document.createElement("input");
  span.type = "text";
  span.id = idCampo;
  span.readOnly = true;
  span.value = nuevoValor;
  span.ondblclick = () => editarCampoFecha(idCampo);
  input.replaceWith(span);
  guardarEstado(); // Opcional si quieres guardar de inmediato
}
function cancelarEdicionCampoFecha(input, idCampo, valorAnterior) {
  const span = document.createElement("input");
  span.type = "text";
  span.id = idCampo;
  span.readOnly = true;
  span.value = valorAnterior;
  span.ondblclick = () => editarCampoFecha(idCampo);
  input.replaceWith(span);
}



// Lista de campos obligatorios
const CAMPOS_OBLIGATORIOS = [
  'inyectora', 
  'moldeSale',
  'moldeEntra',
  'tipoCambio',
  'fechaCambio',
  'semanaCambio',
  'horaInicio',
  'horaTermino',
  'razonCambio'
];



// Función para validar todos los campos
function validarCampos() {
  let valido = true;
  
  CAMPOS_OBLIGATORIOS.forEach(id => {
    const campo = document.getElementById(id);
    const mensaje = campo.parentElement.querySelector('.mensaje-error');
    
    if (!campo.value.trim()) {
      campo.classList.add('campo-obligatorio');
      campo.classList.remove('campo-valido');
      mensaje.style.display = 'block';
      valido = false;
    } else {
      campo.classList.remove('campo-obligatorio');
      campo.classList.add('campo-valido');
      mensaje.style.display = 'none';
    }
  });
  
  return valido;
}



// Funciones para inicializar validación en tiempo real
function inicializarValidacion() {
  CAMPOS_OBLIGATORIOS.forEach(id => {
    const campo = document.getElementById(id);
    if (campo) {
      // Aplicar clase valido si ya tiene contenido al cargar
      if (campo.value.trim()) {
        campo.classList.add('campo-valido');
      }
      
      campo.addEventListener('blur', () => validarCampoIndividual(id));
      campo.addEventListener('input', function() {
        if (this.value.trim()) {
          this.classList.remove('campo-obligatorio');
          this.classList.add('campo-valido');
          this.parentElement.querySelector('.mensaje-error').style.display = 'none';
        } else {
          this.classList.remove('campo-valido');
        }
      });
    }
  });
}
function validarCampoIndividual(id) {
  const campo = document.getElementById(id);
  const mensaje = campo.parentElement.querySelector('.mensaje-error');
  
  if (!campo.value.trim()) {
    campo.classList.add('campo-obligatorio');
    campo.classList.remove('campo-valido');
    mensaje.style.display = 'block';
  } else {
    campo.classList.remove('campo-obligatorio');
    campo.classList.add('campo-valido');
    mensaje.style.display = 'none';
  }
}
function limpiarValidaciones() {
  CAMPOS_OBLIGATORIOS.forEach(id => {
    const campo = document.getElementById(id);
    if (campo) {
      campo.classList.remove('campo-obligatorio');
      const mensaje = campo.parentElement.querySelector('.mensaje-error');
      if (mensaje) mensaje.style.display = 'none';
      
      // Mantener clase valido si tiene contenido
      if (!campo.value.trim()) {
        campo.classList.remove('campo-valido');
      }
    }
  });
  document.getElementById('feedback').innerText = '';
}
}