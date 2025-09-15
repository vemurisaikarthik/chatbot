import { InputType, Field } from '@nestjs/graphql';
import { IsNotEmpty, IsString, IsArray } from 'class-validator';

@InputType()
export class CreateChatInput {
  @Field()
  @IsNotEmpty()
  @IsString()
  name: string;

  @Field(() => [String])
  @IsArray()
  participants: string[];
}