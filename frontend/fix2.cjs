const fs = require('fs');
let content = fs.readFileSync('src/i18n/translations.ts', 'utf-8');
const extraKeys = `  'alert.dismiss': 'Dismiss',
  'alert.crowd.critical.title': 'Critical Crowd Density',
  'alert.crowd.critical.msg': 'Zone reached capacity.',
  'alert.crowd.east.title': 'Critical Crowd Density',
  'alert.crowd.east.msg': 'Zone at capacity.',
  'alert.transport.delay.title': 'Transit Delay',
  'alert.transport.delay.msg': 'Delay on trains.',
  'alert.weather.rain.title': 'Rain Expected',
  'alert.weather.rain.msg': 'Weather forecast rain.',
  'alert.medical.incident.title': 'Medical Incident',
  'alert.medical.incident.msg': 'Medical assistance needed.',\n`;
content = content.split(extraKeys).join('');
content = content.replace(/  'status\.inProgress':/g, extraKeys + "  'status.inProgress':");
fs.writeFileSync('src/i18n/translations.ts', content);
