import promptSync from "prompt-sync";
import { Batalha } from "./batalha.js";
import { Guerreiro, Mago, Arqueiro, Vampiro, Personagem, Eterno } from "./personagem.js";
import { Persistencia } from "./persistencia.js";

const input = promptSync();

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));
class App {
    private batalha: Batalha;

    constructor() {
        this.batalha = new Batalha();
        this.carregarDadosIniciais();
    }

    private carregarDadosIniciais(): void {
        const dados = Persistencia.carregar();
        if (dados.length > 0) {
            dados.forEach(p => {
                try { this.batalha.adicionarPersonagem(p); } catch (e) {}
            });
            console.log(`\n📂 Recuperamos ${dados.length} guerreiros do arquivo.`);
        }
    }

    private gerarId(): number {
        return Math.floor(Math.random() * 9000) + 1000;
    }

    private gerarCenarioTeste(): void {
        console.log("\n⚡ Gerando cenário de batalha épica...");
        
        const personagensAtuais = this.batalha.listarPersonagens();
        
        const candidatos = [
            new Mago(this.gerarId(), "Merlin", 80, 25),
            new Arqueiro(this.gerarId(), "Legolas", 90, 18, 2),
            new Vampiro(this.gerarId(), "Dracula", 110, 12),
            new Guerreiro(this.gerarId(), "Orc", 120, 14, 5)
        ];

        let contador = 0;

        candidatos.forEach(novoP => {
            const jaExiste = personagensAtuais.some(p => p.nome === novoP.nome);

            if (!jaExiste) {
                try {
                    this.batalha.adicionarPersonagem(novoP);
                    console.log(`✅ [ID: ${novoP.id}] ${novoP.nome} entrou na arena.`);
                    contador++;
                } catch (e) {
                    console.log(`⚠️ Erro de ID duplicado para ${novoP.nome}.`);
                }
            } else {
                console.log(`🚫 ${novoP.nome} já existe. Ignorado.`);
            }
        });

        if (contador > 0) {
            console.log(`\n🎉 ${contador} novos combatentes prontos para a guerra!`);
        } else {
            console.log("\n⚠️ Ninguém novo foi adicionado (todos os nomes já existiam).");
        }
    }

    private cadastrarPersonagem(): void {
        console.log("\n--- ⚔️  NOVO RECRUTA ⚔️  ---");
        const nome = input("Nome: ");
        if (!nome.trim()) return;

        const nomeExiste = this.batalha.listarPersonagens().some(p => p.nome === nome);
        
        if (nomeExiste) {
            console.log(`❌ Erro: O guerreiro '${nome}' já existe na arena! Escolha outro nome.`);
            return; 
        }

        console.log("Classes: 1-Guerreiro, 2-Mago, 3-Arqueiro, 4-Vampiro, 5-Eterno");
        const opcao = input("Opção: ");

        const vida = Number(input("Vida (ex:100): ") || 100);
        const ataque = Number(input("Ataque: "));
        
        const id = this.gerarId();
        let p: Personagem;

        try {
            switch (opcao) {
                case "1": 
                    p = new Guerreiro(id, nome, vida, ataque, Number(input("Defesa: "))); break;
                case "2": 
                    p = new Mago(id, nome, vida, ataque); break;
                case "3": 
                    p = new Arqueiro(id, nome, vida, ataque, Number(input("Multiplicador (ex:2): ") || 2)); break;
                case "4": 
                    p = new Vampiro(id, nome, vida, ataque); break;
                case "5":
                    p = new Eterno(id, nome, vida, ataque); break;
                    default: return;
            }
            
            this.batalha.adicionarPersonagem(p);
            
            console.log("\n✅ Personagem Recrutado com Sucesso!");
            console.log(`🆔 ID: ${p.id}`);
            console.log(`👤 Nome: ${p.nome}`);
            console.log(`❤️ Vida: ${p.vida}`);
            
        } catch (e: any) {
            console.log("❌ Erro ao criar: " + e.message);
        }
    }

    private listarPersonagens(): void {
        const todos = this.batalha.listarPersonagens();
        if (todos.length === 0) return console.log("Ninguém na arena.");

        const vivos = todos.filter(p => p.estaVivo);
        const mortos = todos.filter(p => !p.estaVivo);

        console.log(`\n📋 -- STATUS DA ARENA (${vivos.length} Vivos / ${mortos.length} Mortos) --`);
        
        vivos.sort((a, b) => b.vida - a.vida).forEach(p => console.log(p.toString()));
        
        if (mortos.length > 0) {
            console.log("\n💀 -- CEMITÉRIO --");
            mortos.forEach(p => console.log(`🪦 ${p.nome} (${p.tipoClasse}) - Abatido`));
        }
    }

    private realizarTurnoManual(): void {
        const vivos = this.batalha.listarPersonagens().filter(p => p.estaVivo);
        if (vivos.length < 2) return console.log("⚠️ Precisa de 2 vivos para lutar.");

        console.log("\n--- ⚔️  TURNO MANUAL ⚔️  ---");
        vivos.forEach(p => console.log(`${p.id} - ${p.nome} (${p.vida} HP)`));

        const idAtk = Number(input("ID Atacante: "));
        const idDef = Number(input("ID Alvo: "));

        try {
            const acoes = this.batalha.turno(idAtk, idDef);
            console.log(`💥 Ataque realizado! ${acoes[0].descricao} -> ${acoes[0].valorDano} dano.`);
            this.checarVencedor();
        } catch (e: any) {
            console.log("❌ " + e.message);
        }
    }

    private async modoSimulacao(): Promise<void> {
        let vivos = this.batalha.listarPersonagens().filter(p => p.estaVivo);
        if (vivos.length < 2) return console.log("⚠️ Precisa de mais gente para simular.");

        console.log("\n🤖 --- INICIANDO SIMULAÇÃO AUTOMÁTICA --- 🤖");
        let rodada = 1;

        while (vivos.length > 1) {
            console.log(`\n🔔 RODADA ${rodada}`);
            
            const atacante = vivos[Math.floor(Math.random() * vivos.length)];
            let defensor = atacante;
            
            while (defensor.id === atacante.id) {
                defensor = vivos[Math.floor(Math.random() * vivos.length)];
            }

            try {
                const acoes = this.batalha.turno(atacante.id, defensor.id);
                console.log(`⚔️ ${atacante.nome} atacou ${defensor.nome} (${acoes[0].valorDano} dano)`);
                
                if (!defensor.estaVivo) {
                    console.log(`💀 ${defensor.nome} morreu!`);
                }
            } catch (e) {}

            vivos = this.batalha.listarPersonagens().filter(p => p.estaVivo);
            rodada++;
            
            await sleep(800); 
        }
        this.checarVencedor();
    }

    private exibirEstatisticas(): void {
        console.log("\n📊 --- ESTATÍSTICAS DE GUERRA --- 📊");
        const todos = this.batalha.listarPersonagens();
        
        const mvp = [...todos].sort((a, b) => b.danoCausado - a.danoCausado)[0];
        
        console.log(`🎖️ MVP (Maior Dano): ${mvp?.nome || "Ninguém"} (${mvp?.danoCausado || 0})`);
        
        todos.forEach(p => {
            console.log(`- ${p.nome}: Causou ${p.danoCausado} | Recebeu ${p.danoRecebido}`);
        });
    }

    private async replayBatalha(): Promise<void> {
        const logs = this.batalha.listarAcoes();
        if (logs.length === 0) return console.log("Nada para assistir.");

        console.log("\n🎬 --- REPLAY DA BATALHA --- 🎬");
        
        for (const [i, acao] of logs.entries()) {
            console.log(`⏱️ Turno ${i+1}: ${acao.origem.nome} usa ${acao.descricao} em ${acao.alvo.nome} (💥 ${acao.valorDano})`);
            await sleep(1000);
        }
        console.log("\n🎬 Fim do Replay.");
    }

    private checarVencedor(): void {
        const vivos = this.batalha.listarPersonagens().filter(p => p.estaVivo);

        if (vivos.length === 0) {
            console.log(`\n☠️☠️☠️ FIM DE JOGO: SEM VENCEDORES ☠️☠️☠️`);
            console.log(`Todos os combatentes caíram em batalha. Houve um EMPATE TÉCNICO.`);
        } 
        else if (vivos.length === 1) {
            const vencedor = vivos[0];
            console.log(`\n👑👑👑 A BATALHA ACABOU! O VENCEDOR É ${vencedor.nome} (${vencedor.tipoClasse}) 👑👑👑`);
        }
        else {
            
        }
    }

    private esperarEnter(): void {
        input("\nPress ENTER para voltar ao menu...");
    }

    public async menu(): Promise<void> {
        while (true) {
            console.clear();
            
            console.log("\n=== 🏰 BATTLE RPG 🏰 ===");
            console.log("1. Cadastrar Personagem");
            console.log("2. Gerar Cenário Aleatório (Atalho)");
            console.log("3. Listar Status da Arena");
            console.log("4. Batalhar (Turno Manual)");
            console.log("5. Simulação Automática (Assistir Luta)");
            console.log("6. Ver Estatísticas");
            console.log("7. Assistir Replay");
            console.log("8. Excluir Personagem");
            console.log("0. Sair e Salvar");
            
            const op = input(">> ");

            if (op === "0") {
                Persistencia.salvar(this.batalha.listarPersonagens());
                console.log("💾 Dados salvos. Até logo!");
                break;
            }

            switch (op) {
                case "1": 
                    this.cadastrarPersonagem(); 
                    break;
                case "2": 
                    this.gerarCenarioTeste(); 
                    break;
                case "3": 
                    this.listarPersonagens(); 
                    break;
                case "4": 
                    this.realizarTurnoManual(); 
                    break;
                case "5": 
                    await this.modoSimulacao(); 
                    break;
                case "6": 
                    this.exibirEstatisticas(); 
                    break;
                case "7": 
                    await this.replayBatalha(); 
                    break;
                case "8": 
                    console.log("\n--- 🗑️ EXCLUIR PERSONAGEM ---");
                    const listaParaExcluir = this.batalha.listarPersonagens();

                    if (listaParaExcluir.length === 0) {
                        console.log("A arena está vazia. Ninguém para excluir.");
                        break;
                    }

                    console.log("LISTA DE ALVOS DISPONÍVEIS:");
                    listaParaExcluir.forEach(p => {
                        console.log(`➡️  [ ID: ${p.id} ] - ${p.nome} (${p.constructor.name})`);
                    });

                    console.log("\n(Pressione ENTER vazio para cancelar)");
                    const idInput = input("Digite o ID do personagem para excluir: ");

                    if (!idInput.trim()) {
                        console.log("Operação cancelada.");
                        break;
                    }

                    try { 
                        this.batalha.excluir(Number(idInput)); 
                        console.log("🗑️  Personagem excluído com sucesso!"); 
                    } catch(e: any) { 
                        console.log("❌ " + e.message); 
                    }
                    break;
            }

            this.esperarEnter();
        }
    }
}

const app = new App();
app.menu();