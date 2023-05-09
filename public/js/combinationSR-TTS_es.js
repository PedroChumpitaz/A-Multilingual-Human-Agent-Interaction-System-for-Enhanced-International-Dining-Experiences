const SpeechRecognition = window.SpeechRecognition || webkitSpeechRecognition;
const SpeechGrammarList = window.SpeechGrammarList || webkitSpeechGrammarList;
const SpeechRecognitionEvent = window.SpeechRecognitionEvent || webkitSpeechRecognitionEvent;

const synth = window.speechSynthesis;
let numero_pregunta = 0;
let voices = [];
let tipoSeleccionado = '';

let respuestas_positivas = ["sí", "si", "claro", "por supuesto","sí me gustaria","justo estaba pensando eso", "me gusta mucho", "me encanta", "me fascina", "me enloquece"];
let respuestas_negativas = ["no", "no, para nada","no me gusta", "lo detesto", "lo odio", "me da asco"];

window.voices = voices;

function populateVoiceList() {
    voices = synth.getVoices();
}

populateVoiceList();
if (speechSynthesis.onvoiceschanged !== undefined) {
    speechSynthesis.onvoiceschanged = populateVoiceList;
  }

const platos = {
  carne: ['delicioso filete a la parrilla con salsa de champiñones', 'jugoso lomo de res a la plancha'],
  pollo: ['exquisito arroz con pollo', 'sabrosas pechugas de pollo a la crema'],
  pescado: ['sabroso salmón al horno con salsa de eneldo', 'fresco ceviche de pescado'],
  cerdo: ['tiernas costillas de cerdo al horno con salsa barbacoa', 'suave solomillo de cerdo en salsa de vino']
};

window.populatevoice = populateVoiceList;
const recognition = new SpeechRecognition();
recognition.continuous = false;
recognition.lang = 'es-ES';
recognition.interimResults = false;
recognition.maxAlternatives = 1;

let estado = "preguntando_nombre";
let nombre = "";

let comenzar_recognition = () => {
    recognition.start();
}

recognition.onresult = (event) => {
    let comando_recibido = event.results[0][0].transcript;

    switch (estado) {
      case "preguntando_nombre":
          let palabras = comando_recibido.split(" ");
          nombre = palabras[palabras.length-1];
          hacer_hablar_pc(`Hola, ${nombre}. ¿Tienes algo en mente para comer hoy? Responde con "sí" o "no".`,false, comenzar_recognition);
          estado = "preguntando_comida";
          break;
      case "preguntando_comida":
          if (esRespuestaNegativa(comando_recibido.toLowerCase())) {
              hacer_hablar_pc(`Te recomendamos nuestro exquisito arroz con pollo. ¿Te parece bien?`,false, comenzar_recognition);
              estado = "ofreciendo_platos";
          } else if (esRespuestaPositiva(comando_recibido.toLowerCase())) {
              hacer_hablar_pc(`Genial, ${nombre}. ¿Qué se te antoja? Por favor, elige entre "carne", "pollo", "pescado" o "cerdo".`,true, comenzar_recognition);
              estado = "solicitando_preferencia";
          }
          break;
      case "solicitando_preferencia":
          let preferencia = comando_recibido.toLowerCase();
          let platoRecomendado = '';
  
          for (const tipo in platos) {
              if (preferencia.includes(tipo)) {
                  let opciones = platos[tipo];
                  tipoSeleccionado = tipo;
                  platoRecomendado = opciones[Math.floor(Math.random() * opciones.length)];
                  break;
              }
          }
  
          if (platoRecomendado !== '') {
              hacer_hablar_pc(`Te recomendamos nuestro ${platoRecomendado}. ¿Te parece bien?`,false, comenzar_recognition);
              estado = "validando_preferencia";
          } else {
              hacer_hablar_pc(`Lo siento, no pude entender tu preferencia. Por favor, elige entre "carne", "pollo", "pescado" o "cerdo".`,false, comenzar_recognition);
          }
          break;

      case "validando_preferencia":
        if (esRespuestaPositiva(comando_recibido.toLowerCase())) {
            hacer_hablar_pc("¡Buen provecho!",false, terminar_programa);
            break;
        } else if (esRespuestaNegativa(comando_recibido.toLowerCase())) {
            let platosRestantes = Object.keys(platos).filter(plato => plato !== tipoSeleccionado);
            let platoActual = platosRestantes[Math.floor(Math.random() * platosRestantes.length)];
            let platoRecomendado = platos[platoActual];
            hacer_hablar_pc(`¿Qué tal nuestro ${platoRecomendado}? ¿Te parece bien?`,true, comenzar_recognition);
            estado = "validando_preferencia";
        } else {
            hacer_hablar_pc("Lo siento, no pude entender tu respuesta. Por favor, responde con 'sí' o 'no'.",false, comenzar_recognition);
        }
        break;
        
        
      case "ofreciendo_platos":
          if (esRespuestaPositiva(comando_recibido.toLowerCase())) {
            hacer_hablar_pc("¡Buen provecho!",false, terminar_programa);
            break;
          } else if (esRespuestaNegativa(comando_recibido.toLowerCase())) {
              let platosRestantes = Object.keys(platos).filter(plato => plato !== "pollo");
              let platoActual = platosRestantes[Math.floor(Math.random() * platosRestantes.length)];
              let platoRecomendado = platos[platoActual];
              hacer_hablar_pc(`¿Qué tal nuestro ${platoRecomendado}? ¿Te parece bien?`, true, comenzar_recognition);
            } else {
                hacer_hablar_pc("Lo siento, no pude entender tu respuesta. Por favor, responde con 'sí' o 'no'.",false, comenzar_recognition);
            }
            break;
        
        default:
            console.log("No estado");
            break;
        }
        
  


}

recognition.onspeechend = () => {
    recognition.stop();
}

recognition.onnomatch = (event) => {
    console.log("No se reconoció el comando.");
}

recognition.onerror = (event) => {
    console.log('Error en el reconocimiento de voz: ' + event.error);
    console.log('Información adicional: ' + event.message);
}

let is_speaking = false;
  let openning_mouth = true;

  function speak_randomly(x,y,time){
    
    if(y<1 && openning_mouth ){
      y+=0.2;
    }
    else if(openning_mouth){
      openning_mouth=false;
      y-=0.2;
    }
    else if(y>0 && !openning_mouth){
      y-=0.2;
    }
    else{
      y+=0.2;
      openning_mouth=true;
    }

    mover_boca(x,y);

    if(is_speaking)
      setTimeout(()=>{speak_randomly(x,y,time)},time);
      
  }

  let moving_up = true;

  function nodding(x,y,z,time){
    if(z>0){
      if(y<10 && moving_up ){
        y+=1;
        z-=0.7;
      }
      else if(moving_up){
        moving_up=false;
        y-=1;
        z-=0.7;
      }
      else if(y>-10 && !moving_up){
        y-=1;
        z-=0.7;
      }
      else{
        y+=1;
        z-=0.7;
        moving_up=true;
      }
    }
    else{
      if(y<10 && moving_up ){
        y+=1;
      }
      else if(moving_up){
        moving_up=false;
        y-=1;
      }
      else if(y>-10 && !moving_up){
        y-=1;
      }
      else{
        y+=1;
        moving_up=true;
      }
    }  

    mover_cabezay(x,y,z);

    if(is_speaking)
      setTimeout(()=>{nodding(x,y,z,time)},time);
      
  }

  let question = false;
  let moving = true;

  function questioning(x,y,z,time){
    x=0;
      if(z<300 && moving ){
        z+=0.5;
      }
      else if(moving){
        moving=false;
        z-=0.5;
      }
      else if(z>-300 && !moving){
        z-=0.5;
      }
      else{
        z+=1;
        moving=true;
      }

    mover_cabezaz(x,z);
    
    if(is_speaking)
      setTimeout(()=>{questioning(x,y,z,time)},time);
      
  }

function hacer_hablar_pc(text,question,callback){
    const utterThis = new SpeechSynthesisUtterance(text);
    utterThis.audioDestination = audioprocess.mediastreamdestination.stream;

    utterThis.onstart = () =>{
      is_speaking = true;
      speak_randomly(0,0,30);
      if(question){
        questioning(0,0,0,30);
      }
      else{
        nodding(0,0,30,30);
      }
    }

    for (const voice of voices) {
        if (voice.name === "Microsoft Camila Online (Natural) - Spanish (Peru)") {
          utterThis.voice = voice;
        }
        else if(voice.name === "Google español de Estados Unidos"){
          utterThis.voice = voice;
        }
      }
    utterThis.pitch = 1.0;
    utterThis.rate = 1.0;
    synth.speak(utterThis);
    utterThis.onend = () =>{
      is_speaking = false;
      //setTimeout(()=>mover_cabeza(0,0,0,100),200);
      setTimeout(()=>mover_boca(0,0,100),200);
      setTimeout(()=>callback(),200);
    
    };

  }

function esRespuestaPositiva(respuesta) {
  return respuestas_positivas.some(valor => respuesta.includes(valor));
}

function esRespuestaNegativa(respuesta) {
  return respuestas_negativas.some(valor => respuesta.includes(valor));
}

function terminar_programa() {
    console.log("Programa terminado.");
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

sleep(4500).then(() => { populateVoiceList();
    hacer_hablar_pc("Hola, bienvenido a nuestro restaurante internacional. Soy tu bot asistente. ¿Cuál es tu nombre?", true,comenzar_recognition);
   });