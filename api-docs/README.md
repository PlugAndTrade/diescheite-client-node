## Modules

<dl>
<dt><a href="#module_express">express</a></dt>
<dd><p>Implements express specific functions to provide tracing and logging to express middlewares.</p>
</dd>
<dt><a href="#module_generic">generic</a></dt>
<dd><p>Defines a generic configurable logger function.</p>
</dd>
<dt><a href="#module_levels">levels</a></dt>
<dd></dd>
<dt><a href="#module_logged-action">logged-action</a></dt>
<dd><p>Implements the core of die scheite, create, track and publiish log entries.</p>
</dd>
<dt><a href="#module_publishers/console">publishers/console</a> : <code>Object</code></dt>
<dd><p>publishers/console</p>
</dd>
<dt><a href="#module_publishers">publishers</a></dt>
<dd></dd>
<dt><a href="#module_die-scheite">die-scheite</a></dt>
<dd></dd>
</dl>

## Classes

<dl>
<dt><a href="#EntryClient">EntryClient</a></dt>
<dd><p>Functions and actions available to manipulate the main log object.
           This class should not be instantiated manually but through helper methods.</p>
</dd>
<dt><a href="#MessageClient">MessageClient</a></dt>
<dd><p>Proxies all functions of the main log entry.
Add the attach function, used to attach additional data to a log message.</p>
</dd>
<dt><a href="#TracerClient">TracerClient</a></dt>
<dd><p>Runs a trace and proxies all functions of the main log entry to add traceId where applicable.</p>
</dd>
</dl>

## Typedefs

<dl>
<dt><a href="#tracedAction">tracedAction</a> ⇒ <code>*</code></dt>
<dd><p>Traced action</p>
</dd>
</dl>

## External

<dl>
<dt><a href="#external_ExpressApplication">ExpressApplication</a></dt>
<dd><p>Express application</p>
</dd>
<dt><a href="#external_ExpressMiddleware">ExpressMiddleware</a></dt>
<dd><p>Express middleware</p>
</dd>
<dt><a href="#external_ExpressErrorHandler">ExpressErrorHandler</a></dt>
<dd><p>Express error handler</p>
</dd>
</dl>

<a name="module_express"></a>

## express
Implements express specific functions to provide tracing and logging to express middlewares.

**See**

- [EntryClient](#EntryClient)
- [publishers](#module_publishers)


* [express](#module_express)
    * [.errorHandler(err, req, res, next)](#module_express.errorHandler)
    * [.middleware(opts, app)](#module_express.middleware) ⇒ [<code>ExpressMiddleware</code>](#external_ExpressMiddleware)

<a name="module_express.errorHandler"></a>

### express.errorHandler(err, req, res, next)
This error handler will log an error to the log entry if one is initialized for this request.
If a log entry is initialized the next error handler will NOT be called.
If no log entry in initialzied the next error handler will be called and this handler does nothing.

**Kind**: static method of [<code>express</code>](#module_express)  
**See**: [ExpressErrorHandler](#external_ExpressErrorHandler)  

| Param | Type | Description |
| --- | --- | --- |
| err | <code>\*</code> | The error |
| req | <code>IncommingMessage</code> | See https://expressjs.com/en/api.html#req. |
| res | <code>ServerResponse</code> | See https://expressjs.com/en/api.html#res. |
| next | <code>function</code> | The next error handler in the pipeline |

**Example**  
```js
const express = require('express'),
      DieScheite = require('die-scheite');

const app = express();

// do what apps do...

app.use(DieScheite.express.errorHandler);
```
<a name="module_express.middleware"></a>

### express.middleware(opts, app) ⇒ [<code>ExpressMiddleware</code>](#external_ExpressMiddleware)
Creates a middleware initializing and publishing log entries.
The [entry](#EntryClient) is set on the logger key on the request object.

**Kind**: static method of [<code>express</code>](#module_express)  

| Param | Type | Description |
| --- | --- | --- |
| opts | <code>Object</code> | Options and configuration |
| opts.serviceId | <code>String</code> | - |
| opts.serviceInstanceId | <code>String</code> | - |
| opts.serviceVersion | <code>String</code> | - |
| opts.censoredHeaders | <code>Array.&lt;String&gt;</code> | Headers whose values is replaced with '<censored>' in the log entry. |
| opts.ignoredHeaders | <code>Array.&lt;String&gt;</code> | Headers whose values is omitted from the log entry. |
| opts.ignoredRoutes | <code>Array.&lt;(String\|RegExp)&gt;</code> | Strings or RegExp matching urls for which a log entry should not be                                                 initialized. |
| app | [<code>ExpressApplication</code>](#external_ExpressApplication) | The express application |

**Example**  
```js
const express = require('express'),
      DieScheite = require('die-scheite');

const actSystem = DieScheite.start();
const publisher = DieScheite.publishers.console.start(actSystem);

const app = express();

app.use(DieScheite.express.middleware(
  {
    serviceId: 'my-super-service-api',
    serviceVersion: '0.1.2',
    serviceInstanceId: process.env.POD_NAME,
    publisher,
    ignoredRoutes: [ '/healthcheck', /ignored/ ],
    censoredHeaders: [ 'user-agent', 'foo' ]
    ignoredHeaders: [ 'date', 'x-powered-by' ]
  },
  app,
));

app.get('/:id', (req, res, next) => {
  req.logger.info(`Requested id: ${req.params.id}`);
  res.send(JSON.stringify({foo: 'bar'}));
});
```
<a name="module_generic"></a>

## generic
Defines a generic configurable logger function.

**See**

- [EntryClient](#EntryClient)
- [publishers](#module_publishers)

**Example**  
```js
const { start, generic, publishers, scope } = require('die-scheite');
const system = start();
const publisher = publishers.consoele.start(system);
const myScope = scope.generic();
const config = {
  serviceId: 'my-super-service',
  serviceInstanceId: process.env.POD_NAME,
  serviceVersion: '0.1.2'
};

generic(config, publisher)
  .loggedAction(myScope, (entry) => {
    entry.info('Actions started');
    // ... some code
    return 'Hello, german library.';
  })
  .then(({ result }) => console.log(result)); // Prints 'Hello, german library.'
```

* [generic](#module_generic)
    * [module.exports(config, publisher)](#exp_module_generic--module.exports) ⇒ <code>GenericLogger</code> ⏏
        * [~GenericLoggedAction](#module_generic--module.exports..GenericLoggedAction) ⇒ <code>Promise</code>
        * [~GenericLogger](#module_generic--module.exports..GenericLogger) : <code>Object</code>

<a name="exp_module_generic--module.exports"></a>

### module.exports(config, publisher) ⇒ <code>GenericLogger</code> ⏏
Configure generics

**Kind**: Exported function  
**Returns**: <code>GenericLogger</code> - An object with a configured loggedAction function.  
**See**: [publishers](#module_publishers)  

| Param | Type | Description |
| --- | --- | --- |
| config | <code>Object</code> | A configuration object |
| config.serviceId | <code>Object</code> | The serviceId reported with all log entries. Usually the name of the service or                                    project. |
| config.serviceInstanceId | <code>Object</code> | The serviceInstanceId reported with all log entries. Used to identify this                                            instance if multiple instances are running simultaneously. |
| config.serviceVersion | <code>Object</code> | The serviceVersion reported with all log entries. |
| publisher | <code>Actor</code> | A reference to an actor implementing the PUBLISH message type. See [publishers](#module_publishers). |

<a name="module_generic--module.exports..GenericLoggedAction"></a>

#### module.exports~GenericLoggedAction ⇒ <code>Promise</code>
**Kind**: inner typedef of [<code>module.exports</code>](#exp_module_generic--module.exports)  
**Returns**: <code>Promise</code> - A promise resolving with the returned value of action when action is complete.  

| Param | Type | Description |
| --- | --- | --- |
| scope | <code>Obejct</code> | The scope, see [module:scope](module:scope) |
| action | [<code>LoggableAction</code>](#module_logged-action--module.exports..LoggableAction) | The action to invoke. |

<a name="module_generic--module.exports..GenericLogger"></a>

#### module.exports~GenericLogger : <code>Object</code>
**Kind**: inner typedef of [<code>module.exports</code>](#exp_module_generic--module.exports)  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| loggedAction | <code>GenericLoggedAction</code> | A function to log generic function invokation. |

<a name="module_levels"></a>

## levels

* [levels](#module_levels)
    * [.values](#module_levels.values) : <code>object</code>
        * [.NONE](#module_levels.values.NONE) : <code>number</code>
        * [.DEBUG](#module_levels.values.DEBUG) : <code>number</code>
        * [.INFO](#module_levels.values.INFO) : <code>number</code>
        * [.WARNING](#module_levels.values.WARNING) : <code>number</code>
        * [.ERROR](#module_levels.values.ERROR) : <code>number</code>
        * [.CRITICAL](#module_levels.values.CRITICAL) : <code>number</code>

<a name="module_levels.values"></a>

### levels.values : <code>object</code>
Constants describing the log level values.

**Kind**: static namespace of [<code>levels</code>](#module_levels)  

* [.values](#module_levels.values) : <code>object</code>
    * [.NONE](#module_levels.values.NONE) : <code>number</code>
    * [.DEBUG](#module_levels.values.DEBUG) : <code>number</code>
    * [.INFO](#module_levels.values.INFO) : <code>number</code>
    * [.WARNING](#module_levels.values.WARNING) : <code>number</code>
    * [.ERROR](#module_levels.values.ERROR) : <code>number</code>
    * [.CRITICAL](#module_levels.values.CRITICAL) : <code>number</code>

<a name="module_levels.values.NONE"></a>

#### values.NONE : <code>number</code>
**Kind**: static constant of [<code>values</code>](#module_levels.values)  
**Default**: <code>0</code>  
<a name="module_levels.values.DEBUG"></a>

#### values.DEBUG : <code>number</code>
**Kind**: static constant of [<code>values</code>](#module_levels.values)  
**Default**: <code>100</code>  
<a name="module_levels.values.INFO"></a>

#### values.INFO : <code>number</code>
**Kind**: static constant of [<code>values</code>](#module_levels.values)  
**Default**: <code>200</code>  
<a name="module_levels.values.WARNING"></a>

#### values.WARNING : <code>number</code>
**Kind**: static constant of [<code>values</code>](#module_levels.values)  
**Default**: <code>300</code>  
<a name="module_levels.values.ERROR"></a>

#### values.ERROR : <code>number</code>
**Kind**: static constant of [<code>values</code>](#module_levels.values)  
**Default**: <code>400</code>  
<a name="module_levels.values.CRITICAL"></a>

#### values.CRITICAL : <code>number</code>
**Kind**: static constant of [<code>values</code>](#module_levels.values)  
**Default**: <code>500</code>  
<a name="module_logged-action"></a>

## logged-action
Implements the core of die scheite, create, track and publiish log entries.

**See**

- [EntryClient](#EntryClient)
- [publishers](#module_publishers)
- [generic](#module_generic)
- [express](#module_express)


* [logged-action](#module_logged-action)
    * [module.exports(serviceInfo, scope, publisher, action)](#exp_module_logged-action--module.exports) ⇒ <code>Promise</code> ⏏
        * [~LoggableAction](#module_logged-action--module.exports..LoggableAction) ⇒ <code>\*</code>

<a name="exp_module_logged-action--module.exports"></a>

### module.exports(serviceInfo, scope, publisher, action) ⇒ <code>Promise</code> ⏏
Create, track and publish a log entry for the duration of the supplied action.

**Kind**: Exported function  
**Returns**: <code>Promise</code> - A promise resolved with the return value of the action when the action is completed.  

| Param | Type | Description |
| --- | --- | --- |
| serviceInfo | <code>Object</code> | An object with service info |
| scope | <code>Object</code> | Scope specifi data |
| publisher | <code>Actor</code> | A reference to a publisher actor. |
| action | <code>LoggableAction</code> | The action to invoke in the logged scope |

<a name="module_logged-action--module.exports..LoggableAction"></a>

#### module.exports~LoggableAction ⇒ <code>\*</code>
Loggable action

**Kind**: inner typedef of [<code>module.exports</code>](#exp_module_logged-action--module.exports)  
**Returns**: <code>\*</code> - Anything  

| Param | Type | Description |
| --- | --- | --- |
| entry | [<code>EntryClient</code>](#EntryClient) | An instance of an [EntryClient](#EntryClient) used to manipulate the log entry. |

<a name="module_publishers/console"></a>

## publishers/console : <code>Object</code>
publishers/console


* [publishers/console](#module_publishers/console) : <code>Object</code>
    * [.start(actorParent, [opts])](#module_publishers/console.start) ⇒ <code>Actor</code>
    * [.stop()](#module_publishers/console.stop)

<a name="module_publishers/console.start"></a>

### publishers/console.start(actorParent, [opts]) ⇒ <code>Actor</code>
Starts a new console publisher.

**Kind**: static method of [<code>publishers/console</code>](#module_publishers/console)  
**Returns**: <code>Actor</code> - A reference to the publisher actor.  

| Param | Type | Description |
| --- | --- | --- |
| actorParent | <code>Actor</code> | An actor used as parent for the publisher actor. This is usually the nact system returned from `nact.start()` |
| [opts] | <code>Object</code> | Optional options object |
| opts.pretty | <code>bool</code> | If true entries will be pretty printed. Else entries are printed as minimal json. |

<a name="module_publishers/console.stop"></a>

### publishers/console.stop()
Stops a running console publisher.

**Kind**: static method of [<code>publishers/console</code>](#module_publishers/console)  

| Type | Description |
| --- | --- |
| <code>Actor</code> | A reference to an actor as returned by [publishers~console.start](publishers~console.start) |

<a name="module_publishers"></a>

## publishers
<a name="module_publishers.console"></a>

### publishers.console : [<code>publishers/console</code>](#module_publishers/console)
Exposes the console publisher module.

**Kind**: static property of [<code>publishers</code>](#module_publishers)  
<a name="module_die-scheite"></a>

## die-scheite

* [die-scheite](#module_die-scheite)
    * [.express](#module_die-scheite.express) : [<code>express</code>](#module_express)
    * [.generic](#module_die-scheite.generic) : [<code>module.exports</code>](#exp_module_generic--module.exports)
    * [.publishers](#module_die-scheite.publishers) : [<code>publishers</code>](#module_publishers)
    * [.scope](#module_die-scheite.scope) : <code>module:scope</code>

<a name="module_die-scheite.express"></a>

### die-scheite.express : [<code>express</code>](#module_express)
Exposes express specific setup and utilities

**Kind**: static property of [<code>die-scheite</code>](#module_die-scheite)  
<a name="module_die-scheite.generic"></a>

### die-scheite.generic : [<code>module.exports</code>](#exp_module_generic--module.exports)
Exposes generic setup and logging functions.

**Kind**: static property of [<code>die-scheite</code>](#module_die-scheite)  
<a name="module_die-scheite.publishers"></a>

### die-scheite.publishers : [<code>publishers</code>](#module_publishers)
Exposes publisher related functions

**Kind**: static property of [<code>die-scheite</code>](#module_die-scheite)  
<a name="module_die-scheite.scope"></a>

### die-scheite.scope : <code>module:scope</code>
Exposes scope related functions

**Kind**: static property of [<code>die-scheite</code>](#module_die-scheite)  
<a name="EntryClient"></a>

## EntryClient
Functions and actions available to manipulate the main log object.
           This class should not be instantiated manually but through helper methods.

**Kind**: global class  

* [EntryClient](#EntryClient)
    * [.addHeader(key, value)](#EntryClient+addHeader) ⇒ [<code>EntryClient</code>](#EntryClient)
    * [.log(level, message, stacktrace, traceId)](#EntryClient+log) ⇒ [<code>MessageClient</code>](#MessageClient)
    * [.debug(message)](#EntryClient+debug) ⇒ [<code>MessageClient</code>](#MessageClient)
    * [.info(message)](#EntryClient+info) ⇒ [<code>MessageClient</code>](#MessageClient)
    * [.warning(message)](#EntryClient+warning) ⇒ [<code>MessageClient</code>](#MessageClient)
    * [.error(message, stacktrace)](#EntryClient+error) ⇒ [<code>MessageClient</code>](#MessageClient)
    * [.critical(message, stacktrace)](#EntryClient+critical) ⇒ [<code>MessageClient</code>](#MessageClient)
    * [.trace(name, action)](#EntryClient+trace) ⇒ <code>Promise</code>
    * [.extend(name, data)](#EntryClient+extend) ⇒ [<code>EntryClient</code>](#EntryClient)
    * [.init()](#EntryClient+init) ⇒ [<code>EntryClient</code>](#EntryClient)
    * [.finalize()](#EntryClient+finalize) ⇒ [<code>EntryClient</code>](#EntryClient)

<a name="EntryClient+addHeader"></a>

### entryClient.addHeader(key, value) ⇒ [<code>EntryClient</code>](#EntryClient)
Add a header to the log entry.
Multiple values may be added to the same key by calling this function multiple times
with the same key.

**Kind**: instance method of [<code>EntryClient</code>](#EntryClient)  
**Returns**: [<code>EntryClient</code>](#EntryClient) - This instance  

| Param | Type | Description |
| --- | --- | --- |
| key | <code>String</code> | The header key |
| value | <code>String</code> \| <code>Number</code> \| <code>bool</code> | The header value |

<a name="EntryClient+log"></a>

### entryClient.log(level, message, stacktrace, traceId) ⇒ [<code>MessageClient</code>](#MessageClient)
Add a log message to the log entry.

**Kind**: instance method of [<code>EntryClient</code>](#EntryClient)  
**Returns**: [<code>MessageClient</code>](#MessageClient) - A reference to the log message.  

| Param | Type | Description |
| --- | --- | --- |
| level | <code>Number</code> | The log level of this message, see [levels](levels.values) |
| message | <code>String</code> | Log message text. |
| stacktrace | <code>String</code> | Stacktrace associated with the message if available. |
| traceId | <code>String</code> | The id of the enclosing trace if available, see [Tracer](#TracerClient). |

<a name="EntryClient+debug"></a>

### entryClient.debug(message) ⇒ [<code>MessageClient</code>](#MessageClient)
Add a debug log message to the log entry.

**Kind**: instance method of [<code>EntryClient</code>](#EntryClient)  
**Returns**: [<code>MessageClient</code>](#MessageClient) - A reference to the log message.  

| Param | Type | Description |
| --- | --- | --- |
| message | <code>String</code> | Log message text. |

<a name="EntryClient+info"></a>

### entryClient.info(message) ⇒ [<code>MessageClient</code>](#MessageClient)
Add an info log message to the log entry.

**Kind**: instance method of [<code>EntryClient</code>](#EntryClient)  
**Returns**: [<code>MessageClient</code>](#MessageClient) - A reference to the log message.  

| Param | Type | Description |
| --- | --- | --- |
| message | <code>String</code> | Log message text. |

<a name="EntryClient+warning"></a>

### entryClient.warning(message) ⇒ [<code>MessageClient</code>](#MessageClient)
Add a warning log message to the log entry.

**Kind**: instance method of [<code>EntryClient</code>](#EntryClient)  
**Returns**: [<code>MessageClient</code>](#MessageClient) - A reference to the log message.  

| Param | Type | Description |
| --- | --- | --- |
| message | <code>String</code> | Log message text. |

<a name="EntryClient+error"></a>

### entryClient.error(message, stacktrace) ⇒ [<code>MessageClient</code>](#MessageClient)
Add an error log message to the log entry.

**Kind**: instance method of [<code>EntryClient</code>](#EntryClient)  
**Returns**: [<code>MessageClient</code>](#MessageClient) - A reference to the log message.  

| Param | Type | Description |
| --- | --- | --- |
| message | <code>String</code> | Log message text. |
| stacktrace | <code>String</code> | Stacktrace associated with the error. |

<a name="EntryClient+critical"></a>

### entryClient.critical(message, stacktrace) ⇒ [<code>MessageClient</code>](#MessageClient)
Add a critical log message to the log entry.

**Kind**: instance method of [<code>EntryClient</code>](#EntryClient)  
**Returns**: [<code>MessageClient</code>](#MessageClient) - A reference to the log message.  

| Param | Type | Description |
| --- | --- | --- |
| message | <code>String</code> | Log message text. |
| stacktrace | <code>String</code> | Stacktrace associated with the error. |

<a name="EntryClient+trace"></a>

### entryClient.trace(name, action) ⇒ <code>Promise</code>
Starts a trace wrapping the supplied action.

**Kind**: instance method of [<code>EntryClient</code>](#EntryClient)  
**Returns**: <code>Promise</code> - A promise resolved with the return value of the action when the action is complete.  

| Param | Type | Description |
| --- | --- | --- |
| name | <code>String</code> | The name of the trace. Do not use unique name, eg by including dynamic values. |
| action | [<code>tracedAction</code>](#tracedAction) | The action to be traced, it is invoked with the [TracerClient](#TracerClient) representing                                this trace. |

<a name="EntryClient+extend"></a>

### entryClient.extend(name, data) ⇒ [<code>EntryClient</code>](#EntryClient)
Extend the log entry with custom data. Useful when adding eg http related data as response status and request uri.

**Kind**: instance method of [<code>EntryClient</code>](#EntryClient)  
**Returns**: [<code>EntryClient</code>](#EntryClient) - This instance  

| Param | Type | Description |
| --- | --- | --- |
| name | <code>String</code> | Name of the property to associate the data with. |
| data | <code>\*</code> | Any json serializable data. |

<a name="EntryClient+init"></a>

### entryClient.init() ⇒ [<code>EntryClient</code>](#EntryClient)
Initialize the log entry, starts a timer among other initializations.

**Kind**: instance method of [<code>EntryClient</code>](#EntryClient)  
**Returns**: [<code>EntryClient</code>](#EntryClient) - This instance  
<a name="EntryClient+finalize"></a>

### entryClient.finalize() ⇒ [<code>EntryClient</code>](#EntryClient)
Finalize the log entry, stops the timer. This will send a publish message to the parent of the log entry. The
parent is usually a log entry publisher.

**Kind**: instance method of [<code>EntryClient</code>](#EntryClient)  
**Returns**: [<code>EntryClient</code>](#EntryClient) - This instance  
**See**: [ConsolePublisher.start](ConsolePublisher.start)  
<a name="MessageClient"></a>

## MessageClient
Proxies all functions of the main log entry.
Add the attach function, used to attach additional data to a log message.

**Kind**: global class  
**Todo**

- [ ] Proxy remaining EntryClient methods.


* [MessageClient](#MessageClient)
    * [.addHeader()](#MessageClient+addHeader)
    * [.log()](#MessageClient+log)
    * [.debug()](#MessageClient+debug)
    * [.info()](#MessageClient+info)
    * [.warning()](#MessageClient+warning)
    * [.error()](#MessageClient+error)
    * [.critical()](#MessageClient+critical)
    * [.attach(name, body, contentType, contentEncoding)](#MessageClient+attach) ⇒ [<code>MessageClient</code>](#MessageClient)

<a name="MessageClient+addHeader"></a>

### messageClient.addHeader()
**Kind**: instance method of [<code>MessageClient</code>](#MessageClient)  
**See**: [addHeader](#EntryClient+addHeader)  
<a name="MessageClient+log"></a>

### messageClient.log()
**Kind**: instance method of [<code>MessageClient</code>](#MessageClient)  
**See**: [log](#EntryClient+log)  
<a name="MessageClient+debug"></a>

### messageClient.debug()
**Kind**: instance method of [<code>MessageClient</code>](#MessageClient)  
**See**: [debug](#EntryClient+debug)  
<a name="MessageClient+info"></a>

### messageClient.info()
**Kind**: instance method of [<code>MessageClient</code>](#MessageClient)  
**See**: [info](#EntryClient+info)  
<a name="MessageClient+warning"></a>

### messageClient.warning()
**Kind**: instance method of [<code>MessageClient</code>](#MessageClient)  
**See**: [warning](#EntryClient+warning)  
<a name="MessageClient+error"></a>

### messageClient.error()
**Kind**: instance method of [<code>MessageClient</code>](#MessageClient)  
**See**: [error](#EntryClient+error)  
<a name="MessageClient+critical"></a>

### messageClient.critical()
**Kind**: instance method of [<code>MessageClient</code>](#MessageClient)  
**See**: [critical](#EntryClient+critical)  
<a name="MessageClient+attach"></a>

### messageClient.attach(name, body, contentType, contentEncoding) ⇒ [<code>MessageClient</code>](#MessageClient)
Attaches additional data to a log message.

**Kind**: instance method of [<code>MessageClient</code>](#MessageClient)  
**Returns**: [<code>MessageClient</code>](#MessageClient) - Itself  
**Todo**

- [ ] Add support for buffer body
- [ ] Add helper methods to serialize as json and encode with gzip.


| Param | Type | Description |
| --- | --- | --- |
| name | <code>String</code> | The name of the attachment |
| body | <code>String</code> | The attachment body |
| contentType | <code>String</code> | Content type of data, eg "application/json". |
| contentEncoding | <code>String</code> | Content encoding of data, eg "gzip". |

<a name="TracerClient"></a>

## TracerClient
Runs a trace and proxies all functions of the main log entry to add traceId where applicable.

**Kind**: global class  
**Todo**

- [ ] Proxy remaining EntryClient methods.


* [TracerClient](#TracerClient)
    * [.addHeader()](#TracerClient+addHeader)
    * [.log()](#TracerClient+log)
    * [.debug()](#TracerClient+debug)
    * [.info()](#TracerClient+info)
    * [.warning()](#TracerClient+warning)
    * [.error()](#TracerClient+error)
    * [.critical()](#TracerClient+critical)
    * [.trace(name, action)](#TracerClient+trace) ⇒ <code>Promise</code>

<a name="TracerClient+addHeader"></a>

### tracerClient.addHeader()
**Kind**: instance method of [<code>TracerClient</code>](#TracerClient)  
**See**: [addHeader](#EntryClient+addHeader)  
<a name="TracerClient+log"></a>

### tracerClient.log()
Add traceId to the log message and passes the call to [log](#EntryClient+log)

**Kind**: instance method of [<code>TracerClient</code>](#TracerClient)  
**See**: [log](#EntryClient+log)  
<a name="TracerClient+debug"></a>

### tracerClient.debug()
Add traceId to the log message and passes the call to [debug](#EntryClient+debug)

**Kind**: instance method of [<code>TracerClient</code>](#TracerClient)  
**See**: [debug](#EntryClient+debug)  
<a name="TracerClient+info"></a>

### tracerClient.info()
Add traceId to the log message and passes the call to [info](#EntryClient+info)

**Kind**: instance method of [<code>TracerClient</code>](#TracerClient)  
**See**: [info](#EntryClient+info)  
<a name="TracerClient+warning"></a>

### tracerClient.warning()
Add traceId to the log message and passes the call to [warning](#EntryClient+warning)

**Kind**: instance method of [<code>TracerClient</code>](#TracerClient)  
**See**: [warning](#EntryClient+warning)  
<a name="TracerClient+error"></a>

### tracerClient.error()
Add traceId to the log message and passes the call to [error](#EntryClient+error)

**Kind**: instance method of [<code>TracerClient</code>](#TracerClient)  
**See**: [error](#EntryClient+error)  
<a name="TracerClient+critical"></a>

### tracerClient.critical()
Add traceId to the log message and passes the call to [critical](#EntryClient+critical)

**Kind**: instance method of [<code>TracerClient</code>](#TracerClient)  
**See**: [critical](#EntryClient+critical)  
<a name="TracerClient+trace"></a>

### tracerClient.trace(name, action) ⇒ <code>Promise</code>
Starts a sub trace of the trace repesented by this instance, wrapping the supplied action.

**Kind**: instance method of [<code>TracerClient</code>](#TracerClient)  
**Returns**: <code>Promise</code> - A promise resolved with the return value of the action when the action is complete.  

| Param | Type | Description |
| --- | --- | --- |
| name | <code>String</code> | The name of the trace. Do not use unique name, eg by including dynamic values. |
| action | [<code>tracedAction</code>](#tracedAction) | The action to be traced, it is invoked with the [TracerClient](#TracerClient) representing                                this trace. |

<a name="tracedAction"></a>

## tracedAction ⇒ <code>\*</code>
Traced action

**Kind**: global typedef  
**Returns**: <code>\*</code> - Anything  
**See**

- [trace](#EntryClient+trace)
- [trace](#TracerClient+trace)


| Param | Type |
| --- | --- |
| tracer | [<code>TracerClient</code>](#TracerClient) | 

<a name="external_ExpressApplication"></a>

## ExpressApplication
Express application

**Kind**: global external  
**See**: [Express](https://expressjs.com/en/api.html#express)  
<a name="external_ExpressMiddleware"></a>

## ExpressMiddleware
Express middleware

**Kind**: global external  
**See**: [Express](https://expressjs.com/en/api.html#express)  
<a name="external_ExpressErrorHandler"></a>

## ExpressErrorHandler
Express error handler

**Kind**: global external  
**See**: [Express](https://expressjs.com/en/api.html#express)  
