const SpeechRecognition = window.SpeechRecognition || webkitSpeechRecognition;
const SpeechGrammarList = window.SpeechGrammarList || webkitSpeechGrammarList;
const SpeechRecognitionEvent = window.SpeechRecognitionEvent || webkitSpeechRecognitionEvent;

const synth = window.speechSynthesis;
let numero_pregunta =0;
let voices = [];
window.voices = voices
function populateVoiceList() {
    voices = synth.getVoices();
}

populateVoiceList();
if (speechSynthesis.onvoiceschanged !== undefined) {
  speechSynthesis.onvoiceschanged = populateVoiceList;
}

let pregunta = ["¿Te gusta el sushi?", "¿Te gusta el color rosa?","¿Eres o no eres?","¿Te gusta bing?"]

window.populatevoice = populateVoiceList;
const recognition = new SpeechRecognition();
recognition.continuous = false;
recognition.lang = 'es-ES';
recognition.interimResults = false;
recognition.maxAlternatives = 1;

let comenzar_hablar = document.getElementById("convertirVoz");

let estado = "preguntando_nombre";
let nombre = "";

let respuestas_positivas = ["sí","si","claro","por supuesto","me gusta mucho","me encanta","me fascina","me enloquece"];
let respuestas_negativas = ["no","no lo entiendo","lo detesto","lo odio", "me aburre", "me estresa", "no me gusta"];

let comentario_positivo = ["genial","excelente","a mi también","Que onda wey","¡Fantástico!","¡Estupendo!"];
let comentario_negativo = ["oh, que pena","ni modo", "es una lástima","¿Cómo es posible?","entiendo"];

let empezar_recognition  = () =>{
  recognition.start();
}
 
  recognition.onresult = (event) => {
    let comando_recibido = event.results[0][0].transcript;

    switch(estado){
      case "preguntando_nombre":
        let palabras = comando_recibido.split(" ");
        let nombre = palabras[palabras.length-1];
        hacer_hablar_pc("hola "+nombre + " ¿Te gusta el curso de interacción humano agente?",true,empezar_recognition);

        estado = "respuesta_a_la_pregunta";
      break;
      case "respuesta_a_la_pregunta":
        comando_recibido = comando_recibido.toLowerCase();
        let positivo = respuestas_positivas.map((valor)=>comando_recibido.includes(valor))
        let negativo = respuestas_negativas.map((valor)=>comando_recibido.includes(valor))
        let resultado_positivo = false;
        let resultado_negativo = false;

        positivo.map((valor)=>resultado_positivo=resultado_positivo  || valor)
        negativo.map((valor)=>resultado_negativo=resultado_negativo  || valor)
        
        
        let pregunta_actual = pregunta[numero_pregunta]
        
        if(resultado_negativo)  
          setTimeout(()=>{
            let comentario = comentario_negativo[Math.floor(Math.random()*comentario_negativo.length)]
            hacer_hablar_pc(comentario,false,()=>hacer_hablar_pc(pregunta_actual,true,empezar_recognition))
          },2000);

        if(resultado_positivo)
        setTimeout(()=>{
          let comentario = comentario_positivo[Math.floor(Math.random()*comentario_positivo.length)]
            hacer_hablar_pc(comentario,false,()=>hacer_hablar_pc(pregunta_actual,true,empezar_recognition));
          },2000);
        numero_pregunta++;
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
    diagnostic.textContent = "I didn't recognize that color.";
  }

  recognition.onerror = (event) => {
    console.log('Speech recognition error detected: ' + event.error);
    console.log('Additional information: ' + event.message);
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
        if (voice.name === "Microsoft Elena Online (Natural) - Spanish (Argentina)") {
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

  function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  sleep(4500).then(() => { populateVoiceList();
    hacer_hablar_pc("hola mi nombre es agente uno ¿Cuál es tu nombre?", true,empezar_recognition);
   });
  