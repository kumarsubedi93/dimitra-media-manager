import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Media } from './media.entity';
import { unlinkSync } from 'fs';
import { join } from 'path';


@Injectable()
export class MediaService {
  constructor(
    @InjectRepository(Media)
    private mediaRepo: Repository<Media>,
  ) {}

  getAll(): Promise<Media[]> {
    return this.mediaRepo.find();
  }

  findById(id: number): Promise<Media | null> {
    return this.mediaRepo.findOneBy({ id });
  }

  async createMedia(file:string): Promise<void> {
    const media = new Media()
    media.file = file
    await this.mediaRepo.save(media)
  }

  async remove(id: number): Promise<void> {
    const file = await this.findById(id)
    unlinkSync(join(__dirname, '../..', 'uploads', file.file))
    await this.mediaRepo.delete(id);
  }
}