const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const jwt = require('jsonwebtoken');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const SECRET_KEY = process.env.SECRET_KEY || 'sua-chave-secreta-jwt-2024';

// Middlewares
app.use(cors());
app.use(express.json());

// Conectar ao banco de dados
const dbPath = path.join(__dirname, 'livros.db');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) console.error('Erro ao abrir banco:', err);
    else console.log('✅ Conectado ao SQLite');
});

// Middleware de autenticação JWT
const verificarToken = (req, res, next) => {
    const token = req.headers['authorization'];
    
    if (!token) {
        return res.status(401).json({ erro: 'Token não fornecido' });
    }

    const bearerToken = token.startsWith('Bearer ') ? token.slice(7) : token;
    
    try {
        const decoded = jwt.verify(bearerToken, SECRET_KEY);
        req.usuario = decoded;
        next();
    } catch (err) {
        return res.status(401).json({ erro: 'Token inválido ou expirado' });
    }
};

// Rota pública: gerar token (login)
app.post('/auth/login', (req, res) => {
    const usuario = {
        id: 1,
        nome: 'Admin',
        email: 'admin@livros.com'
    };
    
    const token = jwt.sign(usuario, SECRET_KEY, { expiresIn: '7d' });
    res.json({ token, usuario });
});

// Inicializar banco de dados
const initDatabase = () => {
    db.serialize(() => {
        // Tabela de autores
        db.run(`
            CREATE TABLE IF NOT EXISTS autores (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                nome TEXT UNIQUE NOT NULL,
                pais TEXT,
                data_criacao DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Tabela de livros
        db.run(`
            CREATE TABLE IF NOT EXISTS livros (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                titulo TEXT NOT NULL,
                autor_id INTEGER NOT NULL,
                ano INTEGER NOT NULL,
                genero TEXT NOT NULL,
                preco REAL NOT NULL,
                estoque INTEGER NOT NULL,
                descricao TEXT,
                data_criacao DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (autor_id) REFERENCES autores(id)
            )
        `);

        // Verificar se já há dados
        db.get('SELECT COUNT(*) as count FROM livros', (err, row) => {
            if (row.count === 0) {
                inserirDadosIniciais();
            }
        });
    });
};

// Dados iniciais (20+ livros com autores)
const inserirDadosIniciais = () => {
    const autores = [
        { nome: 'George Orwell', pais: 'Reino Unido' },
        { nome: 'Machado de Assis', pais: 'Brasil' },
        { nome: 'Aluísio Azevedo', pais: 'Brasil' },
        { nome: 'J.K. Rowling', pais: 'Reino Unido' },
        { nome: 'Antoine de Saint-Exupéry', pais: 'França' },
        { nome: 'Isaac Asimov', pais: 'EUA' },
        { nome: 'Dan Brown', pais: 'EUA' },
        { nome: 'H.G. Wells', pais: 'Reino Unido' },
        { nome: 'Guimarães Rosa', pais: 'Brasil' },
        { nome: 'Yuval Noah Harari', pais: 'Israel' },
        { nome: 'J.R.R. Tolkien', pais: 'Reino Unido' },
        { nome: 'Augusto Cury', pais: 'Brasil' },
        { nome: 'Clarice Lispector', pais: 'Brasil' }
    ];

    const livros = [
        { titulo: '1984', autorNome: 'George Orwell', ano: 1949, genero: 'Ficção Científica', preco: 45.90, estoque: 12 },
        { titulo: 'Dom Casmurro', autorNome: 'Machado de Assis', ano: 1899, genero: 'Romance', preco: 35.50, estoque: 8 },
        { titulo: 'O Cortiço', autorNome: 'Aluísio Azevedo', ano: 1890, genero: 'Realismo', preco: 42.00, estoque: 5 },
        { titulo: 'Harry Potter e a Pedra Filosofal', autorNome: 'J.K. Rowling', ano: 1997, genero: 'Fantasia', preco: 55.00, estoque: 20 },
        { titulo: 'O Pequeno Príncipe', autorNome: 'Antoine de Saint-Exupéry', ano: 1943, genero: 'Infantil', preco: 38.90, estoque: 15 },
        { titulo: 'Memórias Póstumas de Brás Cubas', autorNome: 'Machado de Assis', ano: 1881, genero: 'Romance', preco: 50.00, estoque: 7 },
        { titulo: 'O Alienígena', autorNome: 'Isaac Asimov', ano: 1959, genero: 'Ficção Científica', preco: 48.50, estoque: 10 },
        { titulo: 'O Código da Vinci', autorNome: 'Dan Brown', ano: 2003, genero: 'Mistério', preco: 52.00, estoque: 14 },
        { titulo: 'A Revolução dos Bichos', autorNome: 'George Orwell', ano: 1945, genero: 'Ficção Política', preco: 39.90, estoque: 11 },
        { titulo: 'O Homem Invisível', autorNome: 'H.G. Wells', ano: 1897, genero: 'Ficção Científica', preco: 41.00, estoque: 9 },
        { titulo: 'Grande Sertão: Veredas', autorNome: 'Guimarães Rosa', ano: 1956, genero: 'Romance', preco: 58.00, estoque: 6 },
        { titulo: 'Sapiens', autorNome: 'Yuval Noah Harari', ano: 2011, genero: 'Não-Ficção', preco: 67.50, estoque: 18 },
        { titulo: 'O Hobbit', autorNome: 'J.R.R. Tolkien', ano: 1937, genero: 'Fantasia', preco: 54.00, estoque: 13 },
        { titulo: 'O Vendedor de Sonhos', autorNome: 'Augusto Cury', ano: 2008, genero: 'Desenvolvimento Pessoal', preco: 42.50, estoque: 16 },
        { titulo: 'Fundação', autorNome: 'Isaac Asimov', ano: 1951, genero: 'Ficção Científica', preco: 59.90, estoque: 8 },
        { titulo: 'Fundação e Império', autorNome: 'Isaac Asimov', ano: 1952, genero: 'Ficção Científica', preco: 61.00, estoque: 7 },
        { titulo: 'A Segunda Fundação', autorNome: 'Isaac Asimov', ano: 1953, genero: 'Ficção Científica', preco: 62.00, estoque: 6 },
        { titulo: 'Harry Potter e a Câmara Secreta', autorNome: 'J.K. Rowling', ano: 1998, genero: 'Fantasia', preco: 56.00, estoque: 19 },
        { titulo: 'O Senhor dos Anéis', autorNome: 'J.R.R. Tolkien', ano: 1954, genero: 'Fantasia', preco: 85.00, estoque: 11 },
        { titulo: 'Quincas Borba', autorNome: 'Machado de Assis', ano: 1891, genero: 'Romance', preco: 48.00, estoque: 9 },
        { titulo: 'A Paixão Segundo G.H.', autorNome: 'Clarice Lispector', ano: 1964, genero: 'Romance', preco: 44.00, estoque: 8 }
    ];

    // Inserir autores e pegar IDs
    const autorMap = {};
    let autorCount = 0;

    autores.forEach((autor) => {
        db.run('INSERT OR IGNORE INTO autores (nome, pais) VALUES (?, ?)', 
            [autor.nome, autor.pais],
            (err) => {
                if (!err) {
                    db.get('SELECT id FROM autores WHERE nome = ?', [autor.nome], (err, row) => {
                        if (row) {
                            autorMap[autor.nome] = row.id;
                            autorCount++;
                            
                            // Quando todos os autores estiverem inseridos, inserir livros
                            if (autorCount === autores.length) {
                                inserirLivros();
                            }
                        }
                    });
                }
            }
        );
    });

    const inserirLivros = () => {
        livros.forEach((livro) => {
            db.run(
                'INSERT INTO livros (titulo, autor_id, ano, genero, preco, estoque) VALUES (?, ?, ?, ?, ?, ?)',
                [livro.titulo, autorMap[livro.autorNome], livro.ano, livro.genero, livro.preco, livro.estoque]
            );
        });
        console.log('✅ Dados iniciais inseridos (20+ livros)');
    };
};

// ============ ROTAS PÚBLICAS ============

// GET - Listar todos os livros com filtros, ordenação e paginação
app.get('/api/livros', (req, res) => {
    const { genero, preco_max, preco_min, titulo, autor, ordem = 'titulo', direcao = 'asc', pagina = 1, limite = 10 } = req.query;

    let query = `
        SELECT l.*, a.nome as autor_nome 
        FROM livros l
        JOIN autores a ON l.autor_id = a.id
        WHERE 1=1
    `;
    const params = [];

    if (genero) {
        query += ' AND l.genero = ?';
        params.push(genero);
    }
    if (preco_max) {
        query += ' AND l.preco <= ?';
        params.push(parseFloat(preco_max));
    }
    if (preco_min) {
        query += ' AND l.preco >= ?';
        params.push(parseFloat(preco_min));
    }
    if (titulo) {
        query += ' AND l.titulo LIKE ?';
        params.push(`%${titulo}%`);
    }
    if (autor) {
        query += ' AND a.nome LIKE ?';
        params.push(`%${autor}%`);
    }

    // Validar campos de ordenação
    const camposValidos = ['titulo', 'preco', 'ano', 'autor_nome', 'estoque'];
    const campoOrdenacao = camposValidos.includes(ordem) ? ordem : 'titulo';
    const direcaoValida = ['asc', 'desc'].includes(direcao?.toLowerCase()) ? direcao.toUpperCase() : 'ASC';

    query += ` ORDER BY l.${campoOrdenacao} ${direcaoValida}`;

    // Contar total antes de paginar
    db.get(`SELECT COUNT(*) as total FROM (${query})`, params, (err, result) => {
        if (err) return res.status(500).json({ erro: 'Erro ao contar registros' });

        const paginaNum = Math.max(1, parseInt(pagina));
        const limiteNum = Math.min(100, Math.max(1, parseInt(limite)));
        const offset = (paginaNum - 1) * limiteNum;

        query += ` LIMIT ? OFFSET ?`;
        params.push(limiteNum, offset);

        db.all(query, params, (err, dados) => {
            if (err) return res.status(500).json({ erro: 'Erro ao buscar livros' });

            res.json({
                dados: dados,
                paginacao: {
                    pagina_atual: paginaNum,
                    itens_por_pagina: limiteNum,
                    total_itens: result.total,
                    total_paginas: Math.ceil(result.total / limiteNum)
                }
            });
        });
    });
});

// GET - Buscar livro por ID
app.get('/api/livros/:id', (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ erro: 'ID inválido' });

    db.get(
        `SELECT l.*, a.nome as autor_nome, a.pais as autor_pais 
         FROM livros l 
         JOIN autores a ON l.autor_id = a.id 
         WHERE l.id = ?`,
        [id],
        (err, livro) => {
            if (err) return res.status(500).json({ erro: 'Erro ao buscar livro' });
            if (!livro) return res.status(404).json({ erro: 'Livro não encontrado' });
            res.json(livro);
        }
    );
});

// ============ ROTAS PROTEGIDAS (JWT) ============

// POST - Criar novo livro
app.post('/api/livros', verificarToken, (req, res) => {
    const { titulo, autor_nome, ano, genero, preco, estoque, descricao } = req.body;

    // Validações
    if (!titulo || typeof titulo !== 'string' || titulo.trim().length < 2) {
        return res.status(400).json({ erro: 'Título é obrigatório (mín. 2 caracteres)' });
    }
    if (!autor_nome || typeof autor_nome !== 'string' || autor_nome.trim().length < 2) {
        return res.status(400).json({ erro: 'Autor é obrigatório (mín. 2 caracteres)' });
    }
    if (!ano || typeof ano !== 'number' || ano < 1000 || ano > new Date().getFullYear()) {
        return res.status(400).json({ erro: `Ano deve estar entre 1000 e ${new Date().getFullYear()}` });
    }
    if (!genero || typeof genero !== 'string' || genero.trim().length < 2) {
        return res.status(400).json({ erro: 'Gênero é obrigatório (mín. 2 caracteres)' });
    }
    if (preco === undefined || typeof preco !== 'number' || preco <= 0) {
        return res.status(400).json({ erro: 'Preço deve ser um número positivo' });
    }
    if (estoque === undefined || !Number.isInteger(estoque) || estoque < 0) {
        return res.status(400).json({ erro: 'Estoque deve ser inteiro não negativo' });
    }

    // Verificar ou criar autor
    db.get('SELECT id FROM autores WHERE nome = ?', [autor_nome.trim()], (err, autor) => {
        if (err) return res.status(500).json({ erro: 'Erro ao buscar autor' });

        const inserirLivro = (autorId) => {
            db.run(
                'INSERT INTO livros (titulo, autor_id, ano, genero, preco, estoque, descricao) VALUES (?, ?, ?, ?, ?, ?, ?)',
                [titulo.trim(), autorId, ano, genero.trim(), preco, estoque, descricao || null],
                function(err) {
                    if (err) return res.status(500).json({ erro: 'Erro ao criar livro' });
                    
                    res.status(201).json({
                        id: this.lastID,
                        titulo: titulo.trim(),
                        autor_id: autorId,
                        ano,
                        genero: genero.trim(),
                        preco,
                        estoque,
                        descricao
                    });
                }
            );
        };

        if (autor) {
            inserirLivro(autor.id);
        } else {
            db.run('INSERT INTO autores (nome) VALUES (?)', [autor_nome.trim()], function(err) {
                if (err) return res.status(500).json({ erro: 'Erro ao criar autor' });
                inserirLivro(this.lastID);
            });
        }
    });
});

// PUT - Atualizar livro
app.put('/api/livros/:id', verificarToken, (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ erro: 'ID inválido' });

    const { titulo, autor_nome, ano, genero, preco, estoque, descricao } = req.body;

    // Buscar livro existente
    db.get('SELECT * FROM livros WHERE id = ?', [id], (err, livro) => {
        if (err) return res.status(500).json({ erro: 'Erro ao buscar livro' });
        if (!livro) return res.status(404).json({ erro: 'Livro não encontrado' });

        const updates = {};
        const params = [];

        if (titulo !== undefined) {
            if (typeof titulo !== 'string' || titulo.trim().length < 2) {
                return res.status(400).json({ erro: 'Título deve ter mín. 2 caracteres' });
            }
            updates.titulo = titulo.trim();
        }

        if (ano !== undefined) {
            if (typeof ano !== 'number' || ano < 1000 || ano > new Date().getFullYear()) {
                return res.status(400).json({ erro: `Ano inválido` });
            }
            updates.ano = ano;
        }

        if (genero !== undefined) {
            if (typeof genero !== 'string' || genero.trim().length < 2) {
                return res.status(400).json({ erro: 'Gênero deve ter mín. 2 caracteres' });
            }
            updates.genero = genero.trim();
        }

        if (preco !== undefined) {
            if (typeof preco !== 'number' || preco <= 0) {
                return res.status(400).json({ erro: 'Preço deve ser positivo' });
            }
            updates.preco = preco;
        }

        if (estoque !== undefined) {
            if (!Number.isInteger(estoque) || estoque < 0) {
                return res.status(400).json({ erro: 'Estoque deve ser inteiro não negativo' });
            }
            updates.estoque = estoque;
        }

        if (descricao !== undefined) {
            updates.descricao = descricao || null;
        }

        // Atualizar autor se necessário
        const atualizarAutor = () => {
            const campos = Object.keys(updates).map(k => `${k} = ?`).join(', ');
            const valores = [...Object.values(updates), id];

            db.run(`UPDATE livros SET ${campos} WHERE id = ?`, valores, (err) => {
                if (err) return res.status(500).json({ erro: 'Erro ao atualizar livro' });

                res.json({ id, ...updates });
            });
        };

        if (autor_nome !== undefined) {
            db.get('SELECT id FROM autores WHERE nome = ?', [autor_nome.trim()], (err, autor) => {
                if (!autor) {
                    return db.run('INSERT INTO autores (nome) VALUES (?)', [autor_nome.trim()], function(err) {
                        updates.autor_id = this.lastID;
                        atualizarAutor();
                    });
                }
                updates.autor_id = autor.id;
                atualizarAutor();
            });
        } else {
            atualizarAutor();
        }
    });
});

// DELETE - Remover livro
app.delete('/api/livros/:id', verificarToken, (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ erro: 'ID inválido' });

    db.get('SELECT * FROM livros WHERE id = ?', [id], (err, livro) => {
        if (err) return res.status(500).json({ erro: 'Erro ao buscar livro' });
        if (!livro) return res.status(404).json({ erro: 'Livro não encontrado' });

        db.run('DELETE FROM livros WHERE id = ?', [id], (err) => {
            if (err) return res.status(500).json({ erro: 'Erro ao deletar livro' });
            res.json({ mensagem: 'Livro removido com sucesso', livro });
        });
    });
});

// ============ ROTAS ADICIONAIS ============

// GET - Listar autores com seus livros
app.get('/api/autores', (req, res) => {
    db.all(
        `SELECT a.*, COUNT(l.id) as total_livros 
         FROM autores a 
         LEFT JOIN livros l ON a.id = l.autor_id 
         GROUP BY a.id 
         ORDER BY a.nome ASC`,
        (err, autores) => {
            if (err) return res.status(500).json({ erro: 'Erro ao buscar autores' });
            res.json(autores);
        }
    );
});

// GET - Livros de um autor específico
app.get('/api/autores/:id/livros', (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ erro: 'ID inválido' });

    db.all(
        `SELECT l.* FROM livros l 
         WHERE l.autor_id = ? 
         ORDER BY l.titulo ASC`,
        [id],
        (err, livros) => {
            if (err) return res.status(500).json({ erro: 'Erro ao buscar livros' });
            res.json(livros);
        }
    );
});

// GET - Estatísticas
app.get('/api/stats', (req, res) => {
    db.get(`
        SELECT 
            COUNT(DISTINCT l.id) as total_livros,
            COUNT(DISTINCT a.id) as total_autores,
            ROUND(AVG(l.preco), 2) as preco_medio,
            MIN(l.preco) as preco_minimo,
            MAX(l.preco) as preco_maximo,
            SUM(l.estoque) as estoque_total
        FROM livros l
        JOIN autores a ON l.autor_id = a.id
    `, (err, stats) => {
        if (err) return res.status(500).json({ erro: 'Erro ao buscar stats' });
        res.json(stats);
    });
});

// Tratar erros 404
app.use((req, res) => {
    res.status(404).json({ erro: 'Rota não encontrada' });
});

// Inicializar e iniciar servidor
initDatabase();
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 API Livros rodando em http://localhost:${PORT}`);
    console.log(`📚 Para gerar token, POST /auth/login`);
});

module.exports = app;