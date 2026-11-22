export const newPresenceSchema = {
  type: "object",
  required: ["enter", "exit"],
  properties: {
    enter: { type: "string" },
    exit: { type: "string" },
    partecipants: { type: "number", default: 1 },
  },
};
