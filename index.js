// {
//   id: '',
//   parentId: '',
//   correlationId: '',
//   serviceId: '',
//   serviceInstanceId: '',
//   serviceVersion: '',
//   protocol: '',
//   route: '',
//   timestamp: 0,
//   duration: 0,
//   level: 0,
//   levelCategory: '',
//   headers: [ { key: value } ],
//   trace: [ trace ],
//   messages: [ { level, message, stacktrace, traceId, attachments: [] } ],
//   http: { },
//   rabbitmq: { }
// }

module.exports = {
  oo: require('./ds-oo'),
  act: require('./ds-act'),
};
