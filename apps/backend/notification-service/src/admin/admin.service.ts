import { AppLogger } from '@dike/common';
import { ApiGatewayService, BaseAdminService, LoggedUser } from '@dike/communication';
import { Injectable } from '@nestjs/common';
import { readdir, readFile } from 'fs/promises';
import { join } from 'path';

@Injectable()
export class AdminService extends BaseAdminService {
  constructor(
    protected readonly logger: AppLogger,
    protected readonly apiGatewayService: ApiGatewayService,
  ) {
    super(
      new AppLogger(AdminService.name),
      apiGatewayService
    );
  }

	async getAllTemplates(
    loggedUser: LoggedUser,
  ): Promise<any[]> {
		const templatesDir = join(__dirname, '..', 'templates');
		try {
			const entries = await readdir(templatesDir, { withFileTypes: true });
			const templates = await Promise.all(
				entries.filter(e => e.isDirectory()).map(async (e) => {
					const dir = join(templatesDir, e.name);
					const files = await readdir(dir);
					const result: any = {
						name: e.name,
						html: files.includes('html'),
						text: files.includes('text') || files.includes('txt'),
						subject: files.includes('subject'),
						readme: files.includes('README.md'),
					};
					if (result.html) {
						try {
							result.htmlContent = await readFile(join(dir, 'html'), 'utf-8');
						} catch {}
					}
					if (result.text) {
						try {
							result.textContent = await readFile(join(dir, files.includes('text') ? 'text' : 'txt'), 'utf-8');
						} catch {}
					}
					if (result.subject) {
						try {
							result.subjectContent = await readFile(join(dir, 'subject'), 'utf-8');
						} catch {}
					}
					if (result.readme) {
						try {
							result.readmeContent = await readFile(join(dir, 'README.md'), 'utf-8');
						} catch {}
					}
					return result;
				})
			);
			return templates;
		} catch (err) {
			return [];
		}
	}
}
