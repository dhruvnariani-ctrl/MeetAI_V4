function normalize(value) {
  return String(value ?? '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ')
}

function getUserNames(user) {
  return [
    user?.name,
    user?.displayName,
    user?.fullName,
  ]
    .filter(Boolean)
    .map(normalize)
}

function getUserEmails(user) {
  return [
    user?.email,
    user?.mail,
    user?.userEmail,
  ]
    .filter(Boolean)
    .map(normalize)
}

function nameMatches(
  ownerName,
  userNames,
) {
  const normalizedOwner =
    normalize(ownerName)

  if (!normalizedOwner) {
    return false
  }

  return userNames.some(
    (userName) =>
      normalizedOwner === userName ||
      normalizedOwner.startsWith(
        `${userName} `,
      ) ||
      userName.startsWith(
        `${normalizedOwner} `,
      ),
  )
}

function emailMatches(
  ownerEmail,
  userEmails,
) {
  const normalizedEmail =
    normalize(ownerEmail)

  return (
    Boolean(normalizedEmail) &&
    userEmails.includes(
      normalizedEmail,
    )
  )
}

/**
 * A task belongs to the current user only
 * when the task owner/assignee is the user.
 */
export function isUserTask(
  task,
  currentUser,
) {
  if (!task || !currentUser) {
    return false
  }

  const userNames =
    getUserNames(currentUser)

  const userEmails =
    getUserEmails(currentUser)

  const ownerCandidates = [
    task.owner,
    task.ownerName,
    task.assignee,
    task.assigneeName,
    task.assignedTo,
    task.assignedToName,
  ]

  for (const owner of ownerCandidates) {
    if (
      typeof owner === 'object' &&
      owner !== null
    ) {
      if (
        emailMatches(
          owner.email,
          userEmails,
        ) ||
        nameMatches(
          owner.name,
          userNames,
        )
      ) {
        return true
      }
    } else if (
      emailMatches(
        owner,
        userEmails,
      ) ||
      nameMatches(
        owner,
        userNames,
      )
    ) {
      return true
    }
  }

  const ownerEmailCandidates = [
    task.ownerEmail,
    task.assigneeEmail,
    task.assignedToEmail,
  ]

  return ownerEmailCandidates.some(
    (email) =>
      emailMatches(
        email,
        userEmails,
      ),
  )
}

/**
 * Filters tasks so only tasks owned by
 * the current user remain.
 */
export function filterUserTasks(
  tasks = [],
  currentUser,
) {
  return tasks.filter(
    (task) =>
      isUserTask(
        task,
        currentUser,
      ),
  )
}