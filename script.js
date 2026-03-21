import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, collection, addDoc, onSnapshot, query, where, orderBy, doc, updateDoc, deleteDoc, getDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyBmQmDlSQz_ewf_szWCGCgSDEuEC13GbK4",
    authDomain: "controle-de-contas-8a0fc.firebaseapp.com",
    projectId: "controle-de-contas-8a0fc",
    storageBucket: "controle-de-contas-8a0fc.firebasestorage.app",
    messagingSenderId: "88972805126",
    appId: "1:88972805126:web:da71d9986fe39aba5d6f87"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
let meuGrafico = null;
let acoesVisiveis = false;

window.toggleEntradas = () => {
    const div = document.getElementById('listaEntradasContainer');
    div.style.display = div.style.display === 'block' ? 'none' : 'block';
};

window.toggleAcoes = () => {
    acoesVisiveis = !acoesVisiveis;
    const botoes = document.querySelectorAll('.btn-acao');
    botoes.forEach(b => b.style.display = acoesVisiveis ? 'inline-block' : 'none');
};

window.salvarRegistro = async () => {
    const id = document.getElementById('editId').value;
    const dados = {
        descricao: document.getElementById('desc').value,
        valor: parseFloat(document.getElementById('valor').value),
        tipo: document.getElementById('tipo').value,
        data: document.getElementById('data').value,
        categoria: document.getElementById('categoria').value,
        timestamp: new Date()
    };
    if (!dados.descricao || !dados.valor || !dados.data) return alert("Preencha tudo!");
    try {
        if (id) {
            await updateDoc(doc(db, "contas", id), dados);
            document.getElementById('editId').value = "";
            document.getElementById('btnSalvar').innerText = "SALVAR REGISTRO";
        } else {
            await addDoc(collection(db, "contas"), { ...dados, status: "PENDENTE" });
        }
        document.getElementById('desc').value = ""; document.getElementById('valor').value = "";
    } catch (e) { alert("Erro ao salvar!"); }
};

window.prepararEdicao = async (id) => {
    const docRef = await getDoc(doc(db, "contas", id));
    if (docRef.exists()) {
        const data = docRef.data();
        document.getElementById('editId').value = id;
        document.getElementById('desc').value = data.descricao;
        document.getElementById('valor').value = data.valor;
        document.getElementById('data').value = data.data;
        document.getElementById('categoria').value = data.categoria;
        document.getElementById('tipo').value = data.tipo;
        document.getElementById('btnSalvar').innerText = "ATUALIZAR AGORA";
        window.scrollTo({top: 0, behavior: 'smooth'});
    }
};

window.alternarStatus = async (id, statusAtual) => {
    await updateDoc(doc(db, "contas", id), { status: statusAtual === "PENDENTE" ? "PAGO" : "PENDENTE" });
};

window.excluirConta = async (id) => { if(confirm("Apagar registro?")) await deleteDoc(doc(db, "contas", id)); };

function atualizarGrafico(dadosCategorias) {
    const ctx = document.getElementById('graficoPizza').getContext('2d');
    const labels = Object.keys(dadosCategorias);
    const coresMap = { "Água":"#3498db","Luz":"#f1c40f","Gás":"#e67e22","Cartão/Crédito":"#9b59b6","Celular":"#2ecc71","Cerrado":"#27ae60","Iptu":"#e74c3c","Internet":"#1abc9c","Empréstimo":"#7f8c8d","Pres. Carro":"#34495e","Outros":"#95a5a6" };
    if (meuGrafico) meuGrafico.destroy();
    meuGrafico = new Chart(ctx, {
        type: 'doughnut',
        data: { labels: labels, datasets: [{ data: Object.values(dadosCategorias), backgroundColor: labels.map(l => coresMap[l] || "#95a5a6"), borderWidth: 2, borderColor: '#1e1e1e' }] },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { color: '#e0e0e0', font: { size: 10 } } } } }
    });
}

let unsubscribe; 
function carregarDados(mesAno) {
    if (unsubscribe) unsubscribe();
    const q = query(collection(db, "contas"), where("data", ">=", `${mesAno}-01`), where("data", "<=", `${mesAno}-31`), orderBy("data", "asc"));
    unsubscribe = onSnapshot(q, (snapshot) => {
        const tbodyGastos = document.getElementById('listaContas');
        const tbodyEntradas = document.getElementById('listaEntradasEdit');
        tbodyGastos.innerHTML = ""; tbodyEntradas.innerHTML = "";
        let ent = 0, sai = 0;
        const resumoCat = {};
        const icones = { "Água":"💧","Luz":"⚡","Gás":"🔥","Cartão/Crédito":"💳","Celular":"📱","Cerrado":"🌳","Iptu":"🏠","Internet":"🌐","Empréstimo":"💸","Pres. Carro":"🚗","Outros":"📁" };
        const classes = { "Água":"cat-agua","Luz":"cat-luz","Gás":"cat-gas","Cartão/Crédito":"cat-cartao","Celular":"cat-celular","Cerrado":"cat-cerrado","Iptu":"cat-iptu","Internet":"cat-internet","Empréstimo":"cat-emprestimo","Pres. Carro":"cat-carro","Outros":"cat-outros" };

        snapshot.forEach((doc) => {
            const item = doc.data();
            const v = parseFloat(item.valor);
            const catStr = item.categoria || "Outros";
            const displayAcoes = acoesVisiveis ? 'inline-block' : 'none';

            if (item.tipo === "+") {
                ent += v;
                tbodyEntradas.innerHTML += `
                    <tr>
                        <td>${item.descricao}</td>
                        <td>${v.toLocaleString('pt-br',{style:'currency',currency:'BRL'})}</td>
                        <td style="text-align:right;">
                            <button class="btn-acao btn-edit" style="display:inline-block" onclick="window.prepararEdicao('${doc.id}')">✎</button>
                            <button class="btn-acao btn-delete" style="display:inline-block" onclick="window.excluirConta('${doc.id}')">✖</button>
                        </td>
                    </tr>`;
            } else {
                sai += v;
                resumoCat[catStr] = (resumoCat[catStr] || 0) + v;
                tbodyGastos.innerHTML += `
                    <tr class="${item.status === 'PAGO' ? 'row-pago' : ''}">
                        <td><strong>${item.descricao}</strong><br><span class="categoria-badge ${classes[catStr]}">${icones[catStr]} ${catStr}</span></td>
                        <td style="color:var(--saida); font-weight:bold;">${v.toLocaleString('pt-br',{style:'currency',currency:'BRL'})}<br>
                            <button class="btn-status ${item.status === 'PAGO' ? 'btn-pago' : ''}" onclick="window.alternarStatus('${doc.id}','${item.status}')">${item.status}</button>
                        </td>
                        <td style="text-align:right;">
                            <button class="btn-acao btn-edit" style="display:${displayAcoes}" onclick="window.prepararEdicao('${doc.id}')">✎</button>
                            <button class="btn-acao btn-delete" style="display:${displayAcoes}" onclick="window.excluirConta('${doc.id}')">✖</button>
                        </td>
                    </tr>`;
            }
        });
        document.getElementById('totalEntradas').innerText = ent.toLocaleString('pt-br',{style:'currency',currency:'BRL'});
        document.getElementById('totalSaidas').innerText = sai.toLocaleString('pt-br',{style:'currency',currency:'BRL'});
        document.getElementById('saldoFinal').innerText = (ent - sai).toLocaleString('pt-br',{style:'currency',currency:'BRL'});
        atualizarGrafico(resumoCat);
    });
}
const campoFiltro = document.getElementById('filtroMes');
campoFiltro.value = new Date().toISOString().slice(0, 7);
carregarDados(campoFiltro.value);
campoFiltro.addEventListener('change', (e) => carregarDados(e.target.value));
// Exportando as funções para o HTML conseguir usar
window.salvarRegistro = salvarRegistro;
window.prepararEdicao = prepararEdicao;
window.alternarStatus = alternarStatus;
window.excluirConta = excluirConta;
window.toggleEntradas = toggleEntradas;
window.toggleAcoes = toggleAcoes;
