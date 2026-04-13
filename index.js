const express = require('express');
const app = express();

app.use(express.json());

let livros = [
    { id: 1, titulo: "1984", autor: "George Orwell", ano: 1949, genero: "Ficção Científica", preco: 45.90, estoque: 12 },
    { id: 2, titulo: "Dom Casmurro", autor: "Machado de Assis", ano: 1899, genero: "Romance", preco: 35.50, estoque: 8 },
    { id: 3, titulo: "O Cortiço", autor: "Aluísio Azevedo", ano: 1890, genero: "Realismo", preco: 42.00, estoque: 5 },
    { id: 4, titulo: "Harry Potter e a Pedra Filosofal", autor: "J.K. Rowling", ano: 1997, genero: "Fantasia", preco: 55.00, estoque: 20 },
    { id: 5, titulo: "O Pequeno Príncipe", autor: "Antoine de Saint-Exupéry", ano: 1943, genero: "Infantil", preco: 38.90, estoque: 15 },
    { id: 6, titulo: "Memórias Póstumas de Brás Cubas", autor: "Machado de Assis", ano: 1881, genero: "Romance", preco: 50.00, estoque: 7 },
    { id: 7, titulo: "O Alienígena", autor: "Isaac Asimov", ano: 1959, genero: "Ficção Científica", preco: 48.50, estoque: 10 },
    { id: 8, titulo: "O Código da Vinci", autor: "Dan Brown", ano: 2003, genero: "Mistério", preco: 52.00, estoque: 14 },
    { id: 9, titulo: "A Revolução dos Bichos", autor: "George Orwell", ano: 1945, genero: "Ficção Política", preco: 39.90, estoque: 11 },
    { id: 10, titulo: "O Homem Invisível", autor: "H.G. Wells", ano: 1897, genero: "Ficção Científica", preco: 41.00, estoque: 9 },
    { id: 11, titulo: "Grande Sertão: Veredas", autor: "Guimarães Rosa", ano: 1956, genero: "Romance", preco: 58.00, estoque: 6 },
    { id: 12, titulo: "Sapiens", autor: "Yuval Noah Harari", ano: 2011, genero: "Não-Ficção", preco: 67.50, estoque: 18 },
    { id: 13, titulo: "O Hobbit", autor: "J.R.R. Tolkien", ano: 1937, genero: "Fantasia", preco: 54.00, estoque: 13 },
    { id: 14, titulo: "O Vendedor de Sonhos", autor: "Augusto Cury", ano: 2008, genero: "Desenvolvimento Pessoal", preco: 42.50, estoque: 16 },
    { id: 15, titulo: "Fundação", autor: "Isaac Asimov", ano: 1951, genero: "Ficção Científica", preco: 59.90, estoque: 8 }
];

let nextId = 16;

app.get('/api/livros', (req, res) => {
    const { genero, preco_max, preco_min, ordem, direcao, pagina = 1, limite = 10 } = req.query;
    
    let resultado = livros;

    if (genero) resultado = resultado.filter(l => l.genero === genero);
    if (preco_max) resultado = resultado.filter(l => l.preco <= parseFloat(preco_max));
    if (preco_min) resultado = resultado.filter(l => l.preco >= parseFloat(preco_min));

    if (ordem) {
        resultado = resultado.sort((a, b) => {
            if (ordem === 'preco') {
                return direcao === 'desc' ? b.preco - a.preco : a.preco - b.preco;
            }
            if (ordem === 'titulo') {
                return direcao === 'desc' ? b.titulo.localeCompare(a.titulo) : a.titulo.localeCompare(b.titulo);
            }
            if (ordem === 'ano') {
                return direcao === 'desc' ? b.ano - a.ano : a.ano - b.ano;
            }
        });
    }

    const paginaNum = parseInt(pagina);
    const limiteNum = parseInt(limite);
    const inicio = (paginaNum - 1) * limiteNum;
    const paginado = resultado.slice(inicio, inicio + limiteNum);

    res.json({
        dados: paginado,
        paginacao: {
            pagina_atual: paginaNum,
            itens_por_pagina: limiteNum,
            total_itens: resultado.length,
            total_paginas: Math.ceil(resultado.length / limiteNum)
        }
    });
});

app.get('/api/livros/:id', (req, res) => {
    const livro = livros.find(l => l.id === parseInt(req.params.id));
    if (!livro) return res.status(404).json({ erro: "Livro não encontrado" });
    res.json(livro);
});

app.post('/api/livros', (req, res) => {
    const { titulo, autor, ano, genero, preco, estoque } = req.body;

    if (!titulo || typeof titulo !== 'string' || titulo.trim().length < 2) {
        return res.status(400).json({ erro: "Título é obrigatório e deve ter pelo menos 2 caracteres." });
    }
    if (!autor || typeof autor !== 'string' || autor.trim().length < 2) {
        return res.status(400).json({ erro: "Autor é obrigatório e deve ter pelo menos 2 caracteres." });
    }
    if (!ano || typeof ano !== 'number' || ano < 1000 || ano > new Date().getFullYear()) {
        return res.status(400).json({ erro: "Ano deve ser um número válido." });
    }
    if (!genero || typeof genero !== 'string' || genero.trim().length < 2) {
        return res.status(400).json({ erro: "Gênero é obrigatório e deve ter pelo menos 2 caracteres." });
    }
    if (preco === undefined || typeof preco !== 'number' || preco <= 0) {
        return res.status(400).json({ erro: "Preço deve ser um número positivo." });
    }
    if (estoque === undefined || !Number.isInteger(estoque) || estoque < 0) {
        return res.status(400).json({ erro: "Estoque deve ser um número inteiro não negativo." });
    }

    const novoLivro = {
        id: nextId++,
        titulo: titulo.trim(),
        autor: autor.trim(),
        ano,
        genero: genero.trim(),
        preco,
        estoque
    };

    livros.push(novoLivro);
    res.status(201).json(novoLivro);
});

app.put('/api/livros/:id', (req, res) => {
    const livro = livros.find(l => l.id === parseInt(req.params.id));
    if (!livro) return res.status(404).json({ erro: "Livro não encontrado" });

    const { titulo, autor, ano, genero, preco, estoque } = req.body;

    if (titulo !== undefined) {
        if (typeof titulo !== 'string' || titulo.trim().length < 2) {
            return res.status(400).json({ erro: "Título deve ter pelo menos 2 caracteres." });
        }
        livro.titulo = titulo.trim();
    }

    if (autor !== undefined) {
        if (typeof autor !== 'string' || autor.trim().length < 2) {
            return res.status(400).json({ erro: "Autor deve ter pelo menos 2 caracteres." });
        }
        livro.autor = autor.trim();
    }

    if (ano !== undefined) {
        if (typeof ano !== 'number' || ano < 1000 || ano > new Date().getFullYear()) {
            return res.status(400).json({ erro: "Ano deve ser um número válido." });
        }
        livro.ano = ano;
    }

    if (genero !== undefined) {
        if (typeof genero !== 'string' || genero.trim().length < 2) {
            return res.status(400).json({ erro: "Gênero deve ter pelo menos 2 caracteres." });
        }
        livro.genero = genero.trim();
    }

    if (preco !== undefined) {
        if (typeof preco !== 'number' || preco <= 0) {
            return res.status(400).json({ erro: "Preço deve ser um número positivo." });
        }
        livro.preco = preco;
    }

    if (estoque !== undefined) {
        if (!Number.isInteger(estoque) || estoque < 0) {
            return res.status(400).json({ erro: "Estoque deve ser um número inteiro não negativo." });
        }
        livro.estoque = estoque;
    }

    res.json(livro);
});

app.delete('/api/livros/:id', (req, res) => {
    const index = livros.findIndex(l => l.id === parseInt(req.params.id));
    if (index === -1) return res.status(404).json({ erro: "Livro não encontrado" });

    const livroRemovido = livros.splice(index, 1);
    res.json({ mensagem: "Livro removido com sucesso", livro: livroRemovido[0] });
});

app.listen(3000, () => console.log('🚀 API de Livros rodando na porta 3000'));