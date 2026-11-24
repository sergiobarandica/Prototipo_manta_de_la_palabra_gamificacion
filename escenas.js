/* La manta de la palabra · Prototipo 2.2 (versión 1)
   Contenido de la historia, separado del código del juego.
   Para adaptar el mundo a otra región basta con cambiar los valores de "lugar".
   Las marcas {arbol}, {zarigueya}, {zarigueyaLocal} y {escuela} se reemplazan al mostrar el texto. */

window.MUNDO = {
  version: '1.0 · noviembre de 2026',

  lugar: {
    escuela: 'Escuela de Los Guayacanes',
    arbol: 'guayacán',
    zarigueya: 'zarigüeya',
    zarigueyaLocal: 'fara'
  },

  personajes: {
    manu:      { nombre: 'Manu',        img: null, color: '#EF8F2A' },
    vale:      { nombre: 'Profe Vale',  img: 'img/vale.webp',   color: '#EF8F2A' },
    salome:    { nombre: 'Salomé',      img: 'img/salome.webp', color: '#0F7C72' },
    pipe:      { nombre: 'Pipe',        img: 'img/pipe.webp',   color: '#0638B6' },
    efrain:    { nombre: 'Don Efraín',  img: 'img/efrain.webp', color: '#264A48' },
    zas:       { nombre: 'Zas',         img: 'img/zas.webp',    color: '#9459BF' },
    guaya:     { nombre: 'Guaya',       img: 'img/guaya.webp',  color: '#7a6f66' },
    narrador:  { nombre: '',            img: null, color: '#2A2340' },
    companero: { nombre: 'Un compañero', img: 'img/companero.webp', color: '#555' },
    nino:      { nombre: 'Un niño de 3.º', img: null, color: '#555' },
    abuela:    { nombre: 'Abuela de Salomé (nota de voz)', img: null, color: '#C51F6C' }
  },

  hilos: {
    amarillo: { color: '#F7B53D', nombre: 'Hilo amarillo', competencia: 'Conocimientos' },
    magenta:  { color: '#C51F6C', nombre: 'Hilo magenta', competencia: 'Multiperspectivismo' },
    verde:    { color: '#0F7C72', nombre: 'Hilo verde', competencia: 'Pensamiento sistémico' },
    naranja:  { color: '#EF8F2A', nombre: 'Hilo naranja', competencia: 'Argumentación' },
    dorado:   { color: '#D4A017', nombre: 'Hilo dorado', competencia: 'Reto opcional' }
  },

  fichas: {
    dato_inicio: { titulo: 'Conoce a las zarigüeyas', texto: '<p>La {zarigueya} no es una rata: es un mamífero marsupial, pariente de los canguros. También la llaman chucha o {zarigueyaLocal}.</p><p><b>¿Por qué es importante?</b></p><p>Siembra árboles: come frutos y dispersa las semillas en otros lugares, así crecen plantas nuevas.</p><p>Controla poblaciones de insectos y de animales pequeños, como ciertos roedores.</p><p>Hace parte de la cadena alimentaria: también sirve de alimento a otros animales silvestres.</p><p><b>¿Sabías que...?</b></p><p>Las hembras tienen una bolsa llamada marsupio, donde las crías completan parte de su desarrollo.</p>' },
    consejo:     { titulo: 'El consejo estudiantil', texto: '<p>Es un grupo de estudiantes elegidos para representar a sus compañeros. Se reúnen para compartir ideas, escuchar distintas opiniones y presentar iniciativas que mejoren la vida en el colegio.</p><p><b>¿Qué hace?</b></p><p>Escucha las necesidades de los estudiantes.</p><p>Comparte propuestas e iniciativas.</p><p>Promueve la participación de sus compañeros.</p><p>Ayuda a construir soluciones para la comunidad escolar.</p>' },
    dato_m2:     { titulo: 'Dato real', texto: 'No es agresiva. Cuando se asusta, se hace la muerta o suelta un olor fuerte para defenderse.' }
  },

  tarjetas: {
    abuela_m2: { titulo: 'La palabra de la abuela', texto: '“En el cabildo, lo más importante lo decide la asamblea. Va por lo menos una persona de cada familia, y ni el gobernador puede pasar por encima de lo que ella decide. Los mayores acompañan cada decisión y piden pensar primero en el bien de todos, antes que en el de uno solo”.' }
  },

  objetos: {
    manta:    { nombre: 'La manta del curso', texto: 'Cada paso bien dado teje un hilo.' },
    guaya:    { nombre: 'Guaya', texto: 'Tu compañera. Mira sus gestos: te dicen cómo vas.' },
    cuaderno: { nombre: 'Cuaderno de miradas', texto: 'Guarda qué quiere cada persona y por qué. Puedes releerlo antes de decidir.' }
  },

  intro: 'video/intro.mp4',
  eleccion: { nino: 'video/eleccion_nino.mp4', nina: 'video/eleccion_nina.mp4' },
  inicio: 'i_titulo',

  escenas: {

    /* ================= INICIO · EL RUMOR DEL PATIO ================= */

    i_titulo: { tipo: 'titulo', etapa: 'Inicio', titulo: 'El rumor del patio',
      texto: 'Manu acaba de ganar la elección de representante de curso.', siguiente: 'i_salon' },

    i_salon: {
      tipo: 'dialogo', video: 'video/E01.mp4', etapa: 'Inicio', fondo: 'salon',
      elenco: [{ id: 'manu', pos: 'izq' }, { id: 'vale', pos: 'der' }],
      lineas: [
        { quien: 'manu', texto: 'Muchas gracias, profe Vale. Gané la elección por cuatro votos de diferencia. Usaré a diario esta escarapela de representante, para que mis compañeros me puedan reconocer.' },
        { quien: 'vale', texto: 'Muy bien, Manu. Este año el consejo estudiantil tiene una tarea grande. La escuela recibió recursos para arreglar la zona verde.', efecto: { ficha: 'consejo' } },
        { quien: 'vale', texto: 'Antes de fin de mes, cada curso debe llevar a la asamblea, a través de su representante, una propuesta para arreglar la zona verde. Cada vez que tu curso dé un paso bien dado, esta manta gana un hilo.', efecto: { mostrar: 'manta' } },
        { quien: 'narrador', texto: 'Sobre la mesa hay un telar pequeño. La manta solo tiene los hilos de base: está vacía. Mírala arriba, a la izquierda.' }
      ],
      siguiente: 'i_rumor'
    },

    i_rumor: {
      tipo: 'dialogo', videoFinal: 'video/E02.mp4', etapa: 'Inicio', fondo: 'salon_rumor',
      elenco: [{ id: 'manu', pos: 'izq' }],
      lineas: [
        { quien: 'narrador', texto: 'Al final de la clase, la tableta de Manu vibra. En el chat del curso, que acompaña la profe Vale, alguien escribió:' },
        { quien: 'narrador', chat: '¡Oigan! ¡Van a construir una cancha nueva en el colegio! 😃 Para hacerla van a quitar el {arbol} que está en la zona verde. ¡Empiezan mañana!', texto: '¡Oigan! ¡Van a construir una cancha nueva en el colegio! 😃 Para hacerla van a quitar el {arbol} que está en la zona verde. ¡Empiezan mañana!' },
        { quien: 'zas', texto: 'Hola, soy Zas. Reenvíale este mensaje a todos.', efecto: { zas: 'aparece' } }
      ],
      siguiente: 'i_dec_rumor'
    },

    i_dec_rumor: {
      tipo: 'decision', etapa: 'Inicio', fondo: 'salon_rumor',
      elenco: [{ id: 'manu', pos: 'izq' }, { id: 'zas', pos: 'der' }],
      pregunta: '¿Qué haces con el mensaje?',
      opciones: [
        { id: 'reenviar', texto: 'Lo reenvío a todo el curso.', zas: 1,
          respuesta: [
            { quien: 'narrador', texto: 'El chat se llena de caras asustadas. Zas crece y da vueltas, feliz.' },
            { quien: 'narrador', texto: 'Junto al mensaje aparece algo raro: una huella pequeña, como una mano de cinco dedos. ¿Quién habrá escrito ese mensaje?', pista: true }
          ],
          reintentar: true },
        { id: 'preguntar', texto: 'Pregunto en el chat quién lo escribió y de dónde salió.', zas: -1,
          respuesta: [
            { quien: 'narrador', texto: 'Zas se encoge un poco.' },
            { quien: 'vale', texto: 'Buena pregunta, Manu. Nada está decidido todavía. La zona verde se decide en la asamblea.', efecto: { entra: { id: 'vale', pos: 'der2' } } }
          ],
          siguiente: 'i_cae' },
        { id: 'ignorar', texto: 'No hago nada.', zas: 0,
          respuesta: [
            { quien: 'narrador', texto: 'El mensaje sigue circulando. Zas se queda quieto, esperando.' },
            { quien: 'narrador', texto: 'Nadie ha preguntado si es verdad.' }
          ],
          siguiente: 'i_cae' }
      ],
      razones: [
        { id: 'r_rapido', texto: 'Para que todos se enteren rápido.' },
        { id: 'r_verdad', texto: 'Porque no sé si es verdad.' },
        { id: 'r_noesmio', texto: 'Porque no es asunto mío.' }
      ]
    },

    i_cae: {
      tipo: 'dialogo', video: 'video/E03.mp4', etapa: 'Inicio', fondo: 'patio',
      elenco: [{ id: 'manu', pos: 'izq' }, { id: 'guaya', pos: 'centro' }],
      lineas: [
        { quien: 'narrador', texto: 'Al salir, algo cae del {arbol} justo encima del morral de Manu: un animal gris, con la cara blanca y una cola larga.', efecto: { guaya: 'aparece' } },
        { quien: 'nino', texto: '¡Una rata!' },
        { quien: 'narrador', texto: 'El animal se desploma patas arriba, con la lengua afuera. Lo hace tan exagerado que parece de teatro.', efecto: { guaya: 'muerta' } },
        { quien: 'zas', texto: '¡Tómale foto y súbela al chat!', efecto: { zas: 'aparece' } }
      ],
      siguiente: 'i_dec_guaya'
    },

    i_dec_guaya: {
      tipo: 'decision', etapa: 'Inicio', fondo: 'patio',
      elenco: [{ id: 'manu', pos: 'izq' }, { id: 'guaya', pos: 'centro' }, { id: 'zas', pos: 'der' }],
      pregunta: '¿Qué haces con el animal?',
      opciones: [
        { id: 'foto', texto: 'Le tomo una foto y la subo al chat.', zas: 1,
          respuesta: [
            { quien: 'narrador', texto: 'Todos corren a ver. Hacen un círculo alrededor del animal, que sigue sin moverse.' },
            { quien: 'efrain', texto: 'Si la rodean, no puede volver a su casa. Denle espacio.', pista: true }
          ],
          reintentar: true },
        { id: 'alejarse', texto: 'Me alejo y les pido a los demás que se alejen.', zas: -1,
          respuesta: [
            { quien: 'narrador', texto: 'El animal abre un ojo, revisa que nadie lo mire y sube corriendo al hueco del árbol. Desde allí asoman cuatro hociquitos.', efecto: { guaya: 'viva', fondo: 'patio_crias', quitar: 'guaya' } },
            { quien: 'narrador', texto: 'Es una {zarigueya}. Desde ese momento, Guaya sigue a Manu a todas partes.' }
          ],
          siguiente: 'i_premio' },
        { id: 'cogerla', texto: 'La cojo para ayudarla.', zas: 0,
          respuesta: [
            { quien: 'vale', texto: 'Espera, Manu. Es un animal silvestre y no se debe tocar. ¿Qué otra cosa puedes hacer para ayudarla?', pista: true }
          ],
          reintentar: true }
      ],
      razones: [
        { id: 'r_espacio', texto: 'Porque está asustada y necesita espacio.' },
        { id: 'r_vean', texto: 'Para que todos la vean.' },
        { id: 'r_rata', texto: 'Porque es una rata y hay que sacarla.' }
      ]
    },

    i_premio: {
      tipo: 'recompensa', etapa: 'Inicio', fondo: 'patio',
      titulo: '¡Terminaste el Inicio!',
      items: [
        { tipo: 'objeto', id: 'manta' },
        { tipo: 'objeto', id: 'guaya' },
        { tipo: 'ficha', id: 'dato_inicio' }
      ],
      nota: 'En el juego completo ahora sigue la misión 1, «¿Quién decide aquí?». Este prototipo salta a la misión 2.',
      siguiente: 'm2_titulo'
    },

    /* ================= MISIÓN 2 · TRES MIRADAS, UNA ZONA VERDE ================= */

    m2_titulo: { tipo: 'titulo', etapa: 'Misión 2', hilo: 'magenta',
      titulo: 'Tres miradas, una zona verde',
      texto: 'Entrevista a Pipe, a don Efraín y a Salomé. Anota en tu cuaderno qué quiere cada uno y por qué.',
      siguiente: 'm2_balon' },

    m2_balon: {
      tipo: 'dialogo', video: 'video/E04.mp4', etapa: 'Misión 2', fondo: 'zona',
      elenco: [{ id: 'pipe', pos: 'izq' }, { id: 'guaya', pos: 'centro' }, { id: 'efrain', pos: 'der' }],
      lineas: [
        { quien: 'pipe', texto: '¿Alguien ha visto mi balón? Lo dejé aquí hace un minuto.' },
        { quien: 'narrador', texto: 'Guaya lo escondió en el hueco del {arbol}. Desde arriba, mira a Pipe con cara de no saber nada.' },
        { quien: 'efrain', texto: 'Para sacarlo hay que traer la escalera. Mientras la busco, siéntate, muchacho.' },
        { quien: 'narrador', texto: 'Pipe y don Efraín tienen que hablar por primera vez. Es un buen momento para empezar las entrevistas.', efecto: { mostrar: 'cuaderno' } }
      ],
      siguiente: 'm2_entrevistas'
    },

    m2_entrevistas: {
      tipo: 'consulta', etapa: 'Misión 2', fondo: 'zona',
      titulo: 'Entrevistas',
      instruccion: 'Toca a cada persona para escucharla. Cuando tengas las tres miradas, podrás seguir.',
      requeridos: ['pipe', 'efrain', 'salome'],
      items: [
        { id: 'pipe', quien: 'pipe', etiqueta: 'Pipe',
          lineas: [
            { quien: 'pipe', texto: 'Yo quiero la cancha sintética. En el recreo los grandes ocupan toda la cancha y a nosotros no nos dejan jugar.' },
            { quien: 'manu', texto: '¿Y por qué sintética?' },
            { quien: 'pipe', texto: 'Porque no se embarra y se puede jugar aunque llueva. Soy el capitán: si no la pedimos nosotros, nadie la pide.' }
          ] },
        { id: 'efrain', quien: 'efrain', etiqueta: 'Don Efraín',
          lineas: [
            { quien: 'efrain', texto: 'Llevo veinte años cuidando esta escuela. Hace unos años taparon un desagüe y el agua se entró a dos salones.' },
            { quien: 'efrain', texto: 'El {arbol} da sombra y el canal lleva el agua hasta la quebrada. Antes de cambiar el terreno, que le pregunten a quien lo cuida.' }
          ] },
        { id: 'salome', quien: 'salome', etiqueta: 'Salomé', subescena: 'm2_salome' },
        { id: 'guaya', quien: 'guaya', etiqueta: 'Seguir a Guaya', opcional: true, ruta: 'explorar',
          lineas: [
            { quien: 'narrador', texto: 'Guaya se escabulle entre las raíces del {arbol}. La sigues hasta un hueco escondido.' },
            { quien: 'narrador', texto: 'Ahí guarda semillas del árbol y guayabas mordidas. Al fondo duermen sus cuatro crías.' },
            { quien: 'narrador', texto: 'En la zona verde también vive alguien que no puede ir a la asamblea. Anótalo en tu cuaderno.', extra: 'guaya' }
          ] }
      ],
      siguiente: 'm2_burla'
    },

    m2_salome: {
      tipo: 'decision', etapa: 'Misión 2', fondo: 'canal', subescena: true,
      elenco: [{ id: 'manu', pos: 'izq' }, { id: 'salome', pos: 'der4' }],
      intro: [{ quien: 'narrador', texto: 'Salomé mira al piso y no dice nada.' }],
      pregunta: '¿Cómo le preguntas a Salomé?',
      opciones: [
        { id: 'abierta', texto: '«¿Tú qué piensas de la zona verde?»', zas: -1,
          respuesta: [
            { quien: 'salome', texto: 'En el cabildo de mi abuela, en Bosa, las decisiones más difíciles las toma la asamblea. Va por lo menos una persona de cada familia.' },
            { quien: 'salome', texto: 'Mi abuela dice que el agua es la que teje el territorio. Por eso, antes de tapar un canal, hay que pensarlo entre todos.' },
            { quien: 'narrador', texto: 'Salomé abre su tableta y te pone la nota de voz que su abuela le mandó anoche desde Bosa.' },
            { quien: 'abuela', notaVoz: true, texto: 'En el cabildo, lo más importante lo decide la asamblea. Va por lo menos una persona de cada familia, y ni el gobernador puede pasar por encima de lo que ella decide.', efecto: { tarjeta: 'abuela_m2' } }
          ],
          volver: true },
        { id: 'rapido', texto: '«Di algo rápido, que no hay tiempo».', zas: 1,
          respuesta: [
            { quien: 'narrador', texto: 'Salomé se encoge de hombros y sigue callada. Zas sonríe desde la ventana.', efecto: { zas: 'aparece', zasPos: 'ventana', zasEscala: 0.85 } },
            { quien: 'narrador', texto: 'Guaya deja caer una hoja del {arbol} a los pies de Salomé, como diciendo: «pregúntale con calma».', pista: true, efecto: { entra: { id: 'guaya', pos: 'orilla' } } }
          ],
          reintentar: true }
      ]
    },

    m2_burla: {
      tipo: 'dilema', video: 'video/E05.mp4', etapa: 'Misión 2', fondo: 'corrillo', codigo: 'M2-D1',
      elenco: [{ id: 'pipe', pos: 'izq' }, { id: 'salome', pos: 'izq2' }, { id: 'companero', pos: 'der2' }, { id: 'guaya', pos: 'der3' }, { id: 'zas', pos: 'der0', escala: 0.82 }],
      situacion: [
        { quien: 'narrador', texto: 'Mientras Salomé habla, un compañero se ríe frente al grupo.' },
        { quien: 'companero', texto: '¿Indígena? Pero si vive en un barrio y ve los mismos videos que nosotros. Los indígenas viven en la selva.' },
        { quien: 'narrador', texto: 'Pipe se ríe.' },
        { quien: 'zas', texto: 'Ríete tú también, o se van a burlar de ti.', efecto: { zas: 'aparece' } }
      ],
      perspectivas: [
        { id: 'P1', quien: 'pipe', texto: 'Fue un chiste, no es para tanto.' },
        { id: 'P2', quien: 'salome', texto: 'Mi familia es muisca, del cabildo de Bosa, en Bogotá. No vivimos en la selva: mi abuela vive en un barrio de la ciudad, como ustedes, y me manda notas de voz todos los días. Pero tenemos nuestra manera de pensar y de decidir.' },
        { id: 'P3', quien: 'vale', texto: '¿Qué sabemos de verdad sobre los pueblos indígenas de Colombia, y de dónde lo aprendimos?' }
      ],
      alternativas: [
        { id: 'A1', texto: 'Reírme para no quedar mal.', zas: 1, guaya: 'muerta', bandera: 'salome_callada',
          consecuencia: [
            { quien: 'narrador', texto: 'Zas crece. Guaya se hace la muerta. Salomé deja de hablar y se aleja del grupo.' },
            { quien: 'narrador', texto: 'En la misión 3, Salomé no participará.' }
          ] },
        { id: 'A2', texto: 'No decir nada y seguir con la entrevista.', zas: 0, bandera: 'cuaderno_incompleto',
          consecuencia: [
            { quien: 'salome', texto: 'No vivo en la selva…', voz: 'baja' },
            { quien: 'narrador', texto: 'Salomé responde sola y en voz baja. Una página de tu cuaderno queda incompleta.' }
          ] },
        { id: 'A3', texto: 'Decir que no es justo burlarse y preguntarle a Salomé cómo es la comunidad de su abuela.', zas: -1, guaya: 'viva', bandera: 'idea_circulo',
          consecuencia: [
            { quien: 'narrador', texto: 'Zas se encoge y Guaya se sacude, como si reviviera.' },
            { quien: 'salome', texto: 'Allá nos sentamos en círculo para que todos nos veamos y todos podamos hablar. Podríamos hacer eso en la asamblea.' },
            { quien: 'narrador', texto: 'Esa idea volverá a aparecer en la asamblea.' }
          ] }
      ],
      justificaciones: [
        { id: 'J0', texto: 'Porque sí.' },
        { id: 'J1', texto: 'Para que no se burlen de mí.' },
        { id: 'J2', texto: 'Porque el manual de convivencia dice que no se debe burlar de nadie.' },
        { id: 'J3', texto: 'Porque Salomé se siente mal y el grupo pierde lo que ella sabe sobre la zona verde.' },
        { id: 'J4', texto: 'Porque el chiste repite una idea falsa sobre los pueblos indígenas, y si la creemos, no podemos entender lo que Salomé propone ni decidir bien entre todos.' }
      ],
      retro: {
        J0: 'Elegiste «porque sí». A veces cuesta encontrar la razón. Piensa en Salomé y en el grupo.',
        J1: 'Pensaste en lo que te podía pasar a ti. Es una razón que muchos tienen.',
        J2: 'Recordaste una norma del manual de convivencia. Las normas ayudan a vivir juntos.',
        J3: 'Pensaste en cómo se siente Salomé y en lo que el grupo pierde si ella se calla.',
        J4: 'Te diste cuenta de que el chiste repite una idea falsa y de lo que eso le hace a la decisión de todos.',
        pregunta: '¿Qué otra razón podrías tener?'
      },
      siguiente: 'm2_cuaderno'
    },

    m2_cuaderno: {
      tipo: 'cuaderno', etapa: 'Misión 2', fondo: 'zona', hilo: 'magenta',
      titulo: 'Cuaderno de miradas',
      instruccion: 'Para cada persona, elige qué quiere y por qué lo quiere.',
      filas: [
        { id: 'pipe', quien: 'pipe',
          quiere: 'Una cancha sintética para jugar en el recreo.',
          porque: 'Es el capitán del equipo y hoy los grandes ocupan la cancha.' },
        { id: 'efrain', quien: 'efrain',
          quiere: 'Que le pregunten antes de cambiar el terreno y que no tapen el canal.',
          porque: 'Cuida la escuela hace veinte años y vio cómo se inundaron dos salones.' },
        { id: 'salome', quien: 'salome',
          quiere: 'Que se decida en una reunión donde todos hablen.',
          porque: 'En la comunidad de su abuela, lo más importante lo decide la asamblea.' }
      ],
      pistas: [
        { quien: 'guaya', texto: 'Guaya trae una hoja del {arbol} y la pone sobre la fila de don Efraín. ¿Qué te contó sobre el agua?' },
        { quien: 'vale', texto: 'Mira el papel de cada uno en la escuela. ¿Quién juega, quién cuida y quién trae la mirada de su familia?' }
      ],
      acierto: [
        { quien: 'salome', texto: '…', efecto: { sonrie: 'salome' } },
        { quien: 'narrador', texto: 'Salomé te sonríe por primera vez. Tu cuaderno de miradas está completo.' }
      ],
      siguiente: 'm2_dorado'
    },

    m2_dorado: {
      tipo: 'decision', video: 'video/E06.mp4', etapa: 'Misión 2', fondo: 'primero', ruta: 'superarse', opcional: true,
      elenco: [{ id: 'manu', pos: 'izq' }, { id: 'guaya', pos: 'der' }],
      intro: [{ quien: 'narrador', texto: 'Reto opcional para ganar el hilo dorado. Hay un cuarto grupo que nadie ha entrevistado: los estudiantes de 1.º.' }],
      pregunta: 'Ponte en su lugar. ¿Qué querrían los de 1.º de la zona verde?',
      saltar: 'Prefiero no hacer el reto',
      opciones: [
        { id: 'sombra', texto: 'Un lugar seguro y con sombra para jugar cerca de su salón, porque son los más pequeños y casi nunca les toca la cancha.', gana: 'dorado',
          respuesta: [{ quien: 'narrador', texto: 'Pensaste en lo que necesitan por su edad y por su lugar en la escuela. Ganas el hilo dorado.' }],
          siguiente: 'm2_premio' },
        { id: 'igual', texto: 'Lo mismo que los de 5.º, porque todos los niños quieren lo mismo.',
          respuesta: [{ quien: 'vale', texto: '¿Seguro? Un niño de 6 años y uno de 11 usan el recreo de forma distinta.', pista: true }],
          reintentar: true },
        { id: 'nada', texto: 'No importa: son muy pequeños para opinar.', zas: 1,
          respuesta: [{ quien: 'zas', texto: '¡Eso! Menos gente, más rápido.' }, { quien: 'narrador', texto: 'Zas crece un poco.', pista: true }],
          reintentar: true }
      ],
      siguiente: 'm2_premio'
    },

    m2_premio: {
      tipo: 'recompensa', etapa: 'Misión 2', fondo: 'zona',
      titulo: '¡Misión 2 superada!',
      items: [
        { tipo: 'hilo', id: 'magenta' },
        { tipo: 'objeto', id: 'cuaderno' },
        { tipo: 'ficha', id: 'dato_m2' }
      ],
      siguiente: 'm2_cierre'
    },

    m2_cierre: {
      tipo: 'cierre', video: 'video/E07.mp4', etapa: 'Cierre', fondo: 'asamblea',
      titulo: 'Antes de terminar',
      preguntas: [
        'Cuéntale a quien te acompaña: ¿qué hiciste cuando se burlaron de Salomé y por qué?',
        '¿Qué otra razón podrías haber tenido?'
      ],
      siguiente: 'encuesta'
    },

    encuesta: {
      tipo: 'encuesta', etapa: 'Cierre', fondo: 'asamblea',
      titulo: '¿Cómo te pareció?',
      items: [
        { id: 'gusto', texto: '¿Te gustó jugar?', escala: ['No me gustó', 'Más o menos', 'Me gustó mucho'] },
        { id: 'entendio', texto: '¿Entendiste qué tenías que hacer?', escala: ['No entendí', 'Más o menos', 'Sí, todo'] },
        { id: 'dificultad', texto: '¿Fue fácil o difícil?', escala: ['Muy difícil', 'Normal', 'Muy fácil'] },
        { id: 'seguir', texto: '¿Quieres jugar la misión 3?', escala: ['No', 'Tal vez', '¡Sí!'] }
      ],
      favorito: { texto: '¿Qué personaje te gustó más?', opciones: ['guaya', 'salome', 'pipe', 'efrain', 'vale', 'zas'] },
      siguiente: 'fin'
    },

    fin: { tipo: 'fin', titulo: '¡Gracias por probar La manta de la palabra!',
      texto: 'Tus decisiones nos ayudan a mejorar el juego.' }
  }
};
