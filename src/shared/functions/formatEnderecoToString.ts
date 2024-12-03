import { IEndereco } from 'src/pedido/interfaces/endereco.interface';

export const formatEnderecoToString = (endereco: IEndereco) => {
  return `${endereco.logradouro} ${endereco.numero}, ${endereco.bairro}, ${endereco.cidade} - ${endereco.uf}, ${endereco.cep}`;
};
