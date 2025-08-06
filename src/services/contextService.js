async function buildEducationalContext(message, context) {
  return {
    class_id: context.class_id,
    class_name: context.class_name,
    user_role: context.user_role,
    conversation_history: context.conversation_history || [],
  };
}

module.exports = { buildEducationalContext };