/**
 * TOFLIT18 Epress Responses
 * ==========================
 *
 * Enhancing the Express Response objects with some handy responses.
 */
export default function(express) {

  /**
   * Ok.
   */
  express.response.ok = function(result) {
    const data = {
      status: 'ok',
      result
    };

    if (this.shouldBeCached)
      this.sentData = result;

    return this.json(data);
  };

  /**
   * Server Error.
   */
  express.response.serverError = function(err) {

    // TEMP: dev logging
    console.log(err);

    this.status(500).json({
      status: 'error',
      error: {
        code: 500,
        title: 'Internal Server Error'
      }
    });
  };

  /**
   * Not Found.
   */
  express.response.notFound = function(reason = null) {
    const response = {
      status: 'error',
      error: {
        code: 404,
        title: 'Not Found'
      }
    };

    if (reason)
      response.error.reason = reason;

    this.status(404).json(response);
  };

  /**
   * Bad Request.
   */
  express.response.badRequest = function(expecting) {
    const response = {
      status: 'error',
      error: {
        code: 400,
        title: 'Bad Request',
      }
    };

    if (expecting)
      response.error.expecting = expecting;

    return this.status(400).json(response);
  };

  /**
   * Unauthorized.
   */
  express.response.unauthorized = function() {
    this.status(401).json({
      status: 'error',
      error: {
        code: 401,
        title: 'Unauthorized'
      }
    });
  };
}
