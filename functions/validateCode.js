// Estas son las instrucciones para nuestro "cerebro"
exports.handler = async (event) => {
  // RECETA PASO 1: Escucha la contraseña que te dicen.
  const { submittedCode } = JSON.parse(event.body);

  // RECETA PASO 2: Mira la contraseña secreta oficial.
  const secretCode = process.env.CODIGO_DIARIO;

  // RECETA PASO 3: Compara las dos.
  if (submittedCode === secretCode) {
    // RECETA PASO 4: Si son iguales, responde "¡Éxito!".
    return {
      statusCode: 200,
      body: JSON.stringify({ success: true, message: "Código válido." })
    };
  } else {
    // RECETA PASO 5: Si son diferentes, responde "¡Error!".
    return {
      statusCode: 400,
      body: JSON.stringify({ success: false, message: "Código incorrecto." })
    };
  }
};