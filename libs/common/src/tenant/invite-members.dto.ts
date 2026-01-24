import { ApiProperty } from '@nestjs/swagger';

export class InviteMembersDto {
  @ApiProperty({ example: 'Studio Rossi', description: 'Nome del team da creare' })
  teamId: string;

  @ApiProperty({
    example: ['user1@email.com', 'user2@email.com'],
    description: 'Indirizzi email degli utenti da invitare',
    type: [String],
    required: false
  })
  inviteEmails?: string[];

  @ApiProperty({ example: 'user-uuid', description: 'ID dell’utente che crea il team' })
  userId: string;

  @ApiProperty({ example: '127.0.0.1', description: 'IP di origine della richiesta', required: false })
  originIp?: string;

  @ApiProperty({ example: 'Mozilla/5.0', description: 'User agent di origine', required: false })
  originUserAgent?: string;
}
