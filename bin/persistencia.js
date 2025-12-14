import fs from 'fs';
import { Guerreiro, Mago, Arqueiro, Vampiro } from './personagem.js';
const CAMINHO_ARQUIVO = './batalha_dados.json';
export class Persistencia {
    static salvar(personagens) {
        try {
            const arquivo = {
                data: new Date(),
                totalPersonagens: personagens.length,
                personagens: personagens
            };
            const dados = JSON.stringify(arquivo, null, 2);
            fs.writeFileSync(CAMINHO_ARQUIVO, dados, 'utf-8');
            console.log("💾 Jogo salvo em 'batalha_dados.json'");
        }
        catch (error) {
            console.error("Erro ao salvar:", error);
        }
    }
    static carregar() {
        if (!fs.existsSync(CAMINHO_ARQUIVO))
            return [];
        try {
            const dados = fs.readFileSync(CAMINHO_ARQUIVO, 'utf-8');
            const json = JSON.parse(dados);
            const listaObjetos = Array.isArray(json) ? json : json.personagens;
            const personagens = [];
            for (const obj of listaObjetos) {
                let p;
                const tipo = obj.tipoClasse || obj._tipoClasse;
                const id = obj._id || obj.id;
                const nome = obj._nome || obj.nome;
                const vida = obj._vida || obj.vida;
                const ataque = obj._ataque || obj.ataque;
                switch (tipo) {
                    case "Guerreiro":
                        p = new Guerreiro(id, nome, vida, ataque, obj._defesa || obj.defesa);
                        break;
                    case "Mago":
                        p = new Mago(id, nome, vida, ataque);
                        break;
                    case "Arqueiro":
                        p = new Arqueiro(id, nome, vida, ataque, obj._ataqueMultiplo || obj.ataqueMultiplo);
                        break;
                    case "Vampiro":
                        p = new Vampiro(id, nome, vida, ataque);
                        break;
                    default: continue;
                }
                personagens.push(p);
            }
            return personagens;
        }
        catch (error) {
            console.error("Erro ao carregar:", error);
            return [];
        }
    }
}
