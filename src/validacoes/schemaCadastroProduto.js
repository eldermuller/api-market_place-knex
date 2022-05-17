const yup = require('./configuracoes');

const schemaCadastroProduto = yup.object().shape({
    nome: yup.string().required(),
    estoque: yup.number().required(),
    preco: yup.number().strict.required(),
    descricao: yup.string.required()
});

module.exports = schemaCadastroProduto;