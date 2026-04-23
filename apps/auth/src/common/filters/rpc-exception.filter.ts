import { Catch } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { throwError, type Observable } from 'rxjs';

@Catch(RpcException)
export class RpcExceptionFilter {
  catch(exception: RpcException): Observable<never> {
    return throwError(() => exception.getError());
  }
}
