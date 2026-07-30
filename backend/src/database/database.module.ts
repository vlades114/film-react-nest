import { DynamicModule, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { Film } from '../repository/entities/film.entity';
import { Schedule } from '../repository/entities/schedule.entity';
import { RepositoryService } from '../repository/repository.service';

@Module({})
export class DatabaseModule {
  static register(): DynamicModule {
    return {
      module: DatabaseModule,
      imports: [
        TypeOrmModule.forRootAsync({
          imports: [ConfigModule],
          inject: [ConfigService],
          useFactory: (config: ConfigService): TypeOrmModuleOptions => {
            const driver = config.get<string>('DATABASE_DRIVER', 'postgres');
            if (driver !== 'postgres') {
              throw new Error(
                `DATABASE_DRIVER must be 'postgres', got '${driver}'`,
              );
            }

            const mode = config.get<string>('DATABASE_MODE', 'local');
            const synchronize =
              config.get<string>('DATABASE_SYNCHRONIZE') === 'true';

            if (mode === 'cloud') {
              const url = config.get<string>('DATABASE_URL');
              if (!url) {
                throw new Error(
                  'DATABASE_URL is required when DATABASE_MODE=cloud',
                );
              }

              return {
                type: 'postgres',
                url,
                ssl: { rejectUnauthorized: false },
                entities: [Film, Schedule],
                synchronize,
              };
            }

            return {
              type: 'postgres',
              host: config.get<string>('DATABASE_HOST', 'localhost'),
              port: Number(config.get<string>('DATABASE_PORT', '5432')),
              username: config.get<string>('DATABASE_USERNAME', 'postgres'),
              password: config.get<string>('DATABASE_PASSWORD', 'postgres'),
              database: config.get<string>('DATABASE_NAME', 'films'),
              ssl: false,
              entities: [Film, Schedule],
              synchronize,
            };
          },
        }),
        TypeOrmModule.forFeature([Film, Schedule]),
      ],
      providers: [
        {
          provide: 'FILMS_REPOSITORY',
          useClass: RepositoryService,
        },
      ],
      exports: ['FILMS_REPOSITORY'],
    };
  }
}
