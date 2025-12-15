import { Acao } from "./acao.js";

export class AtaqueNaoPermitidoException extends Error {
    constructor(message: string) {
        super(message);
        this.name = "AtaqueNaoPermitidoException";
    }
}