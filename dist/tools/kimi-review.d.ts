import { z } from 'zod';
export declare const kimiReviewSchema: {
    scope: z.ZodString;
    work_dir: z.ZodString;
    focus: z.ZodDefault<z.ZodEnum<["security", "performance", "maintainability", "all"]>>;
    detail_level: z.ZodDefault<z.ZodEnum<["summary", "normal", "detailed"]>>;
};
type KimiReviewArgs = {
    scope: string;
    work_dir: string;
    focus?: 'security' | 'performance' | 'maintainability' | 'all';
    detail_level?: 'summary' | 'normal' | 'detailed';
};
export declare function kimiReviewHandler({ scope, work_dir, focus, detail_level, }: KimiReviewArgs): Promise<{
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
