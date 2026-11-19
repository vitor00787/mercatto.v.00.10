/* Mercadinho - app.js - Catalogo, carrinho, favoritos, vendas, contato e simulador das paginas com Bootstrap */
const CHAVES = {
    carrinho: "mercadinho_carrinho",
    favoritos: "mercadinho_favoritos",
    vendas: "mercadinho_vendas",
    mensagens: "mercadinho_mensagens",
    usuario: "mercadinho_usuario"
};

const TAXAS = { gratis: 0.12, basico: 0.09, profissional: 0.06, premium: 0.04 };

function ler(chave) {
    const bruto = localStorage.getItem(chave);
    return bruto ? JSON.parse(bruto) : [];
}

function gravar(chave, valor) {
    localStorage.setItem(chave, JSON.stringify(valor));
}

function moeda(valor) {
    return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function todosProdutos() {
    return PRODUTOS.concat(ler(CHAVES.vendas));
}

function buscarProduto(id) {
    return todosProdutos().find(function (p) {
        return p.id === id;
    });
}

function atualizarContador() {
    const itens = ler(CHAVES.carrinho);
    let total = 0;
    for (const item of itens) {
        total += item.qtd;
    }
    document.querySelectorAll(".contador-carrinho").forEach(function (el) {
        el.textContent = total;
    });
}

function atualizarUsuario() {
    const link = document.getElementById("linkEntrar");
    const nome = localStorage.getItem(CHAVES.usuario);
    if (link && nome) {
        link.textContent = nome.split(" ")[0];
    }
}

function configurarBusca() {
    const form = document.getElementById("formBusca");
    const campo = document.getElementById("campoBusca");
    if (!form) {
        return;
    }
    form.addEventListener("submit", function (evento) {
        evento.preventDefault();
        const termo = campo.value.trim();
        location.href = termo ? "produtos.html?q=" + encodeURIComponent(termo) : "produtos.html";
    });
}

function mostrarAlerta(texto, tipo) {
    const area = document.getElementById("alertas");
    if (!area) {
        return;
    }
    area.innerHTML =
        '<div class="alert alert-' + tipo + ' alert-dismissible fade show" role="alert">' +
        texto +
        '<button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Fechar"></button></div>';
}

function adicionarAoCarrinho(id) {
    const carrinho = ler(CHAVES.carrinho);
    const item = carrinho.find(function (i) {
        return i.id === id;
    });
    if (item) {
        item.qtd += 1;
    } else {
        carrinho.push({ id: id, qtd: 1 });
    }
    gravar(CHAVES.carrinho, carrinho);
    atualizarContador();
}

function alternarFavorito(id) {
    let favoritos = ler(CHAVES.favoritos);
    let salvo;
    if (favoritos.includes(id)) {
        favoritos = favoritos.filter(function (f) {
            return f !== id;
        });
        salvo = false;
    } else {
        favoritos.push(id);
        salvo = true;
    }
    gravar(CHAVES.favoritos, favoritos);
    return salvo;
}

function cartaoProduto(p, comRemover) {
    const selo = p.oferta ? '<span class="badge selo-oferta">Oferta</span>' : "";
    const remover = comRemover
        ? '<button type="button" class="btn btn-perigo w-100 mt-1" data-remover-fav="' + p.id + '">Remover dos favoritos</button>'
        : "";
    return (
        '<div class="col"><article class="card h-100 produto-card">' +
        selo +
        '<img src="' + p.imagem + '" class="card-img-top" alt="' + p.nome + '">' +
        '<div class="card-body"><h3 class="h6 card-title mb-1">' + p.nome + "</h3>" +
        '<p class="card-text small text-secondary mb-1">' + p.categoria + " · " + p.vendedor + "</p>" +
        '<p class="preco">' + moeda(p.preco) + "</p></div>" +
        '<div class="card-footer bg-white border-0 px-0">' +
        '<a href="produto.html?id=' + p.id + '" class="btn btn-contorno btn-sm w-100">Ver produto</a>' +
        remover +
        "</div></article></div>"
    );
}

function desenhar(destino, itens, comRemover) {
    const area = document.getElementById(destino);
    let html = "";
    for (const p of itens) {
        html += cartaoProduto(p, comRemover);
    }
    if (html === "") {
        html = '<div class="col-12"><p class="text-secondary">Nenhum produto encontrado.</p></div>';
    }
    area.innerHTML = html;
}

function desenharChips(destino, ativa, comTodos) {
    let html = comTodos ? '<a class="chip' + (ativa === "" ? " ativo" : "") + '" href="produtos.html">Todos</a>' : "";
    for (const categoria of CATEGORIAS) {
        const classe = categoria === ativa ? "chip ativo" : "chip";
        html += '<a class="' + classe + '" href="produtos.html?cat=' + encodeURIComponent(categoria) + '">' + categoria + "</a>";
    }
    document.getElementById(destino).innerHTML = html;
}

function validar(form) {
    if (!form.checkValidity()) {
        form.classList.add("was-validated");
        return false;
    }
    form.classList.remove("was-validated");
    return true;
}

const paginas = {
    index: function () {
        const lista = todosProdutos();
        desenharChips("chips", "", false);
        desenhar("listaDestaques", lista.slice(0, 4), false);
        desenhar("listaOfertas", lista.filter(function (p) {
            return p.oferta;
        }).slice(0, 4), false);
    },

    produtos: function () {
        const params = new URLSearchParams(location.search);
        const termo = (params.get("q") || "").toLowerCase();
        const categoria = params.get("cat") || "";
        const soOfertas = params.get("oferta") === "1";
        const ordem = document.getElementById("ordenar");
        const campoBusca = document.getElementById("campoBusca");
        campoBusca.value = params.get("q") || "";
        desenharChips("chips", categoria, true);

        function filtrar() {
            const itens = todosProdutos().filter(function (p) {
                const okCategoria = categoria === "" || p.categoria === categoria;
                const okOferta = !soOfertas || p.oferta;
                const okTermo = termo === "" || p.nome.toLowerCase().includes(termo) || p.categoria.toLowerCase().includes(termo);
                return okCategoria && okOferta && okTermo;
            });
            if (ordem.value === "menor") {
                itens.sort(function (a, b) {
                    return a.preco - b.preco;
                });
            } else if (ordem.value === "maior") {
                itens.sort(function (a, b) {
                    return b.preco - a.preco;
                });
            }
            document.getElementById("contagem").textContent = itens.length + " produto(s) encontrado(s)";
            desenhar("listaProdutos", itens, false);
        }

        ordem.addEventListener("change", filtrar);
        filtrar();
    },

    produto: function () {
        const id = Number(new URLSearchParams(location.search).get("id"));
        const p = buscarProduto(id);
        const area = document.getElementById("detalhe");
        if (!p) {
            area.innerHTML = '<div class="alert alert-danger">Produto não encontrado. <a href="produtos.html">Ver todos os produtos</a></div>';
            return;
        }
        document.getElementById("trilha").innerHTML =
            '<a href="index.html">Início</a> / <a href="produtos.html?cat=' + encodeURIComponent(p.categoria) + '">' +
            p.categoria + "</a> / " + p.nome;
        let miniaturas = "";
        for (let i = 0; i < 3; i++) {
            miniaturas +=
                '<button type="button" class="miniatura' + (i === 0 ? " ativa" : "") + '" data-img="' + p.imagem + '">' +
                '<img src="' + p.imagem + '" alt="Foto ' + (i + 1) + ' de ' + p.nome + '"></button>';
        }
        area.innerHTML =
            '<div class="row g-4"><div class="col-lg-7">' +
            '<img id="imagemPrincipal" class="img-fluid w-100 imagem-grande" src="' + p.imagem + '" alt="' + p.nome + '">' +
            '<div class="d-flex gap-2 mt-3" id="miniaturas">' + miniaturas + "</div></div>" +
            '<div class="col-lg-5"><h1 class="h2 fw-bold">' + p.nome + "</h1>" +
            '<p class="preco-grande">' + moeda(p.preco) + "</p>" +
            '<p class="text-secondary">' + p.descricao + "</p>" +
            '<p class="vendedor">Vendido por <strong>' + p.vendedor + "</strong></p>" +
            '<div class="d-flex flex-column flex-sm-row gap-2">' +
            '<button type="button" id="btnAdicionar" class="btn btn-verde flex-grow-1">Adicionar ao carrinho</button>' +
            '<button type="button" id="btnFavorito" class="btn btn-contorno"></button></div></div></div>';

        const btnFavorito = document.getElementById("btnFavorito");
        function textoFavorito() {
            btnFavorito.textContent = ler(CHAVES.favoritos).includes(p.id) ? "Remover dos favoritos" : "Salvar nos favoritos";
        }
        textoFavorito();

        document.getElementById("btnAdicionar").addEventListener("click", function () {
            adicionarAoCarrinho(p.id);
            mostrarAlerta(p.nome + " foi adicionado ao carrinho. <a href='carrinho.html'>Ver carrinho</a>", "success");
        });
        btnFavorito.addEventListener("click", function () {
            const salvo = alternarFavorito(p.id);
            textoFavorito();
            mostrarAlerta(salvo ? "Produto salvo nos favoritos." : "Produto removido dos favoritos.", "success");
        });
        document.getElementById("miniaturas").addEventListener("click", function (evento) {
            const botao = evento.target.closest(".miniatura");
            if (!botao) {
                return;
            }
            document.querySelectorAll(".miniatura").forEach(function (m) {
                m.classList.remove("ativa");
            });
            botao.classList.add("ativa");
            document.getElementById("imagemPrincipal").src = botao.dataset.img;
        });
    },

    carrinho: function () {
        const area = document.getElementById("listaCarrinho");

        function desenharCarrinho() {
            const carrinho = ler(CHAVES.carrinho);
            let total = 0;
            let html = "";
            for (const item of carrinho) {
                const p = buscarProduto(item.id);
                if (!p) {
                    continue;
                }
                total += p.preco * item.qtd;
                html +=
                    '<article class="item-carrinho"><img src="' + p.imagem + '" alt="' + p.nome + '">' +
                    '<div class="info"><div class="d-flex justify-content-between gap-2">' +
                    '<a href="produto.html?id=' + p.id + '" class="text-dark">' + p.nome + "</a>" +
                    "<strong>" + moeda(p.preco * item.qtd) + "</strong></div>" +
                    '<div class="d-flex justify-content-between align-items-center mt-2">' +
                    '<div class="quantidade">' +
                    '<button type="button" data-acao="menos" data-id="' + p.id + '" aria-label="Diminuir">-</button>' +
                    "<span>" + item.qtd + "</span>" +
                    '<button type="button" data-acao="mais" data-id="' + p.id + '" aria-label="Aumentar">+</button></div>' +
                    '<button type="button" class="btn btn-perigo" data-acao="remover" data-id="' + p.id + '">Remover</button>' +
                    "</div></div></article>";
            }
            if (html === "") {
                html = '<p class="text-secondary py-4">Seu carrinho está vazio. <a href="produtos.html">Escolha alguns produtos</a>.</p>';
            }
            area.innerHTML = html;
            document.getElementById("subtotal").textContent = moeda(total);
            document.getElementById("total").textContent = moeda(total);
        }

        area.addEventListener("click", function (evento) {
            const botao = evento.target.closest("[data-acao]");
            if (!botao) {
                return;
            }
            const id = Number(botao.dataset.id);
            let carrinho = ler(CHAVES.carrinho);
            const item = carrinho.find(function (i) {
                return i.id === id;
            });
            if (botao.dataset.acao === "mais") {
                item.qtd += 1;
            } else if (botao.dataset.acao === "menos") {
                item.qtd = Math.max(1, item.qtd - 1);
            } else {
                carrinho = carrinho.filter(function (i) {
                    return i.id !== id;
                });
            }
            gravar(CHAVES.carrinho, carrinho);
            atualizarContador();
            desenharCarrinho();
        });

        document.getElementById("btnFinalizar").addEventListener("click", function () {
            if (ler(CHAVES.carrinho).length === 0) {
                mostrarAlerta("Adicione pelo menos um produto antes de finalizar a compra.", "danger");
                return;
            }
            gravar(CHAVES.carrinho, []);
            atualizarContador();
            desenharCarrinho();
            mostrarAlerta("Compra finalizada com sucesso! Obrigado por comprar no Mercadinho.", "success");
        });

        desenharCarrinho();
    },

    favoritos: function () {
        function desenharFavoritos() {
            const ids = ler(CHAVES.favoritos);
            const itens = todosProdutos().filter(function (p) {
                return ids.includes(p.id);
            });
            desenhar("listaFavoritos", itens, true);
            document.getElementById("contagem").textContent = itens.length + " item(ns) salvo(s)";
        }

        document.getElementById("listaFavoritos").addEventListener("click", function (evento) {
            const botao = evento.target.closest("[data-remover-fav]");
            if (!botao) {
                return;
            }
            alternarFavorito(Number(botao.dataset.removerFav));
            desenharFavoritos();
        });

        desenharFavoritos();
    },

    vender: function () {
        const form = document.getElementById("formVenda");
        const lista = document.getElementById("meusAnuncios");

        function desenharAnuncios() {
            const vendas = ler(CHAVES.vendas);
            let html = "";
            for (const p of vendas) {
                html +=
                    '<li class="list-group-item d-flex justify-content-between align-items-center gap-2">' +
                    "<span>" + p.nome + " - " + moeda(p.preco) + "</span>" +
                    '<button type="button" class="btn btn-perigo" data-excluir="' + p.id + '">Excluir</button></li>';
            }
            if (html === "") {
                html = '<li class="list-group-item text-secondary">Você ainda não anunciou nenhum produto.</li>';
            }
            lista.innerHTML = html;
        }

        form.addEventListener("submit", function (evento) {
            evento.preventDefault();
            if (!validar(form)) {
                mostrarAlerta("Revise os campos destacados em vermelho.", "danger");
                return;
            }
            const vendas = ler(CHAVES.vendas);
            vendas.push({
                id: Date.now(),
                nome: document.getElementById("nome").value.trim(),
                preco: Number(document.getElementById("preco").value),
                categoria: document.getElementById("categoria").value,
                oferta: false,
                vendedor: document.getElementById("vendedor").value.trim(),
                imagem: "img/novo.svg",
                descricao: document.getElementById("descricao").value.trim()
            });
            gravar(CHAVES.vendas, vendas);
            form.reset();
            desenharAnuncios();
            mostrarAlerta("Produto anunciado! Ele já aparece no catálogo.", "success");
        });

        lista.addEventListener("click", function (evento) {
            const botao = evento.target.closest("[data-excluir]");
            if (!botao) {
                return;
            }
            const id = Number(botao.dataset.excluir);
            gravar(CHAVES.vendas, ler(CHAVES.vendas).filter(function (p) {
                return p.id !== id;
            }));
            desenharAnuncios();
        });

        desenharAnuncios();
    },

    contato: function () {
        const form = document.getElementById("formContato");
        const total = document.getElementById("totalMensagens");
        total.textContent = ler(CHAVES.mensagens).length;

        form.addEventListener("submit", function (evento) {
            evento.preventDefault();
            if (!validar(form)) {
                mostrarAlerta("Revise os campos destacados em vermelho.", "danger");
                return;
            }
            const mensagens = ler(CHAVES.mensagens);
            mensagens.push({
                nome: document.getElementById("nome").value.trim(),
                email: document.getElementById("email").value.trim(),
                telefone: document.getElementById("telefone").value.trim(),
                assunto: document.getElementById("assunto").value,
                texto: document.getElementById("mensagem").value.trim()
            });
            gravar(CHAVES.mensagens, mensagens);
            total.textContent = mensagens.length;
            mostrarAlerta("Mensagem enviada! Responderemos em até 2 dias úteis.", "success");
            form.reset();
        });
    },

    planos: function () {
        const form = document.getElementById("simulador");
        const resultado = document.getElementById("resultado");

        function simular() {
            const valor = Number(document.getElementById("valorVenda").value);
            const taxa = TAXAS[document.getElementById("planoEscolhido").value];
            if (valor > 0) {
                const comissao = valor * taxa;
                resultado.textContent = "Comissão de " + moeda(comissao) + ". Você recebe " + moeda(valor - comissao) + ".";
            } else {
                resultado.textContent = "Informe o valor da venda para simular.";
            }
        }

        form.addEventListener("input", simular);
        form.addEventListener("submit", function (evento) {
            evento.preventDefault();
            simular();
        });
    }
};

document.addEventListener("DOMContentLoaded", function () {
    atualizarContador();
    atualizarUsuario();
    configurarBusca();
    const iniciar = paginas[document.body.dataset.pagina];
    if (iniciar) {
        iniciar();
    }
});
