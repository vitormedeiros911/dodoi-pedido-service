export class FiltrosPedidoDto {
  idCliente?: string;
  idFarmacia?: string;
  idEntregador?: string;
  status?: string;
  skip: number;
  limit: number;
}
