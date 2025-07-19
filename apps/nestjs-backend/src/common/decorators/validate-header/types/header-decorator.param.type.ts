/**
 * Parameter type for the ValidateHeader decorator.
 * Can be either a simple header name string or a configuration object with validation options.
 *
 * @example
 * // Simple header name validation
 * @ValidateHeader('Authorization')
 * authHeader: string
 *
 * @example
 * // Header with expected value validation
 * @ValidateHeader({
 *   headerName: 'Accept-Language',
 *   options: { expectedValue: ['en', 'de'] }
 * })
 * language: string
 */
export type HeaderDecoratorParam =
  | string
  | {
    headerName: string;
    options?: HeaderValidationOptions;
  };

/**
 * Configuration interface for header validation options.
 * Provides various validation strategies and customization options.
 */
type HeaderValidationOptions = {
  /**
   * Expected value(s) for the header. Supports multiple validation strategies:
   * - String: Exact match validation
   * - Array: Match any value in the array
   * - RegExp: Pattern matching validation
   * - Enum object: Match any enum value
   *
   * @example
   * // String validation
   * expectedValue: 'application/json'
   *
   * @example
   * // Array validation
   * expectedValue: ['en', 'de', 'fr']
   *
   * @example
   * // RegExp validation
   * expectedValue: /^Bearer .+$/
   *
   * @example
   * // Enum validation
   * expectedValue: AcceptedLanguages
   */
  expectedValue?: string | string[] | RegExp | Record<string, string | number>;

  /**
   * Whether the comparison should be case-sensitive.
   * When false, both header value and expected value are compared in lowercase.
   *
   * @default false
   * @example
   * // Case-insensitive (default)
   * caseSensitive: false // 'EN' matches 'en'
   *
   * @example
   * // Case-sensitive
   * caseSensitive: true // 'EN' does not match 'en'
   */
  caseSensitive?: boolean;

  /**
   * Custom error message when the header is missing or empty.
   * If not provided, a default message will be generated.
   *
   * @example
   * missingMessage: 'Authorization header is required'
   */
  missingMessage?: string;

  /**
   * Custom error message when the header value doesn't match expected value.
   * If not provided, a default message will be generated.
   *
   * @example
   * invalidValueMessage: 'Invalid content type. Expected application/json'
   */
  invalidValueMessage?: string;

  /**
   * Whether to allow empty string as a valid value.
   * When false, empty strings are treated as missing headers.
   *
   * @default false
   * @example
   * // Allow empty values
   * allowEmpty: true
   *
   * @example
   * // Reject empty values (default)
   * allowEmpty: false
   */
  allowEmpty?: boolean;
};
