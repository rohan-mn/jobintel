import {
  ArrayMinSize,
  IsArray,
  IsISO8601,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
  ValidateNested,
} from "class-validator";
import { Type } from "class-transformer";

export class IngestJobDto
{
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  source!: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  sourceJobId?: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(300)
  title!: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  company?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  location?: string;

  @IsUrl()
  url!: string;

  @IsOptional()
  @IsISO8601()
  postedAt?: string;
}

export class IngestJobsBodyDto
{
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => IngestJobDto)
  jobs!: IngestJobDto[];
}
