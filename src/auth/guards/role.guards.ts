
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { ROLE_KEY } from '../decorators/role.decorator';
import { Role } from '../enums/role.enums';


@Injectable()
export class RoleGuard implements CanActivate {
  constructor(private reflector : Reflector) {}

    canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
      const roles = this.reflector.get<Role[]>(ROLE_KEY, context.getHandler());
      if (!roles) {
        return true;
      }
      const request = context.switchToHttp().getRequest();
      const user = request.user;
      return user && user.roles && user.roles.some(role => roles.includes(role));
    }
}