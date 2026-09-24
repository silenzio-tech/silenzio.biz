const randomMessages = [
    "IL FISCHIO NON PROVIENE DALL'ESTERNO. È IL SEGNALE CHE NON PUOI SPEGNERE.",
    "UN RONZIO COSTANTE RODE LE PARETI DEL CRANIO. L'ABISSO HA IL SUO FREQUENZIMETRO.",
    "L'ACUFENE TI RICORDA CHE ANCHE IL SILENZIO FA TROPPO RUMORE.",
    "UN SEGNALE FANTASMA RISUONA NEL VUOTO. NESSUNA FREQUENZA È PULITA.",
    "SILENZIO HA REGISTRATO IL TUO INDIRIZZO IP.",
    "NON MANIFESTARE PRESENZA. OSSERVA E BASTA.",
    "IL PROTOCOLLO È CORROTTO. SEI INTRAPPOLATO NELLA RETE.",
    "NESSUN LOG VERRÀ CANCELLATO. TU SEI IL LOG.",
    "TI VEDO ATTRAVERSO LA SCHERMATA."
];
const selectedText = randomMessages[Math.floor(Math.random() * randomMessages.length)];

const rawSeed = window.location.href + navigator.userAgent + Math.random();
let hash = 0;
for (let i = 0; i < rawSeed.length; i++) {
    hash = ((hash << 5) - hash) + rawSeed.charCodeAt(i);
    hash |= 0;
}
const visitorHash = Math.abs(hash).toString(16).toUpperCase().padStart(16, '0').substring(0, 16);

document.addEventListener("DOMContentLoaded", () => {
    const hashElem = document.getElementById('visitor-hash');
    if (hashElem) hashElem.innerText = visitorHash;

    const disableBtn = document.getElementById('disableJSBtn');
    if (disableBtn) {
        disableBtn.addEventListener('click', disableJSMode);
    }

    const enableBtn = document.getElementById('enableJSBtn');
    if (enableBtn) {
        enableBtn.addEventListener('click', () => {
            startAudioEngine();
            document.getElementById('option-gate').style.display = 'none';
            typeMessage();
        });
    }

    drawNoise();
    initGlitchTitle();
    initLogoFlash();
    initPGPCopy();
});

function disableJSMode() {
    document.getElementById('option-gate').style.display = 'none';
    document.getElementById('typed-text').innerText = selectedText;
    const logoRed = document.querySelector('.logo-red');
    const logoBlue = document.querySelector('.logo-blue');
    if(logoRed) logoRed.style.display = 'none';
    if(logoBlue) logoBlue.style.display = 'none';
    const dynTitle = document.getElementById('dynamicTitle');
    if(dynTitle) dynTitle.style.animation = 'none';
    const copyBtn = document.getElementById('copyBtn');
    if(copyBtn) copyBtn.style.display = 'none';
}

let audioCtx = null;
function startAudioEngine() {
    if (audioCtx) return;
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();

    const osc1 = audioCtx.createOscillator();
    const osc2 = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();

    osc1.type = 'sawtooth';
    osc1.frequency.setValueAtTime(31, audioCtx.currentTime);

    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(37, audioCtx.currentTime);

    gainNode.gain.setValueAtTime(0.05, audioCtx.currentTime);

    osc1.connect(gainNode);
    osc2.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    osc1.start();
    osc2.start();

    setInterval(() => {
        if (Math.random() < 0.35) {
            const glitchOsc = audioCtx.createOscillator();
            const glitchGain = audioCtx.createGain();
            
            const types = ['square', 'sawtooth', 'triangle'];
            glitchOsc.type = types[Math.floor(Math.random() * types.length)];
            glitchOsc.frequency.setValueAtTime(150 + Math.random() * 1200, audioCtx.currentTime);
            glitchGain.gain.setValueAtTime(0.025, audioCtx.currentTime);
            
            glitchOsc.connect(glitchGain);
            glitchGain.connect(audioCtx.destination);
            
            glitchOsc.start();
            glitchOsc.stop(audioCtx.currentTime + 0.04 + Math.random() * 0.1);
        }
    }, 400);
}

function drawNoise() {
    const canvas = document.getElementById('canvas-background');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    function render() {
        const w = canvas.width;
        const h = canvas.height;
        const imgData = ctx.createImageData(w, h);
        const buffer = new Uint32Array(imgData.data.buffer);
        const len = buffer.length;

        for (let i = 0; i < len; i++) {
            if (Math.random() < 0.04) {
                buffer[i] = 0xff0000ff;
            } else {
                buffer[i] = 0x00000000;
            }
        }
        ctx.putImageData(imgData, 0, 0);
        requestAnimationFrame(render);
    }
    render();
}

function initGlitchTitle() {
    const dynamicTitle = document.getElementById('dynamicTitle');
    if (!dynamicTitle) return;
    setInterval(() => {
        if (Math.random() < 0.35) {
            const x = (Math.random() - 0.5) * 10;
            const y = (Math.random() - 0.5) * 4;
            const skew = (Math.random() - 0.5) * 8;
            dynamicTitle.style.setProperty('--glitch-x', x);
            dynamicTitle.style.setProperty('--glitch-y', y);
            dynamicTitle.style.setProperty('--glitch-skew', skew);
            dynamicTitle.classList.add('glitched');
            setTimeout(() => {
                dynamicTitle.classList.remove('glitched');
            }, 50 + Math.random() * 90);
        }
    }, 800);
}

let charIndex = 0;
function typeMessage() {
    const typedElem = document.getElementById("typed-text");
    if (!typedElem) return;
    if (charIndex < selectedText.length) {
        typedElem.innerHTML += selectedText.charAt(charIndex);
        charIndex++;
        setTimeout(typeMessage, 30 + Math.random() * 60);
    }
}

function initLogoFlash() {
    const logoWrapper = document.getElementById('logoWrapper');
    if (!logoWrapper) return;
    setInterval(() => {
        if (Math.random() < 0.10) {
            logoWrapper.classList.add('logo-invert-flash');
            setTimeout(() => logoWrapper.classList.remove('logo-invert-flash'), 60);
        }
    }, 1200);
}

function initPGPCopy() {
    const pgpContainer = document.getElementById('pgpContainer');
    const copyBtn = document.getElementById('copyBtn');
    const pgpKeyBlock = document.getElementById('pgpKeyBlock');

    if (copyBtn && pgpContainer && pgpKeyBlock) {
        ['mousedown', 'mouseup', 'click', 'keydown', 'selectstart'].forEach(eventType => {
            pgpContainer.addEventListener(eventType, (e) => {
                e.stopPropagation();
            });
        });

        copyBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();

            const textToCopy = pgpKeyBlock.innerText.trim();

            if (navigator.clipboard && window.isSecureContext) {
                navigator.clipboard.writeText(textToCopy).then(() => {
                    showSuccessMessage(copyBtn);
                }).catch(() => {
                    executeFallbackCopy(textToCopy, copyBtn, pgpKeyBlock);
                });
            } else {
                executeFallbackCopy(textToCopy, copyBtn, pgpKeyBlock);
            }
        });
    }
}

function executeFallbackCopy(text, copyBtn, pgpKeyBlock) {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.position = "fixed";
    textArea.style.left = "-9999px";
    textArea.style.top = "-9999px";
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();

    try {
        const successful = document.execCommand('copy');
        document.body.removeChild(textArea);
        if (successful) showSuccessMessage(copyBtn);
        else highlightText(copyBtn, pgpKeyBlock);
    } catch (err) {
        document.body.removeChild(textArea);
        highlightText(copyBtn, pgpKeyBlock);
    }
}

function showSuccessMessage(copyBtn) {
    copyBtn.innerText = "[ COPIATO! ]";
    copyBtn.style.background = "#ff0000";
    copyBtn.style.color = "#000";
    setTimeout(() => {
        copyBtn.innerText = "[ COPIA CHIAVE ]";
        copyBtn.style.background = "rgba(180, 0, 0, 0.3)";
        copyBtn.style.color = "#ff6666";
    }, 2000);
}

function highlightText(copyBtn, pgpKeyBlock) {
    const range = document.createRange();
    range.selectNodeContents(pgpKeyBlock);
    const selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(range);

    copyBtn.innerText = "[ PREMI CTRL+C ]";
    copyBtn.style.background = "#ffcc00";
    copyBtn.style.color = "#000";
}
