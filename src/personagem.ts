import { Acao } from "./acao.js";

export abstract class Personagem {
    protected _id: number;
    protected _nome: string;
    protected _vida: number;
    protected _vidaMaxima: number;
    protected _ataque: number; 
    protected _historico: Acao[] = [];
    public readonly tipoClasse: string; 
    
    protected _danoCausado: number = 0;
    protected _danoRecebido: number = 0;

    constructor(id: number, nome: string, vida: number, ataque: number, tipoClasse: string) {
        this._id = id;
        this._nome = nome;
        this.tipoClasse = tipoClasse;
        this._vida = this.validarVida(vida);
        this._vidaMaxima = this._vida; 
        this._ataque = this.validarAtributo(ataque);
    }

    public get id(): number { return this._id; }
    public get nome(): string { return this._nome; }
    public get vida(): number { return this._vida; }
    public get ataque(): number { return this._ataque; }
    public get historico(): Acao[] { return this._historico; }
    public get danoCausado(): number { return this._danoCausado; } 
    public get danoRecebido(): number { return this._danoRecebido; } 

    private validarVida(valor: number): number {
        if (valor < 0) return 0;
        return valor;
    }

    protected validarAtributo(valor: number): number {
        if (valor < 1) return 1;
        return valor;
    }

    public get estaVivo(): boolean {
        return this._vida > 0;
    }

    public registrarAcao(acao: Acao): void {
        this._historico.push(acao);
    }

    public receberDano(valor: number, ignorarDefesa: boolean = false): void {
        this._vida -= valor;
        this._danoRecebido += valor;
        if (this._vida < 0) this._vida = 0;
    }

    public curar(valor: number): void {
        this._vida += valor;
        if (this._vida > this._vidaMaxima) this._vida = this._vidaMaxima;
    }

    public somarDanoCausado(valor: number): void {
        this._danoCausado += valor;
    }

    public abstract atacar(alvo: Personagem): Acao[];

    public toString(): string { 
        return `${this._nome} (${this.tipoClasse}) | ❤️ ${this._vida.toFixed(0)} | ⚔️ ${this._ataque} | 📊 Dano Causado: ${this._danoCausado}`;
    }
}


export class Guerreiro extends Personagem {
    private _defesa: number;

    constructor(id: number, nome: string, vida: number, ataque: number, defesa: number) {
        super(id, nome, vida, ataque, "Guerreiro");
        this._defesa = this.validarAtributo(defesa);
    }

    public receberDano(valor: number, ignorarDefesa: boolean = false): void {
        if (ignorarDefesa) { 
            super.receberDano(valor);
        } else {
            const danoLiquido = Math.max(0, valor - this._defesa);
            super.receberDano(danoLiquido);
        }
    }

public atacar(oponente: Personagem): Acao[] {
    const acoes: Acao[] = [];
    let valorDano = this.ataque;

    if (this.vida < (this._vidaMaxima * 0.3)) { 
        valorDano = Math.floor(valorDano * 1.3);
        console.log(`🔥 FÚRIA DO GUERREIRO ATIVADA! Dano aumentado para ${valorDano}`);
    }

    oponente.receberDano(valorDano);

    const acao = new Acao(0, this, oponente, "Ataque Espada", valorDano);
    acoes.push(acao);
    
    return acoes;
}

    public toString(): string {
        return `${super.toString()} | 🛡️ Def: ${this._defesa}`;
    }
}


export class Mago extends Personagem {
    constructor(id: number, nome: string, vida: number, ataque: number) {
        super(id, nome, vida, ataque, "Mago");
    }

    public atacar(alvo: Personagem): Acao[] {
        const acoes: Acao[] = [];
        let valorAtaque = this._ataque;
        let desc_atq = "Magia";

        if (this.vida > 0) {
            super.receberDano(10); 
            acoes.push(new Acao(0, this, this, "Custo de Vida", 10));
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
    private _ataqueMultiplo: number;

    constructor(id: number, nome: string, vida: number, ataque: number, ataqueMultiplo: number) {
        super(id, nome, vida, ataque, "Arqueiro");
        this._ataqueMultiplo = ataqueMultiplo;
    }

    public atacar(alvo: Personagem): Acao[] {
        const acoes: Acao[] = [];
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
    constructor(id: number, nome: string, vida: number, ataque: number) {
        super(id, nome, vida, ataque, "Vampiro");
    }

    public atacar(alvo: Personagem): Acao[] {
        const acoes: Acao[] = [];
        
        
        super.receberDano(5, true); 
        acoes.push(new Acao(0, this, this, "Queimadura Solar", 5));

        if (!this.estaVivo) return acoes;

        const valorAtaque = this._ataque;
        alvo.receberDano(valorAtaque);
        this.somarDanoCausado(valorAtaque);

        const rouboVida = Math.floor(valorAtaque * 0.5);
        this.curar(rouboVida);

        acoes.push(new Acao(0, this, alvo, `Mordida (Curou ${rouboVida})`, valorAtaque));
        
        return acoes;
    }
}