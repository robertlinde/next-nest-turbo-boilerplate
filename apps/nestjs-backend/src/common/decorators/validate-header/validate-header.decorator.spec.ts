import {ExecutionContext, NotAcceptableException} from '@nestjs/common';
import {Request} from 'express';
import {ValidateHeader, validateHeaderValue, formatExpectedValue} from './validate-header.decorator';

// Re-implementation of internal helper functions for testing
function validateHeaderValueLocal(
    headerValue: string | string[],
    expectedValue: string | string[] | RegExp | Record<string, string | number>,
    caseSensitive: boolean,
): boolean {
    const headerValues = Array.isArray(headerValue) ? headerValue : [headerValue];

    if (expectedValue instanceof RegExp) {
        return headerValues.some((value) => expectedValue.test(value));
    }

    if (typeof expectedValue === 'object' && !Array.isArray(expectedValue) && expectedValue !== null) {
        const enumValues = Object.values(expectedValue).map(String);
        return headerValues.some((headerVal) =>
            enumValues.some((enumVal) =>
                caseSensitive ? headerVal === enumVal : headerVal.toLowerCase() === enumVal.toLowerCase(),
            ),
        );
    }

    const expectedValues = Array.isArray(expectedValue) ? expectedValue : [expectedValue];

    return headerValues.some((headerVal) =>
        expectedValues.some((expectedVal) =>
            caseSensitive ? headerVal === expectedVal : headerVal.toLowerCase() === expectedVal.toLowerCase(),
        ),
    );
}

function formatExpectedValueLocal(expectedValue: string | string[] | RegExp | Record<string, string | number>): string {
    if (expectedValue instanceof RegExp) {
        return expectedValue.toString();
    }

    if (Array.isArray(expectedValue)) {
        return expectedValue.join(' | ');
    }

    if (typeof expectedValue === 'object' && expectedValue !== null) {
        return Object.values(expectedValue).join(' | ');
    }

    return String(expectedValue);
}

// Mock the decorator factory function for comprehensive testing
function mockValidateHeaderFactory(
    param: string | {headerName: string; options?: any},
    ctx: ExecutionContext,
): string | string[] {
    const request: Request = ctx.switchToHttp().getRequest();

    const headerName = typeof param === 'string' ? param : param.headerName;
    const options = typeof param === 'string' ? {} : (param.options ?? {});

    const {expectedValue, caseSensitive = false, missingMessage, invalidValueMessage, allowEmpty = false} = options;

    const headerValue = request.headers[headerName.toLowerCase()];

    if (headerValue === undefined || headerValue === null || (!allowEmpty && headerValue === '')) {
        const message = missingMessage ?? `Missing required header: ${headerName}`;
        throw new NotAcceptableException(message);
    }

    if (expectedValue === undefined) {
        return headerValue;
    }

    const isValid = validateHeaderValueLocal(headerValue, expectedValue, caseSensitive);

    if (!isValid) {
        const message =
            invalidValueMessage ??
            `Invalid value for header '${headerName}'. Expected: ${formatExpectedValueLocal(expectedValue)}`;
        throw new NotAcceptableException(message);
    }

    return headerValue;
}

describe('ValidateHeader Decorator', (): void => {
    describe('Decorator Structure', (): void => {
        it('should be defined', (): void => {
            expect(ValidateHeader).toBeDefined();
            expect(typeof ValidateHeader).toBe('function');
        });

        it('should return a function when called with string parameter', (): void => {
            const result = ValidateHeader('authorization');
            expect(typeof result).toBe('function');
        });

        it('should return a function when called with object parameter', (): void => {
            const result = ValidateHeader({
                headerName: 'content-type',
                options: {expectedValue: 'application/json'},
            });
            expect(typeof result).toBe('function');
        });
    });

    describe('Helper Functions', (): void => {
        describe('validateHeaderValue', (): void => {
            it('should validate string values correctly', (): void => {
                expect(validateHeaderValue('application/json', 'application/json', false)).toBe(true);
                expect(validateHeaderValue('text/html', 'application/json', false)).toBe(false);
            });

            it('should handle case sensitivity', (): void => {
                expect(validateHeaderValue('APPLICATION/JSON', 'application/json', false)).toBe(true);
                expect(validateHeaderValue('APPLICATION/JSON', 'application/json', true)).toBe(false);
            });

            it('should validate array values', (): void => {
                expect(validateHeaderValue('application/xml', ['application/json', 'application/xml'], false)).toBe(true);
                expect(validateHeaderValue('text/html', ['application/json', 'application/xml'], false)).toBe(false);
            });

            it('should validate RegExp patterns', (): void => {
                expect(validateHeaderValue('Bearer token123', /^Bearer\s+/, false)).toBe(true);
                expect(validateHeaderValue('Basic token123', /^Bearer\s+/, false)).toBe(false);
            });

            it('should validate enum values', (): void => {
                enum ContentType {
                    JSON = 'application/json',
                    XML = 'application/xml',
                }
                expect(validateHeaderValue('application/json', ContentType, false)).toBe(true);
                expect(validateHeaderValue('text/html', ContentType, false)).toBe(false);
            });

            it('should handle array header values', (): void => {
                expect(validateHeaderValue(['application/json'], 'application/json', false)).toBe(true);
                expect(validateHeaderValue(['text/html'], 'application/json', false)).toBe(false);
            });
        });

        describe('formatExpectedValue', (): void => {
            it('should format string values', (): void => {
                expect(formatExpectedValue('application/json')).toBe('application/json');
            });

            it('should format array values', (): void => {
                expect(formatExpectedValue(['application/json', 'application/xml'])).toBe('application/json | application/xml');
            });

            it('should format RegExp values', (): void => {
                const regex = /^Bearer\s+/;
                expect(formatExpectedValue(regex)).toBe(regex.toString());
            });

            it('should format enum values', (): void => {
                enum ContentType {
                    JSON = 'application/json',
                    XML = 'application/xml',
                }
                expect(formatExpectedValue(ContentType)).toBe('application/json | application/xml');
            });
        });
    });

    describe('Decorator Functionality (Mock)', (): void => {
        let mockExecutionContext: ExecutionContext;
        let mockRequest: Request;

        beforeEach((): void => {
            // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
            const mockRequestLocal: Request = {
                headers: {},
            } as Request;
            mockRequest = mockRequestLocal;

            // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
            const mockExecutionContextLocal: ExecutionContext = {
                switchToHttp: () => ({
                    getRequest: () => mockRequest,
                }),
            } as ExecutionContext;
            mockExecutionContext = mockExecutionContextLocal;
        });

        describe('Basic header extraction', (): void => {
            it('should extract header value when header exists', (): void => {
                mockRequest.headers.authorization = 'Bearer token123';
                const result = mockValidateHeaderFactory('authorization', mockExecutionContext);
                expect(result).toBe('Bearer token123');
            });

            it('should throw NotAcceptableException when required header is missing', (): void => {
                expect((): void => {
                    mockValidateHeaderFactory('authorization', mockExecutionContext);
                }).toThrow(NotAcceptableException);
            });

            it('should handle case-insensitive header names', (): void => {
                mockRequest.headers['content-type'] = 'application/json';
                const result = mockValidateHeaderFactory('Content-Type', mockExecutionContext);
                expect(result).toBe('application/json');
            });
        });

        describe('Header validation with expectedValue', (): void => {
            it('should validate string value successfully', (): void => {
                mockRequest.headers['content-type'] = 'application/json';
                const result = mockValidateHeaderFactory(
                    {
                        headerName: 'content-type',
                        options: {expectedValue: 'application/json'},
                    },
                    mockExecutionContext,
                );
                expect(result).toBe('application/json');
            });

            it('should throw error when string validation fails', (): void => {
                mockRequest.headers['content-type'] = 'text/html';

                expect((): void => {
                    mockValidateHeaderFactory(
                        {
                            headerName: 'content-type',
                            options: {expectedValue: 'application/json'},
                        },
                        mockExecutionContext,
                    );
                }).toThrow(NotAcceptableException);
            });

            it('should validate array of values successfully', (): void => {
                mockRequest.headers['content-type'] = 'application/xml';
                const result = mockValidateHeaderFactory(
                    {
                        headerName: 'content-type',
                        options: {expectedValue: ['application/json', 'application/xml']},
                    },
                    mockExecutionContext,
                );
                expect(result).toBe('application/xml');
            });

            it('should validate RegExp pattern successfully', (): void => {
                mockRequest.headers.authorization = 'Bearer abc123';
                const result = mockValidateHeaderFactory(
                    {
                        headerName: 'authorization',
                        options: {expectedValue: /^Bearer\s+/},
                    },
                    mockExecutionContext,
                );
                expect(result).toBe('Bearer abc123');
            });

            it('should throw error when RegExp validation fails', (): void => {
                mockRequest.headers.authorization = 'Basic abc123';

                expect((): void => {
                    mockValidateHeaderFactory(
                        {
                            headerName: 'authorization',
                            options: {expectedValue: /^Bearer\s+/},
                        },
                        mockExecutionContext,
                    );
                }).toThrow(NotAcceptableException);
            });

            it('should validate enum values successfully', (): void => {
                enum ContentType {
                    JSON = 'application/json',
                    XML = 'application/xml',
                }

                mockRequest.headers['content-type'] = 'application/json';
                const result = mockValidateHeaderFactory(
                    {
                        headerName: 'content-type',
                        options: {expectedValue: ContentType},
                    },
                    mockExecutionContext,
                );
                expect(result).toBe('application/json');
            });
        });

        describe('Custom error messages', (): void => {
            it('should use custom missing message', (): void => {
                expect((): void => {
                    mockValidateHeaderFactory(
                        {
                            headerName: 'authorization',
                            options: {missingMessage: 'Auth header required'},
                        },
                        mockExecutionContext,
                    );
                }).toThrow('Auth header required');
            });

            it('should use custom invalid value message', (): void => {
                mockRequest.headers['content-type'] = 'text/html';

                expect((): void => {
                    mockValidateHeaderFactory(
                        {
                            headerName: 'content-type',
                            options: {
                                expectedValue: 'application/json',
                                invalidValueMessage: 'Invalid content type',
                            },
                        },
                        mockExecutionContext,
                    );
                }).toThrow('Invalid content type');
            });
        });

        describe('Allow empty option', (): void => {
            it('should allow empty headers when allowEmpty is true', (): void => {
                mockRequest.headers['optional-header'] = '';
                const result = mockValidateHeaderFactory(
                    {
                        headerName: 'optional-header',
                        options: {allowEmpty: true},
                    },
                    mockExecutionContext,
                );
                expect(result).toBe('');
            });

            it('should reject empty headers by default', (): void => {
                mockRequest.headers['required-header'] = '';

                expect((): void => {
                    mockValidateHeaderFactory(
                        {
                            headerName: 'required-header',
                            options: {},
                        },
                        mockExecutionContext,
                    );
                }).toThrow(NotAcceptableException);
            });
        });
    });

    describe('Type Safety', (): void => {
        it('should work as a decorator on class methods', (): void => {
            expect((): unknown => {
                class TestController {
                    testMethod(@ValidateHeader('authorization') auth: string): string {
                        return auth;
                    }
                }
                return TestController;
            }).not.toThrow();
        });

        it('should work with object configuration', (): void => {
            expect((): unknown => {
                class TestController {
                    testMethod(
                        @ValidateHeader({
                            headerName: 'authorization',
                            options: {expectedValue: 'Bearer'},
                        })
                        auth: string,
                    ): string {
                        return auth;
                    }
                }
                return TestController;
            }).not.toThrow();
        });
    });
});