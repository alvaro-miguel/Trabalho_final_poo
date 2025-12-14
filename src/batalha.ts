import { Personagem } from "./personagem.js";
import { Acao } from "./acao.js";
import { error } from "console";

export class Batalha {
    personagens: Personagem[] = [];
    acoes: Acao[] = [];

    public adicionarPersonagem(p: Personagem): void {
        if (this.personagens.some(pers => pers.id === p.id)) {
            throw new Error(`ID ${p.id} já existe.`);
        }

        if (this.personagens.some(pers => pers.nome === p.nome)){
            throw new Error(`O nome '${p.nome} já está sendo usado'`);
        }
           
        this.personagens.push(p);
    }

    public buscar(id: number): Personagem | undefined {
        return this.personagens.find(p => p.id === id);
    }

    public listarPersonagens(): Personagem[] {
        return this.personagens;
    }

    public listarAcoes(): Acao[] {
        return this.acoes;
    }

    public filtrarAcoes(criterio: 'ataque' | 'todas'): Acao[] {
        if (criterio === 'ataque') {
            return this.acoes.filter(a => a.origem.id !== a.alvo.id);
        }
        return this.acoes;
    }

    public turno(atacanteId: number, defensorId: number): Acao[] {
        const atacante = this.buscar(atacanteId);
        const defensor = this.buscar(defensorId);

        if (!atacante || !defensor) throw new Error("Personagem não encontrado.");
        if (atacanteId === defensorId) throw new Error("Não pode atacar a si mesmo.");
        if (!atacante.estaVivo) throw new Error(`${atacante.nome} está morto e não pode atacar.`);
        if (!defensor.estaVivo) throw new Error(`${defensor.nome} já está morto.`);

        const acoesDoTurno = atacante.atacar(defensor);

        acoesDoTurno.forEach(acao => {
            acao.id = this.acoes.length + 1;
            atacante.registrarAcao(acao);
            this.acoes.push(acao);
        });

        return acoesDoTurno;
    }

    public excluir(id: number): void {
        const index = this.personagens.findIndex(p => p.id === id);
        if (index === -1) throw new Error("Personagem não encontrado.");
        this.personagens.splice(index, 1);
    }

    public verificarVencedor(): Personagem | null {
        const vivos = this.personagens.filter(p => p.estaVivo);
        if (vivos.length === 1) return vivos[0];
        return null;
    }
}