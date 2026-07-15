import { Request, Response, NextFunction } from 'express';
export declare function requestLogger(req: Request, _res: Response, next: NextFunction): void;
export declare function errorHandler(err: Error, _req: Request, res: Response, _next: NextFunction): void;
export declare function sanitizeInput(input: string): string;
export declare function sanitizeObject(obj: Record<string, unknown>): Record<string, unknown>;
//# sourceMappingURL=common.d.ts.map