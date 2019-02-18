const DieScheite = require('../index'),
      { start, stop } = require('nact');

const actSystem = start();
const logPublisher = DieScheite.publishers.console.start(actSystem, { pretty: true });
const ds = DieScheite.generic({
    serviceId: 'example-console',
    serviceVersion: '0.1.0',
    serviceInstanceId: '01'
  }, logPublisher);

let scope = {
  correlationId: "asdf"
};

let res = ds.loggedAction(DieScheite.scope.generic(scope), entry => {
  entry.addHeader("Foo", "bar");
  entry
    .info("Hej");

  entry
    .error("Aj")
    .attach("my_attach", "asdf", "text/plain", "")
    .addHeader("ERR", "Aj");

  return entry
    .trace("A", entry => {
      entry
        .info("A:1")
        .attach("a1_att", "asdf", "text/plain", "");
      return entry.trace("B", entry => {
        entry
          .info("B:1")
          .attach("b1_att", "asdf", "text/plain", "");
        return entry.trace("C", entry => {
          entry
            .info("C:1")
            .attach("c1_att", "asdf", "text/plain", "");
          return 1;
        });
      })
      .then(() => entry.info("A:2"));
    })
    .then(() => entry.info("Done"))
    .then(() => 1);
})
.then(res => {
  console.log("FINAL", res)
  return res.published.then(() => console.log("PUBLISHED"));
})
.then(() => console.log("========== END ============"));
