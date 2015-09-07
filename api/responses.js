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

    return this.json(data);
  };

  /**
   * Not Found.
   */
  express.response.notFound = function(reason=null) {
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
}
