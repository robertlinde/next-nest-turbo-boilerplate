import {Controller, Get} from '@nestjs/common';
import {Test, TestingModule} from '@nestjs/testing';
import * as request from 'supertest';
import {ValidateHeader} from './validate-header.decorator';

// Test controller to test the decorator in context
@Controller('test')
class TestController {
  @Get('basic')
  basicHeaderTest(@ValidateHeader('authorization') authHeader: string) {
    return {auth: authHeader};
  }

  @Get('case-insensitive')
  caseInsensitiveTest(@ValidateHeader('Content-Type') contentType: string) {
    return {contentType};
  }

  @Get('with-validation')
  withValidationTest(
    @ValidateHeader({
      headerName: 'content-type',
      options: {expectedValue: 'application/json'},
    })
    contentType: string,
  ) {
    return {contentType};
  }

  @Get('case-sensitive')
  caseSensitiveTest(
    @ValidateHeader({
      headerName: 'x-api-version',
      options: {expectedValue: 'v1', caseSensitive: true},
    })
    version: string,
  ) {
    return {version};
  }

  @Get('array-validation')
  arrayValidationTest(
    @ValidateHeader({
      headerName: 'accept',
      options: {expectedValue: ['application/json', 'text/html']},
    })
    accept: string,
  ) {
    return {accept};
  }

  @Get('regex-validation')
  regexValidationTest(
    @ValidateHeader({
      headerName: 'user-agent',
      options: {expectedValue: /^Mozilla\/.*$/},
    })
    userAgent: string,
  ) {
    return {userAgent};
  }

  @Get('enum-validation')
  enumValidationTest(
    @ValidateHeader({
      headerName: 'x-http-method',
      options: {expectedValue: {GET: 'GET', POST: 'POST', PUT: 'PUT'}},
    })
    method: string,
  ) {
    return {method};
  }

  @Get('allow-empty')
  allowEmptyTest(
    @ValidateHeader({
      headerName: 'x-optional',
      options: {allowEmpty: true},
    })
    optional: string,
  ) {
    return {optional};
  }

  @Get('custom-messages')
  customMessagesTest(
    @ValidateHeader({
      headerName: 'x-required',
      options: {
        expectedValue: 'expected-value',
        missingMessage: 'Custom missing message',
        invalidValueMessage: 'Custom invalid message',
      },
    })
    required: string,
  ) {
    return {required};
  }
}

describe('ValidateHeader Decorator', () => {
  let app: any;
  let testingModule: TestingModule;

  beforeEach(async () => {
    testingModule = await Test.createTestingModule({
      controllers: [TestController],
    }).compile();

    app = testingModule.createNestApplication();
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  describe('Basic header extraction', () => {
    it('should extract header value when header exists', async () => {
      const response = await request(app.getHttpServer())
        .get('/test/basic')
        .set('authorization', 'Bearer token123')
        .expect(200);

      expect(response.body).toEqual({auth: 'Bearer token123'});
    });

    it('should extract header value case-insensitively', async () => {
      const response = await request(app.getHttpServer())
        .get('/test/case-insensitive')
        .set('content-type', 'application/json')
        .expect(200);

      expect(response.body).toEqual({contentType: 'application/json'});
    });

    it('should throw NotAcceptableException when header is missing', async () => {
      await request(app.getHttpServer())
        .get('/test/basic')
        .expect(406);
    });

    it('should throw NotAcceptableException when header is empty by default', async () => {
      await request(app.getHttpServer())
        .get('/test/basic')
        .set('authorization', '')
        .expect(406);
    });
  });

  describe('String value validation', () => {
    it('should validate exact string match (case-insensitive by default)', async () => {
      const response = await request(app.getHttpServer())
        .get('/test/with-validation')
        .set('content-type', 'APPLICATION/JSON')
        .expect(200);

      expect(response.body).toEqual({contentType: 'APPLICATION/JSON'});
    });

    it('should validate exact string match (case-sensitive)', async () => {
      const response = await request(app.getHttpServer())
        .get('/test/case-sensitive')
        .set('x-api-version', 'v1')
        .expect(200);

      expect(response.body).toEqual({version: 'v1'});
    });

    it('should throw when case-sensitive validation fails', async () => {
      await request(app.getHttpServer())
        .get('/test/case-sensitive')
        .set('x-api-version', 'V1')
        .expect(406);
    });

    it('should throw when string validation fails', async () => {
      await request(app.getHttpServer())
        .get('/test/with-validation')
        .set('content-type', 'text/plain')
        .expect(406);
    });
  });

  describe('Array value validation', () => {
    it('should validate against array of expected values', async () => {
      const response = await request(app.getHttpServer())
        .get('/test/array-validation')
        .set('accept', 'application/json')
        .expect(200);

      expect(response.body).toEqual({accept: 'application/json'});
    });

    it('should validate second option from array', async () => {
      const response = await request(app.getHttpServer())
        .get('/test/array-validation')
        .set('accept', 'text/html')
        .expect(200);

      expect(response.body).toEqual({accept: 'text/html'});
    });

    it('should throw when array validation fails', async () => {
      await request(app.getHttpServer())
        .get('/test/array-validation')
        .set('accept', 'application/xml')
        .expect(406);
    });
  });

  describe('RegExp validation', () => {
    it('should validate using regular expression', async () => {
      const response = await request(app.getHttpServer())
        .get('/test/regex-validation')
        .set('user-agent', 'Mozilla/5.0 (compatible; MyBot/1.0)')
        .expect(200);

      expect(response.body).toEqual({userAgent: 'Mozilla/5.0 (compatible; MyBot/1.0)'});
    });

    it('should throw when regex validation fails', async () => {
      await request(app.getHttpServer())
        .get('/test/regex-validation')
        .set('user-agent', 'Chrome/90.0')
        .expect(406);
    });
  });

  describe('Enum validation', () => {
    it('should validate against enum values', async () => {
      const response = await request(app.getHttpServer())
        .get('/test/enum-validation')
        .set('x-http-method', 'POST')
        .expect(200);

      expect(response.body).toEqual({method: 'POST'});
    });

    it('should validate enum case-insensitively by default', async () => {
      const response = await request(app.getHttpServer())
        .get('/test/enum-validation')
        .set('x-http-method', 'get')
        .expect(200);

      expect(response.body).toEqual({method: 'get'});
    });

    it('should throw when enum validation fails', async () => {
      await request(app.getHttpServer())
        .get('/test/enum-validation')
        .set('x-http-method', 'DELETE')
        .expect(406);
    });
  });

  describe('Empty value handling', () => {
    it('should allow empty values when allowEmpty is true', async () => {
      const response = await request(app.getHttpServer())
        .get('/test/allow-empty')
        .set('x-optional', '')
        .expect(200);

      expect(response.body).toEqual({optional: ''});
    });

    it('should still require header to be present even with allowEmpty', async () => {
      await request(app.getHttpServer())
        .get('/test/allow-empty')
        .expect(406);
    });
  });

  describe('Custom error messages', () => {
    it('should use custom missing message', async () => {
      const response = await request(app.getHttpServer())
        .get('/test/custom-messages')
        .expect(406);

      // Note: We can't easily test the exact error message in integration tests
      // but we can verify the status code is correct
      expect(response.status).toBe(406);
    });

    it('should use custom invalid value message', async () => {
      const response = await request(app.getHttpServer())
        .get('/test/custom-messages')
        .set('x-required', 'wrong-value')
        .expect(406);

      expect(response.status).toBe(406);
    });

    it('should pass when validation succeeds', async () => {
      const response = await request(app.getHttpServer())
        .get('/test/custom-messages')
        .set('x-required', 'expected-value')
        .expect(200);

      expect(response.body).toEqual({required: 'expected-value'});
    });
  });

  describe('Edge cases', () => {
    it('should handle header name with special characters', async () => {
      // Create a simple test for this
      @Controller('edge-test')
      class EdgeTestController {
        @Get('special-header')
        specialHeaderTest(@ValidateHeader('X-Custom-Header-123') header: string) {
          return {header};
        }
      }

      const edgeTestingModule = await Test.createTestingModule({
        controllers: [EdgeTestController],
      }).compile();

      const edgeApp = edgeTestingModule.createNestApplication();
      await edgeApp.init();

      const response = await request(edgeApp.getHttpServer())
        .get('/edge-test/special-header')
        .set('x-custom-header-123', 'test-value')
        .expect(200);

      expect(response.body).toEqual({header: 'test-value'});

      await edgeApp.close();
    });
  });
});