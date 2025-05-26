import { z, ZodError } from 'zod';
import { validate } from './validate.middleware.js';

// backend/src/middleware/validate.middleware.test.js

describe('validate middleware', () => {
  let req, res, next;

  beforeEach(() => {
    req = { body: {}, query: {}, params: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();
  });

  const schema = z.object({
    body: z.object({
      name: z.string(),
      age: z.number().int().min(0),
    }),
    query: z.object({}),
    params: z.object({}),
  });

  it('should call next() if validation passes', () => {
    req.body = { name: 'Alice', age: 30 };
    validate(schema)(req, res, next);
    expect(next).toHaveBeenCalledWith();
    expect(res.status).not.toHaveBeenCalled();
    expect(res.json).not.toHaveBeenCalled();
  });

  it('should return 400 and error details if validation fails', () => {
    req.body = { name: 123, age: -5 };
    validate(schema)(req, res, next);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 'error',
        message: 'Validation failed',
        errors: expect.arrayContaining([
          expect.objectContaining({ path: 'body.name' }),
          expect.objectContaining({ path: 'body.age' }),
        ]),
      })
    );
    expect(next).not.toHaveBeenCalledWith();
  });

  it('should call next(error) if a non-Zod error is thrown', () => {
    const badSchema = {
      parse: () => {
        throw new Error('Some other error');
      },
    };
    validate(badSchema)(req, res, next);
    expect(next).toHaveBeenCalledWith(expect.any(Error));
    expect(res.status).not.toHaveBeenCalled();
    expect(res.json).not.toHaveBeenCalled();
  });

  it('should validate query and params as well', () => {
    const fullSchema = z.object({
      body: z.object({}),
      query: z.object({ search: z.string().min(1) }),
      params: z.object({ id: z.string().uuid() }),
    });
    req.query = { search: 'test' };
    req.params = { id: '123e4567-e89b-12d3-a456-426614174000' };
    validate(fullSchema)(req, res, next);
    expect(next).toHaveBeenCalledWith();
    expect(res.status).not.toHaveBeenCalled();
    expect(res.json).not.toHaveBeenCalled();
  });

  it('should return 400 if query or params are invalid', () => {
    const fullSchema = z.object({
      body: z.object({}),
      query: z.object({ search: z.string().min(1) }),
      params: z.object({ id: z.string().uuid() }),
    });
    req.query = { search: '' };
    req.params = { id: 'not-a-uuid' };
    validate(fullSchema)(req, res, next);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 'error',
        message: 'Validation failed',
        errors: expect.arrayContaining([
          expect.objectContaining({ path: 'query.search' }),
          expect.objectContaining({ path: 'params.id' }),
        ]),
      })
    );
    expect(next).not.toHaveBeenCalledWith();
  });

  it('should handle missing schema keys gracefully', () => {
    // If schema expects only body, but query/params are missing, should not throw
    const bodyOnlySchema = z.object({
      body: z.object({ foo: z.string() }),
    });
    req.body = { foo: 'bar' };
    validate(bodyOnlySchema)(req, res, next);
    expect(next).toHaveBeenCalledWith();
  });

  it('should handle empty body/query/params', () => {
    const emptySchema = z.object({
      body: z.object({}),
      query: z.object({}),
      params: z.object({}),
    });
    validate(emptySchema)(req, res, next);
    expect(next).toHaveBeenCalledWith();
  });

  it('should return all error messages for multiple invalid fields', () => {
    req.body = { name: 123, age: 'not-a-number' };
    validate(schema)(req, res, next);
    expect(res.status).toHaveBeenCalledWith(400);
    const errorCall = res.json.mock.calls[0][0];
    expect(errorCall.errors.length).toBeGreaterThanOrEqual(2);
    const paths = errorCall.errors.map(e => e.path);
    expect(paths).toContain('body.name');
    expect(paths).toContain('body.age');
  });

  it('should not mutate req object', () => {
    req.body = { name: 'Alice', age: 30 };
    const originalReq = JSON.parse(JSON.stringify(req));
    validate(schema)(req, res, next);
    expect(req).toEqual(originalReq);
  });
});
    next = jest.fn();
  });

  const schema = z.object({
    body: z.object({
      name: z.string(),
      age: z.number().int().min(0),
    }),
    query: z.object({}),
    params: z.object({}),
  });

  it('should call next() if validation passes', () => {
    req.body = { name: 'Alice', age: 30 };
    validate(schema)(req, res, next);
    expect(next).toHaveBeenCalledWith();
    expect(res.status).not.toHaveBeenCalled();
    expect(res.json).not.toHaveBeenCalled();
  });

  it('should return 400 and error details if validation fails', () => {
    req.body = { name: 123, age: -5 };
    validate(schema)(req, res, next);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 'error',
        message: 'Validation failed',
        errors: expect.arrayContaining([
          expect.objectContaining({ path: 'body.name' }),
          expect.objectContaining({ path: 'body.age' }),
        ]),
      })
    );
    expect(next).not.toHaveBeenCalledWith();
  });

  it('should call next(error) if a non-Zod error is thrown', () => {
    const badSchema = {
      parse: () => {
        throw new Error('Some other error');
      },
    };
    validate(badSchema)(req, res, next);
    expect(next).toHaveBeenCalledWith(expect.any(Error));
    expect(res.status).not.toHaveBeenCalled();
    expect(res.json).not.toHaveBeenCalled();
  });
});import { z } from 'zod';
import { validate } from './validate.middleware.js';

// backend/src/middleware/validate.middleware.test.js

describe('validate middleware', () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      body: {},
      query: {},
      params: {},
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();
  });

  const schema = z.object({
    body: z.object({
      name: z.string(),
      age: z.number().int().min(0),
    }),
    query: z.object({}),
    params: z.object({}),
  });

  it('should call next() if validation passes', () => {
    req.body = { name: 'Alice', age: 30 };
    validate(schema)(req, res, next);
    expect(next).toHaveBeenCalledWith();
    expect(res.status).not.toHaveBeenCalled();
    expect(res.json).not.toHaveBeenCalled();
  });

  it('should return 400 and error details if validation fails', () => {
    req.body = { name: 123, age: -5 };
    validate(schema)(req, res, next);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 'error',
        message: 'Validation failed',
        errors: expect.any(Array),
      })
    );
    expect(next).not.toHaveBeenCalledWith();
  });

  it('should pass non-Zod errors to next(error)', () => {
    // Create a schema that throws a non-Zod error
    const badSchema = {
      parse: () => {
        throw new Error('Some other error');
      },
    };
    validate(badSchema)(req, res, next);
    expect(next).toHaveBeenCalledWith(expect.any(Error));
    expect(res.status).not.toHaveBeenCalled();
    expect(res.json).not.toHaveBeenCalled();
  });
});