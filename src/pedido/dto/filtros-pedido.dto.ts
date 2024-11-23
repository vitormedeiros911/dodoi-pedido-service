export class FiltrosPedidoDto {
  idComprador?: string;
  idFarmacia?: string;
  idEntregador?: string;
  status?: string;
  skip: number;
  limit: number;
}
