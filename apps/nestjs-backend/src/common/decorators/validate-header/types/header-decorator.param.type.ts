// Type for decorator parameter - can be just header name or config object
export type HeaderDecoratorParam =
  | string
  | {
    headerName: string;
    options?: HeaderValidationOptions;
  };

// Configuration interface for header validation
type HeaderValidationOptions = {
  /**
   * Expected value(s) for the header
   */
  expectedValue?: string | string[] | RegExp | Record<string, string | number>;

  /**
   * Whether the comparison should be case-sensitive
   * @default false
   */
  caseSensitive?: boolean;

  /**
   * Custom error message when header is missing
   */
  missingMessage?: string;

  /**
   * Custom error message when header value doesn't match
   */
  invalidValueMessage?: string;

  /**
   * Whether to allow empty string as valid value
   * @default false
   */
  allowEmpty?: boolean;
};
