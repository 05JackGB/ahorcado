(function(){
  'use strict';
  const $ = (sel, ctx=document) => ctx.querySelector(sel);
  const $$ = (sel, ctx=document) => Array.from(ctx.querySelectorAll(sel));
  const normalize = (str) => str.toUpperCase().normalize('NFD').replace(/\p{Diacritic}/gu, '').replace(/Ü/g,'U');
  let toastTimer; function toast(msg){ const t=$('#toast'); t.textContent=msg; t.classList.add('show'); clearTimeout(toastTimer); toastTimer=setTimeout(()=>t.classList.remove('show'),1800); }
  const WORDS=[{w:'ALGORITMO',h:'Serie de pasos para resolver un problema.'},
    {w:'VARIABLE',h:'Espacio en memoria con un nombre y un valor.'},
    {w:'COMPILADOR',h:'Traduce código fuente a ejecutable.'},
    {w:'FUNCION',h:'Bloque reutilizable que realiza una tarea.'},
    {w:'ARREGLO',h:'Estructura lineal indexada.'},
    {w:'OBJETO',h:'Entidad con estado y comportamiento.'},
    {w:'RECURRENCIA',h:'Definición en términos de sí misma.'},
    {w:'PILA',h:'Estructura LIFO.'},{w:'COLA',h:'Estructura FIFO.'},
    {w:'GRAFO',h:'Conjunto de nodos y aristas.'},
    {w:'ENCRIPTACION',h:'Transforma datos para proteger su confidencialidad.'},
    {w:'PROTOCOLO',h:'Conjunto de reglas para comunicación.'},
    {w:'SISTEMA',h:'Conjunto de elementos relacionados.'},
    {w:'LAMBDA',h:'Función anónima (contexto de algunos lenguajes).'},
    {w:'DESARROLLO',h:'Proceso de crear software.'},
    {w:'RED',h:'Interconexión de dispositivos.'},
    {w:'SERVIDOR',h:'Atiende peticiones de clientes.'},
    {w:'CLIENTE',h:'Realiza peticiones a un servidor.'},
    {w:'BACKEND',h:'Lado del servidor.'},
    {w:'FRONTEND',h:'Interfaz con la que interactúa el usuario.'}];
  const state={secret:'',secretN:'',revealed:[],guessed:new Set(),wrong:0,maxWrong:7,wins:0,streak:0,hintUsed:false};
  const wordEl=$('#word'),kbdEl=$('#keyboard'),livesEl=$('#lives'),scoreEl=$('#score'),streakEl=$('#streak'),hintEl=$('#hint'),modal=$('#modal'),modalTitle=$('#modalTitle'),modalDesc=$('#modalDesc'); const letters=[...'ABCDEFGHIJKLMNÑOPQRSTUVWXYZ'];
  function buildKeyboard(){ kbdEl.innerHTML=''; letters.forEach(l=>{ const b=document.createElement('button'); b.className='key'; b.textContent=l; b.setAttribute('aria-label',`Letra ${l}`); b.addEventListener('click',()=>guess(l)); kbdEl.appendChild(b); }); }
  function renderWord(){ wordEl.innerHTML=''; [...state.secret].forEach((ch,i)=>{ const slot=document.createElement('span'); slot.className='slot'+(state.revealed[i]?' revealed':''); slot.textContent=state.revealed[i]?ch.toUpperCase():''; slot.setAttribute('aria-hidden','true'); wordEl.appendChild(slot); }); }
  function updateMeta(){ livesEl.textContent=`Intentos: ${state.maxWrong-state.wrong}`; livesEl.className='badge '+((state.maxWrong-state.wrong)<=2?'warn':'ok'); scoreEl.textContent=`Victorias: ${state.wins}`; scoreEl.className='badge ok'; streakEl.textContent=`Racha: ${state.streak}`; }
  function updateKeyboard(){ $$('.key',kbdEl).forEach(b=>{ const l=b.textContent; if(state.guessed.has(l)){ b.disabled=true; const n=normalize(l); if(state.secretN.includes(n)) b.classList.add('good'); else b.classList.add('bad'); } else { b.disabled=false; b.classList.remove('good','bad'); } }); }
  function drawHangman(){ for(let i=1;i<=7;i++){ const part=document.getElementById('p'+i); if(!part) continue; if(i<=state.wrong) part.classList.add('show'); else part.classList.remove('show'); } }
  function pickWord(diff){ let pool=WORDS; if(diff==='easy') pool=WORDS.filter(x=>x.w.length<=7); if(diff==='hard') pool=WORDS.filter(x=>x.w.length>=8); return pool[Math.floor(Math.random()*pool.length)]; }
  function startGame(){ const {w,h}=pickWord($('#difficulty').value); state.secret=w; state.secretN=normalize(w); state.revealed=Array.from({length:w.length},(_,i)=>/[^A-ZÀ-ÿÑñÜü]/.test(w[i])?true:false); state.guessed.clear(); state.wrong=0; state.hintUsed=false; hintEl.textContent='Consejo: usa el teclado físico o haz clic en las letras. Tienes 1 pista.'; hintEl.hidden=false; renderWord(); updateKeyboard(); drawHangman(); updateMeta(); }
  function revealAll(){ state.revealed=state.revealed.map((v,i)=>/[A-ZÀ-ÿÑñÜü]/i.test(state.secret[i])?true:v); renderWord(); }
  function checkWin(){ if(state.revealed.every(v=>v)){ state.wins++; state.streak++; updateMeta(); modalTitle.textContent='🎉 ¡Ganaste!'; modalDesc.textContent=`La palabra era “${state.secret}”. Excelente.`; showModal(); return true; } return false; }
  function checkLose(){ if(state.wrong>=state.maxWrong){ state.streak=0; updateMeta(); revealAll(); modalTitle.textContent='💀 Fin del juego'; modalDesc.textContent=`La palabra era “${state.secret}”. ¡Sigue intentando!`; showModal(); return true; } return false; }
  function guess(letter){ const L=normalize(letter); if(state.guessed.has(letter)||checkWin()||checkLose()) return; state.guessed.add(letter); let hit=false; for(let i=0;i<state.secret.length;i++){ const t=normalize(state.secret[i]); if(t===L){ state.revealed[i]=true; hit=true; } } if(!hit){ state.wrong++; toast('Fallaste'); } else { toast('¡Bien!'); } renderWord(); updateKeyboard(); drawHangman(); updateMeta(); if(!hit) checkLose(); else checkWin(); }
  function useHint(){ if(state.hintUsed){ toast('Ya usaste tu pista'); return; } const hiddenIdx=state.revealed.map((v,i)=>v?-1:i).filter(i=>i!==-1); if(hiddenIdx.length===0){ toast('Nada que revelar'); return; } const idx=hiddenIdx[Math.floor(Math.random()*hiddenIdx.length)]; const letter=normalize(state.secret[idx]); for(let i=0;i<state.secret.length;i++){ if(normalize(state.secret[i])===letter){ state.revealed[i]=true; } } state.hintUsed=true; $$('.key',kbdEl).forEach(btn=>{ if(normalize(btn.textContent)===letter){ btn.classList.add('good'); btn.disabled=true; state.guessed.add(btn.textContent); } }); renderWord(); updateMeta(); checkWin(); }
  $('#btnNew').addEventListener('click', startGame); $('#btnHint').addEventListener('click', useHint);
  document.addEventListener('keydown', (e)=>{ if(e.key==='n'||e.key==='N'){ startGame(); return; } if(e.key==='h'||e.key==='H'){ useHint(); return; } const key=e.key.toUpperCase(); if(/^[A-ZÑ]$/u.test(key)) guess(key); });
  function showModal(){ $('#modal').classList.add('show'); } function hideModal(){ $('#modal').classList.remove('show'); } $('#btnAgain').addEventListener('click', ()=>{ hideModal(); startGame(); }); $('#btnClose').addEventListener('click', hideModal); $('#modal').addEventListener('click',(e)=>{ if(e.target===$('#modal')) hideModal(); });
  $('#linkHow').addEventListener('click',(e)=>{ e.preventDefault(); $('#modalTitle').textContent='Cómo jugar'; $('#modalDesc').innerHTML='Adivina la palabra antes de que el monigote se complete.<br>Haz clic en las letras o usa tu teclado. Tienes 1 pista por partida. Cambia la dificultad con el selector.'; showModal(); });
  (function init(){ buildKeyboard(); startGame(); })();
  function buildKeyboard(){ const kbd=$('#keyboard'); kbd.innerHTML=''; [...'ABCDEFGHIJKLMNÑOPQRSTUVWXYZ'].forEach(l=>{ const b=document.createElement('button'); b.className='key'; b.textContent=l; b.setAttribute('aria-label',`Letra ${l}`); b.addEventListener('click',()=>guess(l)); kbd.appendChild(b); }); }
})();