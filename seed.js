const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'livros.db');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('❌ Erro ao abrir banco:', err);
        process.exit(1);
    }
    console.log('✅ Conectado ao SQLite');
});

db.serialize(() => {
    // Criar tabelas
    db.run(`
        CREATE TABLE IF NOT EXISTS autores (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nome TEXT UNIQUE NOT NULL,
            pais TEXT,
            data_criacao DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);

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

    // Limpar dados existentes
    db.run('DELETE FROM livros');
    db.run('DELETE FROM autores');

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

    let autorInsertado = 0;
    const autorMap = {};

    // Inserir autores
    autores.forEach((autor) => {
        db.run('INSERT INTO autores (nome, pais) VALUES (?, ?)', 
            [autor.nome, autor.pais],
            function(err) {
                if (err) {
                    console.error('Erro ao inserir autor:', err);
                } else {
                    autorMap[autor.nome] = this.lastID;
                    autorInsertado++;
                    
                    // Quando todos os autores forem inseridos, inserir livros
                    if (autorInsertado === autores.length) {
                        console.log(`✅ ${autores.length} autores inseridos`);
                        inserirLivros();
                    }
                }
            }
        );
    });

    const inserirLivros = () => {
        livros.forEach((livro) => {
            const autorId = autorMap[livro.autorNome];
            if (autorId) {
                db.run(
                    'INSERT INTO livros (titulo, autor_id, ano, genero, preco, estoque) VALUES (?, ?, ?, ?, ?, ?)',
                    [livro.titulo, autorId, livro.ano, livro.genero, livro.preco, livro.estoque],
                    function(err) {
                        if (err) {
                            console.error('Erro ao inserir livro:', err);
                        }
                    }
                );
            }
        });
        
        setTimeout(() => {
            console.log(`✅ ${livros.length} livros inseridos`);
            db.close((err) => {
                if (err) console.error('Erro ao fechar banco:', err);
                console.log('✅ Banco de dados populado com sucesso!');
                process.exit(0);
            });
        }, 500);
    };
});
