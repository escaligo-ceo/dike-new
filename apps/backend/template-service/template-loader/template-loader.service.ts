import { AppLogger } from '@dike/common';
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as fsSync from 'fs';
import * as fs from 'fs/promises';
import * as path from 'path';
import { Repository } from 'typeorm';
import { Template } from '../entities/template.entity';
import {
  LoadedTemplate,
  LoadedTemplateImpl,
  TemplateFile,
  TenantTemplateLoaderOptions,
  UserTemplateLoaderOptions,
  TemplateOptions
} from './template-loader.interface';
import { Resource, ResourceType } from '../entities/resource.entity';
import { LoggedUser } from '@dike/communication';

@Injectable()
export class TemplateLoaderService {
  private readonly templatesPath: string;
  private templateCache = new Map<string, LoadedTemplate>();

  constructor(
    private readonly logger: AppLogger,
    @InjectRepository(Template)
    private readonly templateRepository: Repository<Template>,
  ) {
    this.logger = new AppLogger(TemplateLoaderService.name);
    // Determina il percorso dei template in base all'ambiente
    this.templatesPath = this.getTemplatesPath();
    this.logger.debug(`📁 Template path: ${this.templatesPath}`);
  }

  private getTemplatesPath(): string {
    // Lista di percorsi possibili in ordine di priorità
    const possiblePaths = [
      // 1. Percorso in dist/ (produzione)
      path.join(__dirname, 'templates'),
      // 2. Percorso in src/ relativo al processo corrente
      path.join(process.cwd(), 'src/templates'),
      // 3. Percorso in src/ relativo a questo file
      path.join(__dirname, '../../../src/templates'),
    ];

    // Cerca il primo percorso che esiste
    for (const templatePath of possiblePaths) {
      try {
        if (fsSync.existsSync(templatePath)) {
          this.logger.log(`📁 Template path trovato: ${templatePath}`);
          return templatePath;
        }
      } catch (error) {
        // Ignora errori di accesso
      }
    }

    // Default al primo percorso se nessuno esiste
    this.logger.warn(`⚠️ Nessun template path trovato, uso default: ${possiblePaths[0]}`);
    return possiblePaths[0];
  }

  /**
   * Carica un template di sistema dalla cartella templates
   */
  async loadSystemTemplate(options: TenantTemplateLoaderOptions): Promise<LoadedTemplate> {
    const cacheKey = `${options.templateName}_${options.extension || 'all'}`;
    
    // Controlla se il template è già in cache
    if (this.templateCache.has(cacheKey)) {
      const cached = this.templateCache.get(cacheKey)!;
      this.logger.debug(`📁 Template '${options.templateName}' caricato dalla cache`);
      return this.processVariables(cached, options.variables);
    }

    try {
      const templatePath = path.join(this.templatesPath, options.templateName);
      
      // Verifica che la cartella del template esista
      await this.ensureTemplateDirectoryExists(templatePath);
      
      // Carica i file del template
      const files = await this.loadTemplateFiles(templatePath, options.extension);
      
      if (files.length === 0) {
        throw new Error(`Nessun file trovato per il template '${options.templateName}'`);
      }

      const loadedTemplate = new LoadedTemplateImpl(options.templateName, files);
      
      // Salva in cache
      this.templateCache.set(cacheKey, loadedTemplate);
      
      this.logger.log(`📁 Template '${options.templateName}' caricato con ${files.length} file(s): ${files.map(f => f.extension).join(', ')}`);
      
      return this.processVariables(loadedTemplate, options.variables);
      
    } catch (error) {
      this.logger.error(`❌ Errore nel caricamento del template '${options.templateName}':`, error);
      throw error;
    }
  }

  /**
   * Carica un template dalla cartella templates
   */
  async loadTenantTemplate(
    loggedUser: LoggedUser,
    options: TenantTemplateLoaderOptions
  ): Promise<LoadedTemplate> {
    const cacheKey = `${options.templateName}_${options.extension || 'all'}`;
    
    // Controlla se il template è già in cache
    if (this.templateCache.has(cacheKey)) {
      const cached = this.templateCache.get(cacheKey)!;
      this.logger.debug(`📁 Template '${options.templateName}' caricato dalla cache`);
      return this.processVariables(cached, options.variables);
    }

    try {
      const templatePath = path.join(this.templatesPath, options.templateName);
      
      // Verifica che la cartella del template esista
      await this.ensureTemplateDirectoryExists(templatePath);
      
      // Carica i file del template
      const files = await this.loadTemplateFiles(templatePath, options.extension);
      
      if (files.length === 0) {
        throw new Error(`Nessun file trovato per il template '${options.templateName}'`);
      }

      const loadedTemplate = new LoadedTemplateImpl(options.templateName, files);
      
      // Salva in cache
      this.templateCache.set(cacheKey, loadedTemplate);
      
      this.logger.log(`📁 Template '${options.templateName}' caricato con ${files.length} file(s): ${files.map(f => f.extension).join(', ')}`);
      
      return this.processVariables(loadedTemplate, options.variables);
      
    } catch (error) {
      this.logger.error(`❌ Errore nel caricamento del template '${options.templateName}':`, error);
      throw error;
    }
  }

  /**
   * Carica un template dalla cartella templates
   */
  async loadUserTemplate(options: UserTemplateLoaderOptions): Promise<LoadedTemplate> {
    const cacheKey = `${options.userId}_${options.extension || 'all'}`;
    
    // Controlla se il template è già in cache
    if (this.templateCache.has(cacheKey)) {
      const cached = this.templateCache.get(cacheKey)!;
      this.logger.debug(`📁 Template '${options.userId}' caricato dalla cache`);
      return this.processVariables(cached, options.variables);
    }

    try {
      const templatePath = path.join(this.templatesPath, options.userId);
      
      // Verifica che la cartella del template esista
      await this.ensureTemplateDirectoryExists(templatePath);
      
      // Carica i file del template
      const files = await this.loadTemplateFiles(templatePath, options.extension);
      
      if (files.length === 0) {
        throw new Error(`Nessun file trovato per il template '${options.userId}'`);
      }

      const loadedTemplate = new LoadedTemplateImpl(options.userId, files);
      
      // Salva in cache
      this.templateCache.set(cacheKey, loadedTemplate);
      
      this.logger.log(`📁 Template '${options.userId}' caricato con ${files.length} file(s): ${files.map(f => f.extension).join(', ')}`);
      
      return this.processVariables(loadedTemplate, options.variables);
      
    } catch (error) {
      this.logger.error(`❌ Errore nel caricamento del template '${options.userId}':`, error);
      throw error;
    }
  }

  /**
   * Carica un singolo file di template con estensione specifica
   */
  async loadTenantTemplateFile(
    loggedUser: LoggedUser,
    templateName: string,
    extension: ResourceType,
    variables?: TemplateOptions
  ): Promise<string> {
    const template = await this.loadTenantTemplate(loggedUser, { 
      templateName, 
      extension, 
      variables 
    });
    
    const content = template.getByExtension(extension);
    if (!content) {
      throw new Error(`File con estensione '${extension}' non trovato nel template '${templateName}'`);
    }
    
    return content;
  }

    /**
   * Carica un singolo file di template con estensione specifica
   */
  async loadUserTemplateFile(userId: string, extension: ResourceType, variables?: TemplateOptions): Promise<string> {
    const template = await this.loadUserTemplate({ 
      userId, 
      extension, 
      variables 
    });
    
    const content = template.getByExtension(extension);
    if (!content) {
      throw new Error(`File con estensione '${extension}' non trovato nel template '${userId}'`);
    }
    
    return content;
  }

  /**
   * Lista tutti i template disponibili
   */
  async listAvailableTemplates(): Promise<string[]> {
    try {
      const entries = await fs.readdir(this.templatesPath, { withFileTypes: true });
      return entries
        .filter(entry => entry.isDirectory())
        .map(entry => entry.name);
    } catch (error) {
      this.logger.error('❌ Errore nel listare i template:', error);
      return [];
    }
  }

  /**
   * Lista tutti i file disponibili per un template specifico
   */
  async listTemplateFiles(templateName: string): Promise<string[]> {
    try {
      const templatePath = path.join(this.templatesPath, templateName);
      const entries = await fs.readdir(templatePath, { withFileTypes: true });
      return entries
        .filter(entry => entry.isFile())
        .map(entry => entry.name);
    } catch (error) {
      this.logger.error(`❌ Errore nel listare i file del template '${templateName}':`, error);
      return [];
    }
  }

  /**
   * Pulisce la cache dei template
   */
  clearCache(): void {
    this.templateCache.clear();
    this.logger.log('🧹 Cache dei template pulita');
  }

  /**
   * Pulisce la cache di un template specifico
   */
  clearTemplateCache(templateName: string): void {
    const keysToDelete = Array.from(this.templateCache.keys())
      .filter(key => key.startsWith(`${templateName}_`));
    
    keysToDelete.forEach(key => this.templateCache.delete(key));
    this.logger.log(`🧹 Cache del template '${templateName}' pulita`);
  }

  private async ensureTemplateDirectoryExists(templatePath: string): Promise<void> {
    try {
      await fs.access(templatePath);
    } catch (error) {
      throw new Error(`Cartella template '${path.basename(templatePath)}' non trovata in ${this.templatesPath}`);
    }
  }

  private async loadTemplateFiles(templatePath: string, specificExtension?: string): Promise<TemplateFile[]> {
    const entries = await fs.readdir(templatePath, { withFileTypes: true });
    const files: TemplateFile[] = [];

    for (const entry of entries) {
      if (!entry.isFile()) continue;

      const fileName = entry.name;
      const extension = path.extname(fileName).substring(1); // Rimuove il punto
      
      // Se è specificata un'estensione, carica solo quella
      if (specificExtension && extension !== specificExtension) {
        continue;
      }

      try {
        const filePath = path.join(templatePath, fileName);
        const content = await fs.readFile(filePath, 'utf-8');
        
        files.push({
          extension,
          content,
          filepath: filePath
        });
      } catch (error) {
        this.logger.warn(`⚠️ Impossibile leggere il file '${fileName}':`, error);
      }
    }

    return files;
  }

  private processVariables(template: LoadedTemplate, variables?: TemplateOptions): LoadedTemplate {
    if (!variables) {
      return template;
    }

    // Clona il template e applica le variabili
    const processedFiles = template.files.map(file => ({
      ...file,
      content: this.replaceVariables(file.content, variables)
    }));

    return new LoadedTemplateImpl(template.name, processedFiles);
  }

  private replaceVariables(content: string, variables: TemplateOptions): string {
    let result = content;
    
    for (const [key, value] of Object.entries(variables)) {
      // Supporta sia ${variabile} che {{variabile}}
      const patterns = [
        new RegExp(`\\$\\{${key}\\}`, 'g'),
        new RegExp(`\\{\\{${key}\\}\\}`, 'g')
      ];
      
      patterns.forEach(pattern => {
        result = result.replace(pattern, String(value));
      });
    }
    
    return result;
  }

  async findById(
    loggedUser: LoggedUser,
    templateId: string): Promise<Template | null> {
    // const template = this.templateCache.get(templateId);
    // if (template) {
    //   return template;
    // }

    // // Se il template non è in cache, prova a caricarlo dal filesystem
    // const templatePath = path.join(this.templatesPath, templateId);
    // try {
    //   await this.ensureTemplateDirectoryExists(templatePath);
    //   const files = await this.loadTemplateFiles(templatePath);
    //   const loadedTemplate = new LoadedTemplateImpl(templateId, files);
    //   this.templateCache.set(templateId, loadedTemplate);
    //   return loadedTemplate;
    // } catch (error) {
    //   this.logger.error(`❌ Errore nel recuperare il template '${templateId}':`, error);
    //   return null;
    // }
    const template = await this.templateRepository.findOne({ where: { id: templateId } });
    return template;
  }

  async deleteById(
    loggedUser: LoggedUser,
    templateId: string
  ): Promise<Template | null> {
    const template = await this.templateRepository.findOne({ where: { id: templateId } });
    if (!template) {
      return null;
    }
    await this.templateRepository.softDelete(template.id);
    return template;
  }

  async save(template: Template): Promise<Template> {
    return this.templateRepository.save(template);
  }

  async addOrUpdateResource(
    loggedUser: LoggedUser,
    {
      template,
      resourceType,
      resourceData,
    }: {
      template: Template;
      resourceType: ResourceType;
      resourceData: Partial<Resource>;
    }
  ): Promise<Resource> {
    if (!template) {
      throw new NotFoundException('Template not provided');
    }
    // Logic to add resource to template
    const resource = new Resource();
    Object.assign(resource, { type: resourceType, data: resourceData });
    template.addOrUpdateResource(resource);
    await this.save(template);
    // return { message: 'Resource added successfully' };
    return resource;
  }
}
