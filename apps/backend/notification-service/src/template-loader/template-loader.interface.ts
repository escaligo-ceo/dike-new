import { ResourceType } from "../entities/resource.entity";

export interface TemplateFile {
  extension: string;
  content: string;
  filepath: string;
}

export interface LoadedTemplate {
  name: string;
  files: TemplateFile[];
  // Helper methods per accedere ai contenuti
  getByExtension(extension: string): string | undefined;
  getAllExtensions(): string[];
  hasExtension(extension: string): boolean;
  /**
   * Restituisce il contenuto del file dato il nome completo (es: 'welcome.txt')
   */
  getByFilename(filename: string): string | undefined;
  /**
   * Restituisce il contenuto del file dato il nome senza estensione (es: 'welcome')
   */
  getByName(name: string): string | undefined;
}

export interface TemplateOptions {
  [key: string]: any;
}

export interface TemplateLoaderOptions {
  extension?: ResourceType; // Se specificato, carica solo questo file
  variables?: TemplateOptions; // Variabili per il template
}

export interface TenantTemplateLoaderOptions extends TemplateLoaderOptions{
  templateName: string;
}

export interface UserTemplateLoaderOptions extends TemplateLoaderOptions {
  userId: string;
}

export class LoadedTemplateImpl implements LoadedTemplate {
  constructor(
    public name: string,
    public files: TemplateFile[]
  ) {}

  getByExtension(extension: string): string | undefined {
    const file = this.files.find(f => f.extension === extension);
    return file?.content;
  }

  getByFilename(filename: string): string | undefined {
    const file = this.files.find(f => f.filepath.endsWith(filename));
    return file?.content;
  }

  getByName(name: string): string | undefined {
    // Cerca file che abbia il nome senza estensione uguale a name
    const file = this.files.find(f => {
      console.error( f.filepath);
      const base = f.filepath.split('/').pop()?.split('.')[0];
      return base === name;
    });
    return file?.content;
  }

  getAllExtensions(): string[] {
    return this.files.map(f => f.extension);
  }

  hasExtension(extension: string): boolean {
    return this.files.some(f => f.extension === extension);
  }
}
