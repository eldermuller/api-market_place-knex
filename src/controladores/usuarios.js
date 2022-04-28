const knex = require('../conexao');
const bcrypt = require('bcrypt');


const cadastrarUsuario = async (req, res) => {
    const { nome, email, senha, nome_loja } = req.body;

    if (!nome) {
        return res.status(404).json("O campo nome é obrigatório");
    }

    if (!email) {
        return res.status(404).json("O campo email é obrigatório");
    }

    if (!senha) {
        return res.status(404).json("O campo senha é obrigatório");
    }

    if (!nome_loja) {
        return res.status(404).json("O campo nome_loja é obrigatório");
    }

    try {
        const quantidadeDeUsuarios = await knex('usuarios').where({ email }).first();

        if (quantidadeDeUsuarios) {
            return res.status(400).json("O email já existe");
        }

        const senhaCriptografada = await bcrypt.hash(senha, 10);

        const usuario = await knex('usuarios')
            .insert({ nome, email, senha: senhaCriptografada, nome_loja })
            .returning('*');

        if (usuario[0] === 0) {
            return res.status(400).json("O usuário não foi cadastrado.");
        }

        const { senha: _, ...user } = usuario[0];

        return res.status(200).json(user);
    } catch (error) {
        return res.status(400).json(error.message);
    }
}

const obterPerfil = async (req, res) => {
    return res.status(200).json(req.usuario);
}

const atualizarPerfil = async (req, res) => {
    let { nome, email, senha, nome_loja } = req.body;
    const { id, email: emailTokenUser } = req.usuario;

    if (!nome && !email && !senha && !nome_loja) {
        return res.status(404).json('É obrigatório informar ao menos um campo para atualização');
    }

    try {
        const usuarioExistente = await knex('usuarios').where({ id }).first();

        if (!usuarioExistente) {
            return res.status(404).json("O usuario não encontrado");
        };

        if (senha) {
            senha = await bcrypt.hash(senha, 10);
        };

        if (email !== emailTokenUser) {
            const emailExistente = await knex('usuarios').where({ email }).first();

            if (emailExistente) {
                return res.status(400).json("Esse email já está cadastrado");
            }
        }

        const atualizarUsuario = await knex('usuarios')
            .where({ id })
            .update({ nome, email, senha, nome_loja });

        if (!atualizarUsuario) {
            return res.status(400).json('Usuário não foi atualizado');
        };

        return res.status(200).json(atualizarUsuario);
    } catch (error) {
        return res.status(400).json(error.message);
    }
}

module.exports = {
    cadastrarUsuario,
    obterPerfil,
    atualizarPerfil
}