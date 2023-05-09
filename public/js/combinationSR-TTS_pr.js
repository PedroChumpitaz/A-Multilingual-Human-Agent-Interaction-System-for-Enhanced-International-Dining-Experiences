const SpeechRecognition = window.SpeechRecognition || webkitSpeechRecognition;
const SpeechGrammarList = window.SpeechGrammarList || webkitSpeechGrammarList;
const SpeechRecognitionEvent = window.SpeechRecognitionEvent || webkitSpeechRecognitionEvent;

const synth = window.speechSynthesis;
let numero_pregunta = 0;
let voices = [];
let tipoSeleccionado = '';

let respuestas_positivas = ["sim", "sim", "claro", "claro", "sim eu gostaria", "eu estava pensando que", "eu gosto muito", "eu amo", "ela me fascina", "ela me deixa louco", "eu gosto muito", "eu amo", "ela me fascina", "ela me deixa louco", "ela me deixa louco", "ela me deixa louco"];
let respuestas_negativas = ["não", "não, de forma alguma", "não gosto", "odeio", "odeio", "me enoja", "não gosto", "detesto", "odeio", "me enoja"];

window.voices = voices;

function populateVoiceList() {
    voices = synth.getVoices();
}

populateVoiceList();
if (speechSynthesis.onvoiceschanged !== undefined) {
    speechSynthesis.onvoiceschanged = populateVoiceList;
  }

const platos = {
  carne: ["delicioso bife grelhado com molho de cogumelos", "suculento filé mignon de boi grelhado"],
  frango: ["arroz requintado com frango", "saborosos peitos de frango em creme"],
  peixe: ['saboroso salmão assado com molho de endro', 'ceviche de peixe fresco'],
  carne_de_porco: ['costelas de porco assadas com molho barbecue', 'lombinho de porco tenro em molho de vinho']
};

window.populatevoice = populateVoiceList;
const recognition = new SpeechRecognition();
recognition.continuous = false;
recognition.lang = 'pt-BR';
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
          hacer_hablar_pc(`Ola, ${nombre}. Você tem algo em mente para comer hoje? Responda com "sim" ou "não".`,false, comenzar_recognition);
          estado = "preguntando_comida";
          break;
      case "preguntando_comida":
          if (esRespuestaNegativa(comando_recibido.toLowerCase())) {
              hacer_hablar_pc(`Recomendamos nosso delicioso arroz com frango, está bem assim?`,false, comenzar_recognition);
              estado = "ofreciendo_platos";
          } else if (esRespuestaPositiva(comando_recibido.toLowerCase())) {
              hacer_hablar_pc(`Ótimo, ${nombre}. O que você deseja? Escolha entre "carne", "frango", "peixe" ou "carne de porco".`,true, comenzar_recognition);
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
              hacer_hablar_pc(`Recomendamos nosso ${platoRecomendado}. Está bem para você?`,false, comenzar_recognition);
              estado = "validando_preferencia";
          } else {
              hacer_hablar_pc(`Desculpe, não consegui entender sua preferência. Por favor, escolha entre "carne", "frango", "peixe" ou "carne de porco".`,false, comenzar_recognition);
          }
          break;

      case "validando_preferencia":
        if (esRespuestaPositiva(comando_recibido.toLowerCase())) {
            hacer_hablar_pc("Aproveite sua refeição!",false, terminar_programa);
            break;
        } else if (esRespuestaNegativa(comando_recibido.toLowerCase())) {
            let platosRestantes = Object.keys(platos).filter(plato => plato !== tipoSeleccionado);
            let platoActual = platosRestantes[Math.floor(Math.random() * platosRestantes.length)];
            let platoRecomendado = platos[platoActual];
            hacer_hablar_pc(`Que tal nosso  ${platoRecomendado}? Está bem para você?`,true, comenzar_recognition);
            estado = "validando_preferencia";
        } else {
            hacer_hablar_pc(`Desculpe, não consegui entender sua preferência. Por favor, escolha entre "carne", "frango", "peixe" ou "carne de porco".`,false, comenzar_recognition);
        }
        break;
        
        
      case "ofreciendo_platos":
          if (esRespuestaPositiva(comando_recibido.toLowerCase())) {
            hacer_hablar_pc("Aproveite sua refeição!",false, terminar_programa);
            break;
          } else if (esRespuestaNegativa(comando_recibido.toLowerCase())) {
              let platosRestantes = Object.keys(platos).filter(plato => plato !== "frango");
              let platoActual = platosRestantes[Math.floor(Math.random() * platosRestantes.length)];
              let platoRecomendado = platos[platoActual];
              hacer_hablar_pc(`Que tal nosso ${platoRecomendado}?  Está bem para você?`,true, comenzar_recognition);
            } else {
                hacer_hablar_pc(`Desculpe, não consegui entender sua preferência. Por favor, escolha entre "carne", "frango", "peixe" ou "carne de porco".`,false, comenzar_recognition);
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
        if (voice.name === "Microsoft Antonio Online (Natural) - Portuguese (Brazil)") {
            utterThis.voice = voice;
          }
          else if(voice.name === "Google português do Brasil"){
            utterThis.voice = voice;
          }
      }
    utterThis.pitch = 0.0;
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
    hacer_hablar_pc("Olá, bem-vindo ao nosso restaurante internacional. Sou seu assistente bot. Qual é seu nome?", true,comenzar_recognition);
   });