/**
 * Objeto que almacena toda la información del jugador 1
 * @property {String} ficha			La ficha del jugador 1
 * @property {Number} numFichas		El nº de fichas que ha puesto el jugador 1
 * 									en el tablero
 * @property {Number} victorias		El nº de victorias del jugador 1
 * @property {Number} empates		El nº de empates del jugador 1 con el jugador 2
 * @property {Number} derrotas		El nº de derrotas del jugador 1
 */
const jugador1 = {
	ficha: "X",
	numFichas: 0,
	victorias: 0,
	empates: 0,
	derrotas: 0
};

/**
 * Objeto que almacena toda la información del jugador 2
 * @property {String} ficha			La ficha del jugador 2
 * @property {Number} numFichas		El nº de fichas que ha puesto el jugador 2
 * 									en el tablero
 * @property {Number} victorias		El nº de victorias del jugador 2
 * @property {Number} empates		El nº de empates del jugador 2 con el jugador 1
 * @property {Number} derrotas		El nº de derrotas del jugador 2
 */
const jugador2 = {
	ficha: "0",
	numFichas: 0,
	victorias: 0,
	empates: 0,
	derrotas: 0
};

/**
 * Objeto que almacena toda la información del juego
 * @property {String} tipo				El tipo de juego (9 o 6 fichas)
 * @property {String} modo				El modo de juego (1 vs aleatorio,
 * 										1 vs IA, 2 jugadores)
 * @property {Object} jugadorTurno		El jugador que tiene el turno en ese momento
 * @property {Object} inicio			La fecha en la que comienza la partida
 * @property {Number} cronometro		El ID del setInterval que controla el tiempo
 * 										de partida
 * @property {Number} cuentaAtrasTurno  El ID del setInterval que controla el tiempo
 * 										que tiene un jugador para poner ficha
 * @property {Array.<string>} tablero	Matriz que representa el tablero de la partida
 */
const juego = {
	tipo: "9 fichas",
	modo: "1 vs aleatorio",
	jugadorTurno: jugador1,
	inicio: new Date(),
	cronometro: 0,
	cuentaAtrasTurno: 0,
	tablero: [
		["", "", ""],
		["", "", ""],
		["", "", ""]
	]
};

/**
 * Añade el evento click a las celdas del tablero html para que el jugador
 * pueda poner fichas
 */
function activarCeldas() {
	const celdas = document.querySelectorAll(".celda");
	celdas.forEach((celda) => celda.addEventListener("click", jugarTurno));
}

/**
 * Elimina el evento click de las celdas del tablero html para que el jugador
 * no pueda poner ninguna ficha más
 */
function desactivarCeldas() {
	const celdas = document.querySelectorAll(".celda");
	celdas.forEach((celda) => celda.removeEventListener("click", jugarTurno));
}

/**
 * Permite mostrar un elemento HTML oculto
 * @param {HTMLElement} elemento	El elemento que se quiere mostrar
 */
function mostrarElemento(elemento) {
	elemento.classList.remove("ocultar");
}

/**
 * Permite ocultar un elemento HTML
 * @param {HTMLElement} elemento	El elemento que se quiere ocultar
 */
function ocultarElemento(elemento) {
	elemento.classList.add("ocultar");
}

/* Se ejecuta también al cargar la página para por si se queda guardado el anterior modo
			y tipo de juego, que el nombre del jugador 2 sea el correcto */
cambiarRadioTurnoJug2(document.querySelector("input[name='inp-modo-juego']:checked"));

/**
 * Cambia el nombre del jugador 2 en el apartado de turnos del formulario al elegir
 * otro modo de juego (otro contrincante)
 * @param {HTMLElement} radioInput		El input radio seleccionado en el apartado de
 * 										modo de juego del formulario
 */
function cambiarRadioTurnoJug2(radioInput) {
	const radioJug2 = document.getElementById("turno-jug2");
	if (radioInput.value == "1 vs aleatorio") {
		/* Se cambia tanto el valor del input radio del turno del jugador 2
					como el texto de la label asociada */
		radioJug2.value = "aleatorio";
		radioJug2.nextElementSibling.textContent = "Aleatorio";
	} else if (radioInput.value == "1 vs IA") {
		radioJug2.value = "IA";
		radioJug2.nextElementSibling.textContent = "IA";
	} else {
		radioJug2.value = "jugador 2";
		radioJug2.nextElementSibling.textContent = "Jugador 2";
	}
}

/**
 * Reinicia la partida con el mismo modo y tipo de juego
 */
function reiniciarPartida() {
	pararCronometro(juego.cronometro);

	pararCronometro(juego.cuentaAtrasTurno);

	inicializarPartida();
}

/**
 * Le vuelve a pedir al jugador que introduzca el tipo y modo de juego
 * para iniciar una nueva partida
 */
function nuevaPartida() {
	pararCronometro(juego.cronometro);

	pararCronometro(juego.cuentaAtrasTurno);

	const formOpciones = document.getElementById("form-opciones-juego");
	mostrarElemento(formOpciones);
}

/**
 * Prepara las variables y elementos html necesarios para que el jugador
 * pueda jugar una partida según el tipo y modo de juego elegidos por él mismo
 */
function inicializarPartida() {
	inicializarTipoYModo();

	inicializarTurnos();

	actualizarNombreJugador2();

	borrarCeldas();

	jugador1.numFichas = 0;
	jugador2.numFichas = 0;

	const formOpciones = document.getElementById("form-opciones-juego");
	ocultarElemento(formOpciones);

	// Se ponen en marcha los cronómetros de juego (el de juego y el de jugador)
	inicializarTiempos();

	reiniciarEstiloCeldas();

	activarCeldas();

	if (juego.jugadorTurno === jugador2) {
		if (juego.modo == "1 vs aleatorio") {
			desactivarCeldas();
			setTimeout(elegirJugadaAleatoria, 1000);
		}

		if (juego.modo == "1 vs IA") {
			desactivarCeldas();
			setTimeout(elegirMejorJugada, 1000);
		}
	}
}

/**
 * Recoge el tipo y modo de juego elegidos por el jugador y guarda dicha información
 */
function inicializarTipoYModo() {
	juego.tipo = document.querySelector("input[name='inp-tipo-juego']:checked").value;
	juego.modo = document.querySelector("input[name='inp-modo-juego']:checked").value;

	const pTipoJuego = document.getElementById("tipo-juego");
	pTipoJuego.textContent = juego.tipo;

	const pModoJuego = document.getElementById("modo-juego");
	/* Si el jugador decide volver a jugar o empezar con otro modo de juego (es decir, decide
				jugar contra un contrincante distinto), se resetean las puntuaciones en lugar de mantenerlas 
				y se actualiza el texto del modo de juego de la página */
	if (juego.modo != pModoJuego.textContent || juego.tipo != pTipoJuego.textContent) {
		reiniciarResultados();
		pModoJuego.textContent = juego.modo;
	}
}

/**
 * Pone las puntuaciones de ambos jugadores a 0 y actualiza la tabla de resultados
 * html
 */
function reiniciarResultados() {
	jugador1.victorias = 0;
	jugador1.empates = 0;
	jugador1.derrotas = 0;

	jugador2.victorias = 0;
	jugador2.empates = 0;
	jugador2.derrotas = 0;

	actualizarTablaPuntos();
}

/**
 * Recoge la información de quién va a empezar la partida y colorea las fichas
 * de encima del tablero html con los colores correspondientes
 */
function inicializarTurnos() {
	const turno = document.querySelector("input[name='inp-turno']:checked").value;
	const fichaX = document.getElementById("ficha-x");
	const fichaO = document.getElementById("ficha-o");
	if (turno == "Jugador 1") {
		juego.jugadorTurno = jugador1;
		jugador1.ficha = "X";
		jugador2.ficha = "O";
		fichaX.classList.add("azul");
		fichaX.classList.remove("rosa");
		fichaO.classList.remove("rosa");
		fichaO.classList.remove("azul");
	} else {
		juego.jugadorTurno = jugador2;
		jugador1.ficha = "O";
		jugador2.ficha = "X";
		fichaX.classList.remove("azul");
		fichaX.classList.add("rosa");
		fichaO.classList.remove("rosa");
		fichaO.classList.remove("azul");
	}
}

/**
 * Actualiza l nombre del jugador 2 en la tabla de puntuaciones
 */
function actualizarNombreJugador2() {
	const nombreJugador2 = document.getElementById("nombreJugador2");
	if (juego.modo == "1 vs aleatorio") {
		nombreJugador2.textContent = "Aleatorio";
	} else if (juego.modo == "1 vs IA") {
		nombreJugador2.textContent = "IA";
	} else {
		nombreJugador2.textContent = "Jugador 2";
	}
}

/**
 * Vacía tanto el tablero html como el tablero del objeto juego
 */
function borrarCeldas() {
	for (let i = 0; i < juego.tablero.length; i++) {
		for (let j = 0; j < juego.tablero[i].length; j++) {
			juego.tablero[i][j] = "";
		}
	}

	const celdas = document.getElementsByClassName("celda");
	for (let celda of celdas) {
		celda.textContent = "";
	}
}

/**
 * Inicializa los cronómetros de juego (el del juego y el del turno del jugador) y
 * guarda la fecha de inicio del juego
 */
function inicializarTiempos() {
	const tiempoJuego = document.getElementById("tiempo-juego");
	tiempoJuego.textContent = "0s";

	const tiempoJugador = document.getElementById("tiempo-restante");
	tiempoJugador.textContent = "30s";

	juego.inicio = new Date();

	juego.cronometro = inicializarTiempoJuego();

	juego.cuentaAtrasTurno = inicializarTiempoJugador();
}

/**
 * Permite que un jugador pueda colocar una ficha en una celda del tablero html
 * @param {MouseEvent} e	El evento que provoca que se ejecute la función
 */
function jugarTurno(e) {
	let celdaPulsada = e.target;

	// Si el jugador quiere poner una ficha, sólo la puede poner en una celda vacía
	if (celdaPulsada.textContent == "") {
		let celdaValida = ponerFichaJugador(celdaPulsada, juego.jugadorTurno);
		if (celdaValida) {
			let ganador = comprobarGanador(juego.jugadorTurno.ficha);
			if (ganador == "no hay ganador") {
				reiniciarTiempoJugador();

				cambiarTurno();

				cambiarColorTurno();

				if (juego.modo == "1 vs aleatorio") {
					desactivarCeldas();
					setTimeout(elegirJugadaAleatoria, 1000);
				}

				if (juego.modo == "1 vs IA") {
					desactivarCeldas();
					setTimeout(elegirMejorJugada, 1000);
				}
			} else {
				finalizarPartida(ganador);
			}
		}
		/* Si el jugador quiere quitar una ficha, sólo la puede quitar de una celda
				que tenga una ficha suya */
	} else if (celdaPulsada.textContent == juego.jugadorTurno.ficha) {
		quitarFichaJugador(celdaPulsada, juego.jugadorTurno);
	}
}

/**
 * Cambia el turno de un jugador a otro
 */
function cambiarTurno() {
	if (juego.jugadorTurno === jugador1) {
		juego.jugadorTurno = jugador2;
	} else {
		juego.jugadorTurno = jugador1;
	}
}

/**
 * Cambiar de color las fichas de encima del tablero html para indicar que
 * ahora le toca al otro jugador
 */
function cambiarColorTurno() {
	const fichaX = document.getElementById("ficha-x");
	const fichaO = document.getElementById("ficha-o");
	if (jugador1.ficha == "X") {
		fichaX.classList.toggle("azul");
		fichaO.classList.toggle("rosa");
	} else {
		fichaX.classList.toggle("rosa");
		fichaO.classList.toggle("azul");
	}
}

/**
 * Comprueba si el jugador puede poner una ficha en la celda elegida,
 * y si sí puede, la pone tanto en el tablero del objeto juego como en el tablero
 * html.
 * @param {HTMLElement} celda	La celda que ha seleccionado el jugador
 * @param {Object} jugador		El jugador que ha seleccionado la celda
 */
function ponerFichaJugador(celda, jugador) {
	let celdaValida = false;
	if (juego.tipo == "9 fichas" || (juego.tipo == "6 fichas" && jugador.numFichas < 3)) {
		let filaCelda = celda.id[5];
		let columnaCelda = celda.id[6];

		juego.tablero[filaCelda][columnaCelda] = jugador.ficha;
		celda.textContent = jugador.ficha;

		cambiarColorCelda(celda, jugador);

		jugador.numFichas++;

		celdaValida = true;
	}

	return celdaValida;
}

/**
 * Comprueba si el jugador puede quitar una ficha de la celda elegida,
 * y si sí puede, la quita tanto en el tablero del objeto juego como en el tablero
 * html.
 * @param {HTMLElement} celda	La celda que ha seleccionado el jugador
 * @param {Object} jugador		El jugador que ha seleccionado la celda
 */
function quitarFichaJugador(celda, jugador) {
	let celdaValida = false;

	if (juego.tipo == "6 fichas" && jugador.numFichas == 3) {
		let filaCelda = celda.id[5];
		let columnaCelda = celda.id[6];

		juego.tablero[filaCelda][columnaCelda] = "";
		celda.textContent = "";

		jugador.numFichas--;

		celdaValida = true;
	}

	return celdaValida;
}

/**
 * Cambiar el color de texto de la celda elegida por el jugador que toque a su
 * color correspondiente
 * @param {HTMLElement} elemento
 */
function cambiarColorCelda(celda, jugador) {
	if (jugador === jugador1) {
		celda.classList.remove("rosa");
		celda.classList.add("azul");
	} else {
		celda.classList.remove("azul");
		celda.classList.add("rosa");
	}
}

/**
 * Elige la siguiente jugada aleatoria del jugador 2 (ordenador)
 */
function elegirJugadaAleatoria() {
	if (juego.tipo == "6 fichas" && jugador2.numFichas == 3) {
		let fichaQuitada = quitarFichaAleatoria();
		ponerFichaAleatoria(fichaQuitada);
	} else {
		ponerFichaAleatoria();
	}

	let ganador = comprobarGanador(jugador2.ficha);
	if (ganador == "no hay ganador") {
		cambiarTurno();
		cambiarColorTurno();
		activarCeldas();
		reiniciarTiempoJugador();
	} else {
		finalizarPartida(ganador);
	}
}

/**
 * Pone una ficha del jugador 2 (ordenador) en una celda aleatoria
 * @param {String} [fichaQuitada = "--"]	String de 2 caracteres que indica la fila
 * 											(fichaQuitada[0]) y la columna (fichaQuitada[1])
 * 											de la celda de la que se ha quitado una ficha
 * 											en el caso de que se esté jugando a 6 fichas
 * 											y justo antes el ordenador haya quitado una.
 * 											El parámetro es opcional.
 */
function ponerFichaAleatoria(fichaQuitada = "--") {
	let celdaValida = false;
	let fila;
	let columna;
	do {
		fila = Math.floor(Math.random() * 3);
		columna = Math.floor(Math.random() * 3);
		if (juego.tablero[fila][columna] == "" && (fila != fichaQuitada[0] || columna != fichaQuitada[1])) {
			celdaValida = true;
		}
	} while (!celdaValida);

	juego.tablero[fila][columna] = jugador2.ficha;
	const celda = document.getElementById(`celda${fila}${columna}`);
	celda.textContent = jugador2.ficha;

	cambiarColorCelda(celda, jugador2.ficha);
	jugador2.numFichas++;
}

/**
 * Quita una ficha del jugador 2 (ordenador) del tablero de forma aleatoria
 * @returns {String} 	string de 2 caracteres que indica la fila (string[0]) y la
 * 						columna (string[1]) de la celda en la que estaba la ficha
 * 						que se ha quitado
 */
function quitarFichaAleatoria() {
	let celdaValida = false;
	let fila;
	let columna;
	do {
		fila = Math.floor(Math.random() * 3);
		columna = Math.floor(Math.random() * 3);
		if (juego.tablero[fila][columna] == jugador2.ficha) {
			celdaValida = true;
		}
	} while (!celdaValida);

	juego.tablero[fila][columna] = "";
	const celda = document.getElementById(`celda${fila}${columna}`);
	celda.textContent = "";

	jugador2.numFichas--;

	return `${fila}${columna}`;
}

/**
 * Elige y ejecuta la mejor jugada posible que puede realizar la IA tanto en una partida
 * a 9 fichas como en una partida a 6 fichas
 */
function elegirMejorJugada() {
	let jugada;
	if (juego.tipo == "6 fichas" && jugador2.numFichas == 3) {
		jugada = evaluarMejorCelda6Fichas(jugador2.ficha);

		juego.tablero[jugada[0].fila][jugada[0].col] = "";
		const celdaQuitada = document.getElementById(`celda${jugada[0].fila}${jugada[0].col}`);
		celdaQuitada.textContent = "";

		juego.tablero[jugada[1].fila][jugada[1].col] = jugador2.ficha;
		const celdaPuesta = document.getElementById(`celda${jugada[1].fila}${jugada[1].col}`);
		celdaPuesta.textContent = jugador2.ficha;

		cambiarColorCelda(celdaPuesta, jugador2.ficha);
	} else {
		jugada = evaluarMejorCelda(jugador2.ficha);

		juego.tablero[jugada.fila][jugada.col] = jugador2.ficha;
		const celda = document.getElementById(`celda${jugada.fila}${jugada.col}`);
		celda.textContent = jugador2.ficha;

		cambiarColorCelda(celda, jugador2.ficha);
		jugador2.numFichas++;
	}

	let ganador = comprobarGanador(jugador2.ficha);
	if (ganador == "no hay ganador") {
		activarCeldas();
		cambiarTurno();
		cambiarColorTurno();
		reiniciarTiempoJugador();
	} else {
		finalizarPartida(ganador);
	}
}

/**
 * Implementación del algoritmo minimax. Analiza todos los movimientos posibles en una partida
 * de 9 fichas según el tablero actual y devuelve la celda mejor posicionada para que el ordenador gane
 * @param {String} ficha				La ficha del jugador con el turno actual
 * @param {Boolean} [turnoIA = true]	Si le toca mover a la IA o al jugador
 * @param {Number} [numJugadas = 0]		El número de jugadas que ha realizado la
 * 										función en una rama del árbol.
 * @param {Number} [fila = 0]			El número de fila de la última ficha colocada
 * 										en el tablero
 * @param {Number} [col = 0]			El número de columna de la última ficha colocada
 * 										en el tablero
 * @returns {Object} mejorCelda			La celda mejor posicionada para que el ordenador
 * 										gane. Tiene las propiedades de fila (fila de
 * 										la celda), col (columna de la celda), valor (el
 * 										valor de la celda en sí)
 */
function evaluarMejorCelda(ficha, turnoIA = true, numJugadas = 0, fila = 0, col = 0) {
	let mejorCelda;

	let ganador = comprobarGanador(ficha);
	if (ganador == "jugador2") {
		// Si gana el ordenador se devuelve una puntuación mayor teniendo en cuenta también el nº de jugadas realizadas
		mejorCelda = { fila: fila, col: col, valor: 20 - numJugadas };
		return mejorCelda;
	} else if (ganador == "jugador1") {
		// Si gana el jugador se devuelve una puntuación menor
		mejorCelda = { fila: fila, col: col, valor: -20 + numJugadas };
		return mejorCelda;
	} else if (ganador == "empate") {
		mejorCelda = { fila: fila, col: col, valor: 0 };
		return mejorCelda;
	} else {
		if (turnoIA) {
			ficha = jugador2.ficha;
			mejorCelda = maxValorCelda(ficha, turnoIA, numJugadas);
		} else {
			ficha = jugador1.ficha;
			mejorCelda = minValorCelda(ficha, turnoIA, numJugadas);
		}
		return mejorCelda;
	}
}

/**
 * De todas las jugadas posibles que puede realizar el ordenador, elige la que tenga un valor mayor
 * ya que será la jugada más óptima
 * @param {String} ficha			La ficha del ordenador
 * @param {Boolean} turnoIA			Si le toca al ordenador o no, que en este caso siempre será que sí
 * @param {Number} numJugadas		El número de movimientos que se han realizado en esa rama del árbol
 * 									de posibles jugadas
 * @returns {Object} mejorCelda		La celda mejor posicionada para que el ordenador
 * 									gane. Tiene las propiedades de fila (fila de
 * 									la celda), col (columna de la celda), valor (el
 * 									valor de la celda en sí)
 */
function maxValorCelda(ficha, turnoIA, numJugadas) {
	let mejorCelda;
	let mejorValor = -1000; // Valor auxiliar para comparar con el valor de las celdas

	for (let i = 0; i < juego.tablero.length; i++) {
		for (let j = 0; j < juego.tablero[i].length; j++) {
			/* Si se encuentra una celda vacía, se pone la ficha y se vuelve a llamar
						a la función para ver si con esa jugada se gana o hay que continuar con
						esa rama del árbol de jugadas posibles */
			if (juego.tablero[i][j] == "") {
				juego.tablero[i][j] = ficha;
				let valor = evaluarMejorCelda(ficha, !turnoIA, numJugadas + 1, i, j).valor;

				/* Si se encuentra una jugada mejor que la guardada previamente, se
							actualiza el objeto a devolver */
				if (valor > mejorValor) {
					mejorValor = valor;
					mejorCelda = { fila: i, col: j, valor: mejorValor };

					/* Si la jugada tiene un valor igual al guardado se aleatoriza cuál se mantiene para que
							el ordenador no realice exactamente la misma jugada en todas las partidas */
				} else if (valor == mejorValor) {
					let modificar = Math.random() < 0.5 ? true : false;
					if (modificar) {
						mejorValor = valor;
						mejorCelda = { fila: i, col: j, valor: mejorValor };
					}
				}
				juego.tablero[i][j] = "";
			}
		}
	}

	return mejorCelda;
}

/**
 * De todas las jugadas posibles que puede realizar el jugador 1, elige la que tenga un valor menor
 * ya que será la jugada que le vendría peor al ordenador porque es la mejor jugada que puede hacer
 * el jugador 1 y se asume que el jugador 1 juega óptimamente
 * @param {String} ficha			La ficha del jugador 1
 * @param {Boolean} turnoIA			Si le toca al ordenador o no, que en este caso siempre será que no
 * @param {Number} numJugadas		El número de movimientos que se han realizado en esa rama del árbol
 * 									de posibles jugadas
 * @returns {Object} mejorCelda		La celda mejor posicionada para que el jugador
 * 									gane. Tiene las propiedades de fila (fila de
 * 									la celda), col (columna de la celda), valor (el
 * 									valor de la celda en sí)
 */
function minValorCelda(ficha, turnoIA, numJugadas) {
	let mejorCelda;
	let mejorValor = 1000; // Valor auxiliar para comparar con el valor de las celdas

	for (let i = 0; i < juego.tablero.length; i++) {
		for (let j = 0; j < juego.tablero[i].length; j++) {
			/* Si se encuentra una celda vacía, se pone la ficha y se vuelve a llamar
						a la función para ver si con esa jugada se termina el juego o hay que continuar con
						esa rama del árbol de jugadas posibles */
			if (juego.tablero[i][j] == "") {
				juego.tablero[i][j] = ficha;
				let valor = evaluarMejorCelda(ficha, !turnoIA, numJugadas + 1, i, j).valor;

				/* En este caso se está jugando por el jugador 1 y no por el ordenador por lo que
							se selecciona el valor de celda menor */
				if (valor < mejorValor) {
					mejorValor = valor;
					mejorCelda = { fila: i, col: j, valor: mejorValor };

					// Si la jugada tiene un valor igual al guardado se aleatoriza cuál se mantiene
				} else if (valor == mejorValor) {
					let modificar = Math.random() < 0.5 ? true : false;
					if (modificar) {
						mejorValor = valor;
						mejorCelda = { fila: i, col: j, valor: mejorValor };
					}
				}
				juego.tablero[i][j] = "";
			}
		}
	}

	return mejorCelda;
}

/**
 * Implementación del algoritmo minimax. Analiza todos los movimientos posibles en la partida
 * de 6 fichas según el tablero actual y devuelve la ficha a quitar y la celda mejor posicionada
 * para que el ordenador gane
 * @param {String} ficha				La ficha del jugador con el turno actual
 * @param {Boolean} [turnoIA = true]	Si le toca mover a la IA o al jugador
 * @param {Number} [numJugadas = 0]		El número de jugadas que ha realizado la
 * 										función en una rama del árbol.
 * @param {Number} [fila = 0]			El número de fila de la última ficha colocada
 * 										en el tablero
 * @param {Number} [col = 0]			El número de columna de la última ficha colocada
 * 										en el tablero
 * @returns {Array<Object>} mejorCelda	La ficha a quitar y la celda mejor posicionada para
 * 										que el ordenador gane. Su primer elemento tiene las
 * 										propiedades de fila (fila de la ficha a quitar) y col
 * 										(columna de la ficha a quitar.
 * 										Su segundo elemento tiene las propiedades de fila (fila de
 * 										la mejor celda), col (columna de la mejor celda), valor (el
 * 										valor de la celda en sí)
 */
function evaluarMejorCelda6Fichas(ficha, turnoIA = true, numJugadas = 0, fila = 0, col = 0) {
	let mejorCelda;

	let ganador = comprobarGanador(ficha);
	if (ganador == "jugador2") {
		// Si gana el ordenador se devuelve una puntuación mayor
		mejorCelda = [
			{ fila: fila, col: col },
			{ fila: fila, col: col, valor: 20 - numJugadas }
		];
		return mejorCelda;
	} else if (ganador == "jugador1") {
		// Si gana el jugador se devuelve una puntuación menor
		mejorCelda = [
			{ fila: fila, col: col },
			{ fila: fila, col: col, valor: -20 + numJugadas }
		];
		return mejorCelda;

		/* Se evita que la función entre en bucle analizando sólo hasta 5 movimientos
				de una rama del árbol de jugadas */
	} else if (numJugadas == 5) {
		mejorCelda = [
			{ fila: fila, col: col },
			{ fila: fila, col: col, valor: 0 }
		];
		return mejorCelda;
	} else {
		if (turnoIA) {
			ficha = jugador2.ficha;
			mejorCelda = maxValorCelda6Fichas(ficha, turnoIA, numJugadas);
		} else {
			ficha = jugador1.ficha;
			mejorCelda = minValorCelda6Fichas(ficha, turnoIA, numJugadas);
		}
		return mejorCelda;
	}
}

/**
 * De todas las jugadas posibles que puede realizar el ordenador, elige la que tenga un valor mayor
 * ya que será la jugada más óptima
 * @param {String} ficha			La ficha del ordenador
 * @param {Boolean} turnoIA			Si le toca al ordenador o no, que en este caso siempre será que sí
 * @param {Number} numJugadas		El número de movimientos que se han realizado en esa rama del árbol
 * 									de posibles jugadas
 * @returns {Object} mejorCelda		La ficha a quitar y la celda mejor posicionada para
 * 									que el ordenador gane. Su primer elemento tiene las
 * 									propiedades de fila (fila de la ficha a quitar) y col
 * 									(columna de la ficha a quitar.
 * 									Su segundo elemento tiene las propiedades de fila (fila de
 * 									la mejor celda), col (columna de la mejor celda), valor (el
 * 									valor de la celda en sí)
 */
function maxValorCelda6Fichas(ficha, turnoIA, numJugadas) {
	let mejorCelda;
	let mejorValor = -1000; // Valor auxiliar para comparar con el valor de las celdas

	for (let i = 0; i < juego.tablero.length; i++) {
		for (let j = 0; j < juego.tablero[i].length; j++) {
			/* Si se encuentra una ficha del ordenador, la quita y analiza dónde es mejor
						poner dicha ficha */
			if (juego.tablero[i][j] == ficha) {
				juego.tablero[i][j] = "";
				let fichaQuitada = `${i}${j}`;

				for (let k = 0; k < juego.tablero.length; k++) {
					for (let l = 0; l < juego.tablero[k].length; l++) {
						/* Si se encuentra con una celda vacía en el tablero que no es la
									celda de la ficha quitada anteriormente, coloca ahí la ficha y
									vuelve a llamar a la función para analizar si se puede ganar
									así o hay que seguir analizando jugadas */
						if (juego.tablero[k][l] == "" && (k != fichaQuitada[0] || l != fichaQuitada[1])) {
							juego.tablero[k][l] = ficha;
							let valor = evaluarMejorCelda6Fichas(ficha, !turnoIA, numJugadas + 1, k, l)[1].valor;

							/* Si se encuentra una jugada mejor que la guardada previamente, se
										actualiza el objeto a devolver */
							if (valor > mejorValor) {
								mejorValor = valor;
								mejorCelda = [
									{ fila: i, col: j },
									{ fila: k, col: l, valor: mejorValor }
								];

								/* Si la jugada tiene un valor igual al guardado se aleatoriza cuál se mantiene para que
										el ordenador no realice exactamente la misma jugada en todas las partidas */
							} else if (valor == mejorValor) {
								let modificar = Math.random() < 0.5 ? true : false;
								if (modificar) {
									mejorValor = valor;
									mejorCelda = [
										{ fila: i, col: j },
										{ fila: k, col: l, valor: mejorValor }
									];
								}
							}
							juego.tablero[k][l] = "";
						}
					}
				}
				juego.tablero[i][j] = ficha;
			}
		}
	}

	return mejorCelda;
}

/**
 * De todas las jugadas posibles que puede realizar el jugador 1, elige la que tenga un valor menor
 * ya que será la jugada que le vendría peor al ordenador porque es la mejor jugada que puede hacer
 * el jugador 1 y se asume que el jugador 1 juega óptimamente
 * @param {String} ficha			La ficha del jugador 1
 * @param {Boolean} turnoIA			Si le toca al ordenador o no, que en este caso siempre será que no
 * @param {Number} numJugadas		El número de movimientos que se han realizado en esa rama del árbol
 * 									de posibles jugadas
 * @returns {Object} mejorCelda		La ficha a quitar y la celda mejor posicionada para
 * 									que el jugador gane. Su primer elemento tiene las
 * 									propiedades de fila (fila de la ficha a quitar) y col
 * 									(columna de la ficha a quitar.
 * 									Su segundo elemento tiene las propiedades de fila (fila de
 * 									la mejor celda), col (columna de la mejor celda), valor (el
 * 									valor de la celda en sí)
 */
function minValorCelda6Fichas(ficha, turnoIA, numJugadas) {
	let mejorCelda;
	let mejorValor = 1000; // Valor auxiliar para comparar con el valor de las celdas

	for (let i = 0; i < juego.tablero.length; i++) {
		for (let j = 0; j < juego.tablero[i].length; j++) {
			/* Si se encuentra una ficha del jugador, la quita y analiza dónde es mejor
						poner dicha ficha */
			if (juego.tablero[i][j] == ficha) {
				juego.tablero[i][j] = "";
				let fichaQuitada = `${i}${j}`;

				for (let k = 0; k < juego.tablero.length; k++) {
					for (let l = 0; l < juego.tablero[k].length; l++) {
						/* Si se encuentra con una celda vacía en el tablero que no es la
									celda de la ficha quitada anteriormente, coloca ahí la ficha y
									vuelve a llamar a la función para analizar si se termina la partida
									así o hay que seguir analizando jugadas */
						if (juego.tablero[k][l] == "" && (k != fichaQuitada[0] || l != fichaQuitada[1])) {
							juego.tablero[k][l] = ficha;
							let valor = evaluarMejorCelda6Fichas(ficha, !turnoIA, numJugadas + 1, k, l)[1].valor;

							/* En este caso se está jugando por el jugador 1 y no por el ordenador por lo que
										se selecciona el valor de celda menor */
							if (valor < mejorValor) {
								mejorValor = valor;
								mejorCelda = [
									{ fila: i, col: j },
									{ fila: k, col: l, valor: mejorValor }
								];

								// Si la jugada tiene un valor igual al guardado se aleatoriza cuál se mantiene
							} else if (valor == mejorValor) {
								let modificar = Math.random() < 0.5 ? true : false;
								if (modificar) {
									mejorValor = valor;
									mejorCelda = [
										{ fila: i, col: j },
										{ fila: k, col: l, valor: mejorValor }
									];
								}
							}
							juego.tablero[k][l] = "";
						}
					}
				}
				juego.tablero[i][j] = ficha;
			}
		}
	}

	return mejorCelda;
}

/**
 * Finaliza la partida actual
 * @param {String} ganador		El ganador de la partida
 */
function finalizarPartida(ganador) {
	desactivarCeldas();

	sumarPunto(ganador);

	pararCronometro(juego.cronometro);

	pararCronometro(juego.cuentaAtrasTurno);

	if (ganador == "jugador1") {
		setTimeout(resaltarCeldasGanadoras, 700, jugador1.ficha);
	} else if (ganador == "jugador2") {
		setTimeout(resaltarCeldasGanadoras, 700, jugador2.ficha);
	} else {
		resaltarCeldasGanadoras("-");
	}

	setTimeout(mostrarGanador, 1300, ganador);

	setTimeout(actualizarTablaPuntos, 1300);
}

/**
 * Comprueba si ya hay algún ganador en el juego
 * @param {String} ficha		La ficha del último jugador que ha puesto alguna
 * 								ficha en el tablero
 * @returns {String} 			El ganador del juego: "jugador1", "jugador2",
 * 								"empate", "no hay ganador"
 */
function comprobarGanador(ficha) {
	// Sólo se comprueba si ha ganado el último jugador que ha jugado
	if (ficha == jugador1.ficha) {
		if (ganaPartida(ficha)) {
			return "jugador1";
		}
	} else {
		if (ganaPartida(ficha)) {
			return "jugador2";
		}
	}

	// Se comprueba si hay un empate
	let tableroRelleno = true;
	for (let fila of juego.tablero) {
		for (let celda of fila) {
			if (celda == "") {
				tableroRelleno = false;
				break;
			}
		}

		if (!tableroRelleno) {
			break;
		}
	}

	if (tableroRelleno) {
		return "empate";
	} else {
		return "no hay ganador";
	}
}

/**
 * Comprueba si hay tres fichas iguales en alguna fila, columna o diagonal
 * de una ficha dada
 * @param {String} ficha		La ficha de la que se quiere comprobar si hay
 * 								tres fichas seguidas en alguna fila/columna/diagonal
 * @returns {Boolean}			true si hay tres fichas en alguna fila, columna o
 * 								diagonal, y false si no hay tres fichas en ningún
 * 								lado
 */
function ganaPartida(ficha) {
	for (let i = 0; i < juego.tablero.length; i++) {
		if (juego.tablero[i][0] == ficha && juego.tablero[i][1] == ficha && juego.tablero[i][2] == ficha) {
			return true;
		}
	}

	for (let i = 0; i < juego.tablero[0].length; i++) {
		if (juego.tablero[0][i] == ficha && juego.tablero[1][i] == ficha && juego.tablero[2][i] == ficha) {
			return true;
		}
	}

	if (juego.tablero[0][0] == ficha && juego.tablero[1][1] == ficha && juego.tablero[2][2] == ficha) {
		return true;
	} else if (juego.tablero[2][0] == ficha && juego.tablero[1][1] == ficha && juego.tablero[0][2] == ficha) {
		return true;
	} else {
		return false;
	}
}

/**
 * Muestra quién es el ganador del juego por pantalla
 * @param {String} ganador		El ganador del juego
 */
function mostrarGanador(ganador) {
	const textoResultado = document.getElementById("texto-resultado");
	if (ganador == "jugador1") {
		textoResultado.textContent = "¡Ha ganado el jugador 1!";
	} else if (ganador == "jugador2") {
		if (juego.modo == "2 jugadores") {
			textoResultado.textContent = "¡Ha ganado el jugador 2!";
		} else {
			textoResultado.textContent = "¡Ha ganado el ordenador!";
		}
	} else {
		textoResultado.textContent = "¡Empate!";
	}

	const resultado = document.getElementById("resultado");
	mostrarElemento(resultado);
}

/**
 * Suma los puntos corespondientes a cada jugador
 * @param {String} ganador		El ganador del juego
 */
function sumarPunto(ganador) {
	switch (ganador) {
		case "jugador1":
			jugador1.victorias++;
			jugador2.derrotas++;
			break;
		case "jugador2":
			jugador1.derrotas++;
			jugador2.victorias++;
			break;
		case "empate":
			jugador1.empates++;
			jugador2.empates++;
	}
}

/**
 * Actualiza la tabla de puntos del DOM
 */
function actualizarTablaPuntos() {
	const puntosJugador1 = document.getElementById("puntos-jugador1");
	puntosJugador1.textContent = jugador1.victorias;

	const puntosEmpate = document.getElementById("puntos-empate");
	puntosEmpate.textContent = jugador1.empates;

	const puntosJugador2 = document.getElementById("puntos-jugador2");
	puntosJugador2.textContent = jugador2.victorias;
}

/**
 * Resalta las celdas en las que se encuentran las tres fichas que han formado el tres en raya
 * @param {String} ficha		La ficha del ganador de la partida
 */
function resaltarCeldasGanadoras(ficha) {
	celdasGanadoras = [];
	for (let i = 0; i < juego.tablero.length; i++) {
		if (juego.tablero[i][0] == ficha && juego.tablero[i][1] == ficha && juego.tablero[i][2] == ficha) {
			celdasGanadoras.push({ fila: i, col: 0 }, { fila: i, col: 1 }, { fila: i, col: 2 });
		}
	}

	for (let i = 0; i < juego.tablero[0].length; i++) {
		if (juego.tablero[0][i] == ficha && juego.tablero[1][i] == ficha && juego.tablero[2][i] == ficha) {
			celdasGanadoras.push({ fila: 0, col: i }, { fila: 1, col: i }, { fila: 2, col: i });
		}
	}

	if (juego.tablero[0][0] == ficha && juego.tablero[1][1] == ficha && juego.tablero[2][2] == ficha) {
		celdasGanadoras.push({ fila: 0, col: 0 }, { fila: 1, col: 1 }, { fila: 2, col: 2 });
	} else if (juego.tablero[2][0] == ficha && juego.tablero[1][1] == ficha && juego.tablero[0][2] == ficha) {
		celdasGanadoras.push({ fila: 2, col: 0 }, { fila: 1, col: 1 }, { fila: 0, col: 2 });
	}

	const celdas = document.getElementsByClassName("celda");

	for (let celda of celdas) {
		celda.classList.add("no-hover");
		if (
			celdasGanadoras.length > 0 &&
			(celda.id == `celda${celdasGanadoras[0].fila}${celdasGanadoras[0].col}` ||
				celda.id == `celda${celdasGanadoras[1].fila}${celdasGanadoras[1].col}` ||
				celda.id == `celda${celdasGanadoras[2].fila}${celdasGanadoras[2].col}`)
		) {
			celda.classList.add("celda-ganadora");
		}
	}
}

/**
 * Devuelve todas las celdas a su estilo original (el estilo que tenían al empezar la partida)
 */
function reiniciarEstiloCeldas() {
	const celdas = document.getElementsByClassName("celda");

	for (let celda of celdas) {
		celda.classList.remove("no-hover");
		celda.classList.remove("celda-ganadora");
	}
}

/**
 * Inicializa el cronómetro del juego
 * @returns {Number} 	El ID del setInterval del cronómetro del juego
 */
function inicializarTiempoJuego() {
	return setInterval(() => {
		const tiempoJuego = document.getElementById("tiempo-juego");
		tiempoJuego.textContent = calcularIntervalo(juego.inicio, new Date());
	}, 1000);
}

/**
 * Calcula el tiempo que ha pasado entre una fecha y otra
 * @param {Object} fecha1		La fecha menor
 * @param {Object} fecha2		La fecha mayor
 * @returns {String} tiempo		El tiempo que ha pasado entre una fecha
 * 								y otra
 */
function calcularIntervalo(fecha1, fecha2) {
	let horas = (fecha2 - fecha1) / (1000 * 60 * 60);
	let minutos = (horas - Math.floor(horas)) * 60;
	let segundos = (minutos - Math.floor(minutos)) * 60;

	horas = Math.floor(horas);
	minutos = Math.floor(minutos);
	segundos = Math.floor(segundos);

	let tiempo = "";
	if (horas != 0) {
		tiempo += `${horas}h `;
	}
	if (minutos != 0) {
		tiempo += `${minutos}min `;
	}
	tiempo += `${segundos}s`;

	return tiempo;
}

/**
 * Elimina un setInterval
 * @param {Number} intervalo	El ID del setInterval que se quiere eliminar
 */
function pararCronometro(intervalo) {
	clearInterval(intervalo);
}

/**
 * Inicializa el cronómetro del tiempo que tiene un jugador para poner una
 * ficha
 * @returns {Number} intervalo		El ID del setInterval del cronómetro
 * 									del tiempo del jugador
 */
function inicializarTiempoJugador() {
	const tiempoJugador = document.getElementById("tiempo-restante");
	tiempoJugador.textContent = "30s";

	let intervalo = setInterval(() => {
		tiempoJugador.textContent = `${parseInt(tiempoJugador.textContent) - 1}s`;

		/* Si el jugador no pone una ficha antes de que el cronómetro llegue
					a 0, habrá perdido */
		if (tiempoJugador.textContent == "0s") {
			let ganador;
			if (juego.jugadorTurno === jugador1) {
				ganador = "jugador2";
			} else {
				ganador = "jugador1";
			}
			finalizarPartida(ganador);
		}
	}, 1000);

	return intervalo;
}

/**
 * Reinicia la cuenta atrás del tiempo que tiene el jugador para poner
 * una ficha en su turno
 */
function reiniciarTiempoJugador() {
	pararCronometro(juego.cuentaAtrasTurno);

	juego.cuentaAtrasTurno = inicializarTiempoJugador();
}
