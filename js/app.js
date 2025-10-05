/* ===================================================================
   LÓGICA (JavaScript)
   Descripción general:
   - Define clases base (Dato) y derivadas (Ingreso, Egreso).
   - Mantiene arreglos (ingresos, egresos) que inician vacíos.
   - Proporciona funciones para formatear, calcular totales, renderizar
     la interfaz y manejar eventos (agregar/eliminar).
   - Todas las funciones clave incluyen comentarios descriptivos.
   =================================================================== */

// ====== Clases de dominio ======

/**
 * Clase base que representa un movimiento con descripción y valor.
 * Se utiliza como base para Ingreso y Egreso.
 */
class Dato {
  constructor(descripcion, valor) {
    this._descripcion = descripcion;
    this._valor = valor;
  }
  /** Obtiene la descripción del movimiento. */
  get descripcion() { return this._descripcion; }
  /** Actualiza la descripción del movimiento. */
  set descripcion(d) { this._descripcion = d; }
  /** Obtiene el valor numérico del movimiento. */
  get valor() { return this._valor; }
  /** Actualiza el valor numérico del movimiento. */
  set valor(v) { this._valor = v; }
}

/**
 * Representa un Ingreso (entrada de dinero).
 * Asigna un id incremental único a cada instancia.
 */
class Ingreso extends Dato {
  static contadorIngresos = 0;
  constructor(descripcion, valor) {
    super(descripcion, valor);
    this._id = ++Ingreso.contadorIngresos;
  }
  /** Devuelve el identificador único del ingreso. */
  get id() { return this._id; }
}

/**
 * Representa un Egreso (salida de dinero).
 * Asigna un id incremental único a cada instancia.
 */
class Egreso extends Dato {
  static contadorEgresos = 0;
  constructor(descripcion, valor) {
    super(descripcion, valor);
    this._id = ++Egreso.contadorEgresos;
  }
  /** Devuelve el identificador único del egreso. */
  get id() { return this._id; }
}

// ====== Estado inicial ======
// Arreglos vacíos: la app inicia en 0 sin valores de entrada.
let ingresos = [];
let egresos  = [];

// ====== Utilidades de formato ======

/**
 * Convierte un número a formato de moneda MXN con 2 decimales.
 * @param {number} valor - Cantidad a formatear.
 * @returns {string} Cadena en formato monetario (e.g., $1,234.56).
 */
const formatoMoneda = (valor) => {
  return valor.toLocaleString('es-MX', {
    style: 'currency',
    currency: 'MXN',
    minimumFractionDigits: 2
  });
};

/**
 * Convierte un número (0..1) a porcentaje con 2 decimales.
 * @param {number} valor - Proporción a formatear (ej. 0.25 => 25%).
 * @returns {string} Cadena en formato de porcentaje.
 */
const formatoPorcentaje = (valor) => {
  return valor.toLocaleString('es-MX', {
    style: 'percent',
    minimumFractionDigits: 2
  });
};

// ====== Cálculo de totales ======

/**
 * Suma los valores de todos los ingresos.
 * @returns {number} Total de ingresos.
 */
const totalIngresos = () => {
  let total = 0;
  for (const ingreso of ingresos) total += ingreso.valor;
  return total;
};

/**
 * Suma los valores de todos los egresos.
 * @returns {number} Total de egresos.
 */
const totalEgresos = () => {
  let total = 0;
  for (const egreso of egresos) total += egreso.valor;
  return total;
};

// ====== Render: Cabecero ======

/**
 * Recalcula y muestra:
 * - Presupuesto disponible (ingresos - egresos)
 * - Total de ingresos
 * - Total de egresos
 * - Porcentaje global de egresos respecto a ingresos
 *   (si no hay ingresos, el porcentaje se muestra 0%).
 */
const cargarCabecero = () => {
  const presupuesto = totalIngresos() - totalEgresos();
  const porcentajeEgreso = totalIngresos() > 0 ? totalEgresos() / totalIngresos() : 0;

  document.getElementById('presupuesto').innerHTML = formatoMoneda(presupuesto);
  document.getElementById('ingresos').innerHTML = formatoMoneda(totalIngresos());
  document.getElementById('egresos').innerHTML = formatoMoneda(totalEgresos());
  document.getElementById('porcentaje').innerHTML = formatoPorcentaje(porcentajeEgreso);
};

// ====== Render: Listas dinámicas ======

/**
 * Genera y pinta en DOM la lista completa de ingresos.
 * Usa crearIngresoHTML para cada elemento.
 */
const cargarIngresos = () => {
  let ingresosHTML = '';
  for (const ingreso of ingresos) {
    ingresosHTML += crearIngresoHTML(ingreso);
  }
  document.getElementById('lista-ingresos').innerHTML = ingresosHTML;
};

/**
 * Devuelve el bloque HTML de un ingreso individual con botón para eliminar.
 * @param {Ingreso} ingreso - Instancia a representar.
 * @returns {string} HTML del item.
 */
const crearIngresoHTML = (ingreso) => {
  return `
    <div class="elemento limpiarEstilos">
      <div class="elemento_descripcion">${ingreso.descripcion}</div>
      <div class="derecha limpiarEstilos">
        <div class="elemento_valor">+${formatoMoneda(ingreso.valor)}</div>
        <div class="elemento_eliminar">
          <button class="elemento_eliminar_btn" onclick="eliminarIngreso(${ingreso.id})" title="Eliminar ingreso">
            <ion-icon name="close-circle-outline"></ion-icon>
          </button>
        </div>
      </div>
    </div>
  `;
};

/**
 * Genera y pinta en DOM la lista completa de egresos.
 * Usa crearEgresoHTML para cada elemento.
 */
const cargarEgresos = () => {
  let egresosHTML = '';
  for (const egreso of egresos) {
    egresosHTML += crearEgresoHTML(egreso);
  }
  document.getElementById('lista-egresos').innerHTML = egresosHTML;
};

/**
 * Devuelve el bloque HTML de un egreso individual con botón para eliminar
 * y su porcentaje relativo al total de ingresos actual.
 * @param {Egreso} egreso - Instancia a representar.
 * @returns {string} HTML del item.
 */
const crearEgresoHTML = (egreso) => {
  const totalIng = totalIngresos();
  const pct = totalIng > 0 ? egreso.valor / totalIng : 0;
  return `
    <div class="elemento limpiarEstilos">
      <div class="elemento_descripcion">${egreso.descripcion}</div>
      <div class="derecha limpiarEstilos">
        <div class="elemento_valor">-${formatoMoneda(egreso.valor)}</div>
        <div class="elemento_porcentaje">${formatoPorcentaje(pct)}</div>
        <div class="elemento_eliminar">
          <button class="elemento_eliminar_btn" onclick="eliminarEgreso(${egreso.id})" title="Eliminar egreso">
            <ion-icon name="close-circle-outline"></ion-icon>
          </button>
        </div>
      </div>
    </div>
  `;
};

// ====== Acciones: eliminar elementos ======

/**
 * Elimina un ingreso por id y actualiza cabecero y listas.
 * @param {number} id - Identificador único del ingreso.
 */
const eliminarIngreso = (id) => {
  const indice = ingresos.findIndex((ing) => ing.id === id);
  if (indice >= 0) ingresos.splice(indice, 1);
  cargarCabecero();
  cargarIngresos();
  cargarEgresos(); // recalcula porcentajes de cada egreso
};

/**
 * Elimina un egreso por id y actualiza cabecero y lista de egresos.
 * @param {number} id - Identificador único del egreso.
 */
const eliminarEgreso = (id) => {
  const indice = egresos.findIndex((egr) => egr.id === id);
  if (indice >= 0) egresos.splice(indice, 1);
  cargarCabecero();
  cargarEgresos();
};

// ====== Captura: agregar desde el formulario ======

/**
 * Lee el formulario, valida y agrega un movimiento como ingreso o egreso.
 * - Valida que la descripción no esté vacía y que el valor sea numérico > 0.
 * - Inserta el nuevo objeto en el arreglo correspondiente.
 * - Actualiza cabecero y lista afectada.
 * - Limpia los campos del formulario al terminar.
 */
const agregarDato = () => {
  const forma = document.getElementById('forma');
  const tipo = forma['tipo'].value;
  const descripcion = forma['descripcion'].value.trim();
  const valorRaw = forma['valor'].value;

  // Validaciones básicas
  if (!descripcion) {
    alert('Escribe una descripción.');
    return;
  }
  const valor = parseFloat(valorRaw);
  if (isNaN(valor) || valor <= 0) {
    alert('Ingresa un valor numérico mayor a 0.');
    return;
  }

  if (tipo === 'ingreso') {
    ingresos.push(new Ingreso(descripcion, valor));
    cargarIngresos();
  } else {
    egresos.push(new Egreso(descripcion, valor));
    cargarEgresos();
  }

  cargarCabecero();

  // Limpieza del formulario
  forma['descripcion'].value = '';
  forma['valor'].value = '';
  forma['descripcion'].focus();
};

// ====== Bootstrap de la app ======

/**
 * Punto de entrada al cargar la página (onload en <body>).
 * Renderiza por primera vez el cabecero y las listas (vacías).
 */
const cargarApp = () => {
  cargarCabecero();
  cargarIngresos();
  cargarEgresos();
};
