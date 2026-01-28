// #!/usr/bin/env node
// /**
//  * Script di test per verificare il funzionamento del TemplateLoader
//  */

// import { TemplateLoaderService } from './template-loader.service';
// import { AppLogger } from '@dike/common';

// // Mock AppLogger per il test
// class MockAppLogger implements AppLogger {
//   appName = 'TestTemplateLoader';
  
//   log(message: string, context?: string) {
//     console.log(`[LOG] ${context || this.appName}: ${message}`);
//   }
  
//   error(message: string, trace?: string, context?: string) {
//     console.error(`[ERROR] ${context || this.appName}: ${message}`, trace);
//   }
  
//   warn(message: string, context?: string) {
//     console.warn(`[WARN] ${context || this.appName}: ${message}`);
//   }
  
//   debug(message: string, context?: string) {
//     console.debug(`[DEBUG] ${context || this.appName}: ${message}`);
//   }
  
//   verbose(message: string, context?: string) {
//     console.log(`[VERBOSE] ${context || this.appName}: ${message}`);
//   }
// }

// async function testTemplateLoader() {
//   const logger = new MockAppLogger();
//   const templateLoader = new TemplateLoaderService(logger);

//   logger.log('🧪 Inizio test del TemplateLoader...');

//   try {
//     // Test 1: Verifica che il path dei template venga trovato
//     logger.log('Test 1: Verifica path dei template');
//     const templatesPath = (templateLoader as any).getTemplatesPath();
//     logger.log(`✅ Path trovato: ${templatesPath}`);

//     // Test 2: Carica template di verifica email
//     logger.log('Test 2: Caricamento template verification/email');
//     const verificationTemplate = await templateLoader.loadTemplate({ 
//       templateName: 'verification/email' 
//     });
//     logger.log(`✅ Template caricato:`);
//     logger.log(`   Nome: ${verificationTemplate.name}`);
//     logger.log(`   Files disponibili: ${verificationTemplate.getAllExtensions().join(', ')}`);
    
//     // Mostra i contenuti disponibili
//     if (verificationTemplate.hasExtension('subject')) {
//       logger.log(`   Subject: ${verificationTemplate.getByExtension('subject')}`);
//     }
//     if (verificationTemplate.hasExtension('txt')) {
//       const textContent = verificationTemplate.getByExtension('txt');
//       logger.log(`   Text length: ${textContent?.length || 0} chars`);
//     }
//     if (verificationTemplate.hasExtension('html')) {
//       const htmlContent = verificationTemplate.getByExtension('html');
//       logger.log(`   HTML length: ${htmlContent?.length || 0} chars`);
//     }

//     // Test 3: Carica template di benvenuto
//     logger.log('Test 3: Caricamento template welcome/user');
//     const welcomeTemplate = await templateLoader.loadTemplate({ 
//       templateName: 'welcome/user' 
//     });
//     logger.log(`✅ Template caricato:`);
//     logger.log(`   Nome: ${welcomeTemplate.name}`);
//     logger.log(`   Files disponibili: ${welcomeTemplate.getAllExtensions().join(', ')}`);
    
//     // Mostra i contenuti disponibili
//     if (welcomeTemplate.hasExtension('subject')) {
//       logger.log(`   Subject: ${welcomeTemplate.getByExtension('subject')}`);
//     }
//     if (welcomeTemplate.hasExtension('txt')) {
//       const textContent = welcomeTemplate.getByExtension('txt');
//       logger.log(`   Text length: ${textContent?.length || 0} chars`);
//     }
//     if (welcomeTemplate.hasExtension('html')) {
//       const htmlContent = welcomeTemplate.getByExtension('html');
//       logger.log(`   HTML length: ${htmlContent?.length || 0} chars`);
//     }

//     logger.log('🎉 Tutti i test sono passati!');

//   } catch (error) {
//     logger.error('❌ Errore durante i test:', error.message);
//     process.exit(1);
//   }
// }

// // Esegui i test
// testTemplateLoader();
