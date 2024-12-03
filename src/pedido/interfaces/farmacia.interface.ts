import { IEndereco } from './endereco.interface';

export interface IFarmacia {
  id: string;
  nome: string;
  telefone: string;
  endereco: IEndereco;
}
