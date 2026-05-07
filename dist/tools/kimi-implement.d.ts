import { z } from 'zod';
export declare const kimiImplementSchema: {
    task: z.ZodString;
    work_dir: z.ZodString;
    allow_commit: z.ZodDefault<z.ZodBoolean>;
    max_output_tokens: z.ZodOptional<z.ZodNumber>;
    resume_session: z.ZodOptional<z.ZodString>;
};
type KimiImplementArgs = {
    task: string;
    work_dir: string;
    allow_commit?: boolean;
    max_output_tokens?: number;
    resume_session?: string;
};
export declare function kimiImplementHandler({ task, work_dir, allow_commit, max_output_tokens, resume_session, }: KimiImplementArgs): Promise<{
    content: {
        type: "text";
        text: string;
    }[];
    isError: boolean;
} | {
    content: {
        type: "text";
        text: string;
    }[];
    isError?: undefined;
}>;
export {};
