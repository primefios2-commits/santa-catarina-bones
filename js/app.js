import { db } from './config.js';
import { collection, getDocs } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-firestore.js";

let produtos = [];

async function carregarProdutos() {
    try {
        const querySnapshot = await getDocs(collection(db, "produtos"));
        produtos = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        renderizarCatalogos();
        verificarRota();
    } catch (error) {
        console.error("Erro ao carregar produtos do Firestore:", error);
    }
}

function renderizarCatalogos() {
    const gridBones = document.getElementById('grid-bones');
    const gridChapeus = document.getElementById('grid-chapeus');
    const gridMoletons = document.getElementById('grid-moletons');

    const bones = produtos.filter(p => p.categoria === 'bones');
    const chapeus = produtos.filter(p => p.categoria === 'chapeus');
    const moletons = produtos.filter(p => p.categoria === 'moletons');

    if (gridBones) {
        gridBones.innerHTML = '';
        if (bones.length === 0) {
            gridBones.innerHTML = '<p style="color: var(--cinza-grafite); grid-column: 1 / -1; text-align: center; padding: 2rem; background: var(--cinza-claro); border-radius: 1rem; border: 1px dashed var(--borda-suave);">Nenhum produto cadastrado nesta categoria ainda. Acesse o Painel Admin para adicionar.</p>';
        }
    }
    if (gridChapeus) {
        gridChapeus.innerHTML = '';
        if (chapeus.length === 0) {
            gridChapeus.innerHTML = '<p style="color: var(--cinza-grafite); grid-column: 1 / -1; text-align: center; padding: 2rem; background: var(--cinza-claro); border-radius: 1rem; border: 1px dashed var(--borda-suave);">Nenhum produto cadastrado nesta categoria ainda. Acesse o Painel Admin para adicionar.</p>';
        }
    }
    if (gridMoletons) {
        gridMoletons.innerHTML = '';
        if (moletons.length === 0) {
            gridMoletons.innerHTML = '<p style="color: var(--cinza-grafite); grid-column: 1 / -1; text-align: center; padding: 2rem; background: var(--cinza-claro); border-radius: 1rem; border: 1px dashed var(--borda-suave);">Nenhum produto cadastrado nesta categoria ainda. Acesse o Painel Admin para adicionar.</p>';
        }
    }

    produtos.forEach(produto => {
        const capaImg = produto.capa || 'https://via.placeholder.com/400x400?text=Sem+Foto';
        const card = document.createElement('div');
        card.className = 'card';
        card.innerHTML = `
            <div class="card-clicavel" onclick="navegarParaProduto('${produto.id}')">
                <div class="img-placeholder" style="background-image: url('${capaImg}'); background-size: cover; background-position: center;">
                </div>
            </div>
            <div class="card-content">
                <div>
                    <h3>${produto.nome}</h3>
                    <p style="color: var(--cinza-grafite); font-size: 0.9rem; margin: 1rem 0;">${produto.descricao}</p>
                    <span class="regra-ouro"> ${produto.pedido_minimo}</span>
                    <span class="preco-exemplo">${produto.preco}</span>
                </div>
                <button onclick="navegarParaProduto('${produto.id}')" class="btn-primary">Ver fotos</button>
            </div>
        `;

        if (produto.categoria === 'bones' && gridBones) gridBones.appendChild(card);
        else if (produto.categoria === 'chapeus' && gridChapeus) gridChapeus.appendChild(card);
        else if (produto.categoria === 'moletons' && gridMoletons) gridMoletons.appendChild(card);
    });
}

window.navegarParaProduto = function(id) {
    history.pushState({ produtoId: id }, '', '#produto-' + id);
    mostrarProduto(id);
}

window.voltarAoSite = function() {
    history.pushState(null, '', window.location.pathname);
    document.getElementById('conteudo-principal').classList.remove('oculto');
    document.getElementById('pagina-produto-dinamica').classList.add('oculto');
    window.scrollTo(0, 0);
}

function mostrarProduto(id) {
    const produto = produtos.find(p => p.id === id);
    if (!produto) return voltarAoSite();

    document.getElementById('conteudo-principal').classList.add('oculto');
    const paginaDinamica = document.getElementById('pagina-produto-dinamica');
    paginaDinamica.classList.remove('oculto');

    let fotosHtml = '';
    if (produto.imagens && produto.imagens.length > 0) {
        produto.imagens.forEach((url, index) => {
            fotosHtml += `<div class="foto-item"><img src="${url}" alt="Foto ${index+1}"></div>`;
        });
    } else {
        fotosHtml = '<p>Nenhuma foto disponível.</p>';
    }

    const wppText = encodeURIComponent(`Olá! Tenho interesse no produto: ${produto.nome}`);

    paginaDinamica.innerHTML = `
        <div class="pagina-produto-topo">
            <button class="btn-voltar" onclick="voltarAoSite()">
                <svg viewBox="0 0 24 24"><path d="M15.5 19l-7-7 7-7 1.5 1.5L11 12l6 6z"/></svg>
                Voltar ao catálogo
            </button>
            <span class="logo-mini">Santa Catarina Bonés</span>
        </div>
        <div class="pagina-produto-hero">
            <span class="tag-catalogo">Ver fotos</span>
            <h1>${produto.nome}</h1>
            <p class="descricao">${produto.descricao}</p>
            <span class="regra-ouro"> ${produto.pedido_minimo}</span>
            <span class="preco-exemplo">${produto.preco}</span>
        </div>
        <div class="grid-produto-detalhe">
            ${fotosHtml}
        </div>
        <div class="pagina-produto-cta">
    <a href="https://wa.me/5547989105183?text=${wppText}" target="_blank" class="btn-primary">
        <svg viewBox="0 0 448 512"><path d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 480l117.7-30.9c32.4 17.7 68.9 27 106.1 27h.1c122.3 0 224.1-99.6 224.1-222 0-59.3-25.2-115-67.1-157zm-157 341.6c-33.2 0-65.7-8.9-94-25.7l-6.7-4-69.8 18.3L72 359.2l-4.4-7c-18.5-29.4-28.2-63.3-28.2-98.2 0-101.7 82.8-184.5 184.6-184.5 49.3 0 95.6 19.2 130.4 54.1 34.8 34.9 54 81.2 54 130.5 0 101.7-82.6 184.5-184.5 184.5zm100.5-137.5c-5.5-2.7-32.6-16.1-37.7-18-5.1-1.9-8.8-2.7-12.5 2.7-3.7 5.5-14.3 18-17.6 21.8-3.2 3.7-6.5 4.2-12 1.4-32.6-16.3-54-29.1-75.5-66-5.7-9.8 5.7-9.1 16.3-30.3 1.8-3.7.9-6.9-.5-9.7-1.4-2.8-12.5-30.1-17.1-41.2-4.5-10.8-9.1-9.3-12.5-9.5-3.2-.2-6.9-.2-10.6-.2-3.7 0-9.7 1.4-14.8 6.9-5.1 5.6-19.4 19-19.4 46.3 0 27.3 19.9 53.7 22.6 57.4 2.8 3.7 39.1 59.7 94.8 83.8 35.2 15.2 49 16.5 66.6 13.9 10.7-1.6 32.6-13.4 37.2-26.3 4.6-13 4.6-24.1 3.2-26.3-1.4-2.2-5-3.5-10.5-6.2z"/></svg>
        Fazer Orçamento via WhatsApp
    </a>
</div>
    `;
    window.scrollTo(0, 0);
}

function verificarRota() {
    const hash = window.location.hash;
    if (hash.startsWith('#produto-')) {
        const id = hash.replace('#produto-', '');
        mostrarProduto(id);
    } else {
        document.getElementById('conteudo-principal').classList.remove('oculto');
        document.getElementById('pagina-produto-dinamica').classList.add('oculto');
    }
}

window.addEventListener('popstate', verificarRota);
document.addEventListener('DOMContentLoaded', carregarProdutos);

// Navbar Mobile Toggle
const menuBtn = document.getElementById('menu-btn');
if(menuBtn) {
    menuBtn.addEventListener('click', () => {
        document.getElementById('nav-menu').classList.toggle('active');
    });
}
