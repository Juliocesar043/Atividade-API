const request = require('supertest');
const app = require('./index');

describe('API de Livros - Testes Automatizados', () => {
  let token;
  let novoLivroId;

  beforeAll(async () => {
    // Obter token para testes
    const res = await request(app).post('/auth/login');
    token = res.body.token;
  });

  // ============ TESTES DE AUTENTICAÇÃO ============

  describe('🔐 Autenticação', () => {
    test('POST /auth/login - Deve gerar token JWT', async () => {
      const res = await request(app).post('/auth/login');
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('token');
      expect(res.body).toHaveProperty('usuario');
      expect(res.body.usuario.nome).toBe('Admin');
    });
  });

  // ============ TESTES DE LIVROS - PÚBLICO ============

  describe('📖 GET /api/livros - Listar (Público)', () => {
    test('Deve listar todos os livros', async () => {
      const res = await request(app).get('/api/livros');
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('dados');
      expect(res.body).toHaveProperty('paginacao');
      expect(Array.isArray(res.body.dados)).toBe(true);
      expect(res.body.dados.length).toBeGreaterThan(0);
    });

    test('Deve paginar corretamente', async () => {
      const res = await request(app).get('/api/livros?pagina=1&limite=5');
      expect(res.statusCode).toBe(200);
      expect(res.body.paginacao.pagina_atual).toBe(1);
      expect(res.body.paginacao.itens_por_pagina).toBe(5);
      expect(res.body.dados.length).toBeLessThanOrEqual(5);
    });

    test('Deve filtrar por gênero', async () => {
      const res = await request(app).get('/api/livros').query({ genero: 'Ficção Científica' });
      expect(res.statusCode).toBe(200);
      if (res.body.dados.length > 0) {
        res.body.dados.forEach(livro => {
          expect(livro.genero).toBe('Ficção Científica');
        });
      }
    });

    test('Deve filtrar por preço mínimo', async () => {
      const res = await request(app).get('/api/livros?preco_min=50');
      expect(res.statusCode).toBe(200);
      res.body.dados.forEach(livro => {
        expect(livro.preco).toBeGreaterThanOrEqual(50);
      });
    });

    test('Deve filtrar por preço máximo', async () => {
      const res = await request(app).get('/api/livros?preco_max=50');
      expect(res.statusCode).toBe(200);
      res.body.dados.forEach(livro => {
        expect(livro.preco).toBeLessThanOrEqual(50);
      });
    });

    test('Deve ordenar por preço crescente', async () => {
      const res = await request(app).get('/api/livros?ordem=preco&direcao=asc');
      expect(res.statusCode).toBe(200);
      for (let i = 1; i < res.body.dados.length; i++) {
        expect(res.body.dados[i].preco).toBeGreaterThanOrEqual(res.body.dados[i - 1].preco);
      }
    });

    test('Deve ordenar por preço decrescente', async () => {
      const res = await request(app).get('/api/livros?ordem=preco&direcao=desc');
      expect(res.statusCode).toBe(200);
      for (let i = 1; i < res.body.dados.length; i++) {
        expect(res.body.dados[i].preco).toBeLessThanOrEqual(res.body.dados[i - 1].preco);
      }
    });

    test('Deve buscar por título', async () => {
      const res = await request(app).get('/api/livros?titulo=1984');
      expect(res.statusCode).toBe(200);
      expect(res.body.dados.length).toBeGreaterThan(0);
      expect(res.body.dados[0].titulo).toContain('1984');
    });

    test('Deve buscar por autor', async () => {
      const res = await request(app).get('/api/livros?autor=Orwell');
      expect(res.statusCode).toBe(200);
      expect(res.body.dados.length).toBeGreaterThan(0);
    });
  });

  describe('📖 GET /api/livros/:id - Buscar por ID (Público)', () => {
    test('Deve buscar livro por ID válido', async () => {
      const res = await request(app).get('/api/livros/1');
      expect(res.statusCode).toBe(200);
      expect(res.body.id).toBe(1);
      expect(res.body).toHaveProperty('titulo');
      expect(res.body).toHaveProperty('autor_nome');
    });

    test('Deve retornar 404 para ID inválido', async () => {
      const res = await request(app).get('/api/livros/999');
      expect(res.statusCode).toBe(404);
      expect(res.body).toHaveProperty('erro');
    });

    test('Deve retornar 400 para ID inválido (não número)', async () => {
      const res = await request(app).get('/api/livros/abc');
      expect(res.statusCode).toBe(400);
    });
  });

  // ============ TESTES DE LIVROS - POST (Protegido) ============

  describe('📝 POST /api/livros - Criar (Protegido)', () => {
    test('Deve criar livro com dados válidos', async () => {
      const res = await request(app)
        .post('/api/livros')
        .set('Authorization', `Bearer ${token}`)
        .send({
          titulo: 'Novo Livro Teste',
          autor_nome: 'Autor Teste',
          ano: 2024,
          genero: 'Teste',
          preco: 45.50,
          estoque: 10
        });
      expect(res.statusCode).toBe(201);
      expect(res.body).toHaveProperty('id');
      expect(res.body.titulo).toBe('Novo Livro Teste');
      novoLivroId = res.body.id;
    });

    test('Deve rejeitar requisição sem token', async () => {
      const res = await request(app)
        .post('/api/livros')
        .send({
          titulo: 'Teste',
          autor_nome: 'Teste',
          ano: 2024,
          genero: 'Teste',
          preco: 45.50,
          estoque: 10
        });
      expect(res.statusCode).toBe(401);
    });

    test('Deve rejeitar título ausente', async () => {
      const res = await request(app)
        .post('/api/livros')
        .set('Authorization', `Bearer ${token}`)
        .send({
          autor_nome: 'Teste',
          ano: 2024,
          genero: 'Teste',
          preco: 45.50,
          estoque: 10
        });
      expect(res.statusCode).toBe(400);
      expect(res.body.erro).toContain('Título');
    });

    test('Deve rejeitar título muito curto', async () => {
      const res = await request(app)
        .post('/api/livros')
        .set('Authorization', `Bearer ${token}`)
        .send({
          titulo: 'A',
          autor_nome: 'Teste',
          ano: 2024,
          genero: 'Teste',
          preco: 45.50,
          estoque: 10
        });
      expect(res.statusCode).toBe(400);
    });

    test('Deve rejeitar preço negativo', async () => {
      const res = await request(app)
        .post('/api/livros')
        .set('Authorization', `Bearer ${token}`)
        .send({
          titulo: 'Teste',
          autor_nome: 'Teste',
          ano: 2024,
          genero: 'Teste',
          preco: -50,
          estoque: 10
        });
      expect(res.statusCode).toBe(400);
      expect(res.body.erro).toContain('Preço');
    });

    test('Deve rejeitar ano inválido', async () => {
      const res = await request(app)
        .post('/api/livros')
        .set('Authorization', `Bearer ${token}`)
        .send({
          titulo: 'Teste',
          autor_nome: 'Teste',
          ano: 500,
          genero: 'Teste',
          preco: 45.50,
          estoque: 10
        });
      expect(res.statusCode).toBe(400);
      expect(res.body.erro).toContain('Ano');
    });

    test('Deve rejeitar estoque negativo', async () => {
      const res = await request(app)
        .post('/api/livros')
        .set('Authorization', `Bearer ${token}`)
        .send({
          titulo: 'Teste',
          autor_nome: 'Teste',
          ano: 2024,
          genero: 'Teste',
          preco: 45.50,
          estoque: -5
        });
      expect(res.statusCode).toBe(400);
      expect(res.body.erro).toContain('Estoque');
    });
  });

  // ============ TESTES DE LIVROS - PUT (Protegido) ============

  describe('📝 PUT /api/livros/:id - Atualizar (Protegido)', () => {
    test('Deve atualizar livro parcialmente', async () => {
      const res = await request(app)
        .put(`/api/livros/${novoLivroId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          preco: 50.00
        });
      expect(res.statusCode).toBe(200);
      expect(res.body.preco).toBe(50.00);
    });

    test('Deve atualizar livro completo', async () => {
      const res = await request(app)
        .put('/api/livros/1')
        .set('Authorization', `Bearer ${token}`)
        .send({
          titulo: 'Novo Título',
          preco: 55.00,
          estoque: 20
        });
      expect(res.statusCode).toBe(200);
      expect(res.body.titulo).toBe('Novo Título');
    });

    test('Deve rejeitar requisição sem token', async () => {
      const res = await request(app)
        .put('/api/livros/1')
        .send({ preco: 100 });
      expect(res.statusCode).toBe(401);
    });

    test('Deve rejeitar preço inválido na atualização', async () => {
      const res = await request(app)
        .put('/api/livros/1')
        .set('Authorization', `Bearer ${token}`)
        .send({ preco: -100 });
      expect(res.statusCode).toBe(400);
    });

    test('Deve retornar 404 para ID inexistente', async () => {
      const res = await request(app)
        .put('/api/livros/999')
        .set('Authorization', `Bearer ${token}`)
        .send({ preco: 50 });
      expect(res.statusCode).toBe(404);
    });
  });

  // ============ TESTES DE AUTORES ============

  describe('👥 GET /api/autores - Autores', () => {
    test('Deve listar todos os autores', async () => {
      const res = await request(app).get('/api/autores');
      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThan(0);
      expect(res.body[0]).toHaveProperty('nome');
      expect(res.body[0]).toHaveProperty('total_livros');
    });

    test('Deve buscar livros de um autor', async () => {
      const res = await request(app).get('/api/autores/1/livros');
      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });
  });

  // ============ TESTES DE ESTATÍSTICAS ============

  describe('📊 GET /api/stats - Estatísticas', () => {
    test('Deve retornar estatísticas', async () => {
      const res = await request(app).get('/api/stats');
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('total_livros');
      expect(res.body).toHaveProperty('total_autores');
      expect(res.body).toHaveProperty('preco_medio');
      expect(res.body).toHaveProperty('preco_minimo');
      expect(res.body).toHaveProperty('preco_maximo');
      expect(res.body).toHaveProperty('estoque_total');
      expect(res.body.total_livros).toBeGreaterThanOrEqual(20);
    });
  });

  // ============ TESTES DE LIVROS - DELETE (Protegido) ============

  describe('🗑️ DELETE /api/livros/:id - Deletar (Protegido)', () => {
    test('Deve deletar livro com token válido', async () => {
      const res = await request(app)
        .delete(`/api/livros/${novoLivroId}`)
        .set('Authorization', `Bearer ${token}`);
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('mensagem');
      expect(res.body.mensagem).toContain('sucesso');
    });

    test('Deve rejeitar requisição sem token', async () => {
      const res = await request(app).delete('/api/livros/1');
      expect(res.statusCode).toBe(401);
    });

    test('Deve retornar 404 para ID inexistente', async () => {
      const res = await request(app)
        .delete('/api/livros/999')
        .set('Authorization', `Bearer ${token}`);
      expect(res.statusCode).toBe(404);
    });
  });

  // ============ TESTES DE ROTAS NÃO ENCONTRADAS ============

  describe('❌ Rotas Inválidas', () => {
    test('Deve retornar 404 para rota inexistente', async () => {
      const res = await request(app).get('/api/inexistente');
      expect(res.statusCode).toBe(404);
      expect(res.body).toHaveProperty('erro');
    });
  });
});
