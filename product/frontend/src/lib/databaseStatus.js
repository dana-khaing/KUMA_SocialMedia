const DATABASE_UNAVAILABLE_MESSAGES = ["can't reach database server"];

export function isDatabaseUnavailableError(error) {
  if (!error) return false;

  if (error.code === "P1001") return true;

  const errorName = error.name || error.constructor?.name;
  if (errorName === "PrismaClientInitializationError") return true;

  const message = String(error.message || "").toLowerCase();
  if (
    DATABASE_UNAVAILABLE_MESSAGES.some((databaseMessage) =>
      message.includes(databaseMessage),
    )
  ) {
    return true;
  }

  if (error.cause && error.cause !== error) {
    return isDatabaseUnavailableError(error.cause);
  }

  return false;
}
