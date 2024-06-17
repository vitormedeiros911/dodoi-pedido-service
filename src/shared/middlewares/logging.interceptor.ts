import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const logString = `Chamando ${context.getClass().name}.${context.getHandler().name}(). Duração:`;

    const now = Date.now();
    return next.handle().pipe(
      tap(() => Logger.log(logString + ` ${Date.now() - now}ms`)),
      catchError((error) => {
        Logger.error('Erro ' + logString + ` ${Date.now() - now}ms`);
        Logger.error(error.stack);
        return throwError(() => error);
      }),
    );
  }
}
