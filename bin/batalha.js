export class Batalha {
    constructor() {
        this.personagens = [];
        this.acoes = [];
    }
    adicionarPersonagem(p) {
        if (this.personagens.some(pers => pers.id === p.id)) {
            throw new Error(`ID ${p.id} já existe.`);
        }
        this.personagens.push(p);
    }
    buscar(id) {
        return this.personagens.find(p => p.id === id);
    }
    listarPersonagens() {
        return this.personagens;
    }
    listarAcoes() {
        return this.acoes;
    }
    filtrarAcoes(criterio) {
        if (criterio === 'ataque') {
            return this.acoes.filter(a => a.origem.id !== a.alvo.id);
        }
        return this.acoes;
    }
    turno(atacanteId, defensorId) {
        const atacante = this.buscar(atacanteId);
        const defensor = this.buscar(defensorId);
        if (!atacante || !defensor)
            throw new Error("Personagem não encontrado.");
        if (atacanteId === defensorId)
            throw new Error("Não pode atacar a si mesmo.");
        if (!atacante.estaVivo)
            throw new Error(`${atacante.nome} está morto e não pode atacar.`);
        if (!defensor.estaVivo)
            throw new Error(`${defensor.nome} já está morto.`);
        const acoesDoTurno = atacante.atacar(defensor);
        acoesDoTurno.forEach(acao => {
            acao.id = this.acoes.length + 1;
            atacante.registrarAcao(acao);
            this.acoes.push(acao);
        });
        return acoesDoTurno;
    }
    excluir(id) {
        const index = this.personagens.findIndex(p => p.id === id);
        if (index === -1)
            throw new Error("Personagem não encontrado.");
        this.personagens.splice(index, 1);
    }
    verificarVencedor() {
        const vivos = this.personagens.filter(p => p.estaVivo);
        if (vivos.length === 1)
            return vivos[0];
        return null;
    }
}
