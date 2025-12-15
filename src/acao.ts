import { Personagem } from "./personagem.js";

export class Acao {
    constructor(
        public id: number,
        public origem: Personagem,
        public alvo: Personagem,
        public descricao: string,
        public valorDano: number,
        public dataHora: Date = new Date()
    ) {}


    public toJSON() {
        return {
            id: this.id,
            origem: this.origem.nome,
            alvo: this.alvo.nome,
            descricao: this.descricao,
            valorDano: this.valorDano,
            dataHora: this.dataHora
        };
    }
}