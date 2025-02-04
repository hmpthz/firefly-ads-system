/* eslint-disable @typescript-eslint/no-explicit-any */
import { type SchemaDefinition, type SchemaDefinitionType } from 'mongoose';

declare global {
  type ConstructorReturnType<T extends new (...args: any) => any> =
    InstanceType<T>;
  type SchemaDefinitionObject<T> = SchemaDefinition<SchemaDefinitionType<T>, T>;
  type ReqParam<K extends string> = { [P in K]: string };
}
