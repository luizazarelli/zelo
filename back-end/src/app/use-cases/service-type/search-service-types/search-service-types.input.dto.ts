import z from "zod";

export const searchServiceTypesInputDto = z.object({});

export type SearchServiceTypesInputDto = z.infer<typeof searchServiceTypesInputDto>;
