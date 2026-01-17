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
import { app, globalShortcut, BrowserWindow, ipcMain } from "electron";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createClient } from "@libsql/client";
import { PrismaClient } from "@prisma/client";
import "fs";
import "path";
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
                CREATE TABLE IF NOT EXISTS system_settings (
                    key TEXT PRIMARY KEY,
                    value TEXT NOT NULL,
                    updated_at DATETIME NOT NULL DEFAULT (datetime('now'))
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
      await this.prisma.$executeRawUnsafe(`
                CREATE TABLE IF NOT EXISTS ai_providers (
                    id TEXT PRIMARY KEY,
                    name TEXT NOT NULL,
                    enabled INTEGER NOT NULL DEFAULT 0,
                    created_at DATETIME NOT NULL DEFAULT (datetime('now')),
                    updated_at DATETIME NOT NULL DEFAULT (datetime('now'))
                )
            `);
      await this.prisma.$executeRawUnsafe(`
                CREATE TABLE IF NOT EXISTS ai_provider_configs (
                    id TEXT PRIMARY KEY,
                    provider_id TEXT NOT NULL UNIQUE,
                    config_json TEXT NOT NULL,
                    FOREIGN KEY (provider_id) REFERENCES ai_providers(id) ON DELETE CASCADE
                )
            `);
      await this.prisma.$executeRawUnsafe(`
                CREATE TABLE IF NOT EXISTS commands (
                    id TEXT PRIMARY KEY,
                    name TEXT NOT NULL,
                    description TEXT,
                    type TEXT NOT NULL,
                    action_type TEXT NOT NULL,
                    action_payload TEXT,
                    enabled INTEGER NOT NULL DEFAULT 1,
                    is_built_in INTEGER NOT NULL DEFAULT 0,
                    source TEXT NOT NULL DEFAULT 'system',
                    category TEXT,
                    created_at DATETIME NOT NULL DEFAULT (datetime('now')),
                    updated_at DATETIME NOT NULL DEFAULT (datetime('now'))
                )
            `);
      await this.prisma.$executeRawUnsafe(`
                CREATE TABLE IF NOT EXISTS command_hotkeys (
                    id TEXT PRIMARY KEY,
                    command_id TEXT NOT NULL,
                    accelerator TEXT NOT NULL UNIQUE,
                    is_global INTEGER NOT NULL DEFAULT 0,
                    FOREIGN KEY (command_id) REFERENCES commands(id) ON DELETE CASCADE
                )
            `);
      await this.prisma.$executeRawUnsafe(`
                CREATE TABLE IF NOT EXISTS ai_actions (
                    id TEXT PRIMARY KEY,
                    name TEXT NOT NULL,
                    description TEXT,
                    provider_id TEXT NOT NULL,
                    model_id TEXT NOT NULL,
                    system_prompt TEXT NOT NULL,
                    user_prompt_template TEXT NOT NULL,
                    output_behavior TEXT NOT NULL DEFAULT 'replace',
                    enabled INTEGER NOT NULL DEFAULT 1,
                    created_at DATETIME NOT NULL DEFAULT (datetime('now')),
                    updated_at DATETIME NOT NULL DEFAULT (datetime('now'))
                )
            `);
      await this.prisma.$executeRawUnsafe(`
                CREATE TABLE IF NOT EXISTS ai_action_logs (
                    id TEXT PRIMARY KEY,
                    action_id TEXT NOT NULL,
                    timestamp DATETIME NOT NULL DEFAULT (datetime('now')),
                    provider TEXT NOT NULL,
                    model TEXT NOT NULL,
                    tokens_in INTEGER,
                    tokens_out INTEGER,
                    duration_ms INTEGER NOT NULL,
                    status TEXT NOT NULL,
                    error TEXT,
                    FOREIGN KEY (action_id) REFERENCES ai_actions(id) ON DELETE CASCADE
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
const BUILT_IN_COMMANDS = [
  // =========================================================================
  // Navigation Commands
  // =========================================================================
  {
    id: "nav.dashboard",
    name: "Go to Dashboard",
    description: "Navigate to the main dashboard view",
    type: "navigation",
    actionType: "navigate",
    actionPayload: { route: "dashboard" },
    category: "Navigation",
    source: "system",
    isBuiltIn: true,
    defaultHotkey: "CommandOrControl+Shift+D",
    defaultIsGlobal: false
  },
  {
    id: "nav.settings",
    name: "Open Settings",
    description: "Open the application settings",
    type: "navigation",
    actionType: "navigate",
    actionPayload: { route: "settings" },
    category: "Navigation",
    source: "system",
    isBuiltIn: true,
    defaultHotkey: "CommandOrControl+,",
    defaultIsGlobal: false
  },
  // =========================================================================
  // Application Commands
  // =========================================================================
  {
    id: "app.command-palette",
    name: "Open Command Palette",
    description: "Open the command palette to search and execute commands",
    type: "application",
    actionType: "execute",
    actionPayload: { params: { action: "open-palette" } },
    category: "Application",
    source: "system",
    isBuiltIn: true,
    defaultHotkey: "CommandOrControl+Shift+P",
    defaultIsGlobal: true
  },
  {
    id: "app.toggle-theme",
    name: "Toggle Theme",
    description: "Switch between light and dark theme",
    type: "application",
    actionType: "toggle",
    actionPayload: { params: { action: "toggle-theme" } },
    category: "Application",
    source: "system",
    isBuiltIn: true
  },
  {
    id: "app.toggle-left-sidebar",
    name: "Toggle Left Sidebar",
    description: "Show or hide the left sidebar",
    type: "application",
    actionType: "toggle",
    actionPayload: { params: { action: "toggle-left-sidebar" } },
    category: "Application",
    source: "system",
    isBuiltIn: true,
    defaultHotkey: "CommandOrControl+\\",
    defaultIsGlobal: false
  },
  {
    id: "app.toggle-right-sidebar",
    name: "Toggle Right Sidebar",
    description: "Show or hide the right sidebar",
    type: "application",
    actionType: "toggle",
    actionPayload: { params: { action: "toggle-right-sidebar" } },
    category: "Application",
    source: "system",
    isBuiltIn: true,
    defaultHotkey: "CommandOrControl+Shift+\\",
    defaultIsGlobal: false
  },
  // =========================================================================
  // CRUD Commands
  // =========================================================================
  {
    id: "crud.new-collection",
    name: "Create New Collection",
    description: "Create a new collection to organize notes",
    type: "crud",
    actionType: "execute",
    actionPayload: { params: { action: "create-collection" } },
    category: "Collections",
    source: "system",
    isBuiltIn: true,
    defaultHotkey: "CommandOrControl+Shift+C",
    defaultIsGlobal: false
  },
  {
    id: "crud.new-note",
    name: "Create New Note",
    description: "Create a new note",
    type: "crud",
    actionType: "execute",
    actionPayload: { params: { action: "create-note" } },
    category: "Notes",
    source: "system",
    isBuiltIn: true,
    defaultHotkey: "CommandOrControl+N",
    defaultIsGlobal: false
  }
];
const _CommandRegistry = class _CommandRegistry {
  constructor() {
    __publicField(this, "initialized", false);
  }
  static getInstance() {
    if (!_CommandRegistry.instance) {
      _CommandRegistry.instance = new _CommandRegistry();
    }
    return _CommandRegistry.instance;
  }
  /**
   * Initialize the command registry.
   * Loads commands from database and seeds built-in commands if needed.
   */
  async initialize() {
    if (this.initialized) {
      console.log("[CommandRegistry] Already initialized");
      return;
    }
    console.log("[CommandRegistry] Initializing...");
    await this.seedBuiltInCommands();
    this.initialized = true;
    console.log("[CommandRegistry] Initialization complete");
  }
  /**
   * Seed built-in commands into the database if they don't exist.
   */
  async seedBuiltInCommands() {
    const prisma = DatabaseClient.getInstance().getClient();
    for (const cmd of BUILT_IN_COMMANDS) {
      const existing = await prisma.command.findUnique({
        where: { id: cmd.id }
      });
      if (!existing) {
        console.log(`[CommandRegistry] Seeding built-in command: ${cmd.id}`);
        await this.createCommandFromBuiltIn(cmd);
      }
    }
  }
  /**
   * Create a command from a built-in definition.
   */
  async createCommandFromBuiltIn(cmd) {
    const prisma = DatabaseClient.getInstance().getClient();
    const command = await prisma.command.create({
      data: {
        id: cmd.id,
        name: cmd.name,
        description: cmd.description,
        type: cmd.type,
        actionType: cmd.actionType,
        actionPayload: cmd.actionPayload ? JSON.stringify(cmd.actionPayload) : null,
        enabled: true,
        isBuiltIn: true,
        source: cmd.source ?? "system",
        category: cmd.category
      }
    });
    if (cmd.defaultHotkey) {
      await prisma.commandHotkey.create({
        data: {
          commandId: command.id,
          accelerator: cmd.defaultHotkey,
          isGlobal: cmd.defaultIsGlobal ?? false
        }
      });
    }
  }
  /**
   * List all commands, optionally filtered by type or enabled state.
   */
  async listCommands(filter) {
    const prisma = DatabaseClient.getInstance().getClient();
    const where = {};
    if (filter == null ? void 0 : filter.type) where.type = filter.type;
    if ((filter == null ? void 0 : filter.enabled) !== void 0) where.enabled = filter.enabled;
    const commands = await prisma.command.findMany({
      where,
      include: { hotkeys: true },
      orderBy: [
        { category: "asc" },
        { name: "asc" }
      ]
    });
    return commands.map(this.mapCommandToDefinition);
  }
  /**
   * Get a single command by ID.
   */
  async getCommand(id) {
    const prisma = DatabaseClient.getInstance().getClient();
    const command = await prisma.command.findUnique({
      where: { id },
      include: { hotkeys: true }
    });
    return command ? this.mapCommandToDefinition(command) : null;
  }
  /**
   * Create a new user command.
   */
  async createCommand(input) {
    const prisma = DatabaseClient.getInstance().getClient();
    const command = await prisma.command.create({
      data: {
        name: input.name,
        description: input.description,
        type: input.type,
        actionType: input.actionType,
        actionPayload: input.actionPayload ? JSON.stringify(input.actionPayload) : null,
        enabled: true,
        isBuiltIn: false,
        source: input.source ?? "user",
        category: input.category
      },
      include: { hotkeys: true }
    });
    return this.mapCommandToDefinition(command);
  }
  /**
   * Update an existing command.
   */
  async updateCommand(id, input) {
    const prisma = DatabaseClient.getInstance().getClient();
    const updateData = {};
    if (input.name !== void 0) updateData.name = input.name;
    if (input.description !== void 0) updateData.description = input.description;
    if (input.enabled !== void 0) updateData.enabled = input.enabled;
    if (input.actionPayload !== void 0) {
      updateData.actionPayload = JSON.stringify(input.actionPayload);
    }
    if (input.category !== void 0) updateData.category = input.category;
    const command = await prisma.command.update({
      where: { id },
      data: updateData,
      include: { hotkeys: true }
    });
    return this.mapCommandToDefinition(command);
  }
  /**
   * Delete a command. Only user/plugin commands can be deleted.
   */
  async deleteCommand(id) {
    const prisma = DatabaseClient.getInstance().getClient();
    const command = await prisma.command.findUnique({ where: { id } });
    if (!command) {
      throw new Error(`Command not found: ${id}`);
    }
    if (command.isBuiltIn) {
      throw new Error("Cannot delete built-in commands");
    }
    await prisma.command.delete({ where: { id } });
  }
  /**
   * Add a hotkey to a command.
   */
  async addHotkey(commandId, accelerator, isGlobal = false) {
    const prisma = DatabaseClient.getInstance().getClient();
    const existing = await prisma.commandHotkey.findUnique({
      where: { accelerator }
    });
    if (existing) {
      throw new Error(`Hotkey ${accelerator} is already assigned to another command`);
    }
    const hotkey = await prisma.commandHotkey.create({
      data: {
        commandId,
        accelerator,
        isGlobal
      }
    });
    return {
      id: hotkey.id,
      accelerator: hotkey.accelerator,
      isGlobal: hotkey.isGlobal
    };
  }
  /**
   * Remove a hotkey.
   */
  async removeHotkey(hotkeyId) {
    const prisma = DatabaseClient.getInstance().getClient();
    await prisma.commandHotkey.delete({ where: { id: hotkeyId } });
  }
  /**
   * Update a hotkey's accelerator.
   */
  async updateHotkey(hotkeyId, accelerator) {
    const prisma = DatabaseClient.getInstance().getClient();
    const existing = await prisma.commandHotkey.findFirst({
      where: {
        accelerator,
        NOT: { id: hotkeyId }
      }
    });
    if (existing) {
      throw new Error(`Hotkey ${accelerator} is already assigned to another command`);
    }
    const hotkey = await prisma.commandHotkey.update({
      where: { id: hotkeyId },
      data: { accelerator }
    });
    return {
      id: hotkey.id,
      accelerator: hotkey.accelerator,
      isGlobal: hotkey.isGlobal
    };
  }
  /**
   * Execute a command.
   */
  async executeCommand(id, context) {
    var _a2, _b2, _c2;
    const command = await this.getCommand(id);
    if (!command) {
      return { success: false, error: `Command not found: ${id}` };
    }
    if (!command.enabled) {
      return { success: false, error: `Command is disabled: ${id}` };
    }
    console.log(`[CommandRegistry] Executing command: ${command.name} (${id})`);
    try {
      switch (command.actionType) {
        case "navigate":
          return {
            success: true,
            output: { action: "navigate", route: (_a2 = command.actionPayload) == null ? void 0 : _a2.route }
          };
        case "toggle":
          return {
            success: true,
            output: { action: "toggle", params: (_b2 = command.actionPayload) == null ? void 0 : _b2.params }
          };
        case "execute":
          return {
            success: true,
            output: { action: "execute", params: (_c2 = command.actionPayload) == null ? void 0 : _c2.params }
          };
        case "agent-execute":
          return await this.executeAgentCommand(command, context);
        default:
          return { success: false, error: `Unknown actionType: ${command.actionType}` };
      }
    } catch (error) {
      console.error(`[CommandRegistry] Command execution failed:`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }
  /**
   * Execute an agent-based command.
   */
  async executeAgentCommand(command, context) {
    var _a2;
    const agentId = (_a2 = command.actionPayload) == null ? void 0 : _a2.agentId;
    if (!agentId) {
      return { success: false, error: "No agentId specified in command payload" };
    }
    const orchestrator = AgentOrchestrator.getInstance();
    const result = await orchestrator.executeAgent(agentId, {
      noteId: context == null ? void 0 : context.noteId,
      selectedText: context == null ? void 0 : context.selectedText,
      ...context == null ? void 0 : context.params
    });
    return {
      success: result.success,
      error: result.error,
      output: result.output
    };
  }
  /**
   * Map a Prisma command to a CommandDefinition.
   */
  mapCommandToDefinition(command) {
    var _a2;
    let parsedPayload;
    if (command.actionPayload) {
      try {
        parsedPayload = JSON.parse(command.actionPayload);
      } catch {
        console.warn(`[CommandRegistry] Failed to parse actionPayload for ${command.id}`);
      }
    }
    return {
      id: command.id,
      name: command.name,
      description: command.description ?? void 0,
      type: command.type,
      actionType: command.actionType,
      actionPayload: parsedPayload,
      enabled: command.enabled,
      isBuiltIn: command.isBuiltIn,
      source: command.source,
      category: command.category ?? void 0,
      hotkeys: command.hotkeys.map((h) => ({
        id: h.id,
        accelerator: h.accelerator,
        isGlobal: h.isGlobal
      })),
      defaultHotkey: command.isBuiltIn ? (_a2 = BUILT_IN_COMMANDS.find((b) => b.id === command.id)) == null ? void 0 : _a2.defaultHotkey : void 0
    };
  }
};
__publicField(_CommandRegistry, "instance");
let CommandRegistry = _CommandRegistry;
const _HotkeyManager = class _HotkeyManager {
  constructor() {
    __publicField(this, "registeredAccelerators", /* @__PURE__ */ new Map());
    // accelerator -> commandId
    __publicField(this, "initialized", false);
  }
  static getInstance() {
    if (!_HotkeyManager.instance) {
      _HotkeyManager.instance = new _HotkeyManager();
    }
    return _HotkeyManager.instance;
  }
  /**
   * Initialize the hotkey manager.
   * Loads all global hotkeys from commands and registers them.
   */
  async initialize() {
    if (this.initialized) {
      console.log("[HotkeyManager] Already initialized");
      return;
    }
    console.log("[HotkeyManager] Initializing...");
    await this.registerAllGlobalHotkeys();
    this.initialized = true;
    console.log("[HotkeyManager] Initialization complete");
  }
  /**
   * Register all global hotkeys from enabled commands.
   */
  async registerAllGlobalHotkeys() {
    const registry = CommandRegistry.getInstance();
    const commands = await registry.listCommands({ enabled: true });
    for (const command of commands) {
      for (const hotkey of command.hotkeys) {
        if (hotkey.isGlobal) {
          this.registerHotkey(command.id, hotkey.accelerator);
        }
      }
    }
    console.log(`[HotkeyManager] Registered ${this.registeredAccelerators.size} global hotkeys`);
  }
  /**
   * Register a global hotkey for a command.
   */
  registerHotkey(commandId, accelerator) {
    if (this.registeredAccelerators.has(accelerator)) {
      this.unregisterHotkey(accelerator);
    }
    try {
      const success = globalShortcut.register(accelerator, () => {
        this.handleHotkeyTriggered(commandId, accelerator);
      });
      if (success) {
        this.registeredAccelerators.set(accelerator, commandId);
        console.log(`[HotkeyManager] Registered hotkey: ${accelerator} -> ${commandId}`);
        return true;
      } else {
        console.warn(`[HotkeyManager] Failed to register hotkey: ${accelerator}`);
        return false;
      }
    } catch (error) {
      console.error(`[HotkeyManager] Error registering hotkey ${accelerator}:`, error);
      return false;
    }
  }
  /**
   * Unregister a global hotkey.
   */
  unregisterHotkey(accelerator) {
    if (this.registeredAccelerators.has(accelerator)) {
      try {
        globalShortcut.unregister(accelerator);
        this.registeredAccelerators.delete(accelerator);
        console.log(`[HotkeyManager] Unregistered hotkey: ${accelerator}`);
      } catch (error) {
        console.error(`[HotkeyManager] Error unregistering hotkey ${accelerator}:`, error);
      }
    }
  }
  /**
   * Unregister all global hotkeys.
   */
  unregisterAll() {
    console.log("[HotkeyManager] Unregistering all hotkeys");
    globalShortcut.unregisterAll();
    this.registeredAccelerators.clear();
  }
  /**
   * Check if an accelerator is valid Electron format.
   */
  isAcceleratorValid(accelerator) {
    const modifiers = [
      "Command",
      "Cmd",
      "Control",
      "Ctrl",
      "CommandOrControl",
      "CmdOrCtrl",
      "Alt",
      "Option",
      "AltGr",
      "Shift",
      "Super",
      "Meta"
    ];
    const parts = accelerator.split("+");
    if (parts.length === 0) return false;
    const key = parts[parts.length - 1];
    if (!key || key.length === 0) return false;
    for (let i = 0; i < parts.length - 1; i++) {
      if (!modifiers.includes(parts[i])) {
        return false;
      }
    }
    return true;
  }
  /**
   * Check if an accelerator is available (not already registered).
   */
  isAcceleratorAvailable(accelerator) {
    return !this.registeredAccelerators.has(accelerator);
  }
  /**
   * Get the command ID for a registered accelerator.
   */
  getCommandForAccelerator(accelerator) {
    return this.registeredAccelerators.get(accelerator);
  }
  /**
   * Handle when a hotkey is triggered.
   */
  async handleHotkeyTriggered(commandId, accelerator) {
    console.log(`[HotkeyManager] Hotkey triggered: ${accelerator} -> ${commandId}`);
    const registry = CommandRegistry.getInstance();
    const result = await registry.executeCommand(commandId);
    if (result.success) {
      this.sendToRenderer("command:executed", {
        commandId,
        output: result.output
      });
    } else {
      console.error(`[HotkeyManager] Command execution failed: ${result.error}`);
      this.sendToRenderer("command:error", {
        commandId,
        error: result.error
      });
    }
  }
  /**
   * Send a message to the focused renderer window.
   */
  sendToRenderer(channel, data) {
    const focusedWindow = BrowserWindow.getFocusedWindow();
    if (focusedWindow) {
      focusedWindow.webContents.send(channel, data);
    } else {
      const allWindows = BrowserWindow.getAllWindows();
      for (const win2 of allWindows) {
        win2.webContents.send(channel, data);
      }
    }
  }
  /**
   * Refresh hotkeys for a specific command.
   * Call this after updating a command's hotkeys.
   */
  async refreshCommandHotkeys(commandId) {
    for (const [accelerator, cmdId] of this.registeredAccelerators.entries()) {
      if (cmdId === commandId) {
        this.unregisterHotkey(accelerator);
      }
    }
    const registry = CommandRegistry.getInstance();
    const command = await registry.getCommand(commandId);
    if (command && command.enabled) {
      for (const hotkey of command.hotkeys) {
        if (hotkey.isGlobal) {
          this.registerHotkey(commandId, hotkey.accelerator);
        }
      }
    }
  }
};
__publicField(_HotkeyManager, "instance");
let HotkeyManager = _HotkeyManager;
const CHANNELS = {
  SYSTEM: {
    HEALTH: "system:health"
  },
  SETTINGS: {
    GET_GENERAL: "settings:get-general",
    UPDATE_GENERAL: "settings:update-general",
    GET_AI: "settings:get-ai",
    UPDATE_AI: "settings:update-ai",
    RESET_DEFAULTS: "settings:reset-defaults"
  },
  AGENTS: {
    LIST: "agents:list",
    EXECUTE: "agents:execute",
    GET_LOGS: "agents:get-logs"
  },
  COLLECTIONS: {
    LIST: "collections:list",
    CREATE: "collections:create",
    UPDATE: "collections:update",
    DELETE: "collections:delete"
  },
  NOTES: {
    CREATE: "notes:create",
    READ: "notes:read",
    UPDATE: "notes:update",
    DELETE: "notes:delete"
  },
  AI_PROVIDERS: {
    LIST: "ai-providers:list",
    GET_CONFIG: "ai-providers:get-config",
    SET_ENABLED: "ai-providers:set-enabled",
    UPDATE_CONFIG: "ai-providers:update-config",
    CHECK_AVAILABILITY: "ai-providers:check-availability",
    GET_MODELS: "ai-providers:get-models"
  },
  AI_ACTIONS: {
    LIST: "ai-actions:list",
    CREATE: "ai-actions:create",
    UPDATE: "ai-actions:update",
    DELETE: "ai-actions:delete",
    EXECUTE: "ai-actions:execute",
    GET_LOGS: "ai-actions:get-logs"
  },
  COMMANDS: {
    LIST: "commands:list",
    GET: "commands:get",
    CREATE: "commands:create",
    UPDATE: "commands:update",
    DELETE: "commands:delete",
    EXECUTE: "commands:execute",
    ADD_HOTKEY: "commands:add-hotkey",
    REMOVE_HOTKEY: "commands:remove-hotkey",
    UPDATE_HOTKEY: "commands:update-hotkey"
  }
  // Future channels:
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
var SettingsCategory = /* @__PURE__ */ ((SettingsCategory2) => {
  SettingsCategory2["GENERAL"] = "general";
  SettingsCategory2["AI"] = "ai";
  return SettingsCategory2;
})(SettingsCategory || {});
const GENERAL_DEFAULTS = {
  theme: "system",
  language: "en",
  startMinimized: false
};
const AI_DEFAULTS = {
  defaultProvider: "ollama",
  defaultModel: "llama3",
  providerBaseUrl: void 0,
  maxTokens: 4096,
  temperature: 0.7,
  autoNoteSummary: true,
  backgroundMapping: false
};
const SETTINGS_KEYS = {
  // General
  GENERAL_THEME: "general.theme",
  GENERAL_LANGUAGE: "general.language",
  GENERAL_START_MINIMIZED: "general.startMinimized",
  // AI
  AI_DEFAULT_PROVIDER: "ai.defaultProvider",
  AI_DEFAULT_MODEL: "ai.defaultModel",
  AI_PROVIDER_BASE_URL: "ai.providerBaseUrl",
  AI_MAX_TOKENS: "ai.maxTokens",
  AI_TEMPERATURE: "ai.temperature",
  AI_AUTO_NOTE_SUMMARY: "ai.autoNoteSummary",
  AI_BACKGROUND_MAPPING: "ai.backgroundMapping"
};
async function getSetting(key, defaultValue) {
  const prisma = DatabaseClient.getInstance().getClient();
  const setting = await prisma.systemSettings.findUnique({
    where: { key }
  });
  if (!setting) {
    return defaultValue;
  }
  const value = setting.value;
  if (typeof defaultValue === "boolean") {
    return value === "true";
  }
  if (typeof defaultValue === "number") {
    return Number(value);
  }
  return value;
}
async function setSetting(key, value) {
  const prisma = DatabaseClient.getInstance().getClient();
  const stringValue = String(value);
  await prisma.systemSettings.upsert({
    where: { key },
    update: { value: stringValue },
    create: { key, value: stringValue }
  });
}
async function getGeneralSettings() {
  const [theme, language, startMinimized] = await Promise.all([
    getSetting(SETTINGS_KEYS.GENERAL_THEME, GENERAL_DEFAULTS.theme),
    getSetting(SETTINGS_KEYS.GENERAL_LANGUAGE, GENERAL_DEFAULTS.language),
    getSetting(SETTINGS_KEYS.GENERAL_START_MINIMIZED, GENERAL_DEFAULTS.startMinimized)
  ]);
  return {
    theme,
    language,
    startMinimized
  };
}
async function updateGeneralSettings(updates) {
  const operations = [];
  if (updates.theme !== void 0) {
    operations.push(setSetting(SETTINGS_KEYS.GENERAL_THEME, updates.theme));
  }
  if (updates.language !== void 0) {
    operations.push(setSetting(SETTINGS_KEYS.GENERAL_LANGUAGE, updates.language));
  }
  if (updates.startMinimized !== void 0) {
    operations.push(setSetting(SETTINGS_KEYS.GENERAL_START_MINIMIZED, updates.startMinimized));
  }
  await Promise.all(operations);
}
async function getAISettings() {
  const [
    defaultProvider,
    defaultModel,
    providerBaseUrl,
    maxTokens,
    temperature,
    autoNoteSummary,
    backgroundMapping
  ] = await Promise.all([
    getSetting(SETTINGS_KEYS.AI_DEFAULT_PROVIDER, AI_DEFAULTS.defaultProvider),
    getSetting(SETTINGS_KEYS.AI_DEFAULT_MODEL, AI_DEFAULTS.defaultModel),
    getSetting(SETTINGS_KEYS.AI_PROVIDER_BASE_URL, AI_DEFAULTS.providerBaseUrl ?? ""),
    getSetting(SETTINGS_KEYS.AI_MAX_TOKENS, AI_DEFAULTS.maxTokens),
    getSetting(SETTINGS_KEYS.AI_TEMPERATURE, AI_DEFAULTS.temperature),
    getSetting(SETTINGS_KEYS.AI_AUTO_NOTE_SUMMARY, AI_DEFAULTS.autoNoteSummary),
    getSetting(SETTINGS_KEYS.AI_BACKGROUND_MAPPING, AI_DEFAULTS.backgroundMapping)
  ]);
  return {
    defaultProvider,
    defaultModel,
    providerBaseUrl: providerBaseUrl || void 0,
    maxTokens,
    temperature,
    autoNoteSummary,
    backgroundMapping
  };
}
async function updateAISettings(updates) {
  const operations = [];
  if (updates.defaultProvider !== void 0) {
    operations.push(setSetting(SETTINGS_KEYS.AI_DEFAULT_PROVIDER, updates.defaultProvider));
  }
  if (updates.defaultModel !== void 0) {
    operations.push(setSetting(SETTINGS_KEYS.AI_DEFAULT_MODEL, updates.defaultModel));
  }
  if (updates.providerBaseUrl !== void 0) {
    operations.push(setSetting(SETTINGS_KEYS.AI_PROVIDER_BASE_URL, updates.providerBaseUrl));
  }
  if (updates.maxTokens !== void 0) {
    operations.push(setSetting(SETTINGS_KEYS.AI_MAX_TOKENS, updates.maxTokens));
  }
  if (updates.temperature !== void 0) {
    operations.push(setSetting(SETTINGS_KEYS.AI_TEMPERATURE, updates.temperature));
  }
  if (updates.autoNoteSummary !== void 0) {
    operations.push(setSetting(SETTINGS_KEYS.AI_AUTO_NOTE_SUMMARY, updates.autoNoteSummary));
  }
  if (updates.backgroundMapping !== void 0) {
    operations.push(setSetting(SETTINGS_KEYS.AI_BACKGROUND_MAPPING, updates.backgroundMapping));
  }
  await Promise.all(operations);
}
async function resetToDefaults(category) {
  if (!category || category === SettingsCategory.GENERAL) {
    await updateGeneralSettings(GENERAL_DEFAULTS);
  }
  if (!category || category === SettingsCategory.AI) {
    await updateAISettings(AI_DEFAULTS);
  }
}
function registerSettingsApi() {
  ipcMain.handle(
    CHANNELS.SETTINGS.GET_GENERAL,
    async () => {
      return getGeneralSettings();
    }
  );
  ipcMain.handle(
    CHANNELS.SETTINGS.UPDATE_GENERAL,
    async (_, settings) => {
      await updateGeneralSettings(settings);
    }
  );
  ipcMain.handle(
    CHANNELS.SETTINGS.GET_AI,
    async () => {
      return getAISettings();
    }
  );
  ipcMain.handle(
    CHANNELS.SETTINGS.UPDATE_AI,
    async (_, settings) => {
      await updateAISettings(settings);
    }
  );
  ipcMain.handle(
    CHANNELS.SETTINGS.RESET_DEFAULTS,
    async (_, category) => {
      const cat = category === "general" ? SettingsCategory.GENERAL : category === "ai" ? SettingsCategory.AI : void 0;
      await resetToDefaults(cat);
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
      folders: true,
      placements: {
        include: {
          note: true
        }
      }
    }
  });
}
async function createCollection(name2) {
  const db = DatabaseClient.getInstance().getClient();
  return db.collection.create({
    data: { name: name2 }
  });
}
async function updateCollection(id, data) {
  const db = DatabaseClient.getInstance().getClient();
  return db.collection.update({
    where: { id },
    data
  });
}
async function deleteCollection(id) {
  const db = DatabaseClient.getInstance().getClient();
  return db.collection.delete({
    where: { id }
  });
}
function registerCollectionsApi() {
  ipcMain.handle(CHANNELS.COLLECTIONS.LIST, async () => listCollections());
  ipcMain.handle(CHANNELS.COLLECTIONS.CREATE, async (_, name2) => createCollection(name2));
  ipcMain.handle(CHANNELS.COLLECTIONS.UPDATE, async (_, id, data) => updateCollection(id, data));
  ipcMain.handle(CHANNELS.COLLECTIONS.DELETE, async (_, id) => deleteCollection(id));
}
async function createNote(data) {
  const db = DatabaseClient.getInstance().getClient();
  if (!data.collectionId && !data.folderId) {
    return db.note.create({
      data: {
        title: data.title,
        content: data.content || "",
        metadata: data.metadata ? JSON.stringify(data.metadata) : void 0
      }
    });
  }
  return db.$transaction(async (tx) => {
    const note = await tx.note.create({
      data: {
        title: data.title,
        content: data.content || "",
        metadata: data.metadata ? JSON.stringify(data.metadata) : void 0
      }
    });
    if (data.collectionId) {
      await tx.notePlacement.create({
        data: {
          noteId: note.id,
          collectionId: data.collectionId,
          folderId: data.folderId
        }
      });
    }
    return note;
  });
}
async function getNote(id) {
  const db = DatabaseClient.getInstance().getClient();
  return db.note.findUnique({
    where: { id },
    include: {
      placements: {
        include: {
          collection: true,
          folder: true
        }
      },
      categories: true
    }
  });
}
async function updateNote(id, data) {
  const db = DatabaseClient.getInstance().getClient();
  const updateData = { ...data };
  if (data.metadata) {
    updateData.metadata = JSON.stringify(data.metadata);
  }
  return db.note.update({
    where: { id },
    data: updateData
  });
}
async function deleteNote(id) {
  const db = DatabaseClient.getInstance().getClient();
  return db.note.delete({
    where: { id }
  });
}
function registerNotesApi() {
  ipcMain.handle(CHANNELS.NOTES.CREATE, async (_, data) => createNote(data));
  ipcMain.handle(CHANNELS.NOTES.READ, async (_, id) => getNote(id));
  ipcMain.handle(CHANNELS.NOTES.UPDATE, async (_, id, data) => updateNote(id, data));
  ipcMain.handle(CHANNELS.NOTES.DELETE, async (_, id) => deleteNote(id));
}
var AIProviderType = /* @__PURE__ */ ((AIProviderType2) => {
  AIProviderType2["OLLAMA"] = "ollama";
  return AIProviderType2;
})(AIProviderType || {});
const PROVIDER_METADATA = {
  [
    "ollama"
    /* OLLAMA */
  ]: {
    id: "ollama",
    name: "Ollama",
    description: "Run open-source LLMs locally with Ollama",
    icon: "terminal"
  }
};
const OLLAMA_DEFAULTS = {
  baseUrl: "http://localhost:11434",
  defaultModel: "llama3.2"
};
function getDefaultConfig(providerId) {
  switch (providerId) {
    case "ollama":
      return { ...OLLAMA_DEFAULTS };
    default:
      return null;
  }
}
async function getProviders() {
  var _a2;
  const prisma = DatabaseClient.getInstance().getClient();
  const providers = [];
  for (const type of Object.values(AIProviderType)) {
    const metadata = PROVIDER_METADATA[type];
    const dbProvider = await prisma.aIProvider.findUnique({
      where: { id: type },
      include: { config: true }
    });
    const config = ((_a2 = dbProvider == null ? void 0 : dbProvider.config) == null ? void 0 : _a2.configJson) ? JSON.parse(dbProvider.config.configJson) : getDefaultConfig(type);
    const available = await checkProviderAvailability(type, config);
    providers.push({
      id: type,
      name: metadata.name,
      description: metadata.description,
      enabled: (dbProvider == null ? void 0 : dbProvider.enabled) ?? false,
      available: available.available,
      config
    });
  }
  return providers;
}
async function setProviderEnabled(providerId, enabled) {
  const prisma = DatabaseClient.getInstance().getClient();
  const metadata = PROVIDER_METADATA[providerId];
  if (!metadata) {
    throw new Error(`Unknown provider: ${providerId}`);
  }
  await prisma.aIProvider.upsert({
    where: { id: providerId },
    update: { enabled },
    create: {
      id: providerId,
      name: metadata.name,
      enabled
    }
  });
}
async function getProviderConfig(providerId) {
  var _a2;
  const prisma = DatabaseClient.getInstance().getClient();
  const provider = await prisma.aIProvider.findUnique({
    where: { id: providerId },
    include: { config: true }
  });
  if ((_a2 = provider == null ? void 0 : provider.config) == null ? void 0 : _a2.configJson) {
    return JSON.parse(provider.config.configJson);
  }
  return getDefaultConfig(providerId);
}
async function updateProviderConfig(providerId, config) {
  const prisma = DatabaseClient.getInstance().getClient();
  const metadata = PROVIDER_METADATA[providerId];
  if (!metadata) {
    throw new Error(`Unknown provider: ${providerId}`);
  }
  await prisma.aIProvider.upsert({
    where: { id: providerId },
    update: {},
    create: {
      id: providerId,
      name: metadata.name,
      enabled: false
    }
  });
  await prisma.aIProviderConfig.upsert({
    where: { providerId },
    update: { configJson: JSON.stringify(config) },
    create: {
      providerId,
      configJson: JSON.stringify(config)
    }
  });
}
async function checkProviderAvailability(providerId, config) {
  switch (providerId) {
    case AIProviderType.OLLAMA:
      return checkOllamaAvailability(config);
    default:
      return { available: false, error: `Unknown provider: ${providerId}` };
  }
}
async function checkOllamaAvailability(config) {
  var _a2;
  const baseUrl = (config == null ? void 0 : config.baseUrl) ?? OLLAMA_DEFAULTS.baseUrl;
  try {
    const response = await fetch(`${baseUrl}/api/tags`, {
      method: "GET",
      signal: AbortSignal.timeout(5e3)
      // 5 second timeout
    });
    if (!response.ok) {
      return { available: false, error: `Ollama returned status ${response.status}` };
    }
    const data = await response.json();
    const models = ((_a2 = data.models) == null ? void 0 : _a2.map((m) => m.name)) ?? [];
    return { available: true, models };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Connection failed";
    return { available: false, error: message };
  }
}
async function getOllamaModels(config) {
  const result = await checkOllamaAvailability(config ?? null);
  return result.models ?? [];
}
async function generateCompletion(request) {
  const { providerId, modelId, systemPrompt, userPrompt } = request;
  const config = await getProviderConfig(providerId);
  switch (providerId) {
    case AIProviderType.OLLAMA:
      return generateOllamaCompletion(config, modelId, systemPrompt, userPrompt);
    default:
      throw new Error(`Provider ${providerId} does not support completion generation`);
  }
}
async function generateOllamaCompletion(config, model, systemPrompt, userPrompt) {
  const baseUrl = (config == null ? void 0 : config.baseUrl) ?? OLLAMA_DEFAULTS.baseUrl;
  const response = await fetch(`${baseUrl}/api/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model,
      system: systemPrompt,
      prompt: userPrompt,
      stream: false
    })
  });
  if (!response.ok) {
    throw new Error(`Ollama generation failed: ${response.statusText}`);
  }
  const data = await response.json();
  return {
    content: data.response,
    tokensIn: data.prompt_eval_count,
    tokensOut: data.eval_count
  };
}
function registerAIProvidersHandlers() {
  ipcMain.handle(CHANNELS.AI_PROVIDERS.LIST, async () => {
    return getProviders();
  });
  ipcMain.handle(CHANNELS.AI_PROVIDERS.GET_CONFIG, async (_event, providerId) => {
    return getProviderConfig(providerId);
  });
  ipcMain.handle(
    CHANNELS.AI_PROVIDERS.SET_ENABLED,
    async (_event, providerId, enabled) => {
      await setProviderEnabled(providerId, enabled);
    }
  );
  ipcMain.handle(
    CHANNELS.AI_PROVIDERS.UPDATE_CONFIG,
    async (_event, providerId, config) => {
      await updateProviderConfig(providerId, config);
    }
  );
  ipcMain.handle(
    CHANNELS.AI_PROVIDERS.CHECK_AVAILABILITY,
    async (_event, providerId) => {
      const config = await getProviderConfig(providerId);
      return checkProviderAvailability(providerId, config);
    }
  );
  ipcMain.handle(CHANNELS.AI_PROVIDERS.GET_MODELS, async (_event, providerId) => {
    if (providerId === AIProviderType.OLLAMA) {
      const config = await getProviderConfig(providerId);
      return getOllamaModels(config);
    }
    return [];
  });
}
async function listActions() {
  const prisma = DatabaseClient.getInstance().getClient();
  const actions = await prisma.aIAction.findMany({
    orderBy: { name: "asc" }
  });
  return actions.map((action) => ({
    ...action,
    description: action.description || void 0,
    outputBehavior: action.outputBehavior
    // Cast string to union type
  }));
}
async function createAction(data) {
  const prisma = DatabaseClient.getInstance().getClient();
  const action = await prisma.aIAction.create({
    data: {
      ...data,
      enabled: true
    }
  });
  return {
    ...action,
    description: action.description || void 0,
    outputBehavior: action.outputBehavior
  };
}
async function updateAction(id, data) {
  const prisma = DatabaseClient.getInstance().getClient();
  const action = await prisma.aIAction.update({
    where: { id },
    data
  });
  return {
    ...action,
    description: action.description || void 0,
    outputBehavior: action.outputBehavior
  };
}
async function deleteAction(id) {
  const prisma = DatabaseClient.getInstance().getClient();
  await prisma.aIAction.delete({
    where: { id }
  });
}
async function executeAction(actionId, selection) {
  const prisma = DatabaseClient.getInstance().getClient();
  const startTime = Date.now();
  const action = await prisma.aIAction.findUnique({
    where: { id: actionId }
  });
  if (!action) {
    return { success: false, error: "Action not found" };
  }
  let userPrompt = action.userPromptTemplate;
  if (userPrompt.includes("{{selection}}")) {
    userPrompt = userPrompt.replace("{{selection}}", selection);
  } else {
    userPrompt = `${userPrompt}

${selection}`;
  }
  try {
    const result = await generateCompletion({
      providerId: action.providerId,
      modelId: action.modelId,
      systemPrompt: action.systemPrompt,
      userPrompt
    });
    const durationMs = Date.now() - startTime;
    await prisma.aIActionLog.create({
      data: {
        actionId,
        provider: action.providerId,
        model: action.modelId,
        tokensIn: result.tokensIn,
        tokensOut: result.tokensOut,
        durationMs,
        status: "success"
      }
    });
    return { success: true, output: result.content };
  } catch (error) {
    const durationMs = Date.now() - startTime;
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    await prisma.aIActionLog.create({
      data: {
        actionId,
        provider: action.providerId,
        model: action.modelId,
        durationMs,
        status: "failure",
        error: errorMessage
      }
    });
    return { success: false, error: errorMessage };
  }
}
async function getActionLogs(actionId, limit = 50) {
  const prisma = DatabaseClient.getInstance().getClient();
  const logs = await prisma.aIActionLog.findMany({
    where: { actionId },
    orderBy: { timestamp: "desc" },
    take: limit
  });
  return logs.map((log) => ({
    ...log,
    tokensIn: log.tokensIn || void 0,
    tokensOut: log.tokensOut || void 0,
    error: log.error || void 0,
    status: log.status
  }));
}
function registerAIActionsHandlers() {
  ipcMain.handle(CHANNELS.AI_ACTIONS.LIST, async () => {
    return listActions();
  });
  ipcMain.handle(CHANNELS.AI_ACTIONS.CREATE, async (_event, data) => {
    return createAction(data);
  });
  ipcMain.handle(CHANNELS.AI_ACTIONS.UPDATE, async (_event, id, data) => {
    return updateAction(id, data);
  });
  ipcMain.handle(CHANNELS.AI_ACTIONS.DELETE, async (_event, id) => {
    return deleteAction(id);
  });
  ipcMain.handle(CHANNELS.AI_ACTIONS.EXECUTE, async (_event, actionId, selection) => {
    return executeAction(actionId, selection);
  });
  ipcMain.handle(CHANNELS.AI_ACTIONS.GET_LOGS, async (_event, actionId, limit) => {
    return getActionLogs(actionId, limit);
  });
}
function registerCommandsHandlers() {
  const registry = CommandRegistry.getInstance();
  const hotkeyManager = HotkeyManager.getInstance();
  ipcMain.handle(
    CHANNELS.COMMANDS.LIST,
    async (_, filter) => {
      const commands = await registry.listCommands(filter);
      return commands;
    }
  );
  ipcMain.handle(
    CHANNELS.COMMANDS.GET,
    async (_, id) => {
      return await registry.getCommand(id);
    }
  );
  ipcMain.handle(
    CHANNELS.COMMANDS.CREATE,
    async (_, data) => {
      return await registry.createCommand({
        name: data.name,
        description: data.description,
        type: data.type,
        actionType: data.actionType,
        actionPayload: data.actionPayload,
        category: data.category
      });
    }
  );
  ipcMain.handle(
    CHANNELS.COMMANDS.UPDATE,
    async (_, id, data) => {
      const command = await registry.updateCommand(id, data);
      if (data.enabled !== void 0) {
        await hotkeyManager.refreshCommandHotkeys(id);
      }
      return command;
    }
  );
  ipcMain.handle(
    CHANNELS.COMMANDS.DELETE,
    async (_, id) => {
      const command = await registry.getCommand(id);
      if (command) {
        for (const hotkey of command.hotkeys) {
          if (hotkey.isGlobal) {
            hotkeyManager.unregisterHotkey(hotkey.accelerator);
          }
        }
      }
      await registry.deleteCommand(id);
    }
  );
  ipcMain.handle(
    CHANNELS.COMMANDS.EXECUTE,
    async (_, id, context) => {
      return await registry.executeCommand(id, context);
    }
  );
  ipcMain.handle(
    CHANNELS.COMMANDS.ADD_HOTKEY,
    async (_, commandId, accelerator, isGlobal = false) => {
      const hotkey = await registry.addHotkey(commandId, accelerator, isGlobal);
      if (isGlobal) {
        hotkeyManager.registerHotkey(commandId, accelerator);
      }
      return hotkey;
    }
  );
  ipcMain.handle(
    CHANNELS.COMMANDS.REMOVE_HOTKEY,
    async (_, hotkeyId) => {
      await registry.removeHotkey(hotkeyId);
    }
  );
  ipcMain.handle(
    CHANNELS.COMMANDS.UPDATE_HOTKEY,
    async (_, hotkeyId, accelerator) => {
      return await registry.updateHotkey(hotkeyId, accelerator);
    }
  );
}
function registerAllHandlers() {
  console.log("Registering API handlers...");
  registerSystemApi();
  registerSettingsApi();
  registerAgentsApi();
  registerCollectionsApi();
  registerNotesApi();
  registerAIProvidersHandlers();
  registerAIActionsHandlers();
  registerCommandsHandlers();
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
app.on("will-quit", () => {
  HotkeyManager.getInstance().unregisterAll();
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
  try {
    const commandRegistry = CommandRegistry.getInstance();
    await commandRegistry.initialize();
    console.log("Command Registry initialized");
  } catch (error) {
    console.error("Failed to initialize command registry:", error);
  }
  try {
    const hotkeyManager = HotkeyManager.getInstance();
    await hotkeyManager.initialize();
    console.log("Hotkey Manager initialized");
  } catch (error) {
    console.error("Failed to initialize hotkey manager:", error);
  }
  createWindow();
});
export {
  MAIN_DIST,
  RENDERER_DIST,
  VITE_DEV_SERVER_URL
};
