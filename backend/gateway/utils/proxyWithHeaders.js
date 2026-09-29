import proxy from "express-http-proxy";

export const proxyWithUser = (serviceUrl) => {
  return proxy(serviceUrl, {
    proxyReqOptDecorator: (proxyReqOpts, srcReq) => {
      const headers = proxyReqOpts.headers || {};
      if (srcReq.user) {
        headers["x-user-id"] = srcReq.user.userId || srcReq.user._id || srcReq.user.id;
      }
      proxyReqOpts.headers = headers;
      return proxyReqOpts;
    },
    proxyReqPathResolver: (req) => {
      return req.url;
    },
  });
};