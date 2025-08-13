import { IsOptional, IsString, MaxLength } from "class-validator";

export class DecisionDto {
  @IsOptional()
  @IsString()
  @MaxLength(500)
  reason?: string;
}
