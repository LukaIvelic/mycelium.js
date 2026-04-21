import { HeaderFilterLevel } from "../types";
import { filterHeaders } from "./filter-header";
import { parseRawHeaders } from "./parse-raw-headers";

export function safeHeaders(raw: string[], headerFilterLevel: HeaderFilterLevel): Record<string, string> {
    return filterHeaders(
        parseRawHeaders(raw),
        headerFilterLevel
    );
}
