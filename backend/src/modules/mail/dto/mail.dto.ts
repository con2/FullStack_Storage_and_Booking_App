import { IsEmail, IsString } from "class-validator";

export class SendEmailDto {
  @IsEmail()
  to: string;

  @IsString()
  subject: string;

  @IsString()
  message: string;

  @IsEmail()
  from: string;
}
