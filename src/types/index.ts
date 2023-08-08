interface OriginalMeta {
    currentPage: number;
    pageCount: number;
    perPage: number;
    totalCount: number;
}

interface ParamsRequest {
    [key: string]: any;

    page?: number;
    'per-page'?: number;
}

export type {
    OriginalMeta,
    ParamsRequest
}