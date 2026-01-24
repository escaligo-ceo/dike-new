export class EnvNotFoundException extends Error {
  constructor(envVarName: string) {
    super(`Environment variable "${envVarName}" not found in configuration`);
    this.name = 'EnvNotFoundException';
  }
}