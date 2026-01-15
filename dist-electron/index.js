var __defProp = Object.defineProperty;
var __typeError = (msg) => {
  throw TypeError(msg);
};
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
var __accessCheck = (obj, member, msg) => member.has(obj) || __typeError("Cannot " + msg);
var __privateGet = (obj, member, getter) => (__accessCheck(obj, member, "read from private field"), getter ? getter.call(obj) : member.get(obj));
var __privateAdd = (obj, member, value) => member.has(obj) ? __typeError("Cannot add the same private member more than once") : member instanceof WeakSet ? member.add(obj) : member.set(obj, value);
var __privateSet = (obj, member, value, setter) => (__accessCheck(obj, member, "write to private field"), setter ? setter.call(obj, value) : member.set(obj, value), value);
var _a, _unlockParent, _b, _config, _options, _c;
import { app, ipcMain, BrowserWindow } from "electron";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createClient } from "@libsql/client";
import { PrismaClient } from "@prisma/client";
var __defProp2 = Object.defineProperty;
var __export = (target, all) => {
  for (var name2 in all)
    __defProp2(target, name2, { get: all[name2], enumerable: true });
};
var colors_exports = {};
__export(colors_exports, {
  $: () => $,
  bgBlack: () => bgBlack,
  bgBlue: () => bgBlue,
  bgCyan: () => bgCyan,
  bgGreen: () => bgGreen,
  bgMagenta: () => bgMagenta,
  bgRed: () => bgRed,
  bgWhite: () => bgWhite,
  bgYellow: () => bgYellow,
  black: () => black,
  blue: () => blue,
  bold: () => bold,
  cyan: () => cyan,
  dim: () => dim,
  gray: () => gray,
  green: () => green,
  grey: () => grey,
  hidden: () => hidden,
  inverse: () => inverse,
  italic: () => italic,
  magenta: () => magenta,
  red: () => red,
  reset: () => reset,
  strikethrough: () => strikethrough,
  underline: () => underline,
  white: () => white,
  yellow: () => yellow
});
var FORCE_COLOR;
var NODE_DISABLE_COLORS;
var NO_COLOR;
var TERM;
var isTTY = true;
if (typeof process !== "undefined") {
  ({ FORCE_COLOR, NODE_DISABLE_COLORS, NO_COLOR, TERM } = process.env || {});
  isTTY = process.stdout && process.stdout.isTTY;
}
var $ = {
  enabled: !NODE_DISABLE_COLORS && NO_COLOR == null && TERM !== "dumb" && (FORCE_COLOR != null && FORCE_COLOR !== "0" || isTTY)
};
function init(x, y) {
  let rgx = new RegExp(`\\x1b\\[${y}m`, "g");
  let open = `\x1B[${x}m`, close = `\x1B[${y}m`;
  return function(txt) {
    if (!$.enabled || txt == null) return txt;
    return open + (!!~("" + txt).indexOf(close) ? txt.replace(rgx, close + open) : txt) + close;
  };
}
var reset = init(0, 0);
var bold = init(1, 22);
var dim = init(2, 22);
var italic = init(3, 23);
var underline = init(4, 24);
var inverse = init(7, 27);
var hidden = init(8, 28);
var strikethrough = init(9, 29);
var black = init(30, 39);
var red = init(31, 39);
var green = init(32, 39);
var yellow = init(33, 39);
var blue = init(34, 39);
var magenta = init(35, 39);
var cyan = init(36, 39);
var white = init(37, 39);
var gray = init(90, 39);
var grey = init(90, 39);
var bgBlack = init(40, 49);
var bgRed = init(41, 49);
var bgGreen = init(42, 49);
var bgYellow = init(43, 49);
var bgBlue = init(44, 49);
var bgMagenta = init(45, 49);
var bgCyan = init(46, 49);
var bgWhite = init(47, 49);
var MAX_ARGS_HISTORY = 100;
var COLORS = ["green", "yellow", "blue", "magenta", "cyan", "red"];
var argsHistory = [];
var lastTimestamp = Date.now();
var lastColor = 0;
var processEnv = typeof process !== "undefined" ? process.env : {};
globalThis.DEBUG ?? (globalThis.DEBUG = processEnv.DEBUG ?? "");
globalThis.DEBUG_COLORS ?? (globalThis.DEBUG_COLORS = processEnv.DEBUG_COLORS ? processEnv.DEBUG_COLORS === "true" : true);
var topProps = {
  enable(namespace) {
    if (typeof namespace === "string") {
      globalThis.DEBUG = namespace;
    }
  },
  disable() {
    const prev = globalThis.DEBUG;
    globalThis.DEBUG = "";
    return prev;
  },
  // this is the core logic to check if logging should happen or not
  enabled(namespace) {
    const listenedNamespaces = globalThis.DEBUG.split(",").map((s) => {
      return s.replace(/[.+?^${}()|[\]\\]/g, "\\$&");
    });
    const isListened = listenedNamespaces.some((listenedNamespace) => {
      if (listenedNamespace === "" || listenedNamespace[0] === "-") return false;
      return namespace.match(RegExp(listenedNamespace.split("*").join(".*") + "$"));
    });
    const isExcluded = listenedNamespaces.some((listenedNamespace) => {
      if (listenedNamespace === "" || listenedNamespace[0] !== "-") return false;
      return namespace.match(RegExp(listenedNamespace.slice(1).split("*").join(".*") + "$"));
    });
    return isListened && !isExcluded;
  },
  log: (...args) => {
    const [namespace, format, ...rest] = args;
    const logWithFormatting = console.warn ?? console.log;
    logWithFormatting(`${namespace} ${format}`, ...rest);
  },
  formatters: {}
  // not implemented
};
function debugCreate(namespace) {
  const instanceProps = {
    color: COLORS[lastColor++ % COLORS.length],
    enabled: topProps.enabled(namespace),
    namespace,
    log: topProps.log,
    extend: () => {
    }
    // not implemented
  };
  const debugCall = (...args) => {
    const { enabled, namespace: namespace2, color, log } = instanceProps;
    if (args.length !== 0) {
      argsHistory.push([namespace2, ...args]);
    }
    if (argsHistory.length > MAX_ARGS_HISTORY) {
      argsHistory.shift();
    }
    if (topProps.enabled(namespace2) || enabled) {
      const stringArgs = args.map((arg) => {
        if (typeof arg === "string") {
          return arg;
        }
        return safeStringify(arg);
      });
      const ms = `+${Date.now() - lastTimestamp}ms`;
      lastTimestamp = Date.now();
      if (globalThis.DEBUG_COLORS) {
        log(colors_exports[color](bold(namespace2)), ...stringArgs, colors_exports[color](ms));
      } else {
        log(namespace2, ...stringArgs, ms);
      }
    }
  };
  return new Proxy(debugCall, {
    get: (_, prop) => instanceProps[prop],
    set: (_, prop, value) => instanceProps[prop] = value
  });
}
var Debug = new Proxy(debugCreate, {
  get: (_, prop) => topProps[prop],
  set: (_, prop, value) => topProps[prop] = value
});
function safeStringify(value, indent = 2) {
  const cache = /* @__PURE__ */ new Set();
  return JSON.stringify(
    value,
    (key, value2) => {
      if (typeof value2 === "object" && value2 !== null) {
        if (cache.has(value2)) {
          return `[Circular *]`;
        }
        cache.add(value2);
      } else if (typeof value2 === "bigint") {
        return value2.toString();
      }
      return value2;
    },
    indent
  );
}
var DriverAdapterError = class extends Error {
  constructor(payload) {
    super(typeof payload["message"] === "string" ? payload["message"] : payload.kind);
    __publicField(this, "name", "DriverAdapterError");
    __publicField(this, "cause");
    this.cause = payload;
  }
};
Debug("driver-adapter-utils");
var ColumnTypeEnum = {
  // Scalars
  Int32: 0,
  Int64: 1,
  Float: 2,
  Double: 3,
  Numeric: 4,
  Boolean: 5,
  Text: 7,
  Date: 8,
  Time: 9,
  DateTime: 10,
  Json: 11,
  Bytes: 13,
  // Custom
  UnknownNumber: 128
};
const E_CANCELED = new Error("request for lock canceled");
var __awaiter$2 = function(thisArg, _arguments, P, generator) {
  function adopt(value) {
    return value instanceof P ? value : new P(function(resolve) {
      resolve(value);
    });
  }
  return new (P || (P = Promise))(function(resolve, reject) {
    function fulfilled(value) {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    }
    function rejected(value) {
      try {
        step(generator["throw"](value));
      } catch (e) {
        reject(e);
      }
    }
    function step(result) {
      result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
    }
    step((generator = generator.apply(thisArg, _arguments || [])).next());
  });
};
class Semaphore {
  constructor(_value, _cancelError = E_CANCELED) {
    this._value = _value;
    this._cancelError = _cancelError;
    this._queue = [];
    this._weightedWaiters = [];
  }
  acquire(weight = 1, priority = 0) {
    if (weight <= 0)
      throw new Error(`invalid weight ${weight}: must be positive`);
    return new Promise((resolve, reject) => {
      const task = { resolve, reject, weight, priority };
      const i = findIndexFromEnd(this._queue, (other) => priority <= other.priority);
      if (i === -1 && weight <= this._value) {
        this._dispatchItem(task);
      } else {
        this._queue.splice(i + 1, 0, task);
      }
    });
  }
  runExclusive(callback_1) {
    return __awaiter$2(this, arguments, void 0, function* (callback, weight = 1, priority = 0) {
      const [value, release] = yield this.acquire(weight, priority);
      try {
        return yield callback(value);
      } finally {
        release();
      }
    });
  }
  waitForUnlock(weight = 1, priority = 0) {
    if (weight <= 0)
      throw new Error(`invalid weight ${weight}: must be positive`);
    if (this._couldLockImmediately(weight, priority)) {
      return Promise.resolve();
    } else {
      return new Promise((resolve) => {
        if (!this._weightedWaiters[weight - 1])
          this._weightedWaiters[weight - 1] = [];
        insertSorted(this._weightedWaiters[weight - 1], { resolve, priority });
      });
    }
  }
  isLocked() {
    return this._value <= 0;
  }
  getValue() {
    return this._value;
  }
  setValue(value) {
    this._value = value;
    this._dispatchQueue();
  }
  release(weight = 1) {
    if (weight <= 0)
      throw new Error(`invalid weight ${weight}: must be positive`);
    this._value += weight;
    this._dispatchQueue();
  }
  cancel() {
    this._queue.forEach((entry) => entry.reject(this._cancelError));
    this._queue = [];
  }
  _dispatchQueue() {
    this._drainUnlockWaiters();
    while (this._queue.length > 0 && this._queue[0].weight <= this._value) {
      this._dispatchItem(this._queue.shift());
      this._drainUnlockWaiters();
    }
  }
  _dispatchItem(item) {
    const previousValue = this._value;
    this._value -= item.weight;
    item.resolve([previousValue, this._newReleaser(item.weight)]);
  }
  _newReleaser(weight) {
    let called = false;
    return () => {
      if (called)
        return;
      called = true;
      this.release(weight);
    };
  }
  _drainUnlockWaiters() {
    if (this._queue.length === 0) {
      for (let weight = this._value; weight > 0; weight--) {
        const waiters = this._weightedWaiters[weight - 1];
        if (!waiters)
          continue;
        waiters.forEach((waiter) => waiter.resolve());
        this._weightedWaiters[weight - 1] = [];
      }
    } else {
      const queuedPriority = this._queue[0].priority;
      for (let weight = this._value; weight > 0; weight--) {
        const waiters = this._weightedWaiters[weight - 1];
        if (!waiters)
          continue;
        const i = waiters.findIndex((waiter) => waiter.priority <= queuedPriority);
        (i === -1 ? waiters : waiters.splice(0, i)).forEach((waiter) => waiter.resolve());
      }
    }
  }
  _couldLockImmediately(weight, priority) {
    return (this._queue.length === 0 || this._queue[0].priority < priority) && weight <= this._value;
  }
}
function insertSorted(a, v) {
  const i = findIndexFromEnd(a, (other) => v.priority <= other.priority);
  a.splice(i + 1, 0, v);
}
function findIndexFromEnd(a, predicate) {
  for (let i = a.length - 1; i >= 0; i--) {
    if (predicate(a[i])) {
      return i;
    }
  }
  return -1;
}
var __awaiter$1 = function(thisArg, _arguments, P, generator) {
  function adopt(value) {
    return value instanceof P ? value : new P(function(resolve) {
      resolve(value);
    });
  }
  return new (P || (P = Promise))(function(resolve, reject) {
    function fulfilled(value) {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    }
    function rejected(value) {
      try {
        step(generator["throw"](value));
      } catch (e) {
        reject(e);
      }
    }
    function step(result) {
      result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
    }
    step((generator = generator.apply(thisArg, _arguments || [])).next());
  });
};
class Mutex {
  constructor(cancelError) {
    this._semaphore = new Semaphore(1, cancelError);
  }
  acquire() {
    return __awaiter$1(this, arguments, void 0, function* (priority = 0) {
      const [, releaser] = yield this._semaphore.acquire(1, priority);
      return releaser;
    });
  }
  runExclusive(callback, priority = 0) {
    return this._semaphore.runExclusive(() => callback(), 1, priority);
  }
  isLocked() {
    return this._semaphore.isLocked();
  }
  waitForUnlock(priority = 0) {
    return this._semaphore.waitForUnlock(1, priority);
  }
  release() {
    if (this._semaphore.isLocked())
      this._semaphore.release();
  }
  cancel() {
    return this._semaphore.cancel();
  }
}
var name = "@prisma/adapter-libsql";
var debug = Debug("prisma:driver-adapter:libsql:conversion");
function mapDeclType(declType) {
  switch (declType.toUpperCase()) {
    case "":
      return null;
    case "DECIMAL":
      return ColumnTypeEnum.Numeric;
    case "FLOAT":
      return ColumnTypeEnum.Float;
    case "DOUBLE":
    case "DOUBLE PRECISION":
    case "NUMERIC":
    case "REAL":
      return ColumnTypeEnum.Double;
    case "TINYINT":
    case "SMALLINT":
    case "MEDIUMINT":
    case "INT":
    case "INTEGER":
    case "SERIAL":
    case "INT2":
      return ColumnTypeEnum.Int32;
    case "BIGINT":
    case "UNSIGNED BIG INT":
    case "INT8":
      return ColumnTypeEnum.Int64;
    case "DATETIME":
    case "TIMESTAMP":
      return ColumnTypeEnum.DateTime;
    case "TIME":
      return ColumnTypeEnum.Time;
    case "DATE":
      return ColumnTypeEnum.Date;
    case "TEXT":
    case "CLOB":
    case "CHARACTER":
    case "VARCHAR":
    case "VARYING CHARACTER":
    case "NCHAR":
    case "NATIVE CHARACTER":
    case "NVARCHAR":
      return ColumnTypeEnum.Text;
    case "BLOB":
      return ColumnTypeEnum.Bytes;
    case "BOOLEAN":
      return ColumnTypeEnum.Boolean;
    case "JSONB":
      return ColumnTypeEnum.Json;
    default:
      debug("unknown decltype:", declType);
      return null;
  }
}
function mapDeclaredColumnTypes(columnTypes) {
  const emptyIndices = /* @__PURE__ */ new Set();
  const result = columnTypes.map((typeName, index) => {
    const mappedType = mapDeclType(typeName);
    if (mappedType === null) {
      emptyIndices.add(index);
    }
    return mappedType;
  });
  return [result, emptyIndices];
}
function getColumnTypes(declaredTypes, rows) {
  const [columnTypes, emptyIndices] = mapDeclaredColumnTypes(declaredTypes);
  if (emptyIndices.size === 0) {
    return columnTypes;
  }
  columnLoop: for (const columnIndex of emptyIndices) {
    for (let rowIndex = 0; rowIndex < rows.length; rowIndex++) {
      const candidateValue = rows[rowIndex][columnIndex];
      if (candidateValue !== null) {
        columnTypes[columnIndex] = inferColumnType(candidateValue);
        continue columnLoop;
      }
    }
    columnTypes[columnIndex] = ColumnTypeEnum.Int32;
  }
  return columnTypes;
}
function inferColumnType(value) {
  switch (typeof value) {
    case "string":
      return ColumnTypeEnum.Text;
    case "bigint":
      return ColumnTypeEnum.Int64;
    case "boolean":
      return ColumnTypeEnum.Boolean;
    case "number":
      return ColumnTypeEnum.UnknownNumber;
    case "object":
      return inferObjectType(value);
    default:
      throw new UnexpectedTypeError(value);
  }
}
function inferObjectType(value) {
  if (value instanceof ArrayBuffer) {
    return ColumnTypeEnum.Bytes;
  }
  throw new UnexpectedTypeError(value);
}
var UnexpectedTypeError = class extends Error {
  constructor(value) {
    const type = typeof value;
    const repr = type === "object" ? JSON.stringify(value) : String(value);
    super(`unexpected value of type ${type}: ${repr}`);
    __publicField(this, "name", "UnexpectedTypeError");
  }
};
function mapRow(row, columnTypes) {
  const result = [];
  for (let i = 0; i < row.length; i++) {
    const value = row[i];
    if (value instanceof ArrayBuffer) {
      result[i] = new Uint8Array(value);
      continue;
    }
    if (typeof value === "number" && (columnTypes[i] === ColumnTypeEnum.Int32 || columnTypes[i] === ColumnTypeEnum.Int64) && !Number.isInteger(value)) {
      result[i] = Math.trunc(value);
      continue;
    }
    if (["number", "bigint"].includes(typeof value) && columnTypes[i] === ColumnTypeEnum.DateTime) {
      result[i] = new Date(Number(value)).toISOString();
      continue;
    }
    if (typeof value === "bigint") {
      result[i] = value.toString();
      continue;
    }
    result[i] = value;
  }
  return result;
}
function mapArg(arg, argType, options) {
  if (arg === null) {
    return null;
  }
  if (typeof arg === "string" && argType.scalarType === "bigint") {
    return BigInt(arg);
  }
  if (typeof arg === "string" && argType.scalarType === "decimal") {
    return Number.parseFloat(arg);
  }
  if (typeof arg === "string" && argType.scalarType === "datetime") {
    arg = new Date(arg);
  }
  if (arg instanceof Date) {
    const format = (options == null ? void 0 : options.timestampFormat) ?? "iso8601";
    switch (format) {
      case "unixepoch-ms":
        return arg.getTime();
      case "iso8601":
        return arg.toISOString().replace("Z", "+00:00");
      default:
        throw new Error(`Unknown timestamp format: ${format}`);
    }
  }
  if (typeof arg === "string" && argType.scalarType === "bytes") {
    return Buffer.from(arg, "base64");
  }
  return arg;
}
var SQLITE_BUSY = 5;
var PRIMARY_ERROR_CODE_MASK = 255;
function convertDriverError(error) {
  var _a2;
  if (isDriverError(error)) {
    return {
      originalCode: (_a2 = error.rawCode) == null ? void 0 : _a2.toString(),
      originalMessage: error.message,
      ...mapDriverError(error)
    };
  }
  throw error;
}
function mapDriverError(error) {
  var _a2, _b2, _c2;
  const rawCode = error.rawCode ?? ((_a2 = error.cause) == null ? void 0 : _a2["rawCode"]) ?? 1;
  switch (rawCode) {
    case 2067:
    case 1555: {
      const fields = (_b2 = error.message.split("constraint failed: ").at(1)) == null ? void 0 : _b2.split(", ").map((field) => field.split(".").pop());
      return {
        kind: "UniqueConstraintViolation",
        constraint: fields !== void 0 ? { fields } : void 0
      };
    }
    case 1299: {
      const fields = (_c2 = error.message.split("constraint failed: ").at(1)) == null ? void 0 : _c2.split(", ").map((field) => field.split(".").pop());
      return {
        kind: "NullConstraintViolation",
        constraint: fields !== void 0 ? { fields } : void 0
      };
    }
    case 787:
    case 1811:
      return {
        kind: "ForeignKeyConstraintViolation",
        constraint: { foreignKey: {} }
      };
    default:
      if (rawCode && (rawCode & PRIMARY_ERROR_CODE_MASK) === SQLITE_BUSY) {
        return {
          kind: "SocketTimeout"
        };
      } else if (error.message.startsWith("no such table")) {
        return {
          kind: "TableDoesNotExist",
          table: error.message.split(": ").at(1)
        };
      } else if (error.message.startsWith("no such column")) {
        return {
          kind: "ColumnNotFound",
          column: error.message.split(": ").at(1)
        };
      } else if (error.message.includes("has no column named ")) {
        return {
          kind: "ColumnNotFound",
          column: error.message.split("has no column named ").at(1)
        };
      }
      return {
        kind: "sqlite",
        extendedCode: rawCode,
        message: error.message
      };
  }
}
function isDriverError(error) {
  return typeof error.code === "string" && typeof error.message === "string" && (typeof error.rawCode === "number" || error.rawCode === void 0);
}
var debug2 = Debug("prisma:driver-adapter:libsql");
var LOCK_TAG = Symbol();
var LibSqlQueryable = (_a = LOCK_TAG, class {
  constructor(client, adapterOptions) {
    __publicField(this, "provider", "sqlite");
    __publicField(this, "adapterName", name);
    __publicField(this, _a, new Mutex());
    this.client = client;
    this.adapterOptions = adapterOptions;
  }
  /**
   * Execute a query given as SQL, interpolating the given parameters.
   */
  async queryRaw(query) {
    const tag = "[js::query_raw]";
    debug2(`${tag} %O`, query);
    const { columns, rows, columnTypes: declaredColumnTypes } = await this.performIO(query);
    const columnTypes = getColumnTypes(declaredColumnTypes, rows);
    return {
      columnNames: columns,
      columnTypes,
      rows: rows.map((row) => mapRow(row, columnTypes))
    };
  }
  /**
   * Execute a query given as SQL, interpolating the given parameters and
   * returning the number of affected rows.
   * Note: Queryable expects a u64, but napi.rs only supports u32.
   */
  async executeRaw(query) {
    const tag = "[js::execute_raw]";
    debug2(`${tag} %O`, query);
    return (await this.performIO(query)).rowsAffected ?? 0;
  }
  /**
   * Run a query against the database, returning the result set.
   * Should the query fail due to a connection error, the connection is
   * marked as unhealthy.
   */
  async performIO(query) {
    const release = await this[LOCK_TAG].acquire();
    try {
      const result = await this.client.execute({
        sql: query.sql,
        args: query.args.map((arg, i) => mapArg(arg, query.argTypes[i], this.adapterOptions))
      });
      return result;
    } catch (e) {
      this.onError(e);
    } finally {
      release();
    }
  }
  onError(error) {
    debug2("Error in performIO: %O", error);
    throw new DriverAdapterError(convertDriverError(error));
  }
});
var LibSqlTransaction = (_b = class extends LibSqlQueryable {
  constructor(client, options, adapterOptions, unlockParent) {
    super(client, adapterOptions);
    __privateAdd(this, _unlockParent);
    this.options = options;
    __privateSet(this, _unlockParent, unlockParent);
  }
  async commit() {
    debug2(`[js::commit]`);
    try {
      await this.client.commit();
    } finally {
      __privateGet(this, _unlockParent).call(this);
    }
  }
  async rollback() {
    debug2(`[js::rollback]`);
    try {
      await this.client.rollback();
    } catch (error) {
      debug2("error in rollback:", error);
    } finally {
      __privateGet(this, _unlockParent).call(this);
    }
  }
}, _unlockParent = new WeakMap(), _b);
var PrismaLibSqlAdapter = class extends LibSqlQueryable {
  constructor(client, adapterOptions) {
    super(client, adapterOptions);
  }
  async executeScript(script) {
    const release = await this[LOCK_TAG].acquire();
    try {
      await this.client.executeMultiple(script);
    } catch (e) {
      this.onError(e);
    } finally {
      release();
    }
  }
  async startTransaction(isolationLevel) {
    if (isolationLevel && isolationLevel !== "SERIALIZABLE") {
      throw new DriverAdapterError({
        kind: "InvalidIsolationLevel",
        level: isolationLevel
      });
    }
    const options = {
      usePhantomQuery: true
    };
    const tag = "[js::startTransaction]";
    debug2("%s options: %O", tag, options);
    const release = await this[LOCK_TAG].acquire();
    try {
      const tx = await this.client.transaction("deferred");
      return new LibSqlTransaction(tx, options, this.adapterOptions, release);
    } catch (e) {
      release();
      this.onError(e);
    }
  }
  dispose() {
    this.client.close();
    return Promise.resolve();
  }
};
var PrismaLibSqlAdapterFactoryBase = (_c = class {
  constructor(config, options) {
    __publicField(this, "provider", "sqlite");
    __publicField(this, "adapterName", name);
    __privateAdd(this, _config);
    __privateAdd(this, _options);
    __privateSet(this, _config, config);
    __privateSet(this, _options, options);
  }
  connect() {
    return Promise.resolve(new PrismaLibSqlAdapter(this.createClient(__privateGet(this, _config)), __privateGet(this, _options)));
  }
  connectToShadowDb() {
    return Promise.resolve(
      new PrismaLibSqlAdapter(this.createClient({ ...__privateGet(this, _config), url: ":memory:" }), __privateGet(this, _options))
    );
  }
}, _config = new WeakMap(), _options = new WeakMap(), _c);
var PrismaLibSqlAdapterFactory = class extends PrismaLibSqlAdapterFactoryBase {
  createClient(config) {
    return createClient(config);
  }
};
const _DatabaseClient = class _DatabaseClient {
  constructor() {
    __publicField(this, "prisma");
    const dbPath = path.join(app.getPath("userData"), "matriarch.db");
    const url = `file:${dbPath}`;
    const libsql = createClient({
      url
    });
    Object.assign(libsql, { url });
    const adapter = new PrismaLibSqlAdapterFactory(libsql);
    this.prisma = new PrismaClient({ adapter });
  }
  static getInstance() {
    if (!_DatabaseClient.instance) {
      _DatabaseClient.instance = new _DatabaseClient();
    }
    return _DatabaseClient.instance;
  }
  async initialize() {
    try {
      console.log("Initializing database schema...");
      await this.prisma.$executeRawUnsafe(`
                CREATE TABLE IF NOT EXISTS system_meta (
                    key TEXT PRIMARY KEY,
                    value TEXT,
                    created_at INTEGER DEFAULT (unixepoch())
                )
            `);
      await this.prisma.$executeRawUnsafe(`
                CREATE TABLE IF NOT EXISTS startup_events (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    event TEXT,
                    timestamp INTEGER
                )
            `);
      await this.prisma.$executeRawUnsafe(`
                CREATE TABLE IF NOT EXISTS notes (
                    id TEXT PRIMARY KEY,
                    title TEXT NOT NULL,
                    content TEXT NOT NULL,
                    metadata TEXT,
                    created_at DATETIME NOT NULL DEFAULT (datetime('now')),
                    updated_at DATETIME NOT NULL
                )
            `);
      await this.prisma.$executeRawUnsafe(`
                CREATE TABLE IF NOT EXISTS collections (
                    id TEXT PRIMARY KEY,
                    name TEXT NOT NULL,
                    created_at DATETIME NOT NULL DEFAULT (datetime('now')),
                    updated_at DATETIME NOT NULL
                )
            `);
      await this.prisma.$executeRawUnsafe(`
                CREATE TABLE IF NOT EXISTS folders (
                    id TEXT PRIMARY KEY,
                    name TEXT NOT NULL,
                    collection_id TEXT NOT NULL,
                    parent_id TEXT,
                    created_at DATETIME NOT NULL DEFAULT (datetime('now')),
                    updated_at DATETIME NOT NULL,
                    FOREIGN KEY (collection_id) REFERENCES collections(id) ON DELETE CASCADE,
                    FOREIGN KEY (parent_id) REFERENCES folders(id) ON DELETE CASCADE
                )
            `);
      await this.prisma.$executeRawUnsafe(`
                CREATE TABLE IF NOT EXISTS note_placements (
                    id TEXT PRIMARY KEY,
                    note_id TEXT NOT NULL,
                    collection_id TEXT NOT NULL,
                    folder_id TEXT,
                    FOREIGN KEY (note_id) REFERENCES notes(id) ON DELETE CASCADE,
                    FOREIGN KEY (collection_id) REFERENCES collections(id) ON DELETE CASCADE,
                    FOREIGN KEY (folder_id) REFERENCES folders(id) ON DELETE CASCADE,
                    UNIQUE(note_id, collection_id, folder_id)
                )
            `);
      await this.prisma.$executeRawUnsafe(`
                CREATE TABLE IF NOT EXISTS categories (
                    id TEXT PRIMARY KEY,
                    name TEXT NOT NULL UNIQUE
                )
            `);
      await this.prisma.$executeRawUnsafe(`
                CREATE TABLE IF NOT EXISTS "_CategoryToNote" (
                    "A" TEXT NOT NULL,
                    "B" TEXT NOT NULL,
                    FOREIGN KEY ("A") REFERENCES "categories" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
                    FOREIGN KEY ("B") REFERENCES "notes" ("id") ON DELETE CASCADE ON UPDATE CASCADE
                )
            `);
      await this.prisma.$executeRawUnsafe(`
                CREATE UNIQUE INDEX IF NOT EXISTS "_CategoryToNote_AB_unique" ON "_CategoryToNote"("A", "B");
            `);
      await this.prisma.$executeRawUnsafe(`
                CREATE INDEX IF NOT EXISTS "_CategoryToNote_B_index" ON "_CategoryToNote"("B");
            `);
      await this.prisma.$executeRawUnsafe(`
                CREATE TABLE IF NOT EXISTS note_associations (
                    id TEXT PRIMARY KEY,
                    source_id TEXT NOT NULL,
                    target_id TEXT NOT NULL,
                    type TEXT,
                    metadata TEXT,
                    FOREIGN KEY (source_id) REFERENCES notes(id) ON DELETE CASCADE,
                    FOREIGN KEY (target_id) REFERENCES notes(id) ON DELETE CASCADE,
                    UNIQUE(source_id, target_id)
                )
            `);
      const timestamp = BigInt(Date.now());
      await this.prisma.startupEvent.create({
        data: {
          event: "startup",
          timestamp
        }
      });
      const record = await this.prisma.startupEvent.findFirst({
        where: {
          timestamp
        }
      });
      if (record) {
        console.log("Startup validation passed: Found record", record);
      } else {
        console.error("Startup validation failed: Record not found");
      }
    } catch (e) {
      console.error("Schema initialization failed", e);
      throw e;
    }
  }
  getClient() {
    return this.prisma;
  }
};
__publicField(_DatabaseClient, "instance");
let DatabaseClient = _DatabaseClient;
const DEFAULT_SETTINGS = {
  defaultProvider: "ollama",
  defaultModel: "llama3.2",
  providerBaseUrl: "http://localhost:11434"
};
const SETTINGS_KEY = "ai_settings";
async function getAISettings() {
  try {
    const db = DatabaseClient.getInstance().getClient();
    const record = await db.systemSettings.findUnique({
      where: { key: SETTINGS_KEY }
    });
    if (record == null ? void 0 : record.value) {
      return { ...DEFAULT_SETTINGS, ...JSON.parse(record.value) };
    }
  } catch (error) {
    console.warn("Failed to load AI settings, using defaults:", error);
  }
  return DEFAULT_SETTINGS;
}
async function updateAISettings(settings) {
  const db = DatabaseClient.getInstance().getClient();
  const current = await getAISettings();
  const updated = { ...current, ...settings };
  await db.systemSettings.upsert({
    where: { key: SETTINGS_KEY },
    create: {
      key: SETTINGS_KEY,
      value: JSON.stringify(updated)
    },
    update: {
      value: JSON.stringify(updated)
    }
  });
}
const _AgentOrchestrator = class _AgentOrchestrator {
  constructor() {
    __publicField(this, "agents", /* @__PURE__ */ new Map());
  }
  static getInstance() {
    if (!_AgentOrchestrator.instance) {
      _AgentOrchestrator.instance = new _AgentOrchestrator();
    }
    return _AgentOrchestrator.instance;
  }
  /**
   * Register an agent with the orchestrator.
   */
  registerAgent(agent) {
    if (this.agents.has(agent.id)) {
      console.warn(`Agent ${agent.id} is already registered, replacing...`);
    }
    console.log(`Registering agent: ${agent.id} (${agent.name})`);
    this.agents.set(agent.id, agent);
  }
  /**
   * Unregister an agent.
   */
  unregisterAgent(agentId) {
    const removed = this.agents.delete(agentId);
    if (removed) {
      console.log(`Unregistered agent: ${agentId}`);
    }
    return removed;
  }
  /**
   * Get an agent by ID.
   */
  getAgent(agentId) {
    return this.agents.get(agentId);
  }
  /**
   * List all registered agents.
   */
  listAgents() {
    return Array.from(this.agents.values()).map((agent) => ({
      id: agent.id,
      name: agent.name,
      description: agent.description
    }));
  }
  /**
   * Execute an agent with the given input and optional model override.
   */
  async executeAgent(agentId, input, modelOverride) {
    const agent = this.agents.get(agentId);
    if (!agent) {
      return {
        success: false,
        output: null,
        actions: [],
        error: `Agent not found: ${agentId}`
      };
    }
    const context = {
      input,
      modelOverride
    };
    console.log(`Executing agent: ${agentId} (${agent.name})`);
    try {
      const result = await agent.execute(context);
      console.log(`Agent ${agentId} completed: success=${result.success}`);
      return result;
    } catch (error) {
      console.error(`Agent ${agentId} failed:`, error);
      return {
        success: false,
        output: null,
        actions: [],
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }
  /**
   * Get count of registered agents.
   */
  get agentCount() {
    return this.agents.size;
  }
};
__publicField(_AgentOrchestrator, "instance");
let AgentOrchestrator = _AgentOrchestrator;
const CHANNELS = {
  SYSTEM: {
    HEALTH: "system:health"
  },
  SETTINGS: {
    GET_AI: "settings:get-ai",
    UPDATE_AI: "settings:update-ai"
  },
  AGENTS: {
    LIST: "agents:list",
    EXECUTE: "agents:execute",
    GET_LOGS: "agents:get-logs"
  },
  COLLECTIONS: {
    LIST: "collections:list",
    CREATE: "collections:create"
  }
  // Future channels:
  // NOTES: { CREATE: 'notes:create', ... }
  // TASKS: { CREATE: 'tasks:create', ... }
};
function registerSystemApi() {
  ipcMain.handle(CHANNELS.SYSTEM.HEALTH, async () => {
    return {
      status: "ok",
      timestamp: Date.now(),
      version: app.getVersion()
    };
  });
}
function registerSettingsApi() {
  ipcMain.handle(CHANNELS.SETTINGS.GET_AI, async () => {
    return getAISettings();
  });
  ipcMain.handle(
    CHANNELS.SETTINGS.UPDATE_AI,
    async (_, settings) => {
      await updateAISettings(settings);
    }
  );
}
function registerAgentsApi() {
  ipcMain.handle(CHANNELS.AGENTS.LIST, async () => {
    const orchestrator = AgentOrchestrator.getInstance();
    return orchestrator.listAgents();
  });
  ipcMain.handle(
    CHANNELS.AGENTS.EXECUTE,
    async (_, agentId, input, modelOverride) => {
      const orchestrator = AgentOrchestrator.getInstance();
      return orchestrator.executeAgent(agentId, input, modelOverride);
    }
  );
  ipcMain.handle(
    CHANNELS.AGENTS.GET_LOGS,
    async (_, agentId, limit = 50) => {
      const db = DatabaseClient.getInstance().getClient();
      return db.agentLog.findMany({
        where: { agentId },
        include: { actions: true },
        orderBy: { timestamp: "desc" },
        take: limit
      });
    }
  );
}
async function listCollections() {
  const db = DatabaseClient.getInstance().getClient();
  return db.collection.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      folders: true
    }
  });
}
async function createCollection(name2) {
  const db = DatabaseClient.getInstance().getClient();
  return db.collection.create({
    data: { name: name2 }
  });
}
function registerCollectionsApi() {
  ipcMain.handle(CHANNELS.COLLECTIONS.LIST, async () => listCollections());
  ipcMain.handle(CHANNELS.COLLECTIONS.CREATE, async (_, name2) => createCollection(name2));
}
function registerAllHandlers() {
  console.log("Registering API handlers...");
  registerSystemApi();
  registerSettingsApi();
  registerAgentsApi();
  registerCollectionsApi();
  console.log("API handlers registered successfully");
}
const __dirname$1 = path.dirname(fileURLToPath(import.meta.url));
process.env.APP_ROOT = path.join(__dirname$1, "..");
const VITE_DEV_SERVER_URL = process.env["VITE_DEV_SERVER_URL"];
const MAIN_DIST = path.join(process.env.APP_ROOT, "dist-electron");
const RENDERER_DIST = path.join(process.env.APP_ROOT, "dist");
process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL ? path.join(process.env.APP_ROOT, "public") : RENDERER_DIST;
let win;
async function createWindow() {
  win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname$1, "preload.mjs")
    }
  });
  win.webContents.on("did-finish-load", () => {
    win == null ? void 0 : win.webContents.send("main-process-message", (/* @__PURE__ */ new Date()).toLocaleString());
  });
  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL);
  } else {
    win.loadFile(path.join(RENDERER_DIST, "index.html"));
  }
}
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
    win = null;
  }
});
app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
app.whenReady().then(async () => {
  console.log("App ready, initializing systems...");
  registerAllHandlers();
  try {
    const db = DatabaseClient.getInstance();
    await db.initialize();
    console.log("Database initialized successfully");
  } catch (error) {
    console.error("Failed to initialize database:", error);
  }
  try {
    const orchestrator = AgentOrchestrator.getInstance();
    console.log("Agent Orchestrator initialized");
  } catch (error) {
    console.error("Failed to initialize orchestrator:", error);
  }
  createWindow();
});
export {
  MAIN_DIST,
  RENDERER_DIST,
  VITE_DEV_SERVER_URL
};
