/* Mercadinho - puro.js - JavaScript puro das paginas Entrar e Sobre, sem frameworks ou bibliotecas */
const CHAVE_CARRINHO = "mercadinho_carrinho";
const CHAVE_USUARIO = "mercadinho_usuario";
const CHAVE_USUARIOS = "mercadinho_usuarios";
const CHAVE_VISITAS = "mercadinho_visitas";

function lerLista(chave) {
    const bruto = localStorage.getItem(chave);
    return bruto ? JSON.parse(bruto) : [];
}

function atualizarCabecalho() {
    const itens = lerLista(CHAVE_CARRINHO);
    let total = 0;
    for (const item of itens) {
        total += item.qtd;
    }
    document.getElementById("contador").textContent = total;
    const nome = localStorage.getItem(CHAVE_USUARIO);
    if (nome) {
        document.getElementById("linkEntrar").textContent = nome.split(" ")[0];
    }
}

function configurarMenu() {
    const botao = document.getElementById("botaoMenu");
    const menu = document.getElementById("menu");
    botao.addEventListener("click", function () {
        const aberto = menu.classList.toggle("aberto");
        botao.setAttribute("aria-expanded", aberto);
    });
}

function configurarBusca() {
    const form = document.getElementById("formBusca");
    form.addEventListener("submit", function (evento) {
        evento.preventDefault();
        const termo = document.getElementById("campoBusca").value.trim();
        location.href = termo ? "produtos.html?q=" + encodeURIComponent(termo) : "produtos.html";
    });
}

function mostrarMensagem(texto, tipo) {
    const caixa = document.getElementById("mensagem");
    caixa.textContent = texto;
    caixa.className = "p-alerta " + (tipo === "ok" ? "p-alerta-ok" : "p-alerta-erro");
}

function iniciarEntrar() {
    const abas = document.querySelectorAll(".p-aba");
    const formEntrar = document.getElementById("formEntrar");
    const formCadastro = document.getElementById("formCadastro");
    const sessao = document.getElementById("sessao");

    function mostrarSessao() {
        const nome = localStorage.getItem(CHAVE_USUARIO);
        if (nome) {
            document.getElementById("nomeSessao").textContent = nome;
            sessao.classList.remove("p-oculto");
            formEntrar.classList.add("p-oculto");
            formCadastro.classList.add("p-oculto");
            document.getElementById("abas").classList.add("p-oculto");
        } else {
            sessao.classList.add("p-oculto");
            document.getElementById("abas").classList.remove("p-oculto");
            formEntrar.classList.remove("p-oculto");
        }
    }

    document.getElementById("abas").addEventListener("click", function (evento) {
        const aba = evento.target.closest(".p-aba");
        if (!aba) {
            return;
        }
        for (const a of abas) {
            a.classList.remove("ativa");
        }
        aba.classList.add("ativa");
        if (aba.dataset.alvo === "entrar") {
            formEntrar.classList.remove("p-oculto");
            formCadastro.classList.add("p-oculto");
        } else {
            formCadastro.classList.remove("p-oculto");
            formEntrar.classList.add("p-oculto");
        }
    });

    formCadastro.addEventListener("submit", function (evento) {
        evento.preventDefault();
        const nome = document.getElementById("cadNome").value.trim();
        const email = document.getElementById("cadEmail").value.trim().toLowerCase();
        const senha = document.getElementById("cadSenha").value;
        const usuarios = lerLista(CHAVE_USUARIOS);
        const existe = usuarios.some(function (u) {
            return u.email === email;
        });
        if (existe) {
            mostrarMensagem("Este e-mail já está cadastrado. Use a aba Entrar.", "erro");
            return;
        }
        usuarios.push({ nome: nome, email: email, senha: senha });
        localStorage.setItem(CHAVE_USUARIOS, JSON.stringify(usuarios));
        localStorage.setItem(CHAVE_USUARIO, nome);
        mostrarMensagem("Conta criada com sucesso! Você já está conectado.", "ok");
        formCadastro.reset();
        mostrarSessao();
        atualizarCabecalho();
    });

    formEntrar.addEventListener("submit", function (evento) {
        evento.preventDefault();
        const email = document.getElementById("loginEmail").value.trim().toLowerCase();
        const senha = document.getElementById("loginSenha").value;
        const usuario = lerLista(CHAVE_USUARIOS).find(function (u) {
            return u.email === email && u.senha === senha;
        });
        if (!usuario) {
            mostrarMensagem("E-mail ou senha incorretos. Confira os dados ou crie uma conta.", "erro");
            return;
        }
        localStorage.setItem(CHAVE_USUARIO, usuario.nome);
        mostrarMensagem("Bem-vindo de volta, " + usuario.nome + "!", "ok");
        formEntrar.reset();
        mostrarSessao();
        atualizarCabecalho();
    });

    document.getElementById("botaoSair").addEventListener("click", function () {
        localStorage.removeItem(CHAVE_USUARIO);
        mostrarMensagem("Você saiu da sua conta.", "ok");
        document.getElementById("linkEntrar").textContent = "Entrar";
        mostrarSessao();
    });

    mostrarSessao();
}

function iniciarSobre() {
    const galeria = document.getElementById("galeria");
    galeria.addEventListener("click", function (evento) {
        const imagem = evento.target.closest("img");
        if (!imagem) {
            return;
        }
        const imagens = galeria.querySelectorAll("img");
        for (const i of imagens) {
            if (i !== imagem) {
                i.classList.remove("destaque");
            }
        }
        imagem.classList.toggle("destaque");
        const legenda = imagem.parentElement.querySelector("figcaption").textContent;
        document.getElementById("legendaGaleria").textContent = imagem.classList.contains("destaque")
            ? "Selecionado: " + legenda
            : "Clique em uma imagem para destacá-la.";
    });

    let visitas = Number(localStorage.getItem(CHAVE_VISITAS)) || 0;
    visitas += 1;
    localStorage.setItem(CHAVE_VISITAS, visitas);
    document.getElementById("visitas").textContent = visitas;
}

document.addEventListener("DOMContentLoaded", function () {
    atualizarCabecalho();
    configurarMenu();
    configurarBusca();
    const pagina = document.body.dataset.pagina;
    if (pagina === "entrar") {
        iniciarEntrar();
    } else if (pagina === "sobre") {
        iniciarSobre();
    }
});
