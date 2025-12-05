// ===== Playfair Cipher (Vanilla JS) =====
// I and J are merged. Alphabet = A..Z without J.

const $ = (sel) => document.querySelector(sel);
const ALPHA = [..."ABCDEFGHIKLMNOPQRSTUVWXYZ"]; // no J

function cleanKeyword(k) {
  return k.toUpperCase().replace(/[^A-Z]/g, "").replace(/J/g, "I");
}

function buildMatrix(keyword) {
  const seen = new Set();
  const letters = [];
  const k = cleanKeyword(keyword);

  for (const ch of k) {
    if (ch !== "J" && !seen.has(ch)) {
      seen.add(ch);
      letters.push(ch);
    }
  }
  for (const ch of ALPHA) {
    if (!seen.has(ch)) {
      seen.add(ch);
      letters.push(ch);
    }
  }
  const matrix = [];
  const pos = new Map();
  for (let r = 0; r < 5; r++) {
    matrix[r] = [];
    for (let c = 0; c < 5; c++) {
      const ch = letters[r * 5 + c];
      matrix[r][c] = ch;
      pos.set(ch, { r, c });
    }
  }
  return { matrix, pos };
}

function renderMatrix(el, matrix) {
  el.innerHTML = "";
  if (!matrix || matrix.length !== 5) return;
  for (let r = 0; r < 5; r++) {
    for (let c = 0; c < 5; c++) {
      const div = document.createElement("div");
      div.className = "cell";
      div.textContent = matrix[r][c];
      el.appendChild(div);
    }
  }
}

function cleanTextForPairsEncrypt(text) {
  const s = text.toUpperCase().replace(/[^A-Z]/g, "").replace(/J/g, "I");
  const pairs = [];
  let i = 0;
  while (i < s.length) {
    const a = s[i];
    const b = s[i + 1];
    if (!b) {
      pairs.push([a, "X"]);
      i += 1;
    } else if (a === b) {
      pairs.push([a, "X"]);
      i += 1;
    } else {
      pairs.push([a, b]);
      i += 2;
    }
  }
  return pairs;
}

function cleanTextForPairsDecrypt(text) {
  const s = text.toUpperCase().replace(/[^A-Z]/g, "").replace(/J/g, "I");
  const pairs = [];
  for (let i = 0; i < s.length; i += 2) {
    const a = s[i];
    const b = s[i + 1] || "X";
    pairs.push([a, b]);
  }
  return pairs;
}

function encryptPairs(matrix, pos, pairs) {
  const out = [];
  for (const [a, b] of pairs) {
    const { r: r1, c: c1 } = pos.get(a);
    const { r: r2, c: c2 } = pos.get(b);
    if (r1 === r2) {
      out.push(matrix[r1][(c1 + 1) % 5] + matrix[r2][(c2 + 1) % 5]);
    } else if (c1 === c2) {
      out.push(matrix[(r1 + 1) % 5][c1] + matrix[(r2 + 1) % 5][c2]);
    } else {
      out.push(matrix[r1][c2] + matrix[r2][c1]);
    }
  }
  return out.join("");
}

function decryptPairs(matrix, pos, pairs) {
  const out = [];
  for (const [a, b] of pairs) {
    const { r: r1, c: c1 } = pos.get(a);
    const { r: r2, c: c2 } = pos.get(b);
    if (r1 === r2) {
      out.push(matrix[r1][(c1 + 4) % 5] + matrix[r2][(c2 + 4) % 5]);
    } else if (c1 === c2) {
      out.push(matrix[(r1 + 4) % 5][c1] + matrix[(r2 + 4) % 5][c2]);
    } else {
      out.push(matrix[r1][c2] + matrix[r2][c1]);
    }
  }
  return out.join("");
}

function showPairs(el, pairs) {
  el.innerHTML = "";
  if (!pairs.length) {
    el.classList.add("muted");
    el.textContent = "Run an action to see digraphs…";
    return;
  }
  el.classList.remove("muted");
  for (const [a, b] of pairs) {
    const span = document.createElement("span");
    span.className = "pair";
    span.textContent = `${a}${b}`;
    el.appendChild(span);
  }
}

// UI handlers
const elKeyword = document.querySelector("#keyword");
const elInput = document.querySelector("#inputText");
const elEncrypt = document.querySelector("#btnEncrypt");
const elDecrypt = document.querySelector("#btnDecrypt");
const elClear = document.querySelector("#btnClear");
const elMatrix = document.querySelector("#matrix");
const elPairs = document.querySelector("#pairs");
const elResult = document.querySelector("#result");

function runEncrypt() {
  const { matrix, pos } = buildMatrix(elKeyword.value);
  renderMatrix(elMatrix, matrix);
  const pairs = cleanTextForPairsEncrypt(elInput.value);
  showPairs(elPairs, pairs);
  elResult.textContent = encryptPairs(matrix, pos, pairs) || "—";
}

function runDecrypt() {
  const { matrix, pos } = buildMatrix(elKeyword.value);
  renderMatrix(elMatrix, matrix);
  const pairs = cleanTextForPairsDecrypt(elInput.value);
  showPairs(elPairs, pairs);
  elResult.textContent = decryptPairs(matrix, pos, pairs) || "—";
}

function clearAll() {
  elInput.value = "";
  elResult.textContent = "—";
  elPairs.innerHTML = "Run an action to see digraphs…";
  elPairs.classList.add("muted");
}

elEncrypt.addEventListener("click", runEncrypt);
elDecrypt.addEventListener("click", runDecrypt);
elClear.addEventListener("click", clearAll);

// Initial render
(() => {
  const { matrix } = buildMatrix(elKeyword.value);
  renderMatrix(elMatrix, matrix);
})();
