const response = require("../common/response");

const validate = (schema, property = "body") => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req[property], {
      abortEarly: false
    });

    if (error) {
      const messages = error.details.map(d =>
        d.message.replace(/"/g, "")
      );
      return response.error(res, 400, messages);
    }

    req[property] = value;
    next();
  };
};

module.exports = validate;
