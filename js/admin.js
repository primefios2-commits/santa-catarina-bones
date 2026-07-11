import { db, auth, cloudinaryConfig } from '../js/config.js';
import { collection, addDoc, getDocs, deleteDoc, doc, updateDoc } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-firestore.js";
import { signInWithEmailAndPassword, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-auth.js";

// DOM Elements
const loginView = document.getElementById('login-view');
const dashboardView = document.getElementById('dashboard-view');
const loginForm = document.getElementById('login-form');
const btnLogout = document.getElementById('btn-logout');
const produtoForm = document.getElementById('produto-form');
const tabelaProdutos = document.getElementById('tabela-produtos');
const uploadImagem = document.getElementById('upload-imagem');
const previewImagens = document.getElementById('preview-imagens');
const btnCancelar = document.getElementById('btn-cancelar');

let imagensAtuais = [];
let imagemCapa = '';

// Verificação de Autenticação
onAuthStateChanged(auth, (user) => {
    if (user) {
        loginView.classList.add('oculto');
        dashboardView.classList.remove('oculto');
        carregarProdutosAdmin();
    } else {
        loginView.classList.remove('oculto');
        dashboardView.classList.add('oculto');
    }
});

// Login
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    const errorMsg = document.getElementById('login-error');
    
    try {
        await signInWithEmailAndPassword(auth, email, password);
        errorMsg.style.display = 'none';
    } catch (error) {
        errorMsg.textContent = "Credenciais inválidas. Tente novamente.";
        errorMsg.style.display = 'block';
    }
});

// Logout
btnLogout.addEventListener('click', () => {
    signOut(auth);
});

// Carregar Produtos
async function carregarProdutosAdmin() {
    tabelaProdutos.innerHTML = '<tr><td colspan="5">Carregando...</td></tr>';
    try {
        const querySnapshot = await getDocs(collection(db, "produtos"));
        tabelaProdutos.innerHTML = '';
        querySnapshot.forEach((documento) => {
            const data = documento.data();
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td><img src="${data.capa || 'https://via.placeholder.com/50'}" width="50" style="border-radius:4px;"></td>
                <td>${data.nome}</td>
                <td>${data.categoria}</td>
                <td>${data.preco}</td>
                <td>
                    <button class="btn-secundario" style="padding: 0.4rem 0.8rem; font-size: 0.85rem;" onclick="editarProduto('${documento.id}')">Editar</button>
                    <button class="btn-secundario" style="padding: 0.4rem 0.8rem; font-size: 0.85rem; color:red; border-color:red;" onclick="deletarProduto('${documento.id}')">Excluir</button>
                </td>
            `;
            tabelaProdutos.appendChild(tr);
        });
    } catch (error) {
        console.error("Erro ao carregar produtos", error);
        tabelaProdutos.innerHTML = '<tr><td colspan="5">Erro ao carregar dados.</td></tr>';
    }
}

// Upload Cloudinary
uploadImagem.addEventListener('change', async (e) => {
    const files = e.target.files;
    if(files.length === 0) return;

    // Loading estado visual pode ser adicionado aqui
    
    for (let file of files) {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', cloudinaryConfig.uploadPreset);

        try {
            const response = await fetch(cloudinaryConfig.uploadUrl, {
                method: 'POST',
                body: formData
            });
            const data = await response.json();
            imagensAtuais.push(data.secure_url);
            if(!imagemCapa) imagemCapa = data.secure_url; // primeira img vira capa por padrão
        } catch (error) {
            console.error("Erro no upload", error);
            customAlert("Erro ao fazer upload da imagem.");
        }
    }
    renderizarPreview();
    uploadImagem.value = '';
});

function renderizarPreview() {
    previewImagens.innerHTML = '';
    imagensAtuais.forEach((url, index) => {
        const wrapper = document.createElement('div');
        wrapper.className = 'image-preview-wrapper';
        
        const img = document.createElement('img');
        img.src = url;
        img.className = `image-preview ${url === imagemCapa ? 'selected' : ''}`;
        img.onclick = () => {
            imagemCapa = url;
            renderizarPreview();
        };

        const removeBtn = document.createElement('button');
        removeBtn.className = 'remove-btn';
        removeBtn.innerHTML = '&times;';
        removeBtn.onclick = (e) => {
            e.stopPropagation();
            imagensAtuais.splice(index, 1);
            if(imagemCapa === url) imagemCapa = imagensAtuais[0] || '';
            renderizarPreview();
        };

        wrapper.appendChild(img);
        wrapper.appendChild(removeBtn);
        previewImagens.appendChild(wrapper);
    });
}

// Salvar (Criar ou Atualizar)
produtoForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    document.getElementById('btn-salvar').textContent = "Salvando...";
    document.getElementById('btn-salvar').disabled = true;

    const id = document.getElementById('produto-id').value;
    const produto = {
        nome: document.getElementById('produto-nome').value,
        categoria: document.getElementById('produto-categoria').value,
        descricao: document.getElementById('produto-descricao').value,
        pedido_minimo: document.getElementById('produto-minimo').value,
        preco: document.getElementById('produto-preco').value,
        imagens: imagensAtuais,
        capa: imagemCapa
    };

    try {
        if (id) {
            await updateDoc(doc(db, "produtos", id), produto);
            customAlert("Produto atualizado com sucesso!");
        } else {
            await addDoc(collection(db, "produtos"), produto);
            customAlert("Produto adicionado com sucesso!");
        }
        resetForm();
        carregarProdutosAdmin();
    } catch (error) {
        console.error("Erro ao salvar", error);
        customAlert("Erro ao salvar produto.");
    } finally {
        document.getElementById('btn-salvar').textContent = "Salvar Produto";
        document.getElementById('btn-salvar').disabled = false;
    }
});

window.editarProduto = async function(id) {
    try {
        const querySnapshot = await getDocs(collection(db, "produtos"));
        const docSnap = querySnapshot.docs.find(d => d.id === id);
        if (docSnap) {
            const data = docSnap.data();
            document.getElementById('produto-id').value = docSnap.id;
            document.getElementById('produto-nome').value = data.nome;
            document.getElementById('produto-categoria').value = data.categoria;
            document.getElementById('produto-descricao').value = data.descricao;
            document.getElementById('produto-minimo').value = data.pedido_minimo;
            document.getElementById('produto-preco').value = data.preco;
            
            imagensAtuais = data.imagens || [];
            imagemCapa = data.capa || (imagensAtuais.length > 0 ? imagensAtuais[0] : '');
            
            document.getElementById('form-titulo').textContent = "Editar Produto";
            btnCancelar.style.display = 'inline-block';
            renderizarPreview();
            window.scrollTo(0, 0);
        }
    } catch(e) { console.error(e); }
}

window.deletarProduto = async function(id) {
    if(confirm("Tem certeza que deseja excluir este produto?")) {
        try {
            await deleteDoc(doc(db, "produtos", id));
            carregarProdutosAdmin();
        } catch(e) {
            console.error(e);
            customAlert("Erro ao excluir.");
        }
    }
}

btnCancelar.addEventListener('click', resetForm);

function resetForm() {
    produtoForm.reset();
    document.getElementById('produto-id').value = '';
    imagensAtuais = [];
    imagemCapa = '';
    document.getElementById('form-titulo').textContent = "Adicionar Produto";
    btnCancelar.style.display = 'none';
    renderizarPreview();
}

function customAlert(msg) {
    const alertDiv = document.createElement('div');
    alertDiv.textContent = msg;
    alertDiv.style.position = 'fixed';
    alertDiv.style.bottom = '20px';
    alertDiv.style.right = '20px';
    alertDiv.style.background = '#0F172A';
    alertDiv.style.color = '#FFF';
    alertDiv.style.padding = '12px 24px';
    alertDiv.style.borderRadius = '8px';
    alertDiv.style.zIndex = '10000';
    alertDiv.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
    document.body.appendChild(alertDiv);
    setTimeout(() => alertDiv.remove(), 3000);
};
