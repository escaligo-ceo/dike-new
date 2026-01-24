import { ApiProperty } from '@nestjs/swagger';

export class SendInviteDto {
  @ApiProperty({ example: ['user1@email.com', 'user2@email.com'], type: [String] })
  emails: string[];

  @ApiProperty({ example: 'team-uuid', description: 'ID del team' })
  teamId: string;

  @ApiProperty({ example: 'member', description: 'Ruolo da assegnare agli invitati', required: false })
  role?: string;
}