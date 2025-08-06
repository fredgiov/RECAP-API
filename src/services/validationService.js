const Joi = require('joi');

const requestSchema = Joi.object({
  message: Joi.string().min(1).required(),
  session_id: Joi.string().required(),
  user_id: Joi.string().required(),
  context: Joi.object({
    class_id: Joi.string().required(),
    class_name: Joi.string().required(),
    user_role: Joi.string().required(),
    conversation_history: Joi.array().items(
      Joi.object({ role: Joi.string(), content: Joi.string() })
    ).optional(),
  }).required(),
});

const bannedWords = ['badword'];

function validateRequest(body) {
  const { error } = requestSchema.validate(body);
  return {
    isValid: !error,
    errors: error ? error.details.map((d) => d.message) : [],
  };
}

function filterContent(message) {
  const lower = message.toLowerCase();
  if (bannedWords.some((w) => lower.includes(w))) return null;
  return message;
}

module.exports = { validateRequest, filterContent };