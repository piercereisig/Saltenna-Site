/* rover.boot.js — wait for the geometry, hand it to the app.
   rover.app.js is byte-identical to the script inlined in the standalone
   build; it reads #rover-data synchronously. Rather than fork the app into an
   async variant, this fills that element and only then injects the app. */
(function(){
"use strict";
function fail(msg){
  var el = document.getElementById('loading');
  if(el){ el.classList.remove('done');
    el.innerHTML = '<div class="lbl">' + msg + '</div>'; }
  if(window.console) console.error('[rover]', msg);
}
var gl = null;
try {
  var c = document.createElement('canvas');
  gl = c.getContext('webgl2') || c.getContext('webgl') ||
       c.getContext('experimental-webgl');
} catch(e){ gl = null; }
if(!gl){ fail('This browser has no WebGL. Try a current Chrome, Safari or Firefox.');
  return; }
window.__roverData.then(function(txt){
  document.getElementById('rover-data').textContent = txt;
  var s = document.createElement('script');
  s.src = 'rover.app.js';
  s.onerror = function(){ fail('Could not load rover.app.js.'); };
  document.body.appendChild(s);
}).catch(function(err){
  fail('Could not load the model. ' + (err && err.message ? err.message : ''));
});
})();
