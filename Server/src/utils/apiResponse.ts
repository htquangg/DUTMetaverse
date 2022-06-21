import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

export default class ApiResponse {
  static successResponse(res: Response, msg: string) {
    const data = {
      status: 'ok',
      message: msg,
    };
    console.log(data);
    return res.status(200).json(data);
  }

  static successResponseWithData(
    req: Request,
    res: Response,
    data: any,
    msg: string = 'Success!!!',
    hash?: string,
  ) {
    const resData = {
      status: StatusCodes.OK,
      message: msg,
      data: data,
      hash: hash,
    };
    const log = {
      path: req.path,
      params: req.params,
      authorization: req.headers.authorization,
      query: req.query,
      body: req.body,
      // res: JSON.stringify(data),
    };
    console.log(log);
    return res.status(StatusCodes.OK).json(resData);
  }

  static errorResponse(res: Response, msg: String) {
    const data = {
      status: StatusCodes.INTERNAL_SERVER_ERROR,
      message: msg,
    };
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(data);
  }

  static errorResponseWithData(
    req: Request,
    res: Response,
    data: any,
    msg: string = 'Failed!!!',
  ) {
    const resData = {
      status: StatusCodes.INTERNAL_SERVER_ERROR,
      message: msg,
      res: JSON.stringify(data),
    };
    const log = {
      path: req.path,
      params: req.params,
      query: req.query,
      body: req.body,
      res: data,
    };
    console.log(log);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(resData);
  }

  static notFoundResponse(res: Response, msg: string = 'Not found!!!') {
    const data = {
      status: StatusCodes.NOT_FOUND,
      message: msg,
    };
    console.error(data);
    return res.status(StatusCodes.NOT_FOUND).json(data);
  }

  static validationErrorWithData(
    res: Response,
    data: any,
    msg: string = 'Failed validate data!!!',
  ) {
    const resData = {
      status: StatusCodes.BAD_REQUEST,
      message: msg,
      data: data,
    };
    console.error(data);
    return res.status(StatusCodes.BAD_REQUEST).json(resData);
  }

  static unauthorizedResponse(res: Response, msg: String) {
    const data = {
      status: StatusCodes.UNAUTHORIZED,
      message: msg,
    };
    console.error(data);
    return res.status(StatusCodes.UNAUTHORIZED).json(data);
  }

  static outOfDateResponse(res: Response, msg: String) {
    const data = {
      status: StatusCodes.UNAUTHORIZED,
      message: msg,
    };
    console.error(data);
    return res.status(StatusCodes.UNAUTHORIZED).json(data);
  }
}
