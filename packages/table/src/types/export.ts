import type { FetcherQuery } from '../types';

export type ExporterResult = { url: string } | Blob;

export type Exporter = (query: FetcherQuery) => Promise<ExporterResult>;
