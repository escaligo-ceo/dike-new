import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { writeFileSync } from 'fs';
import path from 'path';

interface ISwaggerInput {
  serviceName: string;
  serviceLabel: string;
  serviceVersion: string;
  swaggerFilePath: string;
}

const usageMsgError = `Usage:\nyarn swagger\n\b<service-name>: service name\n\b<service-label>: service label\n\b<service-version>: service version\n\b<swagger-file-path>: swagger file folder path`

async function generateSwagger(input: ISwaggerInput) {
  const { serviceName, serviceLabel, serviceVersion, swaggerFilePath } = input;
  // Costruisci il percorso assoluto al modulo
  const modulePath = path.resolve(`../backend/${serviceName}/src/app.module.ts`);

  // Import dinamico
  const { AppModule } = await import(modulePath);

  const app = await NestFactory.create(AppModule);

  const config = new DocumentBuilder()
    .setTitle(`API ${serviceLabel}`) // metti un nome adatto per ogni servizio
    .setDescription(`API documentation for the ${serviceLabel}`)
    .setVersion(serviceVersion)
    .build();

  const document = SwaggerModule.createDocument(app, config);

  const swaggerFilename = path.join(swaggerFilePath, `${serviceName}-swagger.json`);
  writeFileSync(swaggerFilename, JSON.stringify(document, null, 2));

  console.log('Swagger JSON generated successfully!');
  await app.close();
}

// generateSwagger();

// Legge il parametro dalla riga di comando
const serviceName = process.argv[2];
const serviceLabel = process.argv[3];
const serviceVersion = process.argv[4];
const swaggerFilePath = process.argv[5];

if (!serviceName) {
  console.error(usageMsgError);
  process.exit(1);
}

const input: ISwaggerInput = {
  serviceName,
  serviceLabel,
  serviceVersion,
  swaggerFilePath: path.resolve(swaggerFilePath),
};
if (!serviceLabel || !serviceVersion || !swaggerFilePath) {
  console.error(usageMsgError);
  process.exit(1);
}

generateSwagger(input).catch((error) => {
  console.error('Error generating Swagger JSON:', error);
});
