const bannedWords = ['badword'];

function validateRequest(body) {
  const errors = [];
  if (!body || typeof body.message !== 'string' || body.message.trim() === '') {
    errors.push('message is required');
  }
  if (!body || typeof body.session_id !== 'string' || body.session_id.trim() === '') {
    errors.push('session_id is required');
  }
  if (!body || typeof body.user_id !== 'string' || body.user_id.trim() === '') {
    errors.push('user_id is required');
  }
  if (!body || typeof body.context !== 'object' || body.context === null) {
    errors.push('context is required');
  } else {
    const c = body.context;
    if (typeof c.class_id !== 'string' || c.class_id.trim() === '') {
      errors.push('context.class_id is required');
    }
    if (typeof c.class_name !== 'string' || c.class_name.trim() === '') {
      errors.push('context.class_name is required');
    }
    if (typeof c.user_role !== 'string' || c.user_role.trim() === '') {
      errors.push('context.user_role is required');
    }
  }
  return { isValid: errors.length === 0, errors };
}

function filterContent(message) {
  const lower = message.toLowerCase();
  if (bannedWords.some(w => lower.includes(w))) return null;
  return message;
}

module.exports = { validateRequest, filterContent };
