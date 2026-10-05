export function alertsToNotify(alerts, { notifiedIds, enabled, visible }) {
  if (!enabled || !visible) {
    return [];
  }
  return (alerts || []).filter((alert) => !notifiedIds.has(alert.id));
}

export function showAlertNotifications(alerts, { notify, notifiedIds }) {
  const next = new Set(notifiedIds);
  alertsToNotify(alerts, { notifiedIds: next, enabled: true, visible: true }).forEach((alert) => {
    notify(alert.message);
    next.add(alert.id);
  });
  return next;
}
