const knex = require('../conexao');
const schemaCadastroProduto = require('../validacoes/schemaCadastroProduto');

const listarProdutos = async (req, res) => {
    const { id } = req.usuario;
    const { categoria } = req.query;

    try {
        const produtos = await knex('produtos').where({ usuario_id: id });

        return res.status(200).json(produtos);
    } catch (error) {
        return res.status(400).json(error.message);
    }
}

const obterProduto = async (req, res) => {
    const { usuario } = req;
    const { id } = req.params;

    try {
        const produto = await knex('produtos').where({
            usuario_id: usuario.id,
            id: id
        }).first();

        if (!produto) {
            return res.status(404).json('Produto não encontrado');
        }

        return res.status(200).json(produto);
    } catch (error) {
        return res.status(400).json(error.message);
    }
}

const cadastrarProduto = async (req, res) => {
    const { usuario } = req;
    const { nome, estoque, preco, categoria, descricao, imagem } = req.body;

    try {
        await schemaCadastroProduto.validate(req.body);

        const produto = await knex('produtos')
            .insert({ usuario_id: usuario.id, nome, estoque, preco, categoria, descricao, imagem })
            .returning('*');

        if (!produto) {
            return res.status(400).json('O produto não foi cadastrado');
        }

        return res.status(200).json(produto);
    } catch (error) {
        return res.status(400).json(error.message);
    }
}

const atualizarProduto = async (req, res) => {
    const { id: idUsuario } = req.usuario;
    const { id } = req.params;
    const { nome, estoque, preco, categoria, descricao, imagem } = req.body;

    if (!nome && !estoque && !preco && !categoria && !descricao && !imagem) {
        return res.status(404).json('Informe ao menos um campo para atualizaçao do produto');
    }

    try {
        const produtoExistente = await knex('produtos').where({ usuario_id: idUsuario, id: id }).first();

        if (!produtoExistente) {
            return res.status(404).json('Produto não encontrado');
        }

        const produtoAtualizado = await knex('produtos').where({ usuario_id: idUsuario, id: id }).update({ nome, estoque, preco, categoria, descricao, imagem });

        if (!produtoAtualizado) {
            return res.status(400).json("O produto não foi atualizado");
        }

        return res.status(200).json(produtoAtualizado);
    } catch (error) {
        return res.status(400).json(error.message);
    }
}

const excluirProduto = async (req, res) => {
    const { usuario } = req;
    const { id } = req.params;

    try {
        const produto = await knex('produtos').where({
            usuario_id: usuario.id,
            id: id
        }).first();

        if (!produto) {
            return res.status(404).json('Produto não encontrado');
        }

        const produtoExcluido = await knex('produtos').del().where('id', id).returning('*');

        console.log(produtoExcluido);

        if (!produtoExcluido[0]) {
            return res.status(400).json("O produto não foi excluido");
        }

        return res.status(200).json(produtoExcluido[0]);
    } catch (error) {
        return res.status(400).json(error.message);
    }
}

module.exports = {
    listarProdutos,
    obterProduto,
    cadastrarProduto,
    atualizarProduto,
    excluirProduto
}