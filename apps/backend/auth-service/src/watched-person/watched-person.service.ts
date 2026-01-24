import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import { WatchedPerson } from '../entities/watched-person.entity';
import { LoggedUser } from '@dike/communication';

@Injectable()
export class WatchedPersonService {
  constructor(
    @InjectRepository(WatchedPerson)
    private readonly watchwedPersonRepository: Repository<WatchedPerson>,
  ) {}

  async create(
    loggedUser: LoggedUser,
    data: Partial<WatchedPerson>
  ): Promise<WatchedPerson> {
    return this.watchwedPersonRepository.save(this.watchwedPersonRepository.create(data));
  }

  async findAll(loggedUser: LoggedUser): Promise<WatchedPerson[]> {
    return this.watchwedPersonRepository.find({ order: { createdAt: 'DESC' } });
  }

  async findOne(loggedUser: LoggedUser, id: string): Promise<WatchedPerson | null> {
    return this.watchwedPersonRepository.findOne({ where: { id } });
  }

  async update(loggedUser: LoggedUser, id: string, data: Partial<WatchedPerson>): Promise<WatchedPerson> {
    await this.watchwedPersonRepository.update(id, data);

    const watchedPerson = await this.findOne(loggedUser, id);
    if (!watchedPerson) {
      throw new Error(`WatchedPerson with id ${id} not found`);
    }
    return watchedPerson;
  }

  async remove(loggedUser: LoggedUser, id: string): Promise<void> {
    await this.watchwedPersonRepository.delete(id);
  }

  async checkMatch(loggedUser: LoggedUser, firstName: string, lastName: string, email?: string): Promise<WatchedPerson | null> {
    return this.watchwedPersonRepository.findOne({
      where: [
        { firstName: ILike(firstName), lastName: ILike(lastName) },
        ...(email ? [{ email: ILike(email) }] : []),
      ],
    });
  }

  async markRegistered(loggedUser: LoggedUser, id: string): Promise<void> {
    await this.watchwedPersonRepository.update(id, { registered: true, registeredAt: new Date() });
  }
}
