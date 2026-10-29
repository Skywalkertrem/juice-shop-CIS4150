import { mock } from 'node:test'
import type { Request, Response, NextFunction } from 'express'

type MockableResponseProps =
  | 'status'
  | 'sendStatus'
  | 'json'
  | 'send'
  | 'cookie'
  | 'clearCookie'
  | 'redirect'
  | 'header'
  | 'set'
  | 'setHeader'
  | 'getHeader'
  | 'type'
  | 'contentType'
  | 'render'
  | 'sendFile'
  | 'end'

export interface MockResponse extends Omit<Partial<Response>, MockableResponseProps> {
  statusCode: number
  headersSent: boolean
  locals: Record<string, any>
  _headers: Record<string, string | string[]>
  _body: any
  status: ReturnType<typeof mock.fn>
  sendStatus: ReturnType<typeof mock.fn>
  json: ReturnType<typeof mock.fn>
  send: ReturnType<typeof mock.fn>
  cookie: ReturnType<typeof mock.fn>
  clearCookie: ReturnType<typeof mock.fn>
  redirect: ReturnType<typeof mock.fn>
  header: ReturnType<typeof mock.fn>
  set: ReturnType<typeof mock.fn>
  setHeader: ReturnType<typeof mock.fn>
  getHeader: ReturnType<typeof mock.fn>
  type: ReturnType<typeof mock.fn>
  contentType: ReturnType<typeof mock.fn>
  render: ReturnType<typeof mock.fn>
  sendFile: ReturnType<typeof mock.fn>
  end: ReturnType<typeof mock.fn>
}

export interface MockRequest extends Omit<Partial<Request>, 'header' | 'get'> {
  body: any
  params: Record<string, string>
  query: Record<string, any>
  headers: Record<string, string | string[]>
  cookies: Record<string, any>
  signedCookies: Record<string, any>
  session: Record<string, any>
  header: ReturnType<typeof mock.fn>
  get: ReturnType<typeof mock.fn>
}

export type MockNext = NextFunction & ReturnType<typeof mock.fn>

export const createMockReq = (overrides: Partial<Request> = {}): MockRequest => {
  const headers: Record<string, string | string[]> = (overrides.headers as Record<string, string | string[]>) ?? {}
  const getHeader = mock.fn((name: string) => {
    return headers[name.toLowerCase()] ?? headers[name]
  })

  return {
    body: {},
    params: {},
    query: {},
    headers,
    cookies: {},
    signedCookies: {},
    session: {},
    ip: '127.0.0.1',
    method: 'GET',
    url: '/',
    originalUrl: '/',
    baseUrl: '',
    path: '/',
    header: getHeader,
    get: getHeader,
    ...overrides
  } as unknown as MockRequest
}

export const createMockRes = (): MockResponse => {
  const res: Record<string, any> = {
    statusCode: 200,
    headersSent: false,
    locals: {},
    _headers: {} as Record<string, string | string[]>,
    _body: undefined
  }

  res.status = mock.fn((code: number) => {
    res.statusCode = code
    return res
  })

  res.sendStatus = mock.fn((code: number) => {
    res.statusCode = code
    return res
  })

  res.json = mock.fn((body: any) => {
    res._body = body
    return res
  })

  res.send = mock.fn((body: any) => {
    res._body = body
    return res
  })

  res.cookie = mock.fn((_name: string, _val: any, _options?: any) => res)
  res.clearCookie = mock.fn((_name: string, _options?: any) => res)
  res.redirect = mock.fn((_urlOrStatus: string | number, _url?: string) => res)

  const setHeader = mock.fn((field: any, val?: any) => {
    if (typeof field === 'object' && field !== null) {
      Object.assign(res._headers, field)
    } else if (typeof field === 'string' && val !== undefined) {
      res._headers[field.toLowerCase()] = val
    }
    return res
  })

  res.header = setHeader
  res.set = setHeader
  res.setHeader = setHeader
  res.getHeader = mock.fn((name: string) => res._headers[name.toLowerCase()])

  const setType = mock.fn((_type: string) => res)
  res.type = setType
  res.contentType = setType

  res.render = mock.fn((_view: string, _options?: any, callback?: any) => {
    if (typeof callback === 'function') {
      callback(null, '')
    }
    return res
  })

  res.sendFile = mock.fn((_path: string, _options?: any, callback?: any) => {
    if (typeof callback === 'function') {
      callback(null)
    }
    return res
  })

  res.end = mock.fn((_data?: any) => res)

  return res as MockResponse
}

export const createMockNext = (): MockNext => {
  return mock.fn() as unknown as MockNext
}

export const resetMockRes = (res: MockResponse): void => {
  res.statusCode = 200
  res.headersSent = false
  res.locals = {}
  res._headers = {}
  res._body = undefined
  res.status.mock.resetCalls()
  res.sendStatus.mock.resetCalls()
  res.json.mock.resetCalls()
  res.send.mock.resetCalls()
  res.cookie.mock.resetCalls()
  res.clearCookie.mock.resetCalls()
  res.redirect.mock.resetCalls()
  res.header.mock.resetCalls()
  res.getHeader.mock.resetCalls()
  res.type.mock.resetCalls()
  res.render.mock.resetCalls()
  res.sendFile.mock.resetCalls()
  res.end.mock.resetCalls()
}
