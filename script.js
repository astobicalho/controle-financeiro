import { db, collection, addDoc, deleteDoc, doc, onSnapshot } from "./firebase-config.js";

const tbody = document.querySelector("#tbody");
const descItem = document.querySelector("#desc");
const amount = document.querySelector("#amount");
const type = document.querySelector("#type");
const btnNew = document.querySelector("#btnNew");

const colRef = collection(db, "contas");

onSnapshot(q, (snapshot) => {
    let items = [];
    snapshot.docs.forEach((doc) => {
        items.push({ ...doc.data(), id: doc.id });
    });
    
    render(items);

    // ESCONDE O LOADING APÓS CARREGAR
    const loader = document.getElementById('loader');
    if (loader) {
        loader.style.opacity = '0';
        setTimeout(() => loader.style.display = 'none', 500);
    }
});

// Escuta o Firebase em tempo real
onSnapshot(colRef, (snapshot) => {
    let items = [];
    snapshot.docs.forEach((doc) => {
        items.push({ ...doc.data(), id: doc.id });
    });
    render(items);
});

// Dentro da função render, logo após criar a tr:
tr.style.opacity = "0";
tr.style.transform = "translateX(-20px)";
tbody.appendChild(tr);

setTimeout(() => {
    tr.style.transition = "all 0.4s ease";
    tr.style.opacity = "1";
    tr.style.transform = "translateX(0)";
}, 50 * index); // Efeito cascata
// Salva no Firebase
btnNew.onclick = async () => {
    if (descItem.value === "" || amount.value === "" || type.value === "") {
        return alert("Preencha todos os campos!");
    }

    try {
        await addDoc(colRef, {
            desc: descItem.value,
            amount: Number(amount.value).toFixed(2),
            type: type.value,
            createdAt: new Date()
        });
        
        descItem.value = "";
        amount.value = "";
    } catch (e) {
        console.error("Erro ao salvar: ", e);
    }
};

// Deleta do Firebase
window.deleteItem = async (id) => {
    await deleteDoc(doc(db, "contas", id));
};

function render(items) {
    tbody.innerHTML = "";
    items.forEach((item) => {
        insertItem(item);
    });
    getTotals(items);
}

// ... manter funções insertItem(item) e getTotals(items) adaptadas para o objeto do Firebase

// BLINDAGEM (Padrão AstoBicalho)
document.addEventListener('contextmenu', e => e.preventDefault());
document.onkeydown = e => {
    if(e.keyCode == 123 || (e.ctrlKey && e.shiftKey && e.keyCode == 73)) return false;
};
// Função para Gerar PDF (Estilo Profissional)
document.querySelector("#btnPDF").onclick = () => {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    // Título do PDF
    doc.setFontSize(18);
    doc.text("Relatório Mensal - Março 2026", 14, 20);
    
    // Assinatura do Desenvolvedor
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text("By: AstoBicalho - Developer", 14, 28);

    // Gerar a tabela no PDF usando os dados do tbody
    doc.autoTable({
        html: '#tbody-table', // Certifique-se que sua table tem esse ID
        startY: 35,
        theme: 'grid',
        headStyles: { fillColor: [0, 230, 118] } // Verde Neon Urbano
    });

    // Totais no final do PDF
    const finalY = doc.lastAutoTable.finalY + 10;
    doc.setFontSize(12);
    doc.setTextColor(0);
    doc.text(`Entradas: ${totalInDisplay.innerText}`, 14, finalY);
    doc.text(`Saídas: ${totalOutDisplay.innerText}`, 14, finalY + 7);
    doc.text(`Saldo Atual: ${totalBalanceDisplay.innerText}`, 14, finalY + 14);

    doc.save("Contas_Mensais_Marco_Asto.pdf");
};