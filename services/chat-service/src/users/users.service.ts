import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { User } from './user.entity';

@Injectable()
export class UsersService {
  private readonly userServiceUrl = process.env.USER_SERVICE_URL || 'http://localhost:4001/graphql';

  constructor(private readonly httpService: HttpService) {}

  async findUser(id: string): Promise<User> {
    const query = `
      query GetUser($id: ID!) {
        user(id: $id) {
          id
          username
          email
          displayName
          createdAt
          updatedAt
        }
      }
    `;

    try {
      const response = await firstValueFrom(
        this.httpService.post(this.userServiceUrl, {
          query,
          variables: { id },
        }),
      );

      return (response.data as any).data.user;
    } catch (error) {
      throw new Error(`Failed to fetch user ${id}: ${error.message}`);
    }
  }

  async findUsers(ids: string[]): Promise<User[]> {
    const promises = ids.map(id => this.findUser(id));
    return Promise.all(promises);
  }
}