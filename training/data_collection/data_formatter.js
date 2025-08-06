function formatConversation(raw) {
  return {
    role: raw.role,
    content: raw.content.trim(),
  };
}

module.exports = { formatConversation };
