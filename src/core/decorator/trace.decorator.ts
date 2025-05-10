import { HttpErrorFormat } from '../http/http-error-objects';

export interface TraceMessage {
  message: string;
  errorCodeMap?: Record<string, HttpErrorFormat>;
  errorMessage: HttpErrorFormat;
}

export function TraceExecution(traceMessage: TraceMessage): MethodDecorator {
  return (target: any, propertyKey: string | symbol, descriptor: TypedPropertyDescriptor<any>) => {
    const originalMethod = descriptor.value;
    descriptor.value = async function (...args: any[]) {
      const traceTemplate = this.traceTemplate;

      if (!traceTemplate) {
        return originalMethod.apply(this, args);
      }

      return await traceTemplate.execute(traceMessage, async () => {
        return await originalMethod.apply(this, args);
      });
    };

    return descriptor;
  };
}
