// Importamos la función 'createClient' del paquete de Supabase.
// NOTA IMPORTANTE: Para que esto funcione en el navegador, asegúrate de haber añadido
// la librería de Supabase en tu archivo index.html, justo antes de tu etiqueta <script src="app.js">.
// La línea que debes añadir es: <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';


// --- PASO 1: CONFIGURACIÓN Y CONEXIÓN ---

// Aquí es donde conectarás tu frontend con tu base de datos de Supabase.
// Reemplaza los textos entre comillas con tus propias credenciales.
const supabaseUrl = 'https://whqitpmokmgphrgnouda.supabase.co'; // La encuentras en tu proyecto de Supabase > Settings > API
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndocWl0cG1va21ncGhyZ25vdWRhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY4NjQwMzIsImV4cCI6MjA3MjQ0MDAzMn0.veB0UGVuiAeLDU4w7wL2vadM3AmxIR1bvn2Zm6ct6Nw'; // La encuentras en el mismo lugar que la URL

// Creamos el "cliente" de Supabase. Este objeto es el que nos permitirá
// hacer consultas (pedir datos) y mutaciones (cambiar datos) a nuestra base de datos.
const supabase = createClient(supabaseUrl, supabaseKey);


// --- PASO 2: SELECCIÓN DE ELEMENTOS DEL DOM ---

// "DOM" es la representación de tu HTML en JavaScript. Para poder manipular
// los elementos de la página (cambiar texto, añadir clases, etc.), primero
// necesitamos "seleccionarlos" y guardarlos en variables.

const clientNameSpan = document.getElementById('client-name');
const purchaseCountSpan = document.getElementById('purchase-count');
const progressVisualizer = document.getElementById('progress-visualizer');
const reward10PercentDiv = document.getElementById('reward-10-percent');
const rewardTiramisuDiv = document.getElementById('reward-tiramisu');

const registerButton = document.getElementById('register-button');
const modalContainer = document.getElementById('modal-container');
const closeModalButton = document.getElementById('close-modal-button');
const submitCodeButton = document.getElementById('submit-code-button');
const codeInput = document.getElementById('code-input');
const modalMessage = document.getElementById('modal-message');

// Variable para guardar los datos del cliente actual una vez los obtengamos.
// La declaramos con 'let' porque su valor cambiará.
let currentClientData = null;


// --- PASO 3: LÓGICA PRINCIPAL AL CARGAR LA PÁGINA ---

// Usamos 'DOMContentLoaded' para asegurarnos de que todo el HTML
// se ha cargado completamente antes de que nuestro JavaScript intente manipularlo.
document.addEventListener('DOMContentLoaded', async () => {
    // La palabra 'async' nos permite usar 'await' dentro de esta función,
    // lo que facilita el manejo de operaciones que toman tiempo (como pedir datos a una base de datos).

    // A. Obtenemos el ID del cliente desde la URL.
    const clientId = getClientIdFromURL();

    // B. Verificamos si se encontró un ID.
    if (!clientId) {
        document.body.innerHTML = '<h1>Error: No se encontró un ID de cliente en la URL.</h1>';
        return; // Detenemos la ejecución si no hay ID.
    }

    try {
        // C. Buscamos los datos del cliente en Supabase usando el ID.
        const clientData = await fetchClientData(clientId);
        
        if (!clientData) {
             document.body.innerHTML = `<h1>Error: No se encontró un cliente con el ID "${clientId}".</h1>`;
             return;
        }

        // Guardamos los datos del cliente en nuestra variable global para usarlos después.
        currentClientData = clientData;

        // D. Actualizamos la página con los datos del cliente.
        updateUI(currentClientData);

    } catch (error) {
        // Si algo sale mal (ej. problema de red), mostramos un error.
        console.error('Error al obtener los datos del cliente:', error);
        document.body.innerHTML = '<h1>Error al cargar los datos. Inténtalo más tarde.</h1>';
    }
});

/**
 * Función para leer la barra de direcciones del navegador y extraer el valor del parámetro 'id'.
 * Por ejemplo, de "misitio.com/?id=ANA01", extrae "ANA01".
 */
function getClientIdFromURL() {
    const params = new URLSearchParams(window.location.search);
    return params.get('id'); // .get('id') busca el parámetro llamado 'id'
}

/**
 * Función asíncrona para hacer una consulta a Supabase y obtener los datos de un cliente.
 * @param {string} clientId - El ID manual del cliente a buscar.
 * @returns {object | null} - El objeto con los datos del cliente, o null si no se encuentra.
 */
async function fetchClientData(clientId) {
    console.log(`Buscando datos para el cliente: ${clientId}`);

    // Hacemos la consulta a la base de datos.
    const { data, error } = await supabase
        .from('clientes') // De la tabla 'clientes'
        .select('*') // Selecciona todas las columnas
        .eq('cliente_id_manual', clientId) // Donde la columna 'cliente_id_manual' sea igual a nuestro clientId
        .single(); // Esperamos un único resultado. Si no encuentra nada o encuentra más de uno, es un error.

    if (error) {
        // Si Supabase devuelve un error, lo mostramos en la consola y detenemos la función.
        console.error('Error en la consulta a Supabase:', error);
        throw error; // "Lanzamos" el error para que el bloque try...catch de arriba lo capture.
    }

    return data; // Devolvemos los datos encontrados.
}


// --- PASO 4: FUNCIÓN PARA ACTUALIZAR LA INTERFAZ VISUAL ---

/**
 * Recibe los datos de un cliente y actualiza todos los elementos de la página.
 * @param {object} clientData - Objeto con la información del cliente desde Supabase.
 */
function updateUI(clientData) {
    // Actualizamos el nombre del cliente
    clientNameSpan.textContent = clientData.nombre;

    // Actualizamos el contador de compras
    purchaseCountSpan.textContent = clientData.total_compras;

    // Actualizamos los iconos de progreso (los tiramisús)
    const tiramisuIcons = progressVisualizer.querySelectorAll('.taramisu-icon');
    
    // Primero, nos aseguramos de que todos los iconos estén en su estado por defecto (sin la clase 'completed')
    tiramisuIcons.forEach(icon => {
        icon.classList.remove('completed');
    });

    // Luego, añadimos la clase 'completed' solo a los iconos que correspondan
    // a las compras realizadas.
    for (let i = 0; i < clientData.total_compras; i++) {
        if (tiramisuIcons[i]) { // Verificamos que el icono exista
            tiramisuIcons[i].classList.add('completed');
        }
    }

    // Actualizamos el estado de las recompensas
    // Recompensa 1: 10% de descuento (se desbloquea con 5 compras)
    if (clientData.recompensa_10_porciento_desbloqueada) {
        reward10PercentDiv.classList.remove('locked');
        reward10PercentDiv.classList.add('unlocked');
    } else {
        reward10PercentDiv.classList.remove('unlocked');
        reward10PercentDiv.classList.add('locked');
    }

    // Recompensa 2: Tiramisú gratis (se desbloquea con 10 compras)
    if (clientData.recompensa_tiramisu_desbloqueada) {
        rewardTiramisuDiv.classList.remove('locked');
        rewardTiramisuDiv.classList.add('unlocked');
    } else {
        rewardTiramisuDiv.classList.remove('unlocked');
        rewardTiramisuDiv.classList.add('locked');
    }
}


// --- PASO 5: MANEJO DE LA VENTANA EMERGENTE (MODAL) ---

// Añadimos un "escuchador de eventos" al botón principal.
// Cuando el usuario haga clic en él, se ejecutará la función que le pasamos.
registerButton.addEventListener('click', () => {
    // Limpiamos mensajes anteriores y el campo de texto por si se abre de nuevo.
    modalMessage.textContent = '';
    codeInput.value = '';
    // Para mostrar el modal, le añadimos la clase 'visible' que definimos en CSS.
    modalContainer.classList.add('visible');
});

// Hacemos lo mismo para el botón de cerrar.
closeModalButton.addEventListener('click', () => {
    // Para ocultar el modal, le quitamos la clase 'visible'.
    modalContainer.classList.remove('visible');
});


// --- PASO 6: LÓGICA PARA REGISTRAR LA COMPRA ---

// Añadimos el "escuchador de eventos" al botón de confirmar dentro del modal.
submitCodeButton.addEventListener('click', async () => {
    // A. Obtenemos el código que el usuario escribió en el campo de texto.
    // .trim() elimina espacios en blanco al principio y al final.
    const submittedCode = codeInput.value.trim();

    // Validamos que el usuario haya escrito algo.
    if (!submittedCode) {
        modalMessage.textContent = 'Por favor, introduce un código.';
        return;
    }

    // Desactivamos el botón para evitar múltiples clics mientras se procesa.
    submitCodeButton.disabled = true;
    modalMessage.textContent = 'Validando código...';

    try {
        // B. Hacemos la llamada a nuestra Netlify Function para validar el código.
        const response = await fetch('/.netlify/functions/validateCode', {
            method: 'POST', // Usamos el método POST porque estamos enviando datos.
            headers: {
                'Content-Type': 'application/json' // Indicamos que los datos van en formato JSON.
            },
            body: JSON.stringify({ submittedCode: submittedCode }) // Convertimos nuestro objeto JS a un string JSON.
        });

        const result = await response.json(); // Convertimos la respuesta de la función a un objeto JS.

        // C. Si el código es válido (la función devuelve { success: true }).
        if (result.success) {
            modalMessage.textContent = '¡Código correcto! Registrando tu compra...';

            // Incrementamos el número de compras.
            const newTotal = currentClientData.total_compras + 1;
            
            // Verificamos si se desbloquean nuevas recompensas.
            const reward10Unlocked = newTotal >= 5;
            const rewardTiramisuUnlocked = newTotal >= 10;

            // Preparamos el objeto con los datos que vamos a actualizar en Supabase.
            const dataToUpdate = {
                total_compras: newTotal,
                recompensa_10_porciento_desbloqueada: reward10Unlocked,
                recompensa_tiramisu_desbloqueada: rewardTiramisuUnlocked
            };

            // Enviamos la actualización a Supabase.
            const { error } = await supabase
                .from('clientes')
                .update(dataToUpdate) // El objeto con los nuevos datos.
                .eq('cliente_id_manual', currentClientData.cliente_id_manual); // La condición para saber qué fila actualizar.
            
            if (error) { throw error; } // Si hay un error al guardar, lo lanzamos.

            // Si todo fue bien:
            modalMessage.textContent = '¡Compra registrada con éxito!';

            // Esperamos un momento para que el usuario lea el mensaje y luego cerramos el modal
            // y refrescamos la información de la página.
            setTimeout(async () => {
                modalContainer.classList.remove('visible');
                // Volvemos a pedir los datos actualizados desde Supabase para estar 100% seguros
                // de que la información que mostramos es la correcta.
                const updatedClientData = await fetchClientData(currentClientData.cliente_id_manual);
                currentClientData = updatedClientData; // Actualizamos nuestra variable global.
                updateUI(currentClientData); // Actualizamos la interfaz.
            }, 1500); // 1500 milisegundos = 1.5 segundos

        } else {
            // D. Si el código es inválido.
            modalMessage.textContent = 'Código incorrecto. Inténtalo de nuevo.';
        }

    } catch (error) {
        console.error('Error al registrar la compra:', error);
        modalMessage.textContent = 'Hubo un error. Por favor, inténtalo más tarde.';
    } finally {
        // El bloque 'finally' se ejecuta siempre, tanto si hubo éxito como si hubo un error.
        // Volvemos a activar el botón para que el usuario pueda intentarlo de nuevo si fue un error.
        // Lo hacemos con un pequeño retraso para que el usuario no haga clic accidentalmente.
        setTimeout(() => {
            submitCodeButton.disabled = false;
        }, 1500);
    }
});