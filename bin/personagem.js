import { Acao } from "./acao.js";
export class Personagem {
    constructor(id, nome, vida, ataque, tipoClasse) {
        this._historico = [];
        this._danoCausado = 0;
        this._danoRecebido = 0;
        this._id = id;
        this._nome = nome;
        this.tipoClasse = tipoClasse;
        this._vida = this.validarVida(vida);
        this._vidaMaxima = this._vida;
        this._ataque = this.validarAtributo(ataque);
    }
    get id() { return this._id; }
    get nome() { return this._nome; }
    get vida() { return this._vida; }
    get ataque() { return this._ataque; }
    get historico() { return this._historico; }
    get danoCausado() { return this._danoCausado; }
    get danoRecebido() { return this._danoRecebido; }
    validarVida(valor) {
        if (valor < 0)
            return 0;
        return valor;
    }
    validarAtributo(valor) {
        if (valor < 1)
            return 1;
        return valor;
    }
    get estaVivo() {
        return this._vida > 0;
    }
    registrarAcao(acao) {
        this._historico.push(acao);
    }
    receberDano(valor, ignorarDefesa = false) {
        this._vida -= valor;
        this._danoRecebido += valor;
        if (this._vida < 0)
            this._vida = 0;
    }
    curar(valor) {
        this._vida += valor;
        if (this._vida > this._vidaMaxima)
            this._vida = this._vidaMaxima;
    }
    somarDanoCausado(valor) {
        this._danoCausado += valor;
    }
    toString() {
        return `${this._nome} (${this.tipoClasse}) | ❤️ ${this._vida.toFixed(0)} | ⚔️ ${this._ataque} | 📊 Dano Causado: ${this._danoCausado}`;
    }
}
export class Guerreiro extends Personagem {
    constructor(id, nome, vida, ataque, defesa) {
        super(id, nome, vida, ataque, "Guerreiro");
        this._defesa = this.validarAtributo(defesa);
    }
    receberDano(valor, ignorarDefesa = false) {
        if (ignorarDefesa) {
            super.receberDano(valor);
        }
        else {
            const danoLiquido = Math.max(0, valor - this._defesa);
            super.receberDano(danoLiquido);
        }
    }
    atacar(alvo) {
        const acoes = [];
        let valorAtaque = this._ataque;
        let desc_atq = "Ataque Físico";
        if (this.vida < (this._vidaMaxima * 0.3)) {
            valorAtaque = valorAtaque * 1.5;
            desc_atq += " (Fúria +50%)";
        }
        valorAtaque = Math.floor(valorAtaque);
        alvo.receberDano(valorAtaque);
        this.somarDanoCausado(valorAtaque);
        acoes.push(new Acao(0, this, alvo, desc_atq, valorAtaque));
        return acoes;
    }
    toString() {
        return `${super.toString()} | 🛡️ Def: ${this._defesa}`;
    }
}
export class Mago extends Personagem {
    constructor(id, nome, vida, ataque) {
        super(id, nome, vida, ataque, "Mago");
    }
    atacar(alvo) {
        const acoes = [];
        let valorAtaque = this._ataque;
        let desc_atq = "Magia";
        if (this.vida > 0) {
            super.receberDano(5);
            acoes.push(new Acao(0, this, this, "Custo de Mana (Vida)", 5));
        }
        if (alvo instanceof Arqueiro) {
            valorAtaque *= 2;
            desc_atq += " (Crítico em Arqueiro)";
        }
        alvo.receberDano(valorAtaque, true);
        this.somarDanoCausado(valorAtaque);
        acoes.push(new Acao(0, this, alvo, desc_atq, valorAtaque));
        return acoes;
    }
}
export class Arqueiro extends Personagem {
    constructor(id, nome, vida, ataque, ataqueMultiplo) {
        super(id, nome, vida, ataque, "Arqueiro");
        this._ataqueMultiplo = ataqueMultiplo;
    }
    atacar(alvo) {
        const acoes = [];
        let valorAtaque = this._ataque;
        let desc_atq = "Disparo";
        if (Math.random() <= 0.5) {
            valorAtaque = this._ataque * this._ataqueMultiplo;
            desc_atq += ` (Crítico x${this._ataqueMultiplo})`;
        }
        alvo.receberDano(valorAtaque);
        this.somarDanoCausado(valorAtaque);
        acoes.push(new Acao(0, this, alvo, desc_atq, valorAtaque));
        return acoes;
    }
}
export class Vampiro extends Personagem {
    constructor(id, nome, vida, ataque) {
        super(id, nome, vida, ataque, "Vampiro");
    }
    atacar(alvo) {
        const acoes = [];
        super.receberDano(5, true);
        acoes.push(new Acao(0, this, this, "Queimadura Solar", 5));
        if (!this.estaVivo)
            return acoes;
        const valorAtaque = this._ataque;
        alvo.receberDano(valorAtaque);
        this.somarDanoCausado(valorAtaque);
        const rouboVida = Math.floor(valorAtaque * 0.5);
        this.curar(rouboVida);
        acoes.push(new Acao(0, this, alvo, `Mordida (Curou ${rouboVida})`, valorAtaque));
        return acoes;
    }
}
