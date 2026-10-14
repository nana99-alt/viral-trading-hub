import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface Cell {
    value: Value;
    name: string;
}
export interface ContentFilter {
    source?: string;
    timeRange?: TimeRange;
    keyword?: string;
}
export type ContentId = bigint;
export interface ContentItem {
    id: ContentId;
    title: string;
    viralityScore: bigint;
    body: string;
    publishedAt: Timestamp;
    sourceUrl: string;
    sourceName: string;
    summary: string;
    topics: Array<string>;
    articleUrl: string;
}
export type Error_ = {
    __kind__: "FrontendOriginsNotConfigured";
    FrontendOriginsNotConfigured: null;
} | {
    __kind__: "MixedSsoSources";
    MixedSsoSources: {
        otherKeys: Array<string>;
        ssoKeys: Array<string>;
    };
} | {
    __kind__: "Stale";
    Stale: {
        ageNs: bigint;
    };
} | {
    __kind__: "MalformedCandid";
    MalformedCandid: null;
} | {
    __kind__: "AmbiguousAttribute";
    AmbiguousAttribute: {
        field: string;
        sources: Array<string>;
    };
} | {
    __kind__: "NoAttributes";
    NoAttributes: null;
} | {
    __kind__: "UnknownNonce";
    UnknownNonce: null;
} | {
    __kind__: "UntrustedSsoSource";
    UntrustedSsoSource: {
        domain: string;
    };
} | {
    __kind__: "MissingField";
    MissingField: string;
} | {
    __kind__: "FrontendOriginMismatch";
    FrontendOriginMismatch: {
        got: string;
        expected: Array<string>;
    };
};
export interface HttpHeader {
    value: string;
    name: string;
}
export interface HttpRequestResult {
    status: bigint;
    body: Uint8Array;
    headers: Array<HttpHeader>;
}
export interface Result {
    hasMore: boolean;
    rows: Array<Array<Cell>>;
}
export type Result__1 = {
    __kind__: "ok";
    ok: null;
} | {
    __kind__: "err";
    err: Error_;
};
export interface SourceDescriptor {
    url: string;
    name: string;
    description: string;
}
export interface TimeRange {
    to?: Timestamp;
    from?: Timestamp;
}
export type Timestamp = bigint;
export interface TransformationInput {
    context: Uint8Array;
    response: HttpRequestResult;
}
export interface TransformationOutput {
    status: bigint;
    body: Uint8Array;
    headers: Array<HttpHeader>;
}
export type Value = {
    __kind__: "int";
    int: bigint;
} | {
    __kind__: "nat";
    nat: bigint;
} | {
    __kind__: "float";
    float: number;
} | {
    __kind__: "bool";
    bool: boolean;
} | {
    __kind__: "null";
    null: null;
} | {
    __kind__: "text";
    text: string;
};
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    execute(qJson: string): Promise<Result>;
    getApiDoc(): Promise<string>;
    getCallerUserRole(): Promise<UserRole>;
    /**
     * / Fetch a single content item by id.
     */
    getContent(id: ContentId): Promise<ContentItem | null>;
    /**
     * / Fetch content related to the given item by shared topics.
     */
    getRelatedContent(id: ContentId): Promise<Array<ContentItem>>;
    isCallerAdmin(): Promise<boolean>;
    /**
     * / List the available external content sources.
     */
    listSources(): Promise<Array<SourceDescriptor>>;
    /**
     * / List viral content matching the optional filters, sorted by virality
     * / score descending.
     */
    listViralContent(filter: ContentFilter): Promise<Array<ContentItem>>;
    /**
     * / Pull fresh content from the external sources and persist it.
     */
    refreshContent(): Promise<bigint>;
    schema(): Promise<string>;
    /**
     * / Response-normalization callback for HTTP outcalls. The actor owns this
     * / shared query member; the domain mixin receives it as a parameter.
     */
    transform(input: TransformationInput): Promise<TransformationOutput>;
}
