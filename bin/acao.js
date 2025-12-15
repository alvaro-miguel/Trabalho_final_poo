export class Acao {
    constructor(id, origem, alvo, descricao, valorDano, dataHora = new Date()) {
        this.id = id;
        this.origem = origem;
        this.alvo = alvo;
        this.descricao = descricao;
        this.valorDano = valorDano;
        this.dataHora = dataHora;
    }
    toJSON() {
        return {
            id: this.id,
            origem: this.origem.nome, //salva apenas o nome/ID
            alvo: this.alvo.nome,
            descricao: this.descricao,
            valorDano: this.valorDano,
            dataHora: this.dataHora
        };
    }
}
