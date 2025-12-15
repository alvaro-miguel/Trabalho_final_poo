import { Acao } from "./acao.js";
import { AtaqueNaoPermitidoException } from "./ataquenaopermitido.js";

// 🏗️ CLASSE ABSTRATA BASE - O "DNA" DE TODO PERSONAGEM
export abstract class Personagem {
    // 🛡️ PROPRIEDADES PROTEGIDAS (encapsulamento)
    protected _id: number; // 🆔 Identificador único
    protected _nome: string; // 🏷️ Nome do personagem
    protected _vida: number; // ❤️ Vida atual
    protected _vidaMaxima: number; // 💊 Vida máxima (para cura)
    protected _ataque: number; // ⚔️ Poder de ataque base
    protected _historico: Acao[] = []; // 📜 Histórico de ações
    public readonly tipoClasse: string; // 🎭 Tipo da classe (imutável)
    
    // 📊 ESTATÍSTICAS DE COMBATE
    protected _danoCausado: number = 0; 
    protected _danoRecebido: number = 0; // 📈 Armazena vida máxima inicial

    constructor(id: number, nome: string, vida: number, ataque: number, tipoClasse: string) {
        this._id = id;
        this._nome = nome;
        this.tipoClasse = tipoClasse;
        this._vida = this.validarVida(vida); // 🔒 Vida não pode ser negativa
        this._vidaMaxima = this._vida; // 📈 Armazena vida máxima inicial
        this._ataque = this.validarAtributo(ataque); // 🔒 Ataque mínimo (1)
    }

    // 🔓 GETTERS (acesso controlado às propriedades)
    public get id(): number { return this._id; }
    public get nome(): string { return this._nome; }
    public get vida(): number { return this._vida; }
    public get ataque(): number { return this._ataque; }
    public get historico(): Acao[] { return this._historico; }
    public get danoCausado(): number { return this._danoCausado; } 
    public get danoRecebido(): number { return this._danoRecebido; } 

    // 🛡️ VALIDAÇÃO DE VIDA (privada - só usada internamente)
    private validarVida(valor: number): number {
        if (valor < 0) return 0;
        return valor;
    }

    // 🛡️ VALIDAÇÃO DE ATRIBUTOS (protegida - classes filhas usam)
    protected validarAtributo(valor: number): number {
        if (valor < 1) return 1;
        return valor;
    }

    // ❤️ PROPRIEDADE COMPUTADA - VERIFICA ESTADO
    public get estaVivo(): boolean {
        return this._vida > 0;
    }

    // 📝 REGISTRO DE AÇÕES NO HISTÓRICO
    public registrarAcao(acao: Acao): void {
        this._historico.push(acao);
    }

    // 💥 MÉTODO: RECEBER DANO (com lógica básica)
    public receberDano(valor: number, ignorarDefesa: boolean = false): void {
        this._vida -= valor;
        this._danoRecebido += valor;
        if (this._vida < 0) this._vida = 0;
    }

    // 💊 MÉTODO: CURAR PERSONAGEM
    public curar(valor: number): void {
        this._vida += valor;
        if (this._vida > this._vidaMaxima) this._vida = this._vidaMaxima;
    }

    // 📈 MÉTODO: SOMAR DANO CAUSADO (para estatísticas)
    public somarDanoCausado(valor: number): void {
        this._danoCausado += valor;
    }

    // ⚔️ MÉTODO ABSTRATO - CADA CLASSE IMPLEMENTA SEU PRÓPRIO ATAQUE
    public abstract atacar(alvo: Personagem): Acao[];

    // 📋 REPRESENTAÇÃO EM STRING (para logs/UI)
    public toString(): string { 
        return `${this._nome} (${this.tipoClasse}) | ❤️ ${this._vida.toFixed(0)} | ⚔️ ${this._ataque} | 📊 Dano Causado: ${this._danoCausado}`;
    }
}

// ⚔️ CLASSE GUERREIRO - TANQUE COM DEFESA

export class Eterno extends Personagem {
    constructor(id: number, nome: string, vida: number, ataque: number) {
        super(id, nome, vida, ataque, "Eterno");
    }

    public atacar(alvo: Personagem): Acao[] {
        const acoes: Acao[] = [];
        const valorAtaque = this._ataque;
        
        // Eternos podem atacar qualquer um
        alvo.receberDano(valorAtaque);
        this.somarDanoCausado(valorAtaque);
        
        acoes.push(new Acao(0, this, alvo, "Ataque Eterno", valorAtaque));
        return acoes;
    }

    // Sobrescreve o método receberDano para verificar se o atacante é Eterno
    public receberDano(valor: number, ignorarDefesa: boolean = false): void {
        throw new AtaqueNaoPermitidoException(
            "Ataque não permitido! Apenas Eternos podem atacar outros Eternos."
        );
    }
}

export class DivinoAtrapalhado extends Personagem {
    constructor(id: number, nome: string, vida: number, ataque: number) {
        super(id, nome, vida, ataque, "DivinoAtrapalhado");
    }

    public atacar(alvo: Personagem): Acao[] {
        const acoes: Acao[] = [];
        const valorAtaque = this._ataque;
        
        alvo.receberDano(valorAtaque);
        this.somarDanoCausado(valorAtaque);
        
        acoes.push(new Acao(0, this, alvo, "Ataque Divino", valorAtaque));
        return acoes;
    }

    public receberDano(valor: number, ignorarDefesa: boolean = false): void {
        super.receberDano(valor, ignorarDefesa);
        
        this.registrarAcao(new Acao(0, this, this, "Efeito de Ressurreição Ativado", 0));
        
    }
}

export class Aneurisma extends Personagem {
    constructor(id: number, nome: string, vida: number, ataque: number) {
        super(id, nome, vida, ataque, "Aneurisma");
    }

    public atacar(alvo: Personagem): Acao[] {
        const acoes: Acao[] = [];
        const valorAtaque = this._ataque;
        
        alvo.receberDano(valorAtaque);
        this.somarDanoCausado(valorAtaque);
        
        acoes.push(new Acao(0, this, alvo, "Ataque Aneurismático", valorAtaque));
        return acoes;
    }

    public receberDano(valor: number, ignorarDefesa: boolean = false): void {
        super.receberDano(valor, ignorarDefesa);
        
        this.registrarAcao(new Acao(0, this, this, "Efeito Aneurisma Ativado", 0));
    }
}


export class Guerreiro extends Personagem {
    private _defesa: number; // 🛡️ Defesa adicional específica

    constructor(id: number, nome: string, vida: number, ataque: number, defesa: number) {
        super(id, nome, vida, ataque, "Guerreiro"); // ⬆️ Chama construtor pai
        this._defesa = this.validarAtributo(defesa); // 🔒 Valida defesa (mínimo 1)
    }

    // 💥 SOBRESCRITA: RECEBER DANO COM DEFESA
    public receberDano(valor: number, ignorarDefesa: boolean = false): void {
        if (ignorarDefesa) { 
            super.receberDano(valor); // ⬆️ Se ignorar defesa, usa lógica padrão
        } else {
            // 🛡️ Calcula dano líquido (dano - defesa, mínimo 0)
            const danoLiquido = Math.max(0, valor - this._defesa);
            super.receberDano(danoLiquido); // ⬆️ Aplica dano reduzido
        }
    }

// ⚔️ IMPLEMENTAÇÃO: ATAQUE DO GUERREIRO (com bônus em vida baixa)
public atacar(oponente: Personagem): Acao[] {
    const acoes: Acao[] = []; // 📝 Lista de ações deste ataque
    let valorDano = this.ataque; // ⚔️ Dano base

    // 🔥 MECÂNICA ESPECIAL: FÚRIA (30% mais dano quando vida < 30%)
    if (this.vida < (this._vidaMaxima * 0.3)) { 
        valorDano = Math.floor(valorDano * 1.3); // 📈 30% mais dano
        console.log(`🔥 FÚRIA DO GUERREIRO ATIVADA! Dano aumentado para ${valorDano}`);
    }

    oponente.receberDano(valorDano); // 💥 Aplica dano no oponente

    // 📝 Cria e registra ação
    const acao = new Acao(0, this, oponente, "Ataque Espada", valorDano);
    acoes.push(acao);
    
    return acoes; // 🔄 Retorna todas as ações deste turno
}

    // 📋 REPRESENTAÇÃO COM DEFESA
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