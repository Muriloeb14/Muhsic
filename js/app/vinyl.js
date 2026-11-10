/* ============================================================
   MUHSIC — APP / VINYL.JS
   ------------------------------------------------------------
   Animação de rotação dos discos (requestAnimationFrame):
     - vinil compacto (barra do player)
     - vinil grande (painel maximizado)
   Também contém a matemática do giro manual com o mouse.
   ============================================================ */

const DEG_PER_SEC     = PLAYER.degreesPerSecond;
const SWAP_THRESHOLD  = PLAYER.swapThreshold;
const CLICK_TOLERANCE = PLAYER.clickTolerance;

/* ============================================================
   VINIL COMPACTO
   ============================================================ */
let accumulatedAngle = 0;
let spinStartTime    = 0;
let spinStartAngle   = 0;
let rafId            = null;
let brakeTimeoutId   = null;

function applyAngle(angle) {
    if (vinyl) vinyl.style.transform = `rotate(${angle}deg)`;
}

function spinLoop() {
    const elapsed = (performance.now() - spinStartTime) / 1000;
    applyAngle(spinStartAngle + elapsed * DEG_PER_SEC);
    rafId = requestAnimationFrame(spinLoop);
}

function startSpin() {
    if (!vinyl) return;
    cancelAnimationFrame(rafId);
    clearTimeout(brakeTimeoutId);
    spinStartAngle = accumulatedAngle;
    spinStartTime  = performance.now();
    rafId = requestAnimationFrame(spinLoop);
}

/** Para o loop e retorna o ângulo em que o disco estava */
function stopSpin() {
    cancelAnimationFrame(rafId);
    rafId = null;
    const elapsed = (performance.now() - spinStartTime) / 1000;
    return spinStartAngle + elapsed * DEG_PER_SEC;
}

/** Simula a frenagem: avança um pouco e "volta" levemente */
function brakeAndStop() {
    if (!vinyl) return;
    const startAngle = stopSpin();
    vinyl.style.transition = 'transform 0.3s cubic-bezier(0.2, 0.7, 0.4, 1)';
    applyAngle(startAngle + 28);
    brakeTimeoutId = setTimeout(() => {
        vinyl.style.transition = 'transform 0.35s cubic-bezier(0.3, 0.9, 0.4, 1)';
        applyAngle(startAngle + 18);
        accumulatedAngle = startAngle + 18;
        brakeTimeoutId = setTimeout(() => { vinyl.style.transition = 'none'; }, 360);
    }, 300);
}

/* ============================================================
   VINIL DO PAINEL MAXIMIZADO
   ============================================================ */
let maxRafId            = null;
let maxAngle            = 0;
let maxLastTs           = 0;
let maxAccumulatedAngle = 0;

function maxSpinLoop(ts) {
    if (!maxLastTs) maxLastTs = ts;
    const dt = (ts - maxLastTs) / 1000;
    maxLastTs = ts;
    maxAccumulatedAngle = (maxAccumulatedAngle + DEG_PER_SEC * dt) % 360;
    maxAngle = maxAccumulatedAngle;
    if (maxVinyl) maxVinyl.style.transform = `rotate(${maxAngle}deg)`;
    maxRafId = requestAnimationFrame(maxSpinLoop);
}

function startMaxSpin() {
    if (maxRafId) return;
    maxLastTs = 0;
    maxRafId = requestAnimationFrame(maxSpinLoop);
}

function stopMaxSpin() {
    if (maxRafId) { cancelAnimationFrame(maxRafId); maxRafId = null; }
}

function maxBrakeAndStop() {
    if (!maxVinyl) return;
    cancelAnimationFrame(maxRafId);
    maxRafId = null;
    const startAngle = maxAngle;
    maxVinyl.style.transition = 'transform 0.3s cubic-bezier(0.2, 0.7, 0.4, 1)';
    maxVinyl.style.transform = `rotate(${startAngle + 28}deg)`;
    setTimeout(() => {
        maxVinyl.style.transition = 'transform 0.35s cubic-bezier(0.3, 0.9, 0.4, 1)';
        maxVinyl.style.transform = `rotate(${startAngle + 18}deg)`;
        maxAccumulatedAngle = startAngle + 18;
        setTimeout(() => { maxVinyl.style.transition = 'none'; }, 360);
    }, 300);
}

/* ============================================================
   GIRO MANUAL (arrastar o disco)
   ============================================================ */

/** Ângulo (graus) do mouse em relação ao centro do elemento */
function getMouseAngleFor(el, evt) {
    if (!el) return 0;
    const rect = el.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    return Math.atan2(evt.clientY - cy, evt.clientX - cx) * (180 / Math.PI);
}

/** Diferença entre dois ângulos, no intervalo [-180, 180] */
function angleDiff(a, b) {
    let d = a - b;
    while (d > 180)  d -= 360;
    while (d < -180) d += 360;
    return d;
}
