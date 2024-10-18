const svgArea = document.getElementById('svgArea');
const setoresDiv = document.getElementById('setores');
let yPosicaoAtual = 10;
let draggingElement = null;

// Função para zoom e pan
let isPanning = false, startX = 0, startY = 0, panX = 0, panY = 0;

svgArea.addEventListener('mousedown', function(e) {
    isPanning = true;
    startX = e.x;
    startY = e.y;
});

svgArea.addEventListener('mousemove', function(e) {
    if (!isPanning) return;
    let dx = e.x - startX;
    let dy = e.y - startY;
    panX += dx;
    panY += dy;
    svgArea.style.transform = `translate(${panX}px, ${panY}px)`;
    startX = e.x;
    startY = e.y;
});

svgArea.addEventListener('mouseup', function() {
    isPanning = false;
});

svgArea.addEventListener('wheel', function(e) {
    e.preventDefault();
    let scale = svgArea.style.transform.match(/scale\(([^)]+)\)/);
    scale = scale ? parseFloat(scale[1]) : 1;
    let zoomFactor = e.deltaY > 0 ? 0.9 : 1.1;
    svgArea.style.transform = `translate(${panX}px, ${panY}px) scale(${scale * zoomFactor})`;
});

// Funções de desenho
function desenharAssento(x, y, cor, usarBorda, espessuraBorda, numero = '') {
    const assento = document.createElementNS("http://www.w3.org/2000/svg", "ellipse");
    assento.setAttribute("cx", x);
    assento.setAttribute("cy", y);
    assento.setAttribute("rx", 15);
    assento.setAttribute("ry", 15);
    assento.setAttribute("fill", cor);
    assento.setAttribute("stroke-width", usarBorda ? espessuraBorda : 0);
    assento.setAttribute("stroke", "black");

    if (numero) {
        const texto = document.createElementNS("http://www.w3.org/2000/svg", "text");
        texto.setAttribute("x", x);
        texto.setAttribute("y", y + 5);
        texto.setAttribute("text-anchor", "middle");
        texto.setAttribute("font-size", "12");
        texto.setAttribute("fill", "black");
        texto.textContent = numero;
        svgArea.appendChild(texto);
    }

    return assento;
}

function desenharMesa(x, y, largura, altura, corMesa, numeroMesa = '') {
    const mesa = document.createElementNS("http://www.w3.org/2000/svg", "rect");
    mesa.setAttribute("x", x);
    mesa.setAttribute("y", y);
    mesa.setAttribute("width", largura);
    mesa.setAttribute("height", altura);
    mesa.setAttribute("fill", corMesa);

    if (numeroMesa) {
        const texto = document.createElementNS("http://www.w3.org/2000/svg", "text");
        texto.setAttribute("x", x + largura / 2);
        texto.setAttribute("y", y + altura / 2 + 5);
        texto.setAttribute("text-anchor", "middle");
        texto.setAttribute("font-size", "14");
        texto.setAttribute("fill", "black");
        texto.textContent = numeroMesa;
        svgArea.appendChild(texto);
    }

    return mesa;
}

// Função para gerar o mapa
function gerarMapa() {
    svgArea.innerHTML = ''; // Limpar o mapa atual antes de gerar o novo

    const setores = document.querySelectorAll('.setor');
    let yPosicao = 20;

    setores.forEach((setorDiv, index) => {
        const tipo = setorDiv.querySelector('.tipo').value;
        const fileiras = parseInt(setorDiv.querySelector('.fileiras').value);
        const assentos = parseInt(setorDiv.querySelector('.assentos').value);
        const mesasPorFileira = parseInt(setorDiv.querySelector('.mesasPorFileira').value);
        const assentosPorMesa = parseInt(setorDiv.querySelector('.assentosPorMesa').value);
        const alturaMesa = parseInt(setorDiv.querySelector('.alturaMesa').value);
        const larguraMesa = parseInt(setorDiv.querySelector('.larguraMesa').value);
        const cor = setorDiv.querySelector('.cor').value;
        const corMesa = setorDiv.querySelector('.corMesa').value;
        const usarBorda = setorDiv.querySelector('.usarBorda').value === 'true';
        const espessuraBorda = parseInt(setorDiv.querySelector('.espessuraBorda').value);
        const numeracao = setorDiv.querySelector('.numeracao').value === 'true';
        const numeracaoMesa = setorDiv.querySelector('.numeracaoMesa').value === 'true';

        if (tipo === 'teatro') {
            for (let i = 0; i < fileiras; i++) {
                for (let j = 0; j < assentos; j++) {
                    const x = 50 + j * 40;
                    const y = yPosicao + i * 50;
                    const numeroAssento = numeracao ? `${i + 1}-${j + 1}` : '';
                    const assento = desenharAssento(x, y, cor, usarBorda, espessuraBorda, numeroAssento);
                    svgArea.appendChild(assento);
                }
            }
            yPosicao += fileiras * 50 + 20;
        } else if (tipo === 'mesa') {
            for (let i = 0; i < fileiras; i++) {
                for (let j = 0; j < mesasPorFileira; j++) {
                    const x = 50 + j * (larguraMesa + 40);
                    const y = yPosicao + i * (alturaMesa + 60);
                    const numeroMesa = numeracaoMesa ? `Mesa ${i + 1}-${j + 1}` : '';
                    const mesa = desenharMesa(x, y, larguraMesa, alturaMesa, corMesa, numeroMesa);
                    svgArea.appendChild(mesa);

                    for (let k = 0; k < assentosPorMesa; k++) {
                        const angulo = (k / assentosPorMesa) * 2 * Math.PI;
                        const raio = larguraMesa / 2 + 20;
                        const assentoX = x + larguraMesa / 2 + Math.cos(angulo) * raio;
                        const assentoY = y + alturaMesa / 2 + Math.sin(angulo) * raio;
                        const assento = desenharAssento(assentoX, assentoY, cor, usarBorda, espessuraBorda);
                        svgArea.appendChild(assento);
                    }
                }
            }
            yPosicao += fileiras * (alturaMesa + 60);
        }
    });
}

// Botão de salvar
document.getElementById('salvarMapa').addEventListener('click', gerarMapa);

// Função para adicionar novo setor
document.getElementById('novoSetor').addEventListener('click', function () {
    const setorDiv = document.createElement('div');
    setorDiv.classList.add('setor');

    const titulo = document.createElement('h3');
    titulo.textContent = `Setor ${setoresDiv.children.length + 1}`;
    titulo.addEventListener('click', () => {
        const configDiv = setorDiv.querySelector('.config');
        configDiv.style.display = configDiv.style.display === 'none' ? 'block' : 'none';
    });

    const configDiv = document.createElement('div');
    configDiv.classList.add('config');
    configDiv.innerHTML = `
        <div class="input-group">
            <label>Tipo:</label>
            <select class="tipo">
                <option value="teatro">Teatro</option>
                <option value="mesa">Mesa</option>
            </select>
        </div>
        <div class="input-group">
            <label>Quantidade de fileiras:</label>
            <input type="number" class="fileiras" min="1" value="1">
        </div>
        <div class="input-group assentos-group">
            <label>Assentos por fileira:</label>
            <input type="number" class="assentos" min="1" value="1">
        </div>
        <div class="input-group mesas-group" style="display: none;">
            <label>Mesas por fileira:</label>
            <input type="number" class="mesasPorFileira" min="1" value="1">
            <label>Assentos por mesa:</label>
            <input type="number" class="assentosPorMesa" min="1" value="4">
            <label>Altura da mesa:</label>
            <input type="number" class="alturaMesa" min="1" value="50">
            <label>Largura da mesa:</label>
            <input type="number" class="larguraMesa" min="1" value="100">
        </div>
        <div class="input-group">
            <label>Cor dos assentos:</label>
            <input type="color" class="cor" value="#ff0000">
        </div>
        <div class="input-group">
            <label>Cor das mesas:</label>
            <input type="color" class="corMesa" value="#00ff00">
        </div>
        <div class="input-group">
            <label>Usar borda:</label>
            <select class="usarBorda">
                <option value="false">Não</option>
                <option value="true">Sim</option>
            </select>
        </div>
        <div class="input-group">
            <label>Espessura da borda:</label>
            <input type="number" class="espessuraBorda" min="1" value="2">
        </div>
        <div class="input-group">
            <label>Numerar assentos:</label>
            <select class="numeracao">
                <option value="false">Não</option>
                <option value="true">Sim</option>
            </select>
        </div>
        <div class="input-group">
            <label>Numerar mesas:</label>
            <select class="numeracaoMesa">
                <option value="false">Não</option>
                <option value="true">Sim</option>
            </select>
        </div>
    `;

    setorDiv.appendChild(titulo);
    setorDiv.appendChild(configDiv);
    setoresDiv.appendChild(setorDiv);

    // Mostrar ou esconder campos de acordo com o tipo de setor
    const tipoSelect = setorDiv.querySelector('.tipo');
    const assentosGroup = setorDiv.querySelector('.assentos-group');
    const mesasGroup = setorDiv.querySelector('.mesas-group');

    tipoSelect.addEventListener('change', () => {
        const tipo = tipoSelect.value;
        if (tipo === 'teatro') {
            assentosGroup.style.display = 'block';
            mesasGroup.style.display = 'none';
        } else {
            assentosGroup.style.display = 'none';
            mesasGroup.style.display = 'block';
        }
    });
});
